import { NextResponse } from 'next/server';
import { getRandomEquation } from '@/utils/equationDatabase';

export async function GET() {
  try {
    const equation = await getRandomEquation();

    return NextResponse.json(equation);
  } catch (error) {
    console.error('Error getting random equation:', error);
    return NextResponse.json(
      { error: 'Failed to get random equation' },
      { status: 500 }
    );
  }
}
