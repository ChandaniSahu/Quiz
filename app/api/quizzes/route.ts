import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import Quiz from '@/lib/models/Quiz';
import User from '@/lib/models/User';

export async function GET() {
  try {
    const session = await getServerSession();
    await connectDB();
    
    const user = await User.findOne({ email: session?.user?.email });
    const quizzes = await Quiz.find({ organizerId: user._id });
    
    return NextResponse.json(quizzes);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    await connectDB();
    
    const user = await User.findOne({ email: session?.user?.email });
    const data = await request.json();
    
    const quiz = await Quiz.create({
      ...data,
      organizerId: user._id,
    });

    await User.findByIdAndUpdate(user._id, {
      $push: { quizesCreatedIds: quiz._id }
    });

    return NextResponse.json(quiz, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
