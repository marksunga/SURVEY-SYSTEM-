'use client';

import { SurveyQuestion } from '@/lib/types/database';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, CheckCircle2 } from 'lucide-react';

interface QuestionRendererProps {
  question: SurveyQuestion;
  index: number;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  disabled?: boolean;
}

export function QuestionRenderer({
  question,
  index,
  value,
  onChange,
  error,
  disabled = false,
}: QuestionRendererProps) {
  const options = question.options;

  // 1. Rating Scale
  if (question.question_type === 'RATING_SCALE') {
    const min = (options as any)?.min || 1;
    const max = (options as any)?.max || 5;
    const minLabel = (options as any)?.minLabel || 'Poor';
    const maxLabel = (options as any)?.maxLabel || 'Excellent';
    const ratings = Array.from({ length: max - min + 1 }, (_, i) => min + i);

    return (
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <Label className="text-sm font-semibold text-slate-800 leading-snug">
            {index + 1}. {question.question_text}{' '}
            {question.is_required && <span className="text-rose-500">*</span>}
          </Label>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            {ratings.map((rate) => {
              const selected = Number(value) === rate;
              return (
                <button
                  type="button"
                  key={rate}
                  disabled={disabled}
                  onClick={() => onChange(rate)}
                  className={`h-11 w-11 rounded-lg border text-sm font-bold transition-all flex flex-col items-center justify-center ${
                    selected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm scale-105'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50'
                  }`}
                >
                  <Star className={`h-3.5 w-3.5 mb-0.5 ${selected ? 'fill-white' : 'text-amber-400 fill-amber-400'}`} />
                  <span>{rate}</span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 max-w-xs pt-1">
            <span>{minLabel}</span>
            <span>{maxLabel}</span>
          </div>
        </div>
        {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
      </div>
    );
  }

  // 2. Multiple Choice (Radio)
  if (question.question_type === 'MULTIPLE_CHOICE') {
    const choices = Array.isArray(options) ? options : (options as any)?.choices || [];

    return (
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-slate-800 leading-snug">
          {index + 1}. {question.question_text}{' '}
          {question.is_required && <span className="text-rose-500">*</span>}
        </Label>

        <div className="space-y-2 pt-1">
          {choices.map((choice: string, cIdx: number) => {
            const selected = value === choice;
            return (
              <label
                key={cIdx}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  selected
                    ? 'border-blue-500 bg-blue-50/60 text-blue-900 font-medium shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name={`q-${question.id}`}
                  disabled={disabled}
                  checked={selected}
                  onChange={() => onChange(choice)}
                  className="h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <span className="text-sm">{choice}</span>
              </label>
            );
          })}
        </div>
        {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
      </div>
    );
  }

  // 3. Checkbox (Multi-select)
  if (question.question_type === 'CHECKBOX') {
    const choices = Array.isArray(options) ? options : (options as any)?.choices || [];
    const currentList: string[] = Array.isArray(value) ? value : [];

    const toggleChoice = (choice: string) => {
      if (currentList.includes(choice)) {
        onChange(currentList.filter((item) => item !== choice));
      } else {
        onChange([...currentList, choice]);
      }
    };

    return (
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <Label className="text-sm font-semibold text-slate-800 leading-snug">
            {index + 1}. {question.question_text}{' '}
            {question.is_required && <span className="text-rose-500">*</span>}
          </Label>
          <span className="text-xs text-slate-400">(Select all that apply)</span>
        </div>

        <div className="space-y-2 pt-1">
          {choices.map((choice: string, cIdx: number) => {
            const selected = currentList.includes(choice);
            return (
              <label
                key={cIdx}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  selected
                    ? 'border-blue-500 bg-blue-50/60 text-blue-900 font-medium shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  disabled={disabled}
                  checked={selected}
                  onChange={() => toggleChoice(choice)}
                  className="h-4 w-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <span className="text-sm">{choice}</span>
              </label>
            );
          })}
        </div>
        {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
      </div>
    );
  }

  // 4. Yes or No
  if (question.question_type === 'YES_NO') {
    return (
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-slate-800 leading-snug">
          {index + 1}. {question.question_text}{' '}
          {question.is_required && <span className="text-rose-500">*</span>}
        </Label>

        <div className="flex items-center gap-3 pt-1">
          {['Yes', 'No'].map((opt) => {
            const selected = value === opt;
            return (
              <button
                type="button"
                key={opt}
                disabled={disabled}
                onClick={() => onChange(opt)}
                className={`flex-1 py-3 px-4 rounded-lg border text-sm font-semibold transition-all ${
                  selected
                    ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
      </div>
    );
  }

  // 5. Short Answer
  if (question.question_type === 'SHORT_ANSWER') {
    const placeholder = (options as any)?.placeholder || 'Enter your response...';

    return (
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-slate-800 leading-snug">
          {index + 1}. {question.question_text}{' '}
          {question.is_required && <span className="text-rose-500">*</span>}
        </Label>

        <Input
          type="text"
          disabled={disabled}
          placeholder={placeholder}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="max-w-md"
        />
        {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
      </div>
    );
  }

  // 6. Paragraph
  const placeholder = (options as any)?.placeholder || 'Type your detailed response here...';
  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold text-slate-800 leading-snug">
        {index + 1}. {question.question_text}{' '}
        {question.is_required && <span className="text-rose-500">*</span>}
      </Label>

      <Textarea
        disabled={disabled}
        placeholder={placeholder}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
      />
      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
    </div>
  );
}

