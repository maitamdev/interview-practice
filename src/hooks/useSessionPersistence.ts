/**
 * Persist interview session to localStorage for recovery
 */

import { useCallback, useEffect } from 'react';
import { InterviewMessage, InterviewAnswer } from '@/types/interview';

const STORAGE_KEY = 'interview_session_backup';

interface SessionBackup {
  sessionId: string;
  messages: InterviewMessage[];
  answers: InterviewAnswer[];
  timestamp: number;
}

export function useSessionPersistence(sessionId: string | null) {
  // Save session to localStorage
  const saveSession = useCallback((messages: InterviewMessage[], answers: InterviewAnswer[]) => {
    if (!sessionId) return;
    
    const backup: SessionBackup = {
      sessionId,
      messages,
      answers,
      timestamp: Date.now(),
    };
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(backup));
    } catch (e) {
      console.warn('Failed to save session backup:', e);
    }
  }, [sessionId]);

  // Load session from localStorage
  const loadSession = useCallback((): SessionBackup | null => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return null;
      
      const backup: SessionBackup = JSON.parse(data);
      
      // Check if backup is for current session and not too old (1 hour)
      if (backup.sessionId === sessionId && Date.now() - backup.timestamp < 3600000) {
        return backup;
      }
      
      return null;
    } catch (e) {
      console.warn('Failed to load session backup:', e);
      return null;
    }
  }, [sessionId]);

  // Clear session backup
  const clearSession = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear session backup:', e);
    }
  }, []);

  // Auto-clear old backups on mount
  useEffect(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const backup: SessionBackup = JSON.parse(data);
        // Clear if older than 1 hour
        if (Date.now() - backup.timestamp > 3600000) {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (e) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return { saveSession, loadSession, clearSession };
}
