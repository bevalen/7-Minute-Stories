import { NextRequest, NextResponse } from 'next/server';
import { generateTestimony } from '@/app/actions/generateTestimony';

export async function POST(req: NextRequest) {
    try {
        const { answers, writingStyle } = await req.json();
        const testimony = await generateTestimony(answers, writingStyle);
        return NextResponse.json({ testimony });
    } catch (error) {
        console.error('Error generating testimony:', error);
        return NextResponse.json({ error: 'Failed to generate testimony' }, { status: 500 });
    }
}