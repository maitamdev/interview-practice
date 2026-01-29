/**
 * Input validation utilities
 */

export const INTERVIEW_ROLES = ['frontend', 'backend', 'fullstack', 'data', 'qa', 'ba', 'devops', 'mobile'] as const;
export const INTERVIEW_LEVELS = ['intern', 'junior', 'mid', 'senior'] as const;
export const INTERVIEW_MODES = ['behavioral', 'technical', 'mixed'] as const;
export const INTERVIEW_LANGUAGES = ['vi', 'en'] as const;

export type InterviewRole = typeof INTERVIEW_ROLES[number];
export type InterviewLevel = typeof INTERVIEW_LEVELS[number];
export type InterviewMode = typeof INTERVIEW_MODES[number];
export type InterviewLanguage = typeof INTERVIEW_LANGUAGES[number];

export function isValidRole(role: string): role is InterviewRole {
  return INTERVIEW_ROLES.includes(role as InterviewRole);
}

export function isValidLevel(level: string): level is InterviewLevel {
  return INTERVIEW_LEVELS.includes(level as InterviewLevel);
}

export function isValidMode(mode: string): mode is InterviewMode {
  return INTERVIEW_MODES.includes(mode as InterviewMode);
}

export function isValidLanguage(lang: string): lang is InterviewLanguage {
  return INTERVIEW_LANGUAGES.includes(lang as InterviewLanguage);
}

export function sanitizeText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>'"]/g, '') // Remove dangerous chars
    .trim()
    .slice(0, 10000); // Limit length
}

export function validateSessionSetup(setup: {
  role: string;
  level: string;
  mode: string;
  language: string;
  totalQuestions: number;
  jdText?: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!isValidRole(setup.role)) {
    errors.push(`Invalid role: ${setup.role}`);
  }
  if (!isValidLevel(setup.level)) {
    errors.push(`Invalid level: ${setup.level}`);
  }
  if (!isValidMode(setup.mode)) {
    errors.push(`Invalid mode: ${setup.mode}`);
  }
  if (!isValidLanguage(setup.language)) {
    errors.push(`Invalid language: ${setup.language}`);
  }
  if (setup.totalQuestions < 1 || setup.totalQuestions > 50) {
    errors.push('Total questions must be between 1 and 50');
  }
  if (setup.jdText && setup.jdText.length > 10000) {
    errors.push('JD text too long (max 10000 chars)');
  }

  return { valid: errors.length === 0, errors };
}
