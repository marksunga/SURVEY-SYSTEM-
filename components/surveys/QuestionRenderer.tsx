'use client';

import { SurveyQuestion } from '@/lib/types/database';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, CheckCircle2, AlertCircle } from 'lucide-react';

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
  const questionId = question.id;
  const errorId = `error-${questionId}`;

  // 1. Rating Scale
  if (question.question_type === 'RATING_SCALE') {
    const min = (options as any)?.min || 1;
    const max = (options as any)?.max || 5;
    const minLabel = (options as any)?.minLabel || 'Poor';
    const maxLabel = (options as any)?.maxLabel || 'Excellent';
    const ratings = Array.from({ length: max - min + 1 }, (_, i) => min + i);

    return (
      <fieldset className="space-y-3" aria-describedby={error ? errorId : undefined}>
        <legend className="text-sm font-semibold text-slate-800 leading-snug">
          {index + 1}. {question.question_text}{' '}
          {question.is_required && <span className="text-rose-500" aria-label="Required field">*</span>}
        </legend>

        <div className="flex flex-col gap-2 pt-1">
          <div className="flex items-center gap-2 flex-wrap" role="group" aria-label={`Rating scale for ${question.question_text}`}>
            {ratings.map((rate) => {
              const selected = Number(value) === rate;
              return (
                <button
                  type="button"
                  key={rate}
                  disabled={disabled}
                  aria-pressed={selected}
                  aria-label={`Rate ${rate} out of ${max}`}
                  onClick={() => onChange(rate)}
                  className={`h-11 w-11 rounded-lg border text-sm font-bold transition-all flex flex-col items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 min-h-[44px] min-w-[44px] ${
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
          <div className="flex items-center justify-between text-xs text-slate-500 max-w-xs pt-1">
            <span>{minLabel}</span>
            <span>{maxLabel}</span>
          </div>
        </div>
        {error && (
          <p id={errorId} role="alert" className="text-xs text-rose-600 font-medium flex items-center gap-1.5 pt-1">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{error}</span>
          </p>
        )}
      </fieldset>
    );
  }

  // 2. Multiple / Single Choice (Radio)
  if (question.question_type === 'MULTIPLE_CHOICE' || question.question_type === 'SINGLE_CHOICE') {
    const choices = Array.isArray(options) ? options : (options as any)?.choices || [];

    return (
      <fieldset className="space-y-3" aria-describedby={error ? errorId : undefined}>
        <legend className="text-sm font-semibold text-slate-800 leading-snug">
          {index + 1}. {question.question_text}{' '}
          {question.is_required && <span className="text-rose-500" aria-label="Required field">*</span>}
        </legend>

        <div className="space-y-2 pt-1" role="radiogroup" aria-label={question.question_text}>
          {choices.map((choice: string, cIdx: number) => {
            const selected = value === choice;
            return (
              <label
                key={cIdx}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all min-h-[44px] select-none ${
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
                  aria-checked={selected}
                  onChange={() => onChange(choice)}
                  className="h-4 w-4 text-blue-600 border-slate-300 focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm leading-normal">{choice}</span>
              </label>
            );
          })}
        </div>
        {error && (
          <p id={errorId} role="alert" className="text-xs text-rose-600 font-medium flex items-center gap-1.5 pt-1">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{error}</span>
          </p>
        )}
      </fieldset>
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
      <fieldset className="space-y-3" aria-describedby={error ? errorId : undefined}>
        <div className="flex items-baseline justify-between gap-2">
          <legend className="text-sm font-semibold text-slate-800 leading-snug">
            {index + 1}. {question.question_text}{' '}
            {question.is_required && <span className="text-rose-500" aria-label="Required field">*</span>}
          </legend>
          <span className="text-xs text-slate-500 font-normal whitespace-nowrap">(Select all that apply)</span>
        </div>

        <div className="space-y-2 pt-1" role="group" aria-label={question.question_text}>
          {choices.map((choice: string, cIdx: number) => {
            const selected = currentList.includes(choice);
            return (
              <label
                key={cIdx}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all min-h-[44px] select-none ${
                  selected
                    ? 'border-blue-500 bg-blue-50/60 text-blue-900 font-medium shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  disabled={disabled}
                  checked={selected}
                  aria-checked={selected}
                  onChange={() => toggleChoice(choice)}
                  className="h-4 w-4 rounded text-blue-600 border-slate-300 focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm leading-normal">{choice}</span>
              </label>
            );
          })}
        </div>
        {error && (
          <p id={errorId} role="alert" className="text-xs text-rose-600 font-medium flex items-center gap-1.5 pt-1">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{error}</span>
          </p>
        )}
      </fieldset>
    );
  }

  // 4. Yes or No
  if (question.question_type === 'YES_NO') {
    return (
      <fieldset className="space-y-3" aria-describedby={error ? errorId : undefined}>
        <legend className="text-sm font-semibold text-slate-800 leading-snug">
          {index + 1}. {question.question_text}{' '}
          {question.is_required && <span className="text-rose-500" aria-label="Required field">*</span>}
        </legend>

        <div className="flex items-center gap-3 pt-1" role="radiogroup" aria-label={question.question_text}>
          {['Yes', 'No'].map((opt) => {
            const selected = value === opt;
            return (
              <button
                type="button"
                key={opt}
                disabled={disabled}
                aria-pressed={selected}
                onClick={() => onChange(opt)}
                className={`flex-1 py-3 px-4 rounded-lg border text-sm font-semibold transition-all cursor-pointer min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
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
        {error && (
          <p id={errorId} role="alert" className="text-xs text-rose-600 font-medium flex items-center gap-1.5 pt-1">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{error}</span>
          </p>
        )}
      </fieldset>
    );
  }

  // 5. Short Answer
  if (question.question_type === 'SHORT_ANSWER') {
    const placeholder = (options as any)?.placeholder || 'Enter your response...';

    return (
      <div className="space-y-2">
        <Label htmlFor={`input-${question.id}`} className="text-sm font-semibold text-slate-800 leading-snug block">
          {index + 1}. {question.question_text}{' '}
          {question.is_required && <span className="text-rose-500" aria-label="Required field">*</span>}
        </Label>

        <Input
          id={`input-${question.id}`}
          type="text"
          disabled={disabled}
          placeholder={placeholder}
          value={value || ''}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          onChange={(e) => onChange(e.target.value)}
          className="max-w-md text-xs sm:text-sm h-10"
        />
        {error && (
          <p id={errorId} role="alert" className="text-xs text-rose-600 font-medium flex items-center gap-1.5 pt-1">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  }

  // 6. Paragraph
  const placeholder = (options as any)?.placeholder || 'Type your detailed response here...';
  return (
    <div className="space-y-2">
      <Label htmlFor={`textarea-${question.id}`} className="text-sm font-semibold text-slate-800 leading-snug block">
        {index + 1}. {question.question_text}{' '}
        {question.is_required && <span className="text-rose-500" aria-label="Required field">*</span>}
      </Label>

      <Textarea
        id={`textarea-${question.id}`}
        disabled={disabled}
        placeholder={placeholder}
        value={value || ''}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="text-xs sm:text-sm"
      />
      {error && (
        <p id={errorId} role="alert" className="text-xs text-rose-600 font-medium flex items-center gap-1.5 pt-1">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
