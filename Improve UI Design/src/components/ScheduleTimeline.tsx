import { useState } from 'react';
import { Play, RotateCcw, AlertTriangle, Coffee, ChevronDown, ChevronUp } from 'lucide-react';
import { cn, formatTime, formatDuration } from '../lib/utils';
import type { ScheduleBlock } from '../types/planner';

interface ScheduleTimelineProps {
  blocks: ScheduleBlock[];
  setBlocks: (blocks: ScheduleBlock[]) => void;
  warnings: string[];
  onStartFocusBlock: (block: ScheduleBlock) => void;
  onRebalanceDay: () => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string; dot: string; accent: string }> = {
  'deep-work': { bg: 'bg-amber-500/8',   border: 'border-amber-500/20',   text: 'text-amber-300',   dot: 'bg-amber-400',   accent: '#f59e0b' },
  'meetings':  { bg: 'bg-emerald-500/8', border: 'border-emerald-500/20', text: 'text-emerald-300', dot: 'bg-emerald-400', accent: '#34d399' },
  'admin':     { bg: 'bg-sky-500/8',     border: 'border-sky-500/20',     text: 'text-sky-300',     dot: 'bg-sky-400',     accent: '#38bdf8' },
  'personal':  { bg: 'bg-rose-500/8',    border: 'border-rose-500/20',    text: 'text-rose-300',    dot: 'bg-rose-400',    accent: '#fb7185' },
  'break':     { bg: 'bg-white/[0.03]',  border: 'border-white/[0.05]',   text: 'text-stone-600',   dot: 'bg-stone-700',   accent: '#57534e' },
};

const STATUS_STYLES: Record<string, string> = {
  completed: 'opacity-40 scale-[0.99]',
  skipped:   'opacity-25',
  'in-progress': 'ring-1 ring-amber-400/30',
};

const PRIORITY_DOT: Record<string, string> = {
  critical: 'bg-red-400',
  high:     'bg-orange-400',
  medium:   'bg-yellow-400',
  low:      'bg-stone-600',
};

