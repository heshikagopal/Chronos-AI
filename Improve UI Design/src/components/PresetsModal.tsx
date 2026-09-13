import { X, ChevronRight } from 'lucide-react';
import { cn, formatDuration } from '../lib/utils';
import { PRESET_PLANS } from '../data/presets';
import type { DailyPlanPreset } from '../types/planner';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: DailyPlanPreset) => void;
}

export function PresetsModal({ isOpen, onClose, onSelectPreset }: PresetsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative bg-[#111] border border-white/[0.08] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] sticky top-0 bg-[#111]">
          <div>
            <h2 className="text-base font-semibold text-stone-100" style={{ fontFamily: "'Fraunces', serif" }}>
              Day Presets
            </h2>
            <p className="text-xs text-stone-600 mt-0.5">Load a template to populate your priorities</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-stone-600 hover:text-stone-300 hover:bg-white/5 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PRESET_PLANS.map((preset, i) => {
            const totalMins = preset.tasks.reduce((s, t) => s + t.estimatedMinutes, 0);
            return (
              <button
                key={preset.id}
                onClick={() => { onSelectPreset(preset); onClose(); }}
                className={cn(
                  'text-left bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 transition-all duration-200 group animate-slide-up hover:border-amber-500/25 hover:bg-amber-500/5',
                  `stagger-${i + 1}`
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{preset.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-stone-200">{preset.name}</p>
                      <p className="text-xs text-stone-600 mt-0.5 font-mono">
                        {preset.tasks.length} tasks · {formatDuration(totalMins)}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-stone-700 group-hover:text-amber-400 transition-colors mt-0.5" />
                </div>

                <p className="text-xs text-stone-600 mb-3 leading-relaxed">{preset.description}</p>

                <div className="space-y-1">
                  {preset.tasks.slice(0, 3).map((task, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <div className={cn('w-1 h-1 rounded-full flex-shrink-0', {
                        'bg-red-400':    task.priority === 'critical',
                        'bg-orange-400': task.priority === 'high',
                        'bg-amber-400':  task.priority === 'medium',
                        'bg-stone-600':  task.priority === 'low',
                      })} />
                      <span className="text-xs text-stone-600 truncate">{task.title}</span>
                      <span className="text-xs text-stone-700 font-mono ml-auto flex-shrink-0">{formatDuration(task.estimatedMinutes)}</span>
                    </div>
                  ))}
                  {preset.tasks.length > 3 && (
                    <p className="text-xs text-stone-700 pl-3">+{preset.tasks.length - 3} more</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
