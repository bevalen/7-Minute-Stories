'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import ReactMarkdown from 'react-markdown'
import { PDFDocument, rgb, PDFFont, StandardFonts } from 'pdf-lib';
import { marked } from 'marked'; // Add this import
import { CheckCircle, Download, Copy as CopyIcon } from 'lucide-react'; // Add this import

interface Line {
    text: string;
    isBold: boolean;
}

const questions = [
    "What was it like growing up in your family or home?",
    "What has been your greatest failure, and what have you learned from it?",
    "What is a challenge you've faced that felt impossible at the time, and how did you overcome it?",
    "Who has had the greatest impact on your life, and why?",
    "What do you want others to learn from your story?"
];

const writingStyles = [
    { id: "conversational", label: "Conversational" },
    { id: "formal", label: "Formal" },
    { id: "storytelling", label: "Storytelling" },
    { id: "narrative", label: "Narrative" },
    { id: "reflective", label: "Reflective" },
    { id: "humorous", label: "Humorous" },
]

export default function TestimonyForm() {
    const [step, setStep] = useState(-1)
    const [answers, setAnswers] = useState(Array(questions.length).fill(''))
    const [generatedTestimony, setGeneratedTestimony] = useState('')
    const [writingStyle, setWritingStyle] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isCopied, setIsCopied] = useState(false)
    const [isDownloaded, setIsDownloaded] = useState(false) // Add this state

    const handleNext = () => {
        if (step < questions.length) {
            setStep(step + 1)
        }
    }

    const handlePrevious = () => {
        if (step > 0) {
            setStep(step - 1)
        }
    }

    const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newAnswers = [...answers]
        newAnswers[step] = e.target.value
        setAnswers(newAnswers)
    }

    const handleSubmit = async () => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/generate-testimony', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ answers, writingStyle }),
            })

            if (!response.ok) {
                throw new Error('Failed to generate testimony')
            }

            const data = await response.json()
            setGeneratedTestimony(data.testimony)
            setStep(questions.length + 1) // Move to the final step
        } catch (error) {
            console.error('Error generating testimony:', error)
            // Handle error (e.g., show error message to user)
        } finally {
            setIsLoading(false)
        }
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedTestimony)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000) // Reset after 2 seconds
    }

    const handleWritingStyleChange = (value: string) => {
        setWritingStyle(value)
    }

    const handleDownloadPDF = async () => {
        console.log('Download PDF button clicked'); // Debugging log
        try {
            const pdfDoc = await PDFDocument.create();
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica); // Use built-in Helvetica font
            const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold); // Embed bold font
            let page = pdfDoc.addPage();
            const { width, height } = page.getSize();
            page.setSize(width, height);
            const fontSize = 12;
            const margin = 50;

            // Split the text into lines that fit within the page width
            const lines = splitTextIntoLines(generatedTestimony, font, boldFont, fontSize, width - 2 * margin);

            // Add header
            page.drawText('Your 7-Minute Story', {
                x: margin,
                y: height - margin,
                size: fontSize + 4,
                font,
                color: rgb(0, 0, 0),
            });

            // Add the text lines to the page
            let y = height - margin - 20;
            for (const line of lines) {
                if (y < margin) {
                    page = pdfDoc.addPage();
                    y = height - margin;
                }
                page.drawText(line.text, {
                    x: margin,
                    y,
                    size: fontSize,
                    font: line.isBold ? boldFont : font,
                    color: rgb(0, 0, 0),
                });
                y -= fontSize + 4;
                if (line.text === '') {
                    y -= fontSize; // Add a smaller space for paragraph breaks
                }
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = '7-Minute Story.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
            console.log('PDF generated and download initiated'); // Debugging log

            setIsDownloaded(true); // Set isDownloaded to true
            setTimeout(() => setIsDownloaded(false), 2000); // Reset after 2 seconds
        } catch (error) {
            console.error('Error generating PDF:', error);
            // Handle error (e.g., show error message to user)
        }
    };

    // Helper function to split text into lines that fit within the page width
    const splitTextIntoLines = (text: string, font: PDFFont, boldFont: PDFFont, fontSize: number, maxWidth: number) => {
        const tokens = marked.lexer(text); // Parse the markdown text
        const lines: Line[] = []; // Explicitly define type as Line array
        let currentLine = '';
        const isBold = false; // Changed 'let' to 'const'

        const addLine = (line: string, bold: boolean) => {
            const width = (bold ? boldFont : font).widthOfTextAtSize(line, fontSize);
            if (width > maxWidth) {
                const words = line.split(' ');
                let newLine = '';
                for (const word of words) {
                    const testLine = newLine + word + ' ';
                    const testWidth = (bold ? boldFont : font).widthOfTextAtSize(testLine, fontSize);
                    if (testWidth > maxWidth) {
                        lines.push({ text: newLine.trim(), isBold: bold });
                        newLine = word + ' ';
                    } else {
                        newLine = testLine;
                    }
                }
                lines.push({ text: newLine.trim(), isBold: bold });
            } else {
                lines.push({ text: line.trim(), isBold: bold });
            }
        };

        for (const token of tokens) {
            if (token.type === 'paragraph') {
                const paragraph = token.text;
                const parts = paragraph.split(/(\*\*[^*]+\*\*)/); // Split by bold text
                for (const part of parts) {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        if (currentLine) {
                            addLine(currentLine, isBold);
                            currentLine = '';
                        }
                        addLine(part.slice(2, -2), true);
                    } else {
                        currentLine += part;
                    }
                }
                if (currentLine) {
                    addLine(currentLine, isBold);
                    currentLine = '';
                }
                lines.push({ text: '', isBold: false }); // Add an empty line for paragraph break
            } else if (token.type === 'text') {
                currentLine += token.text;
            }
        }

        if (currentLine) {
            addLine(currentLine, isBold);
        }

        return lines;
    };

    if (step === -1) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Write Your 7-Minute Testimony</CardTitle>
                    <CardDescription>Answer a series of questions to help craft your 7-minute story</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>This form will guide you through writing your 7-minute story. You&apos;ll answer one question at a time, and at the end, we&apos;ll use AI to help craft your story.</p>
                </CardContent>
                <CardFooter>
                    <Button onClick={() => setStep(0)}>Get Started</Button>
                </CardFooter>
            </Card>
        )
    }

    if (step === questions.length) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Choose Writing Style</CardTitle>
                    <CardDescription>Select a writing style for your 7-minute story</CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup onValueChange={handleWritingStyleChange} value={writingStyle}>
                        {writingStyles.map((style) => (
                            <div key={style.id} className="flex items-center space-x-2">
                                <RadioGroupItem value={style.id} id={style.id} />
                                <Label htmlFor={style.id}>{style.label}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSubmit} disabled={!writingStyle || isLoading}>
                        {isLoading ? "Generating..." : "Generate Testimony"}
                    </Button>
                </CardFooter>
            </Card>
        )
    }

    if (step === questions.length + 1) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Your Generated 7-Minute Story</CardTitle>
                    <CardDescription>Here&apos;s your AI-generated 7-minute story based on your answers</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-auto whitespace-pre-line">
                        <ReactMarkdown>{generatedTestimony}</ReactMarkdown>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-center space-x-4">
                    <Button onClick={copyToClipboard}>
                        {isCopied ? <><CheckCircle style={{ marginRight: '4px', width: '16px', height: '16px' }} /> Copied</> : <><CopyIcon style={{ marginRight: '4px', width: '16px', height: '16px' }} /> Copy to Clipboard</>}
                    </Button>
                    <Button onClick={handleDownloadPDF}>
                        {isDownloaded ? <><CheckCircle style={{ marginRight: '4px', width: '16px', height: '16px' }} /> Downloaded</> : <><Download style={{ marginRight: '4px', width: '16px', height: '16px' }} /> Download PDF</>}
                    </Button>
                </CardFooter>
            </Card>
        )
    }

    if (step !== -1 && step < questions.length) {
        return (
            <Card className="w-full">
                <CardHeader className="text-center">
                    <CardTitle className="text-lg font-semibold">{questions[step]}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea
                        value={answers[step]}
                        onChange={handleAnswerChange}
                        placeholder="Type your answer here..."
                        className="h-[300px]"
                    />
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                    <Button onClick={handlePrevious} disabled={step === 0}>Previous</Button>
                    <span className="text-center">Question {step + 1}</span>
                    {step < questions.length - 1 ? (
                        <Button onClick={handleNext} disabled={!answers[step]}>Next</Button>
                    ) : (
                        <Button onClick={handleNext} disabled={!answers[step]}>Next</Button>
                    )}
                </CardFooter>
            </Card>
        )
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Question {step + 1}</CardTitle>
                <CardDescription>{questions[step]}</CardDescription>
            </CardHeader>
            <CardContent>
                <Textarea
                    value={answers[step]}
                    onChange={handleAnswerChange}
                    placeholder="Type your answer here..."
                    className="h-[300px]"
                />
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button onClick={handlePrevious} disabled={step === 0}>Previous</Button>
                {step < questions.length - 1 ? (
                    <Button onClick={handleNext} disabled={!answers[step]}>Next</Button>
                ) : (
                    <Button onClick={handleNext} disabled={!answers[step]}>Next</Button>
                )}
            </CardFooter>
        </Card>
    )
}