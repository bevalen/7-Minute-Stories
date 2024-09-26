import TestimonyForm from "@/app/testimony/components/TestimonyForm"

export default function TestimonyPage() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center">
                    <div className="w-full max-w-4xl">
                        <TestimonyForm />
                    </div>
                </div>
            </div>
        </div>
    )
}