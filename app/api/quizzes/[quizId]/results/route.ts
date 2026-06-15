import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Result from '@/lib/models/Result';

export async function GET(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    await connectDB();
    const results = await Result.find({ quizId: params.quizId })
      .populate('studentId', 'name email');
    
    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
