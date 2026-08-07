import { useState, useRef, useEffect, useCallback } from 'react';

type TTSState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

export function useTTS() {
  const [state, setState] = useState<TTSState>('idle');
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const play = useCallback(async (text: string) => {
    if (!text) return;

    // Stop any existing playback
    cleanup();

    setState('loading');
    setError(null);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`TTS failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      objectUrlRef.current = objectUrl;

      const audio = new Audio(objectUrl);
      audioRef.current = audio;

      audio.addEventListener('ended', () => setState('idle'));
      audio.addEventListener('pause', () => {
        if (audio.currentTime !== audio.duration) setState('paused');
      });
      audio.addEventListener('play', () => setState('playing'));
      audio.addEventListener('error', () => {
        setState('error');
        setError('Audio playback error');
      });

      await audio.play();
    } catch (e) {
      setState('error');
      setError(e instanceof Error ? e.message : 'Unknown TTS error');
      console.error('TTS Playback Error:', e);
    }
  }, [cleanup]);

  const pause = useCallback(() => {
    if (audioRef.current && state === 'playing') {
      audioRef.current.pause();
    }
  }, [state]);

  const resume = useCallback(() => {
    if (audioRef.current && state === 'paused') {
      audioRef.current.play().catch(e => {
        setState('error');
        setError('Failed to resume');
      });
    }
  }, [state]);

  const toggle = useCallback((text?: string) => {
    if (state === 'playing') {
      pause();
    } else if (state === 'paused') {
      resume();
    } else if (text) {
      void play(text);
    }
  }, [state, pause, resume, play]);

  return { state, error, play, pause, resume, toggle };
}
