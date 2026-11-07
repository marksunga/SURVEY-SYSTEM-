'use client';

import { useState } from 'react';
import { QuestionType, SurveyQuestion } from '@/lib/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, GripVertical, Check, HelpCircle } from 'lucide-react';

export interface DraftQuestion {
  id?: string;
  question_text: string;
  question_type: QuestionType;
  options: any;
  is_required: boolean;
  order_index: number;
}

interface QuestionBuilderProps {
  questions: DraftQuestion[];
  onChange: (questions: DraftQuestion[]) => void;
}

const QUESTION_TYPES: { type: QuestionType; label: string }[] = [
  { type: 'RATING_SCALE', label: 'Rating Scale (1-5 / 1-10)' },
  { type: 'MULTIPLE_CHOICE', label: 'Multiple Choice (Single Select)' },
  { type: 'SINGLE_CHOICE', label: 'Single Choice (Radio Options)' },
  { type: 'CHECKBOX', label: 'Checkboxes (Multi-Select)' },
  { type: 'YES_NO', label: 'Yes or No' },
  { type: 'SHORT_ANSWER', label: 'Short Answer' },
  { type: 'PARAGRAPH', label: 'Paragraph Text' },
];

export function QuestionBuilder({ questions, onChange }: QuestionBuilderProps) {
  function handleAddQuestion() {
    const newQ: DraftQuestion = {
      question_text: '',
      question_type: 'RATING_SCALE',
      options: { min: 1, max: 5, minLabel: 'Poor', maxLabel: 'Excellent' },
      is_required: true,
      order_index: questions.length,
    };
    onChange([...questions, newQ]);
  }

  function handleRemoveQuestion(idx: number) {
    const updated = questions.filter((_, i) => i !== idx).map((q, i) => ({ ...q, order_index: i }));
    onChange(updated);
  }

  function handleUpdateQuestion(idx: number, updates: Partial<DraftQuestion>) {
    const updated = [...questions];
    updated[idx] = { ...updated[idx], ...updates };

    // When type changes, adapt default options
    if (updates.question_type) {
      if (
        updates.question_type === 'MULTIPLE_CHOICE' ||
        updates.question_type === 'SINGLE_CHOICE' ||
        updates.question_type === 'CHECKBOX'
      ) {
        if (!Array.isArray(updated[idx].options)) {
          updated[idx].options = ['Option 1', 'Option 2', 'Option 3'];
        }
      } else if (updates.question_type === 'RATING_SCALE') {
        updated[idx].options = { min: 1, max: 5, minLabel: 'Poor', maxLabel: 'Excellent' };
      } else if (updates.question_type === 'YES_NO') {
        updated[idx].options = ['Yes', 'No'];
      } else {
        updated[idx].options = { placeholder: '' };
      }
    }

    onChange(updated);
  }

  function handleOptionChoiceChange(qIdx: number, cIdx: number, val: string) {
    const updated = [...questions];
    const choices = Array.isArray(updated[qIdx].options) ? [...updated[qIdx].options] : [];
    choices[cIdx] = val;
    updated[qIdx].options = choices;
    onChange(updated);
  }

  function handleAddOptionChoice(qIdx: number) {
    const updated = [...questions];
    const choices = Array.isArray(updated[qIdx].options) ? [...updated[qIdx].options] : [];
    choices.push(`Option ${choices.length + 1}`);
    updated[qIdx].options = choices;
    onChange(updated);
  }

  function handleRemoveOptionChoice(qIdx: number, cIdx: number) {
    const updated = [...questions];
    const choices = Array.isArray(updated[qIdx].options) ? [...updated[qIdx].options] : [];
    choices.splice(cIdx, 1);
    updated[qIdx].options = choices;
    onChange(updated);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Survey Questions ({questions.length})</h3>
          <p className="text-xs text-slate-500">Add and customize questions with various response types.</p>
        </div>
        <Button
          type="button"
          onClick={handleAddQuestion}
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5 border-dashed border-blue-400 text-blue-600 hover:bg-blue-50"
        >
          <Plus className="h-4 w-4" />
          <span>Add Question</span>
        </Button>
      </div>

      {questions.length === 0 ? (
        <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <HelpCircle className="h-8 w-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700">No questions added yet</p>
          <p className="text-xs text-slate-500 mb-4">Add your first question to build the survey structure.</p>
          <Button type="button" onClick={handleAddQuestion} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Add Question
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <Card key={idx} className="border-slate-200">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">Question #{idx + 1}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveQuestion(idx)}
                    className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 h-8 px-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2 space-y-1.5">
                    <Label className="text-xs">Question Text *</Label>
                    <Input
                      type="text"
                      placeholder="e.g., How would you rate the laboratory workstations?"
                      value={q.question_text}
                      onChange={(e) => handleUpdateQuestion(idx, { question_text: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Question Type</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      value={q.question_type}
                      onChange={(e) =>
                        handleUpdateQuestion(idx, { question_type: e.target.value as QuestionType })
                      }
                    >
                      {QUESTION_TYPES.map((t) => (
                        <option key={t.type} value={t.type}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Sub-options for Choices / Rating scale */}
                {(q.question_type === 'MULTIPLE_CHOICE' || q.question_type === 'CHECKBOX') && (
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
                    <Label className="text-xs font-semibold text-slate-600">Options / Choices:</Label>
                    {(Array.isArray(q.options) ? q.options : []).map((opt: string, cIdx: number) => (
                      <div key={cIdx} className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 w-4">{cIdx + 1}.</span>
                        <Input
                          type="text"
                          value={opt}
                          onChange={(e) => handleOptionChoiceChange(idx, cIdx, e.target.value)}
                          className="h-8 text-xs bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveOptionChoice(idx, cIdx)}
                          className="text-slate-400 hover:text-rose-500 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddOptionChoice(idx)}
                      className="text-xs text-blue-600 hover:bg-blue-50 h-7 px-2 mt-1"
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add Option
                    </Button>
                  </div>
                )}

                {q.question_type === 'RATING_SCALE' && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div>
                      <Label className="text-[11px] text-slate-500">Min Score</Label>
                      <Input
                        type="number"
                        min="1"
                        max="1"
                        value={q.options?.min || 1}
                        readOnly
                        className="h-8 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] text-slate-500">Max Score</Label>
                      <select
                        value={q.options?.max || 5}
                        onChange={(e) =>
                          handleUpdateQuestion(idx, {
                            options: { ...q.options, max: Number(e.target.value) },
                          })
                        }
                        className="flex h-8 w-full rounded-md border border-input bg-white px-2 py-1 text-xs"
                      >
                        <option value="5">5 Stars</option>
                        <option value="10">10 Points</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-[11px] text-slate-500">Min Label</Label>
                      <Input
                        type="text"
                        value={q.options?.minLabel || 'Poor'}
                        onChange={(e) =>
                          handleUpdateQuestion(idx, {
                            options: { ...q.options, minLabel: e.target.value },
                          })
                        }
                        className="h-8 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] text-slate-500">Max Label</Label>
                      <Input
                        type="text"
                        value={q.options?.maxLabel || 'Excellent'}
                        onChange={(e) =>
                          handleUpdateQuestion(idx, {
                            options: { ...q.options, maxLabel: e.target.value },
                          })
                        }
                        className="h-8 text-xs bg-white"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={q.is_required}
                      onChange={(e) => handleUpdateQuestion(idx, { is_required: e.target.checked })}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Required question</span>
                  </label>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

