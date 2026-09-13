import { useState } from 'react';
import { X } from 'lucide-react';
import type { UserPreferences } from '../types/planner';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onSavePreferences: (prefs: UserPreferences) => void;
}

type FieldDef = { key: string; label: string; type: string; min?: number; max?: number; step?: number };

const FIELD_GROUPS: { label: string; fields: FieldDef[] }[] = [
  {
    label: 'Work Hours',
    fields: [
      { key: 'workStartTime', label: 'Start time', type: 'time' },
      { key: 'workEndTime',   label: 'End time',   type: 'time' },
    ],
  },
  {
    label: 'Focus Sessions',
    fields: [
      { key: 'preferredFocusDuration', label: 'Focus block (min)', type: 'number', min: 15, max: 120 },
      { key: 'shortBreakDuration',     label: 'Short break (min)', type: 'number', min: 5,  max: 30  },
    ],
  },
  {
    label: 'Lunch',
    fields: [
      { key: 'lunchStartTime', label: 'Lunch start',    type: 'time' },
      { key: 'lunchDuration',  label: 'Duration (min)', type: 'number', min: 15, max: 90 },
    ],
  },
  {
    label: 'Scheduling',
    fields: [
      { key: 'bufferRatio', label: 'Buffer ratio (0–0.5)', type: 'number', min: 0, max: 0.5, step: 0.05 },
    ],
  },
];

export function SettingsModal({ isOpen, onClose, preferences, onSavePreferences }: SettingsModalProps) {
  const [local, setLocal] = useState<UserPreferences>(preferences);

  if (!isOpen) return null;

  const update = (key: keyof UserPreferences, value: string | number) =>
    setLocal((p) => ({ ...p, [key]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative bg-[#111] border border-white/[0.08] rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-base font-semibold text-stone-100" style={{ fontFamily: "'Fraunces', serif" }}>
            Preferences
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-stone-600 hover:text-stone-300 hover:bg-white/5 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {FIELD_GROUPS.map(({ label, fields }) => (
            <div key={label}>
              <p className="text-xs text-stone-600 uppercase tracking-wider font-mono mb-3">{label}</p>
              <div className="space-y-3">
                {fields.map(({ key, label: fieldLabel, type, min, max, step }) => (
                  <div key={key} className="flex items-center justify-between gap-4">
                    <label className="text-sm text-stone-400 flex-shrink-0">{fieldLabel}</label>
                    <input
                      type={type}
                      value={local[key as keyof UserPreferences] as string | number}
                      min={min}
                      max={max}
                      step={step ?? (type === 'number' ? 1 : undefined)}
                      onChange={(e) => update(
                        key as keyof UserPreferences,
                        type === 'number' ? parseFloat(e.target.value) : e.target.value
                      )}
                      className="bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-1.5 text-sm text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500/30 w-32 text-right font-mono transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 border-t border-white/[0.06] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm text-stone-500 hover:text-stone-200 hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSavePreferences(local)}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-black transition-all hover:scale-[1.02] active:scale-95"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
          >
            Save & Apply
          </button>
        </div>
      </div>
    </div>
  );
}
