import Papa from 'papaparse';
import { Survey } from '@/lib/types/database';

export function exportSurveyCSV(survey: Survey, results: any) {
  const rows: any[] = [];

  results.aggregatedQuestions.forEach((item: any, idx: number) => {
    let summaryText = '';
    if (item.averageRating !== null) {
      summaryText = `Avg Rating: ${item.averageRating} / 5.0`;
    } else if (Object.keys(item.distribution).length > 0) {
      summaryText = Object.entries(item.distribution)
        .map(([k, v]) => `${k}=${v}`)
        .join('; ');
    } else {
      summaryText = `${item.totalAnswers} text responses`;
    }

    rows.push({
      Index: idx + 1,
      QuestionText: item.question.question_text,
      Type: item.question.question_type,
      TotalResponses: item.totalAnswers,
      SummaryMetrics: summaryText,
      SurveyTitle: survey.title,
      SurveyCategory: survey.category,
      ExportDate: new Date().toISOString(),
    });
  });

  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Survey-Data-${survey.id.slice(0, 8)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

