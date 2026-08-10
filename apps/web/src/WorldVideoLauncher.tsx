import { useEffect, useRef, useState } from 'react';
import './world-video.css';

type WorldVideoStatus = {
  contract?: string;
  enabled?: boolean;
  eligible?: boolean;
  turnCost?: number;
  source?: string;
};

type WorldState = 'idle' | 'generating' | 'ready' | 'error';

export function WorldVideoLauncher() {
  const [status, setStatus] = useState<WorldVideoStatus | null>(null);
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<WorldState>('idle');
  const [message, setMessage] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    void fetch('/api/v1/worlds/video/status', {
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { accept: 'application/json' },
      signal: controller.signal
    })
      .then(async (response) => response.ok ? response.json() as Promise<WorldVideoStatus> : null)
      .then((payload) => setStatus(payload))
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [open]);

  if (!status?.enabled || !status.eligible) return null;

  async function generateWorld() {
    if (state === 'generating') return;
    setState('generating');
    setMessage('Building a private World from your current Expression Field.');
    try {
      const response = await fetch('/api/v1/worlds/video', {
        method: 'POST',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { accept: 'video/mp4,video/*' }
      });
      if (!response.ok) {
        const problem = await response.json().catch(() => ({})) as { message?: string };
        throw new Error(problem.message || 'The World could not be generated.');
      }
      const blob = await response.blob();
      if (!blob.type.startsWith('video/')) throw new Error('The generated World did not return as video.');
      const nextUrl = URL.createObjectURL(blob);
      setVideoUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return nextUrl;
      });
      setState('ready');
      setMessage('Illustrative World · derived from your permitted Expression Field.');
    } catch (error) {
      setState('error');
      setMessage(error instanceof Error ? error.message : 'The World could not be generated.');
    }
  }

  async function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) await video.play().catch(() => undefined);
    else video.pause();
  }

  return (
    <>
      <button className="worlds-launcher" type="button" onClick={() => setOpen(true)}>
        <span aria-hidden="true" />
        <strong>Worlds</strong>
      </button>
      {open && (
        <section className="worlds-stage" role="dialog" aria-modal="true" aria-labelledby="worlds-stage-title">
          <header className="worlds-stage__header">
            <div>
              <span>WORLD · SELF</span>
              <h2 id="worlds-stage-title">See the world you’re living in.</h2>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close Worlds">×</button>
          </header>

          <div className={`worlds-stage__viewport is-${state}`}>
            {videoUrl ? (
              <video
                ref={videoRef}
                src={videoUrl}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                onClick={() => void togglePlayback()}
                aria-label="Private generated World. Select the video to pause or play."
              />
            ) : (
              <div className="worlds-stage__darkness" aria-hidden="true"><span /></div>
            )}

            {state === 'generating' && (
              <div className="worlds-stage__working" role="status">
                <span />
                <p>Translating your Expression Field into space, light, distance, and motion.</p>
              </div>
            )}
          </div>

          <footer className="worlds-stage__footer">
            <div>
              <strong>{state === 'ready' ? 'Expression Field → World' : 'Private by design'}</strong>
              <p>{message || 'Nothing is sent from your raw Baseline. The renderer receives only sanitized world-physics values.'}</p>
            </div>
            <button
              className="worlds-generate"
              type="button"
              onClick={() => void generateWorld()}
              disabled={state === 'generating'}
            >
              {state === 'generating'
                ? 'Generating…'
                : state === 'ready'
                  ? `Generate again · ${status.turnCost ?? 25} AI turns`
                  : `Generate World · ${status.turnCost ?? 25} AI turns`}
            </button>
          </footer>
        </section>
      )}
    </>
  );
}
