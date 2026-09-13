import { cn, formatDuration } from '../lib/utils';
import type { ScheduleBlock, DistractionNote, UserPreferences } from '../types/planner';

interface DayAnalyticsProps {
  blocks: ScheduleBlock[];
  distractions: DistractionNote[];
  preferences: UserPreferences;
  selectedDate: string;
}

const CATEGORY_META: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
  'deep-work': { label: 'Deep Work', emoji: '🎯', color: 'bg-amber-500',   bg: 'bg-amber-500/10' },
  'meetings':  { label: 'Meetings',  emoji: '🤝', color: 'bg-emerald-500', bg: 'bg-emerald-500/10' },
  'admin':     { label: 'Admin',     emoji: '📋', color: 'bg-sky-500',     bg: 'bg-sky-500/10' },
  'personal':  { label: 'Personal',  emoji: '🌱', color: 'bg-rose-500',    bg: 'bg-rose-500/10' },
  'break':     { label: 'Breaks',    emoji: '☕', color: 'bg-stone-600',   bg: 'bg-stone-600/10' },
};

export function DayAnalytics({ blocks, distractions, selectedDate }: DayAnalyticsProps) {
  const workBlocks  = blocks.filter((b) => !b.isBreak);
  const completed   = workBlocks.filter((b) => b.status === 'completed');
  const completionRate = workBlocks.length > 0 ? (completed.length / workBlocks.length) * 100 : 0;
  const totalWork      = workBlocks.reduce((s, b) => s + b.durationMinutes, 0);
  const completedWork  = completed.reduce((s, b) => s + b.durationMinutes, 0);

  const catMap: Record<string, number> = {};
  for (const b of blocks) catMap[b.category] = (catMap[b.category] ?? 0) + b.durationMinutes;
  const totalMins = Object.values(catMap).reduce((s, v) => s + v, 0);

  const focusScore = Math.round(
    completionRate * 0.5 +
    (distractions.length === 0 ? 50 : Math.max(0, 50 - distractions.length * 10))
  );

  const dateDisplay = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="animate-slide-up flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-stone-100" style={{ fontFamily: "'Fraunces', serif" }}>Day Review</h2>
          <p className="text-sm text-stone-500 mt-0.5">{dateDisplay}</p>
        </div>
        <div className="text-right">
          <div
            className="text-5xl font-semibold"
            style={{
              fontFamily: "'Fraunces', serif",
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {focusScore}
          </div>
          <div className="text-xs text-stone-600 font-mono mt-0.5">Focus Score</div>
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Tasks completed', value: `${completed.length}/${workBlocks.length}`, sub: `${Math.round(completionRate)}%`, stagger: 'stagger-1' },
          { label: 'Work completed',  value: formatDuration(completedWork), sub: `of ${formatDuration(totalWork)}`, stagger: 'stagger-2' },
          { label: 'Distractions',    value: `${distractions.length}`, sub: distractions.length === 0 ? '🎯 Perfect!' : 'logged', stagger: 'stagger-3' },
          { label: 'Breaks taken',    value: `${blocks.filter((b) => b.isBreak).length}`, sub: 'scheduled', stagger: 'stagger-4' },
        ].map(({ label, value, sub, stagger }) => (
          <div key={label} className={cn('animate-slide-up bg-white/[0.03] border border-white/[0.06] rounded-xl p-4', stagger)}>
            <p className="text-xs text-stone-600 mb-2 font-mono">{label}</p>
            <p className="text-2xl font-semibold text-stone-100" style={{ fontFamily: "'Fraunces', serif" }}>{value}</p>
            <p className="text-xs text-stone-600 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Completion bar */}
      <div className="animate-slide-up stagger-2 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
        <div className="flex justify-between items-center mb-3">
          <p className="text-sm font-medium text-stone-300">Completion Rate</p>
          <span className="text-sm font-mono text-amber-400">{Math.round(completionRate)}%</span>
        </div>
        <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden relative">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${completionRate}%`,
              background: 'linear-gradient(90deg, #d97706, #f59e0b)',
              boxShadow: completionRate > 0 ? '0 0 10px rgba(245,158,11,0.4)' : 'none',
            }}
          />
        </div>
      </div>

      {/* Time breakdown */}
      {totalMins > 0 && (
        <div className="animate-slide-up stagger-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
          <p className="text-sm font-medium text-stone-300 mb-4">Time Breakdown</p>
          <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5 mb-4">
            {Object.entries(catMap).map(([cat, mins]) => {
              const meta = CATEGORY_META[cat];
              return (
                <div
                  key={cat}
                  className={cn('h-full rounded-sm transition-all duration-700', meta?.color ?? 'bg-stone-600')}
                  style={{ width: `${(mins / totalMins) * 100}%` }}
                  title={`${meta?.label}: ${formatDuration(mins)}`}
                />
              );
            })}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(catMap).map(([cat, mins]) => {
              const meta = CATEGORY_META[cat];
              return (
                <div key={cat} className="flex items-center gap-2">
                  <div className={cn('w-2 h-2 rounded-full flex-shrink-0', meta?.color ?? 'bg-stone-600')} />
                  <div>
                    <p className="text-xs text-stone-400">{meta?.emoji} {meta?.label}</p>
                    <p className="text-xs text-stone-600 font-mono">{formatDuration(mins)} · {Math.round((mins / totalMins) * 100)}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Distractions */}
      {distractions.length > 0 && (
        <div className="animate-slide-up stagger-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
          <p className="text-sm font-medium text-stone-300 mb-4">Distraction Log</p>
          <div className="space-y-2">
            {distractions.map((d, i) => (
              <div key={d.id} className={cn('flex items-start gap-3 text-xs animate-slide-in-left', `stagger-${i + 1}`)}>
                <span className="text-stone-700 font-mono flex-shrink-0 pt-0.5">
                  {new Date(d.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-stone-500">{d.note}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Block timeline */}
      {blocks.length > 0 && (
        <div className="animate-slide-up stagger-5 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
          <p className="text-sm font-medium text-stone-300 mb-4">Block Timeline</p>
          <div className="space-y-2">
            {blocks.map((b) => {
              const meta = CATEGORY_META[b.category];
              const isDone = b.status === 'completed';
              const isSkipped = b.status === 'skipped';
              return (
                <div key={b.id} className={cn('flex items-center gap-3', isSkipped && 'opacity-30')}>
                  <span className="text-xs text-stone-700 font-mono w-14 flex-shrink-0 text-right">{b.startTime}</span>
                  <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', meta?.color ?? 'bg-stone-600')} />
                  <span className={cn('text-xs flex-1', isDone ? 'text-stone-600 line-through' : 'text-stone-400')}>{b.title}</span>
                  <span className="text-xs text-stone-700 font-mono">{formatDuration(b.durationMinutes)}</span>
                  {isDone    && <span className="text-xs text-emerald-400">✓</span>}
                  {isSkipped && <span className="text-xs text-stone-600">skip</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
