import { Calendar, CheckSquare, Zap, BarChart2, Settings, LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import type { EnergyPeak } from '../types/planner';

type Tab = 'priorities' | 'schedule' | 'focus' | 'analytics';

interface HeaderProps {
  currentTab: Tab;
  setCurrentTab: (tab: Tab) => void;
  energyPeak: EnergyPeak;
  setEnergyPeak: (peak: EnergyPeak) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  onOpenSettings: () => void;
  onOpenPresets: () => void;
  activeFocusBlockTitle?: string;
}

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: 'priorities', label: 'Priorities', icon: CheckSquare },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'focus', label: 'Focus', icon: Zap },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
];

const ENERGY_OPTIONS: { value: EnergyPeak; label: string; emoji: string }[] = [
  { value: 'morning', label: 'Morning', emoji: '🌅' },
  { value: 'afternoon', label: 'Afternoon', emoji: '☀️' },
  { value: 'evening', label: 'Evening', emoji: '🌆' },
];

function formatDateDisplay(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function shiftDate(dateStr: string, delta: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + delta);
  return d.toISOString().split('T')[0];
}

export function Header({
  currentTab, setCurrentTab, energyPeak, setEnergyPeak,
  selectedDate, setSelectedDate, onOpenSettings, onOpenPresets,
  activeFocusBlockTitle,
}: HeaderProps) {
  return (
    <header className="border-b border-white/[0.06] bg-black/70 backdrop-blur-md sticky top-0 z-50 animate-fade-in">
      {/* Top row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg animate-glow-pulse"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
          >
            <span className="text-black text-sm font-bold" style={{ fontFamily: "'Fraunces', serif" }}>C</span>
          </div>
          <span className="hidden sm:block text-sm font-semibold text-stone-100 tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
            ChronosAI
          </span>
        </div>

        {/* Date navigator */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedDate(shiftDate(selectedDate, -1))}
            className="p-1.5 rounded-md text-stone-600 hover:text-stone-300 hover:bg-white/5 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-stone-300 min-w-[170px] text-center hidden md:block" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {formatDateDisplay(selectedDate)}
          </span>
          <span className="text-sm text-stone-300 text-center md:hidden">
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          <button
            onClick={() => setSelectedDate(shiftDate(selectedDate, 1))}
            className="p-1.5 rounded-md text-stone-600 hover:text-stone-300 hover:bg-white/5 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Energy peak + actions */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 bg-white/[0.04] border border-white/[0.06] rounded-lg p-1">
            {ENERGY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setEnergyPeak(opt.value)}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200',
                  energyPeak === opt.value
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'text-stone-500 hover:text-stone-300'
                )}
              >
                <span>{opt.emoji}</span>
                <span className="hidden lg:inline">{opt.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={onOpenPresets}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.05] hover:bg-white/[0.09] text-stone-300 transition-colors border border-white/[0.06]"
          >
            <LayoutGrid size={13} />
            <span className="hidden sm:inline">Presets</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-300 hover:bg-white/5 transition-colors"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Tab row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setCurrentTab(id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all duration-200',
              currentTab === id
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-stone-500 hover:text-stone-300'
            )}
          >
            <Icon size={14} />
            <span>{label}</span>
            {id === 'focus' && activeFocusBlockTitle && (
              <span className="ml-1 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>
        ))}
      </div>
    </header>
  );
}
