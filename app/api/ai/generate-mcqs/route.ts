import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { topic, numberOfQuestions = 10 } = await request.json();
    
    const prompt = `Generate ${numberOfQuestions} multiple choice questions about "${topic}". 
    For each question, provide 4 options (A, B, C, D) and indicate the correct answer.
    Format the response as a JSON array where each question has:
    {
      "questionId": number,
      "question": "the question text",
      "options": {
        "A": "option A",
        "B": "option B",
        "C": "option C",
        "D": "option D"
      },
      "correctAnswer": "A/B/C/D"
    }`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.7,
    });

    const generatedText = completion.choices[0]?.message?.content || '';
    const questions = JSON.parse(generatedText);

    return NextResponse.json({ questions });
  } catch (error: any) {
    console.error('Error generating MCQs:', error);
    return NextResponse.json(
      { error: 'Failed to generate questions' }, 
      { status: 500 }
    );
  }
}
