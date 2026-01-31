import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export const SHORTCUTS: ShortcutConfig[] = [
  { key: 'n', ctrl: true, action: () => {}, description: 'Phỏng vấn mới' },
  { key: 'd', ctrl: true, action: () => {}, description: 'Dashboard' },
  { key: 'b', ctrl: true, action: () => {}, description: 'Bookmarks' },
  { key: 'q', ctrl: true, action: () => {}, description: 'Quick Practice' },
  { key: 'l', ctrl: true, action: () => {}, description: 'Learning Path' },
  { key: '/', ctrl: true, action: () => {}, description: 'Hiện shortcuts' },
];

export function useKeyboardShortcuts(customShortcuts?: ShortcutConfig[]) {
  const navigate = useNavigate();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    const shortcuts: ShortcutConfig[] = [
      { key: 'n', ctrl: true, action: () => navigate('/interview/new'), description: 'Phỏng vấn mới' },
      { key: 'd', ctrl: true, action: () => navigate('/dashboard'), description: 'Dashboard' },
      { key: 'b', ctrl: true, action: () => navigate('/bookmarks'), description: 'Bookmarks' },
      { key: 'q', ctrl: true, action: () => navigate('/quick-practice'), description: 'Quick Practice' },
      { key: 'l', ctrl: true, action: () => navigate('/learning-path'), description: 'Learning Path' },
      ...(customShortcuts || []),
    ];

    for (const shortcut of shortcuts) {
      const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey;
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const altMatch = shortcut.alt ? event.altKey : !event.altKey;
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

      if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
        event.preventDefault();
        shortcut.action();
        return;
      }
    }
  }, [navigate, customShortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Hook for showing shortcuts help modal
export function useShortcutsHelp() {
  const shortcuts = [
    { keys: ['Ctrl', 'N'], description: 'Phỏng vấn mới' },
    { keys: ['Ctrl', 'D'], description: 'Dashboard' },
    { keys: ['Ctrl', 'B'], description: 'Bookmarks' },
    { keys: ['Ctrl', 'Q'], description: 'Quick Practice' },
    { keys: ['Ctrl', 'L'], description: 'Learning Path' },
    { keys: ['Ctrl', '/'], description: 'Hiện shortcuts' },
    { keys: ['Esc'], description: 'Đóng modal' },
  ];

  return { shortcuts };
}
