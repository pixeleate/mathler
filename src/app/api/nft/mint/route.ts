import { NextRequest, NextResponse } from 'next/server';

/**
 * API route for minting NFT to user's embedded wallet using Crossmint
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, userId } = body;

    if (!walletAddress || !userId) {
      return NextResponse.json(
        { error: 'Missing walletAddress or userId' },
        { status: 400 }
      );
    }

    // Get Crossmint API credentials from environment variables
    const crossmintApiKey = process.env.CROSSMINT_API_KEY;
    const crossmintCollectionId = process.env.CROSSMINT_COLLECTION_ID;
    const crossmintProjectId = process.env.CROSSMINT_PROJECT_ID;

    if (!crossmintApiKey || !crossmintCollectionId) {
      console.error('Crossmint credentials not configured');
      return NextResponse.json(
        { error: 'NFT minting service not configured' },
        { status: 500 }
      );
    }

    // Prepare NFT metadata
    const nftMetadata = {
      name: 'Mathler First Win',
      description: 'Congratulations on solving your first Mathler equation!',
      image: process.env.NFT_IMAGE_URL || 'https://via.placeholder.com/512',
      attributes: [
        {
          trait_type: 'Achievement',
          value: 'First Win',
        },
        {
          trait_type: 'Game',
          value: 'Mathler',
        },
        {
          trait_type: 'Minted Date',
          value: new Date().toISOString(),
        },
      ],
    };

    // Mint NFT using Crossmint API
    // Documentation: https://docs.crossmint.com/minting/quickstarts/nfts
    const crossmintResponse = await fetch(
      `https://staging.crossmint.com/api/2022-06-09/collections/${crossmintCollectionId}/nfts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': crossmintApiKey,
          ...(crossmintProjectId && { 'X-PROJECT-ID': crossmintProjectId }),
        },
        body: JSON.stringify({
          recipient: `avalanche-fuji:${walletAddress}`, // Avalanche Fuji testnet
          metadata: nftMetadata,
          reuploadLinkedFiles: true, // Re-upload metadata to IPFS
        }),
      }
    );

    if (!crossmintResponse.ok) {
      const errorData = await crossmintResponse.json().catch(() => ({}));
      console.error('Crossmint API error:', errorData);
      return NextResponse.json(
        {
          error: 'Failed to mint NFT',
          details: errorData.message || 'Unknown error',
        },
        { status: crossmintResponse.status || 500 }
      );
    }

    const result = await crossmintResponse.json();

    // The result.id is the actionId, not the actual NFT ID
    // We need to verify the NFT was actually minted and get the real NFT ID
    const actionId = result.id;

    // Poll the verification endpoint to get the actual NFT ID
    // Retry up to 10 times with 2 second delays
    let actualNftId: string | null = null;
    let transactionHash: string | null = null;
    const maxRetries = 10;
    const retryDelay = 2000; // 2 seconds

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Wait before checking (except first attempt)
        if (attempt > 0) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }

        const verifyResponse = await fetch(
          `https://staging.crossmint.com/api/2022-06-09/collections/${crossmintCollectionId}/nfts/${actionId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-API-KEY': crossmintApiKey,
              ...(crossmintProjectId && { 'X-PROJECT-ID': crossmintProjectId }),
            },
          }
        );

        if (verifyResponse.ok) {
          const verifyResult = await verifyResponse.json();

          // Check if NFT is minted and get the actual NFT ID
          if (verifyResult.id && verifyResult.onChain?.status === 'success') {
            actualNftId = verifyResult.id;
            transactionHash =
              verifyResult.onChain?.txId ||
              verifyResult.onChain?.txHash ||
              null;
            break;
          } else if (verifyResult.onChain?.status === 'pending') {
            // Still pending, continue polling
            console.log(
              `NFT verification attempt ${attempt + 1}: Still pending...`
            );
            continue;
          } else if (verifyResult.onChain?.status === 'failed') {
            // Minting failed
            throw new Error('NFT minting failed on-chain');
          }
        } else {
          // If 404, NFT might not be ready yet, continue polling
          if (verifyResponse.status === 404 && attempt < maxRetries - 1) {
            console.log(
              `NFT verification attempt ${
                attempt + 1
              }: Not found yet, retrying...`
            );
            continue;
          }
          throw new Error(`Verification failed: ${verifyResponse.status}`);
        }
      } catch (error) {
        console.error(`NFT verification attempt ${attempt + 1} error:`, error);
        // On last attempt, throw the error
        if (attempt === maxRetries - 1) {
          throw error;
        }
        // Otherwise continue polling
        continue;
      }
    }

    if (!actualNftId) {
      // If we couldn't verify the NFT after all retries, return the actionId
      // The client can retry verification later
      console.warn(
        'Could not verify NFT after all retries, returning actionId'
      );
      return NextResponse.json({
        success: true,
        transactionHash: null,
        nftId: actionId,
        actionId: actionId,
        message: 'NFT minting initiated, verification pending',
        crossmintId: actionId,
        nftImageUrl: nftMetadata.image,
        pending: true,
      });
    }

    // Get the NFT image URL from metadata
    const nftImageUrl = nftMetadata.image;

    return NextResponse.json({
      success: true,
      transactionHash,
      nftId: actualNftId,
      actionId: actionId,
      message: 'NFT minted successfully via Crossmint',
      crossmintId: actualNftId,
      nftImageUrl, // Include image URL for display
    });
  } catch (error) {
    console.error('Error minting NFT:', error);
    return NextResponse.json(
      {
        error: 'Failed to mint NFT',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
