import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Survey } from '@/lib/types/database';

export function generateSurveyPDF(survey: Survey, results: any) {
  const doc = new jsPDF();

  // Header Banner
  doc.setFillColor(15, 23, 42); // #0F172A
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('IT DEPARTMENT SURVEY & FEEDBACK SYSTEM', 14, 15);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text('Official Analytical Report & Submission Summary', 14, 23);

  // Survey Metadata Section
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(`Survey: ${survey.title}`, 14, 42);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Category: ${survey.category}  |  Status: ${survey.status}`, 14, 48);
  doc.text(
    `Date Generated: ${new Date().toLocaleDateString()}  |  Total Submissions: ${results.totalResponses}`,
    14,
    54
  );
  doc.text(
    `Anonymous Submissions: ${results.anonymousResponses}  |  Identified Submissions: ${results.identifiedResponses}`,
    14,
    60
  );

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 65, 196, 65);

  // Table of Questions & Stats
  const tableRows: any[] = [];
  results.aggregatedQuestions.forEach((item: any, idx: number) => {
    let summaryText = '';
    if (item.averageRating !== null) {
      summaryText = `Avg Rating: ${item.averageRating} / 5.0 (${item.totalAnswers} votes)`;
    } else if (Object.keys(item.distribution).length > 0) {
      summaryText = Object.entries(item.distribution)
        .map(([k, v]) => `${k}: ${v}`)
        .join('; ');
    } else {
      summaryText = `${item.totalAnswers} text responses`;
    }

    tableRows.push([
      idx + 1,
      item.question.question_text,
      item.question.question_type.replace('_', ' '),
      item.totalAnswers,
      summaryText,
    ]);
  });

  autoTable(doc, {
    startY: 70,
    head: [['#', 'Question Text', 'Type', 'Responses', 'Distribution / Summary']],
    body: tableRows,
    headStyles: {
      fillColor: [37, 99, 235], // #2563EB
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 8,
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 65 },
      2: { cellWidth: 30 },
      3: { cellWidth: 20 },
      4: { cellWidth: 65 },
    },
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Page ${i} of ${pageCount} - IT Department Feedback System (Confidential)`,
      14,
      288
    );
  }

  doc.save(`Survey-Report-${survey.id.slice(0, 8)}.pdf`);
}

