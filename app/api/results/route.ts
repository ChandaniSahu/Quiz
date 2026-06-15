import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import Result from '@/lib/models/Result';
import User from '@/lib/models/User';
import Quiz from '@/lib/models/Quiz';

export async function GET() {
  try {
    const session = await getServerSession();
    await connectDB();
    
    const user = await User.findOne({ email: session?.user?.email });
    const results = await Result.find({ studentId: user._id })
      .populate('quizId', 'title');
    
    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    await connectDB();
    
    const user = await User.findOne({ email: session?.user?.email });
    const { quizId, answers, timeTaken } = await request.json();
    
    const quiz = await Quiz.findById(quizId);
    
    let score = 0;
    const answerResults = [];
    
    for (const question of quiz.questions) {
      const selectedOption = answers[question.questionId];
      const isCorrect = selectedOption === question.correctAnswer;
      
      if (isCorrect) {
        score += quiz.eachMarks;
      } else if (quiz.negativeMarking && selectedOption) {
        score -= quiz.negativeMarks;
      }
      
      answerResults.push({
        questionId: question.questionId,
        selectedOption,
      });
    }
    
    const result = await Result.create({
      quizId,
      studentId: user._id,
      score: Math.max(0, score),
      answers: answerResults,
      timeTaken,
    });
    
    await User.findByIdAndUpdate(user._id, {
      $push: { 
        quizesAttemptedIds: quizId,
        resultIds: result._id
      }
    });
    
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
