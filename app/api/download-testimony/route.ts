import { NextRequest, NextResponse } from 'next/server';
import { generatePDF } from '@/app/actions/generatePDF';

export async function POST(req: NextRequest) {
    try {
        const { testimony } = await req.json();

        if (!testimony) {
            return NextResponse.json({ error: 'Testimony is required' }, { status: 400 });
        }

        const pdfBlob = await generatePDF(testimony);
        return new NextResponse(pdfBlob, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename=testimony.pdf',
            },
        });
    } catch (error) {
        console.error('Error generating PDF:', error);
        return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
    }
}