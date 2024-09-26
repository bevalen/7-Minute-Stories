import jsPDF from "jspdf"; // Changed to default import

export async function generatePDF(testimony: string): Promise<Blob> {
    const doc = new jsPDF();
    doc.text(testimony, 10, 10);
    return doc.output("blob");
}