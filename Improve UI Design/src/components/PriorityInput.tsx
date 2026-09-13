import { useState } from 'react';
import { Plus, Trash2, GripVertical, Sparkles, Clock, Tag } from 'lucide-react';
import { cn, formatDuration } from '../lib/utils';
import type { TaskInput, Priority, TaskCategory, UserPreferences } from '../types/planner';

interface PriorityInputProps {
  tasks: TaskInput[];
  setTasks: (tasks: TaskInput[]) => void;
  preferences: UserPreferences & { energyPeak: string };
  onGenerateSchedule: () => void;
}

const PRIORITIES: { value: Priority; label: string; color: string; bg: string; border: string }[] = [
  { value: 'critical', label: 'Critical', color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/25' },
  { value: 'high',     label: 'High',     color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/25' },
  { value: 'medium',   label: 'Medium',   color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/25' },
  { value: 'low',      label: 'Low',      color: 'text-stone-400',  bg: 'bg-stone-500/10',  border: 'border-stone-500/20' },
];

const CATEGORIES: { value: TaskCategory; label: string; emoji: string }[] = [
  { value: 'deep-work', label: 'Deep Work', emoji: '🎯' },
  { value: 'meetings',  label: 'Meetings',  emoji: '🤝' },
  { value: 'admin',     label: 'Admin',     emoji: '📋' },
  { value: 'personal',  label: 'Personal',  emoji: '🌱' },
];

const DURATION_PRESETS = [15, 25, 30, 45, 60, 90, 120];

const priorityMeta = (p: Priority) => PRIORITIES.find((x) => x.value === p)!;

export function PriorityInput({ tasks, setTasks, onGenerateSchedule }: PriorityInputProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<TaskCategory>('deep-work');
  const [duration, setDuration] = useState(45);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  const addTask = () => {
    if (!title.trim()) return;
    setTasks([
      ...tasks,
      { id: `task-${Date.now()}`, title: title.trim(), estimatedMinutes: duration, priority, category, notes: notes.trim() || undefined },
    ]);
    setTitle('');
    setNotes('');
    setShowNotes(false);
  };

  const removeTask = (id: string) => setTasks(tasks.filter((t) => t.id !== id));
  const totalMinutes = tasks.reduce((s, t) => s + t.estimatedMinutes, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Form */}
      <div className="lg:col-span-2 animate-slide-up">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
          <h2 className="text-base font-semibold text-stone-100 mb-4" style={{ fontFamily: "'Fraunces', serif" }}>
            Add Task
          </h2>

          <div className="mb-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
              placeholder="What needs to get done?"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/25 transition-all"
            />
          </div>

          <div className="mb-4">
            <label className="text-xs text-stone-600 uppercase tracking-wider mb-2 block font-mono">Priority</label>
            <div className="grid grid-cols-4 gap-1.5">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPriority(p.value)}
                  className={cn(
                    'px-2 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 hover:scale-[1.03] active:scale-95',
                    priority === p.value ? `${p.bg} ${p.color} ${p.border}` : 'bg-transparent border-white/[0.06] text-stone-600 hover:border-white/[0.12]'
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="text-xs text-stone-600 uppercase tracking-wider mb-2 block font-mono">Category</label>
            <div className="grid grid-cols-2 gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-150',
                    category === c.value
                      ? 'bg-amber-500/12 text-amber-300 border-amber-500/25'
                      : 'bg-transparent border-white/[0.06] text-stone-600 hover:border-white/[0.12] hover:text-stone-400'
                  )}
                >
                  <span>{c.emoji}</span> {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="text-xs text-stone-600 uppercase tracking-wider mb-2 block font-mono">
              Duration — {formatDuration(duration)}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DURATION_PRESETS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-mono border transition-all duration-150',
                    duration === d
                      ? 'bg-amber-500/12 text-amber-300 border-amber-500/25'
                      : 'bg-transparent border-white/[0.06] text-stone-600 hover:border-white/[0.12]'
                  )}
                >
                  {formatDuration(d)}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowNotes(!showNotes)}
            className="text-xs text-stone-600 hover:text-stone-400 flex items-center gap-1 mb-3 transition-colors"
          >
            <Tag size={11} /> {showNotes ? 'Hide notes' : 'Add notes'}
          </button>

          {showNotes && (
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any context or notes..."
              rows={2}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-amber-500/30 resize-none mb-3 transition-all animate-slide-up"
            />
          )}

          <button
            onClick={addTask}
            disabled={!title.trim()}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-black transition-all active:scale-98 disabled:opacity-35 disabled:cursor-not-allowed hover:scale-[1.01]"
            style={{ background: title.trim() ? 'linear-gradient(135deg, #f59e0b, #d97706)' : '#333' }}
          >
            <Plus size={15} /> Add Task
          </button>
        </div>
      </div>

      {/* Task list */}
      <div className="lg:col-span-3">
        <div className="flex items-center justify-between mb-4 animate-slide-up stagger-1">
          <h2 className="text-base font-semibold text-stone-100" style={{ fontFamily: "'Fraunces', serif" }}>
            Today&apos;s Priorities
            {tasks.length > 0 && (
              <span className="ml-2 text-xs font-normal text-stone-600 font-mono">
                {tasks.length} task{tasks.length !== 1 ? 's' : ''} · {formatDuration(totalMinutes)}
              </span>
            )}
          </h2>

          {tasks.length > 0 && (
            <button
              onClick={onGenerateSchedule}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-black transition-all hover:scale-[1.03] active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                boxShadow: '0 0 20px rgba(245,158,11,0.3)',
              }}
            >
              <Sparkles size={14} /> Generate Schedule
            </button>
          )}
        </div>

        {tasks.length === 0 ? (
          <div className="animate-fade-in bg-white/[0.02] border border-dashed border-white/[0.07] rounded-2xl p-12 flex flex-col items-center gap-3 text-center">
            <div className="text-3xl animate-float">📝</div>
            <p className="text-stone-500 text-sm">Add your tasks for the day,<br />then let AI build your schedule.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {(['critical', 'high', 'medium', 'low'] as Priority[]).map((p) => {
              const group = tasks.filter((t) => t.priority === p);
              if (group.length === 0) return null;
              const meta = priorityMeta(p);
              return (
                <div key={p} className="animate-slide-up">
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <div className={cn('w-1.5 h-1.5 rounded-full', meta.color.replace('text-', 'bg-'))} />
                    <span className="text-xs uppercase tracking-wider text-stone-600 font-mono">{meta.label}</span>
                  </div>
                  {group.map((task, idx) => {
                    const catMeta = CATEGORIES.find((c) => c.value === task.category);
                    return (
                      <div
                        key={task.id}
                        className={cn(
                          'flex items-center gap-3 p-3.5 rounded-xl border mb-1.5 group transition-all duration-200 hover:scale-[1.005] animate-slide-in-left',
                          `stagger-${idx + 1}`,
                          meta.bg, meta.border
                        )}
                      >
                        <GripVertical size={14} className="text-stone-700 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-stone-200 truncate">{task.title}</p>
                          {task.notes && <p className="text-xs text-stone-600 truncate mt-0.5">{task.notes}</p>}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-stone-600">{catMeta?.emoji}</span>
                          <span className="flex items-center gap-1 text-xs text-stone-600 font-mono">
                            <Clock size={10} />{formatDuration(task.estimatedMinutes)}
                          </span>
                          <button
                            onClick={() => removeTask(task.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded text-stone-700 hover:text-red-400 transition-all"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
