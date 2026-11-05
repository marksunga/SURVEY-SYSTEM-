'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Star, MessageSquare } from 'lucide-react';

interface QuestionStat {
  question: {
    id: string;
    question_text: string;
    question_type: string;
  };
  totalAnswers: number;
  distribution: Record<string, number>;
  averageRating: number | null;
  textResponses: string[];
}

interface SurveyAnalyticsChartsProps {
  questions: QuestionStat[];
}

const COLORS = ['#2563EB', '#0284C7', '#38BDF8', '#818CF8', '#6366F1', '#A855F7', '#EC4899'];

export function SurveyAnalyticsCharts({ questions }: SurveyAnalyticsChartsProps) {
  return (
    <div className="space-y-6">
      {questions.map((stat, idx) => {
        const isRating = stat.question.question_type === 'RATING_SCALE';
        const isChoice =
          stat.question.question_type === 'MULTIPLE_CHOICE' ||
          stat.question.question_type === 'CHECKBOX' ||
          stat.question.question_type === 'YES_NO';
        const isText =
          stat.question.question_type === 'SHORT_ANSWER' ||
          stat.question.question_type === 'PARAGRAPH';

        const chartData = Object.entries(stat.distribution).map(([name, count]) => ({
          name,
          count,
        }));

        return (
          <Card key={stat.question.id} className="border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <CardTitle className="text-sm font-semibold text-slate-900 leading-snug">
                  {idx + 1}. {stat.question.question_text}
                </CardTitle>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 whitespace-nowrap">
                  {stat.totalAnswers} {stat.totalAnswers === 1 ? 'response' : 'responses'}
                </span>
              </div>
              {isRating && stat.averageRating !== null && (
                <div className="flex items-center gap-1.5 pt-1 text-sm font-bold text-amber-600">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span>Average Rating: {stat.averageRating} / 5</span>
                </div>
              )}
            </CardHeader>

            <CardContent>
              {isRating && (
                <div className="h-56 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 8,
                          backgroundColor: '#0F172A',
                          color: '#FFF',
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {chartData.map((_, i) => (
                          <Cell key={`cell-${i}`} fill="#2563EB" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {isChoice && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={75}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {chartData.map((_, i) => (
                            <Cell key={`pie-cell-${i}`} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-2">
                    {chartData.map((d, i) => (
                      <div key={d.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: COLORS[i % COLORS.length] }}
                          />
                          <span className="text-slate-700 font-medium">{d.name}</span>
                        </div>
                        <span className="font-bold text-slate-900">{d.count} votes</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isText && (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {stat.textResponses.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No textual feedback provided.</p>
                  ) : (
                    stat.textResponses.map((txt, tIdx) => (
                      <div
                        key={tIdx}
                        className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700 flex items-start gap-2"
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>{txt}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

