import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, CheckCircle, Plus, Minus, AlertCircle } from 'lucide-react';
import { cn, formatDuration } from '../lib/utils';
import type { ScheduleBlock, DistractionNote } from '../types/planner';

interface FocusModeProps {
  activeBlock: ScheduleBlock | null;
  onCompleteBlock: (blockId: string, actualMinutes: number) => void;
  onExtendBlock: (blockId: string, extraMinutes: number) => void;
  onNextBlock: () => void;
  distractions: DistractionNote[];
  setDistractions: (d: DistractionNote[]) => void;
}

function useTimer(totalSeconds: number) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setRemaining(totalSeconds);
    setRunning(false);
  }, [totalSeconds]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => Math.max(0, r - 1));
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const elapsed = totalSeconds - remaining;
  return { remaining, running, setRunning, elapsed };
}

function formatSeconds(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export function FocusMode({ activeBlock, onCompleteBlock, onExtendBlock, onNextBlock, distractions, setDistractions }: FocusModeProps) {
  const totalSeconds = (activeBlock?.durationMinutes ?? 25) * 60;
  const { remaining, running, setRunning, elapsed } = useTimer(totalSeconds);
  const [distractionNote, setDistractionNote] = useState('');
  const [showDistractionInput, setShowDistractionInput] = useState(false);

  const progress = totalSeconds > 0 ? ((totalSeconds - remaining) / totalSeconds) * 100 : 0;
  const r = 110;
  const circumference = 2 * Math.PI * r;
  const strokeDash = (progress / 100) * circumference;
  const isDone = remaining === 0;

  const logDistraction = () => {
    if (!activeBlock || !distractionNote.trim()) return;
    setDistractions([
      ...distractions,
      { id: `d-${Date.now()}`, blockId: activeBlock.id, timestamp: new Date().toISOString(), note: distractionNote.trim() },
    ]);
    setDistractionNote('');
    setShowDistractionInput(false);
  };

  const handleComplete = () => {
    if (!activeBlock) return;
    onCompleteBlock(activeBlock.id, Math.max(1, Math.round(elapsed / 60)));
  };

  const blockDistractions = distractions.filter((d) => d.blockId === activeBlock?.id);

  if (!activeBlock) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center animate-fade-in">
        <div className="text-4xl animate-float">🎯</div>
        <p className="text-stone-500">No focus block selected. Start one from the Schedule tab.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto animate-slide-up">
      {/* Title */}
      <div className="text-center mb-10">
        <p className="text-xs text-stone-600 uppercase tracking-widest font-mono mb-2">Now focusing on</p>
        <h2 className="text-2xl font-semibold text-stone-100" style={{ fontFamily: "'Fraunces', serif" }}>
          {activeBlock.title}
        </h2>
        <p className="text-sm text-stone-500 mt-1">{formatDuration(activeBlock.durationMinutes)} block</p>
      </div>

      {/* Timer ring */}
      <div className="flex justify-center mb-10">
        <div className={cn('relative w-64 h-64', running && 'animate-breathe')}>
          <svg className="w-full h-full -rotate-90" viewBox="0 0 240 240">
            {/* Track */}
            <circle cx="120" cy="120" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
            {/* Glow ring (behind) */}
            {running && (
              <circle
                cx="120" cy="120" r={r} fill="none"
                stroke="rgba(245,158,11,0.15)" strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - strokeDash}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s linear', filter: 'blur(3px)' }}
              />
            )}
            {/* Main arc */}
            <circle
              cx="120" cy="120" r={r} fill="none"
              stroke={isDone ? '#34d399' : '#f59e0b'}
              strokeWidth="5" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - strokeDash}
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.4s ease' }}
            />
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-5xl font-light tabular-nums tracking-tight text-stone-100"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {formatSeconds(remaining)}
            </span>
            <span className="text-xs text-stone-600 mt-2 font-mono uppercase tracking-wider">
              {isDone ? '✓ complete' : running ? '● in focus' : '⏸ paused'}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          onClick={() => onExtendBlock(activeBlock.id, -10)}
          className="p-3 rounded-xl border border-white/[0.06] text-stone-600 hover:text-stone-300 hover:bg-white/5 transition-all active:scale-95"
          title="−10 min"
        >
          <Minus size={15} />
        </button>

        <button
          onClick={() => setRunning(!running)}
          className={cn(
            'flex items-center gap-2.5 px-10 py-3.5 rounded-2xl text-sm font-semibold transition-all active:scale-95',
            running
              ? 'bg-white/[0.08] hover:bg-white/[0.12] text-stone-200'
              : 'text-black hover:scale-105'
          )}
          style={!running ? {
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            boxShadow: '0 0 24px rgba(245,158,11,0.35)',
          } : {}}
        >
          {running ? <Pause size={16} /> : <Play size={16} />}
          {running ? 'Pause' : 'Start'}
        </button>

        <button
          onClick={() => onExtendBlock(activeBlock.id, 10)}
          className="p-3 rounded-xl border border-white/[0.06] text-stone-600 hover:text-stone-300 hover:bg-white/5 transition-all active:scale-95"
          title="+10 min"
        >
          <Plus size={15} />
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <button
          onClick={handleComplete}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600/15 border border-emerald-500/20 text-emerald-300 text-sm hover:bg-emerald-600/25 transition-all"
        >
          <CheckCircle size={14} /> Complete
        </button>
        <button
          onClick={onNextBlock}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-stone-500 text-sm hover:text-stone-200 hover:bg-white/[0.07] transition-all"
        >
          <SkipForward size={14} /> Next block
        </button>
      </div>

      {/* Distraction log */}
      <div className="animate-slide-up stagger-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-stone-300">Distraction Log</p>
            <p className="text-xs text-stone-600 mt-0.5">{blockDistractions.length} logged</p>
          </div>
          <button
            onClick={() => setShowDistractionInput(!showDistractionInput)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-white/[0.04] border border-white/[0.06] text-stone-500 hover:text-stone-200 transition-all"
          >
            <AlertCircle size={12} /> Log
          </button>
        </div>

        {showDistractionInput && (
          <div className="flex gap-2 mb-4 animate-slide-up">
            <input
              value={distractionNote}
              onChange={(e) => setDistractionNote(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && logDistraction()}
              placeholder="What distracted you?"
              autoFocus
              className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
            />
            <button
              onClick={logDistraction}
              className="px-3 py-2 rounded-lg text-xs font-medium text-black transition-colors"
              style={{ background: '#f59e0b' }}
            >
              Log
            </button>
          </div>
        )}

        {blockDistractions.length > 0 ? (
          <div className="space-y-2">
            {blockDistractions.map((d, i) => (
              <div key={d.id} className={cn('flex items-start gap-2 text-xs animate-slide-in-left', `stagger-${i + 1}`)}>
                <span className="text-stone-700 font-mono flex-shrink-0">
                  {new Date(d.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-stone-500">{d.note}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-stone-700 italic">No distractions — great focus!</p>
        )}
      </div>
    </div>
  );
}
