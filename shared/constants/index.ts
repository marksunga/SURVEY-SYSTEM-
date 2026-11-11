/**
 * University of the Assumption — IT Department Portal
 * Centralized Shared System Constants
 */

export const SYSTEM_ROLES = {
  ADMINISTRATOR: 'ADMINISTRATOR',
  STUDENT: 'STUDENT',
} as const;

export type SystemRole = typeof SYSTEM_ROLES[keyof typeof SYSTEM_ROLES];

export const SURVEY_CATEGORIES = {
  ACADEMIC: 'ACADEMIC',
  FACILITY: 'FACILITY',
  INSTRUCTOR: 'INSTRUCTOR',
  EVENT: 'EVENT',
  GENERAL: 'GENERAL',
} as const;

export type SurveyCategory = typeof SURVEY_CATEGORIES[keyof typeof SURVEY_CATEGORIES];

export const QUESTION_TYPES = {
  RATING_SCALE: 'RATING_SCALE',
  CHECKBOX: 'CHECKBOX',
  YES_NO: 'YES_NO',
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
  SHORT_ANSWER: 'SHORT_ANSWER',
  PARAGRAPH: 'PARAGRAPH',
} as const;

export type QuestionType = typeof QUESTION_TYPES[keyof typeof QUESTION_TYPES];
