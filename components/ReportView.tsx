
import React from 'react';
import { DownloadIcon } from './icons';

// Make TS aware of the global jsPDF library from the CDN
declare const jspdf: any;

interface ReportViewProps {
  report: string;
}

const ReportView: React.FC<ReportViewProps> = ({ report }) => {
  const handleDownloadPdf = () => {
    if (!report) return;
    
    const { jsPDF } = jspdf;
    const doc = new jsPDF();
    
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const usableWidth = pageWidth - 2 * margin;
    const usableHeight = pageHeight - 2 * margin;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    
    const lines = doc.splitTextToSize(report, usableWidth);
    
    let cursorY = margin;
    
    lines.forEach((line: string) => {
        if (cursorY + 10 > pageHeight - margin) { // Check if new page is needed
            doc.addPage();
            cursorY = margin;
        }
        doc.text(line, margin, cursorY);
        cursorY += 7; // Line height
    });
    
    doc.save("generated-report.pdf");
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Generated Report</h2>
          {report && (
            <button 
                onClick={handleDownloadPdf}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                <DownloadIcon className="h-5 w-5 mr-2" />
                Download as PDF
            </button>
          )}
      </div>
      <div className="prose prose-invert prose-lg max-w-none bg-gray-800/50 p-6 rounded-lg">
         {/* Using a pre-wrap to respect newlines and formatting from the model */}
        <p className="whitespace-pre-wrap">{report || "No report generated yet."}</p>
      </div>
    </div>
  );
};

export default ReportView;