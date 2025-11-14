import { NextRequest, NextResponse } from 'next/server';
import { getDailyEquation } from '@/utils/equationDatabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    
    const equation = await getDailyEquation(date);
    
    return NextResponse.json(equation);
  } catch (error) {
    console.error('Error getting daily equation:', error);
    return NextResponse.json(
      { error: 'Failed to get daily equation' },
      { status: 500 }
    );
  }
}
