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
import { CheckCircle, Download, Copy as CopyIcon, Pencil } from 'lucide-react'; // Add this import
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

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
    const [editedTestimony, setEditedTestimony] = useState('')

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

    const handleEditTestimony = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditedTestimony(e.target.value)
    }

    const saveEditedTestimony = () => {
        setGeneratedTestimony(editedTestimony)
        // The dialog will be closed automatically when this button is clicked
    }

    if (step === -1) {
        return (
            <Card className="w-full max-w-[600px] mx-auto">
                <CardHeader>
                    <CardTitle className="text-xl sm:text-2xl">Write Your 7-Minute Story</CardTitle>
                    <CardDescription className="text-sm sm:text-base">Answer a series of questions to help craft your testimony</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm sm:text-base">This form will guide you through writing your 7-minute story. You&apos;ll answer one question at a time, and at the end, we&apos;ll use AI to help craft your story.</p>
                    <p className="text-xsm sm:text-xs mt-6 italic">&quot;They triumphed over him by the blood of the Lamb and by <span className="font-bold">the word of their testimony</span>.&quot; <br />- Revelation 12:11</p>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                    <Button className="w-full sm:w-auto" onClick={() => setStep(0)}>Get Started</Button>
                </CardFooter>
            </Card>
        )
    }

    if (step === questions.length) {
        return (
            <Card className="w-full max-w-[600px] mx-auto">
                <CardHeader>
                    <CardTitle className="text-xl sm:text-2xl">Choose Writing Style</CardTitle>
                    <CardDescription className="text-sm sm:text-base">Select a writing style for your 7-minute story</CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup onValueChange={handleWritingStyleChange} value={writingStyle}>
                        {writingStyles.map((style) => (
                            <div key={style.id} className="flex items-center space-x-2">
                                <RadioGroupItem value={style.id} id={style.id} />
                                <Label htmlFor={style.id} className="text-sm sm:text-base">{style.label}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                    <Button className="w-full sm:w-auto" onClick={handleSubmit} disabled={!writingStyle || isLoading}>
                        {isLoading ? "Generating..." : "Generate Testimony"}
                    </Button>
                </CardFooter>
            </Card>
        )
    }

    if (step === questions.length + 1) {
        return (
            <Card className="w-full max-w-[600px] mx-auto">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-xl sm:text-2xl">Your 7-Minute Story</CardTitle>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button size="sm" onClick={() => setEditedTestimony(generatedTestimony)}>
                                    <Pencil className="w-4 h-4 mr-2" /> Edit
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[625px]">
                                <DialogHeader>
                                    <DialogTitle>Edit Your 7-Minute Story</DialogTitle>
                                </DialogHeader>
                                <Textarea
                                    value={editedTestimony}
                                    onChange={handleEditTestimony}
                                    className="h-[400px] mb-4"
                                />
                                <div className="flex flex-col sm:flex-row sm:space-x-4 w-full space-y-4 sm:space-y-0">
                                    <DialogClose asChild>
                                        <Button className="w-full sm:w-[calc(50%-0.5rem)]" variant="outline">Cancel</Button>
                                    </DialogClose>
                                    <DialogClose asChild>
                                        <Button className="w-full sm:w-[calc(50%-0.5rem)]" onClick={saveEditedTestimony}>Save Changes</Button>
                                    </DialogClose>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <CardDescription className="text-sm sm:text-base">Here&apos;s your AI-generated testimony! <br /> You can edit from here and download when you&apos;re ready!</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-auto whitespace-pre-line text-sm sm:text-base">
                        <ReactMarkdown>{generatedTestimony}</ReactMarkdown>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <Button className="w-full sm:w-auto" onClick={copyToClipboard}>
                        {isCopied ? <><CheckCircle className="mr-1 w-4 h-4" /> Copied</> : <><CopyIcon className="mr-1 w-4 h-4" /> Copy to Clipboard</>}
                    </Button>
                    <Button className="w-full sm:w-auto" onClick={handleDownloadPDF}>
                        {isDownloaded ? <><CheckCircle className="mr-1 w-4 h-4" /> Downloaded</> : <><Download className="mr-1 w-4 h-4" /> Download PDF</>}
                    </Button>
                </CardFooter>
            </Card>
        )
    }

    if (step !== -1 && step < questions.length) {
        return (
            <Card className="w-full max-w-[600px] mx-auto">
                <CardHeader className="text-center">
                    <CardTitle className="text-lg sm:text-xl font-semibold">{questions[step]}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea
                        value={answers[step]}
                        onChange={handleAnswerChange}
                        placeholder="Type your answer here..."
                        className="h-[200px] sm:h-[300px]"
                    />
                </CardContent>
                <CardFooter className="flex flex-col items-center space-y-4 sm:space-y-0">
                    <span className="text-center text-sm sm:text-base sm:hidden mb-2">Question {step + 1}</span>
                    <div className="flex flex-col sm:flex-row justify-between items-center w-full space-y-4 sm:space-y-0">
                        <Button className="w-full sm:w-auto" onClick={handlePrevious} disabled={step === 0}>Previous</Button>
                        <span className="hidden sm:inline text-center text-sm sm:text-base">Question {step + 1}</span>
                        <Button 
                            className="w-full sm:w-auto"
                            onClick={handleNext} 
                            disabled={!answers[step]}
                        >
                            {step < questions.length - 1 ? "Next" : "Finish"}
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-[600px] mx-auto">
            <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">Question {step + 1}</CardTitle>
                <CardDescription className="text-sm sm:text-base">{questions[step]}</CardDescription>
            </CardHeader>
            <CardContent>
                <Textarea
                    value={answers[step]}
                    onChange={handleAnswerChange}
                    placeholder="Type your answer here..."
                    className="h-[200px] sm:h-[300px]"
                />
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                <Button className="w-full sm:w-auto" onClick={handlePrevious} disabled={step === 0}>Previous</Button>
                <Button className="w-full sm:w-auto" onClick={handleNext} disabled={!answers[step]}>Next</Button>
            </CardFooter>
        </Card>
    )
}