export function ScheduleTimeline({ blocks, setBlocks, warnings, onStartFocusBlock, onRebalanceDay }: ScheduleTimelineProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const totalWork    = blocks.filter((b) => !b.isBreak).reduce((s, b) => s + b.durationMinutes, 0);
  const completedWork = blocks.filter((b) => !b.isBreak && b.status === 'completed').reduce((s, b) => s + b.durationMinutes, 0);
  const completedCount = blocks.filter((b) => b.status === 'completed').length;
  const progress = totalWork > 0 ? (completedWork / totalWork) * 100 : 0;

  const markComplete = (id: string) =>
    setBlocks(blocks.map((b) => b.id === id ? { ...b, status: 'completed' } : b));
  const markSkipped = (id: string) =>
    setBlocks(blocks.map((b) => b.id === id ? { ...b, status: 'skipped' } : b));

  if (blocks.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center animate-fade-in">
        <div className="text-4xl animate-float">📅</div>
        <p className="text-stone-500">No schedule yet. Add your priorities and generate a schedule.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Timeline */}
      <div className="lg:col-span-3 space-y-2">
        {warnings.length > 0 && (
          <div className="animate-slide-up bg-yellow-500/6 border border-yellow-500/15 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-2">
              <AlertTriangle size={14} className="text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-yellow-400 mb-1">Schedule notices</p>
                {warnings.map((w, i) => (
                  <p key={i} className="text-xs text-yellow-300/60">{w}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {blocks.map((block, i) => {
          const colors = CATEGORY_COLORS[block.category] ?? CATEGORY_COLORS['admin'];
          const isExpanded = expandedId === block.id;
          const isCompleted = block.status === 'completed';
          const staggerClass = `stagger-${Math.min(i + 1, 8)}`;

          return (
            <div
              key={block.id}
              className={cn(
                'rounded-xl border transition-all duration-300 animate-slide-in-left',
                staggerClass,
                colors.bg, colors.border,
                STATUS_STYLES[block.status] ?? '',
                block.isBreak ? 'py-2' : 'py-3',
                !block.isBreak && block.status === 'pending' && 'hover:border-opacity-40'
              )}
            >
              <div className="flex items-center gap-3 px-4">
                {/* Time */}
                <div className="flex-shrink-0 w-16 text-right">
                  <span className="text-xs text-stone-600 font-mono">{formatTime(block.startTime)}</span>
                </div>

                {/* Indicator */}
                <div className="flex-shrink-0">
                  {block.isBreak ? (
                    <Coffee size={13} className="text-stone-700" />
                  ) : (
                    <div
                      className={cn('w-2 h-2 rounded-full transition-transform', block.priority ? PRIORITY_DOT[block.priority] : colors.dot)}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn('text-sm font-medium truncate transition-all', isCompleted ? 'line-through text-stone-600' : 'text-stone-100')}>
                      {block.title}
                    </p>
                    <span className={cn('text-xs px-2 py-0.5 rounded-md font-mono flex-shrink-0 border', colors.bg, colors.text, colors.border)}>
                      {formatDuration(block.durationMinutes)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {!block.isBreak && block.status === 'pending' && (
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => onStartFocusBlock(block)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-black transition-all hover:scale-105 active:scale-95"
                      style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 0 12px rgba(245,158,11,0.25)' }}
                    >
                      <Play size={11} /> Focus
                    </button>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : block.id)}
                      className="p-1.5 rounded-lg text-stone-600 hover:text-stone-300 hover:bg-white/5 transition-colors"
                    >
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                )}

                {!block.isBreak && block.status === 'completed' && (
                  <span className="text-xs text-emerald-400 font-mono flex-shrink-0">✓</span>
                )}
              </div>

              {/* Expanded */}
              {isExpanded && !block.isBreak && (
                <div className="px-4 pt-3 pb-1 mt-2 border-t border-white/[0.05] animate-slide-up">
                  {block.notes && <p className="text-xs text-stone-500 mb-3">{block.notes}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={() => { markComplete(block.id); setExpandedId(null); }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600/15 text-emerald-300 text-xs hover:bg-emerald-600/25 transition-colors border border-emerald-500/20"
                    >
                      Mark complete
                    </button>
                    <button
                      onClick={() => { markSkipped(block.id); setExpandedId(null); }}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-stone-500 text-xs hover:bg-white/[0.07] transition-colors border border-white/[0.06]"
                    >
                      Skip
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        {/* Progress card */}
        <div className="animate-slide-up stagger-1 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
          <p className="text-xs text-stone-600 uppercase tracking-wider font-mono mb-3">Day Progress</p>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-3xl font-semibold text-stone-100" style={{ fontFamily: "'Fraunces', serif" }}>
              {Math.round(progress)}%
            </span>
          </div>
          {/* Animated progress bar */}
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden relative">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #d97706, #f59e0b)',
                boxShadow: progress > 0 ? '0 0 8px rgba(245,158,11,0.5)' : 'none',
              }}
            />
            {progress > 0 && progress < 100 && (
              <div
                className="absolute top-0 h-full w-12 animate-shimmer rounded-full"
                style={{ left: `calc(${progress}% - 48px)` }}
              />
            )}
          </div>
          <div className="flex justify-between mt-3 text-xs text-stone-600 font-mono">
            <span>{completedCount} done</span>
            <span>{blocks.filter((b) => !b.isBreak && b.status === 'pending').length} left</span>
          </div>
        </div>

        {/* Stats */}
        <div className="animate-slide-up stagger-2 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
          <p className="text-xs text-stone-600 uppercase tracking-wider font-mono mb-3">Summary</p>
          <div className="space-y-2.5">
            {[
              { label: 'Total work',  value: formatDuration(totalWork) },
              { label: 'Completed',   value: formatDuration(completedWork), highlight: true },
              { label: 'Breaks',      value: formatDuration(blocks.filter((b) => b.isBreak).reduce((s, b) => s + b.durationMinutes, 0)) },
              { label: 'Blocks',      value: `${blocks.filter((b) => !b.isBreak).length}` },
            ].map(({ label, value, highlight }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-xs text-stone-600">{label}</span>
                <span className={cn('text-xs font-mono font-medium', highlight ? 'text-amber-400' : 'text-stone-300')}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onRebalanceDay}
          className="animate-slide-up stagger-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.03] text-stone-500 text-sm hover:text-stone-200 hover:bg-white/[0.06] transition-all"
        >
          <RotateCcw size={13} /> Rebalance
        </button>
      </div>
    </div>
  );
}
