/**
 * Record interview audio for playback later
 */

import { useState, useRef, useCallback } from 'react';

interface Recording {
  blob: Blob;
  url: string;
  duration: number;
  timestamp: Date;
}

export function useInterviewRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [currentRecording, setCurrentRecording] = useState<Recording | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      startTimeRef.current = Date.now();

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const duration = (Date.now() - startTimeRef.current) / 1000;
        
        const recording: Recording = {
          blob,
          url,
          duration,
          timestamp: new Date(),
        };
        
        setCurrentRecording(recording);
        setRecordings(prev => [...prev, recording]);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const downloadRecording = useCallback((recording: Recording, filename?: string) => {
    const a = document.createElement('a');
    a.href = recording.url;
    a.download = filename || `interview-${recording.timestamp.toISOString()}.webm`;
    a.click();
  }, []);

  const clearRecordings = useCallback(() => {
    recordings.forEach(r => URL.revokeObjectURL(r.url));
    setRecordings([]);
    setCurrentRecording(null);
  }, [recordings]);

  return {
    isRecording,
    recordings,
    currentRecording,
    startRecording,
    stopRecording,
    downloadRecording,
    clearRecordings,
  };
}
