export interface GameHistoryEntry {
  id: number;
  date: string;
  equation: string; // Will be base64 encoded for storage
  targetNumber: number;
  guesses: number;
  won: boolean;
  isPracticeMode: boolean;
}

export interface UserGameMetadata {
  history: GameHistoryEntry[];
  hasReceivedNFT?: boolean;
  firstWinDate?: string;
  nftImageUrl?: string;
  nftId?: string;
  nftTransactionHash?: string;
}

/**
 * Service for managing user game history in Dynamic metadata
 */
export class UserMetadataService {
  /**
   * Get current user metadata
   */
  static getUserMetadata(user: any): UserGameMetadata | null {
    if (!user?.metadata) {
      return null;
    }

    try {
      const metadata =
        typeof user.metadata === 'string'
          ? JSON.parse(user.metadata)
          : user.metadata;

      // Decode equations from base64 when reading
      const history = (metadata.history || []).map((entry: any) => {
        if (entry.equation) {
          try {
            // Try to decode - if it fails, it might be old format (not encoded)
            let decoded: string;
            if (typeof window !== 'undefined') {
              // Browser: decode base64 (works for ASCII characters like equations)
              decoded = atob(entry.equation);
            } else {
              // Node.js: use Buffer
              decoded = Buffer.from(entry.equation, 'base64').toString('utf-8');
            }
            return { ...entry, equation: decoded };
          } catch {
            // If decoding fails, assume it's already in plain text (backward compatibility)
            return entry;
          }
        }
        return entry;
      });

      return {
        history,
        hasReceivedNFT: metadata.hasReceivedNFT || false,
        firstWinDate: metadata.firstWinDate,
        nftImageUrl: metadata.nftImageUrl,
        nftId: metadata.nftId,
        nftTransactionHash: metadata.nftTransactionHash,
      };
    } catch (error) {
      console.error('Error parsing user metadata:', error);
      return null;
    }
  }

  /**
   * Add a new game result to user metadata
   */
  static async addGameResult(
    updateUser: (fields: any) => Promise<any>,
    gameResult: Omit<GameHistoryEntry, 'id'>,
    existingMetadata: UserGameMetadata | null
  ): Promise<UserGameMetadata> {
    const currentMetadata = existingMetadata || {
      history: [],
      hasReceivedNFT: false,
    };

    // Generate ID for new entry (use timestamp or increment from last entry)
    const lastId =
      currentMetadata.history.length > 0
        ? Math.max(...currentMetadata.history.map((h) => h.id))
        : 0;
    const newId = lastId + 1;

    // Create new history entry with ID
    // Encode equation to base64 to avoid invalid characters in metadata
    // Dynamic's metadata validation rejects special characters like +, -, *, /
    let encodedEquation: string;
    if (typeof window !== 'undefined') {
      // Browser: use btoa (works for ASCII characters like equations)
      encodedEquation = btoa(gameResult.equation);
    } else {
      // Node.js: use Buffer
      encodedEquation = Buffer.from(gameResult.equation, 'utf-8').toString(
        'base64'
      );
    }

    const newEntry: GameHistoryEntry = {
      ...gameResult,
      equation: encodedEquation,
      id: newId,
    };

    // Update metadata - keep last 100 games to stay under 2KB limit
    const updatedMetadata: UserGameMetadata = {
      history: [...currentMetadata.history, newEntry].slice(-100),
      hasReceivedNFT: currentMetadata.hasReceivedNFT,
      firstWinDate:
        currentMetadata.firstWinDate ||
        (gameResult.won ? gameResult.date : undefined),
    };

    // Update user metadata using Dynamic's updateUser
    try {
      const result = await updateUser({
        metadata: updatedMetadata,
      });

      // Handle email/SMS verification if required
      if (
        result.isEmailVerificationRequired ||
        result.isSmsVerificationRequired
      ) {
        console.warn('Email/SMS verification required for metadata update');
        // If verification is required, we'll skip it for now to avoid blocking
        // The metadata update will be retried on next game win
        // In production, you might want to show a verification modal
        return updatedMetadata;
      }
    } catch (error) {
      console.error('Error updating user metadata:', error);
      // Don't throw - allow game to continue even if save fails
      // The error is already logged
      return updatedMetadata;
    }

    return updatedMetadata;
  }

  /**
   * Mark NFT as received
   */
  static async markNFTReceived(
    updateUser: (fields: any) => Promise<any>,
    existingMetadata: UserGameMetadata | null,
    nftImageUrl?: string,
    nftId?: string,
    nftTransactionHash?: string
  ): Promise<void> {
    const currentMetadata = existingMetadata || {
      history: [],
      hasReceivedNFT: false,
    };

    const updatedMetadata: UserGameMetadata = {
      ...currentMetadata,
      hasReceivedNFT: true,
      ...(nftImageUrl && { nftImageUrl }),
      ...(nftId && { nftId }),
      ...(nftTransactionHash && { nftTransactionHash }),
    };

    try {
      const result = await updateUser({
        metadata: updatedMetadata,
      });

      // Handle email/SMS verification if required
      if (
        result.isEmailVerificationRequired ||
        result.isSmsVerificationRequired
      ) {
        console.warn('Email/SMS verification required for metadata update');
      }
    } catch (error) {
      console.error('Error marking NFT as received:', error);
      throw error;
    }
  }
}
