import { useState, useEffect } from 'react';
import type {
  TaskInput,
  ScheduleBlock,
  UserPreferences,
  EnergyPeak,
  DistractionNote,
  DailyPlanPreset,
} from './types/planner';
import { generateAISchedule, rebalanceSchedule } from './services/aiScheduler';
import { PRESET_PLANS } from './data/presets';
import { Header } from './components/Header';
import { PriorityInput } from './components/PriorityInput';
import { ScheduleTimeline } from './components/ScheduleTimeline';
import { FocusMode } from './components/FocusMode';
import { DayAnalytics } from './components/DayAnalytics';
import { SettingsModal } from './components/SettingsModal';
import { PresetsModal } from './components/PresetsModal';

const DEFAULT_PREFERENCES: UserPreferences = {
  workStartTime: '09:00',
  workEndTime: '18:00',
  energyPeak: 'morning',
  preferredFocusDuration: 50,
  shortBreakDuration: 10,
  lunchStartTime: '12:30',
  lunchDuration: 45,
  bufferRatio: 0.15,
};

export function App() {
  const [currentTab, setCurrentTab] = useState<'priorities' | 'schedule' | 'focus' | 'analytics'>('priorities');
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem('chronos_preferences');
    return saved ? JSON.parse(saved) : DEFAULT_PREFERENCES;
  });

  const [energyPeak, setEnergyPeak] = useState<EnergyPeak>(preferences.energyPeak);

  const [tasks, setTasks] = useState<TaskInput[]>(() => {
    const saved = localStorage.getItem('chronos_tasks');
    if (saved) return JSON.parse(saved);
    const defaultPreset = PRESET_PLANS[0];
    return defaultPreset.tasks.map((t, idx) => ({ ...t, id: `default-task-${idx}` }));
  });

  const [blocks, setBlocks] = useState<ScheduleBlock[]>(() => {
    const saved = localStorage.getItem('chronos_blocks');
    return saved ? JSON.parse(saved) : [];
  });

  const [warnings, setWarnings] = useState<string[]>([]);
  const [activeFocusBlock, setActiveFocusBlock] = useState<ScheduleBlock | null>(null);
  const [distractions, setDistractions] = useState<DistractionNote[]>(() => {
    const saved = localStorage.getItem('chronos_distractions');
    return saved ? JSON.parse(saved) : [];
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);

  useEffect(() => { localStorage.setItem('chronos_preferences', JSON.stringify({ ...preferences, energyPeak })); }, [preferences, energyPeak]);
  useEffect(() => { localStorage.setItem('chronos_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('chronos_blocks', JSON.stringify(blocks)); }, [blocks]);
  useEffect(() => { localStorage.setItem('chronos_distractions', JSON.stringify(distractions)); }, [distractions]);

  useEffect(() => {
    if (blocks.length === 0 && tasks.length > 0) handleGenerateSchedule();
  }, []);

  const handleGenerateSchedule = () => {
    const currentPrefs = { ...preferences, energyPeak };
    const result = generateAISchedule(tasks, currentPrefs);
    setBlocks(result.blocks);
    setWarnings(result.warnings);
    const firstWork = result.blocks.find((b) => !b.isBreak);
    if (firstWork) setActiveFocusBlock(firstWork);
    setCurrentTab('schedule');
  };

  const handleSelectPreset = (preset: DailyPlanPreset) => {
    setEnergyPeak(preset.energyPeak);
    const newTasks: TaskInput[] = preset.tasks.map((t, idx) => ({
      ...t,
      id: `preset-${preset.id}-${Date.now()}-${idx}`,
    }));
    setTasks(newTasks);
    const result = generateAISchedule(newTasks, { ...preferences, energyPeak: preset.energyPeak });
    setBlocks(result.blocks);
    setWarnings(result.warnings);
    const firstWork = result.blocks.find((b) => !b.isBreak);
    if (firstWork) setActiveFocusBlock(firstWork);
    setCurrentTab('schedule');
  };

  const handleStartFocusBlock = (block: ScheduleBlock) => {
    setActiveFocusBlock(block);
    setCurrentTab('focus');
  };

  const handleCompleteBlock = (blockId: string, actualMinutes: number) => {
    const rebalanced = rebalanceSchedule(blocks, blockId, actualMinutes);
    setBlocks(rebalanced);
    const remaining = rebalanced.filter((b) => b.status === 'pending' && !b.isBreak);
    if (remaining.length > 0) setActiveFocusBlock(remaining[0]);
  };

  const handleExtendBlock = (blockId: string, extraMinutes: number) => {
    setBlocks(blocks.map((b) =>
      b.id === blockId ? { ...b, durationMinutes: Math.max(5, b.durationMinutes + extraMinutes) } : b
    ));
  };

  const handleNextBlock = () => {
    if (!activeFocusBlock) return;
    const currentIdx = blocks.findIndex((b) => b.id === activeFocusBlock.id);
    const nextWork = blocks.slice(currentIdx + 1).find((b) => !b.isBreak);
    if (nextWork) setActiveFocusBlock(nextWork);
  };

  const handleRebalanceDay = () => {
    if (activeFocusBlock) {
      const rebalanced = rebalanceSchedule(blocks, activeFocusBlock.id, activeFocusBlock.durationMinutes);
      setBlocks(rebalanced);
    }
  };

  return (
    <div className="min-h-screen text-stone-100 flex flex-col" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        energyPeak={energyPeak}
        setEnergyPeak={(peak) => {
          setEnergyPeak(peak);
          if (tasks.length > 0) {
            const res = generateAISchedule(tasks, { ...preferences, energyPeak: peak });
            setBlocks(res.blocks);
            setWarnings(res.warnings);
          }
        }}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenPresets={() => setIsPresetsOpen(true)}
        activeFocusBlockTitle={activeFocusBlock?.title}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div key={currentTab} className="animate-tab-in">
        {currentTab === 'priorities' && (
          <PriorityInput
            tasks={tasks}
            setTasks={setTasks}
            preferences={{ ...preferences, energyPeak }}
            onGenerateSchedule={handleGenerateSchedule}
          />
        )}
        {currentTab === 'schedule' && (
          <ScheduleTimeline
            blocks={blocks}
            setBlocks={setBlocks}
            warnings={warnings}
            onStartFocusBlock={handleStartFocusBlock}
            onRebalanceDay={handleRebalanceDay}
          />
        )}
        {currentTab === 'focus' && (
          <FocusMode
            activeBlock={activeFocusBlock}
            onCompleteBlock={handleCompleteBlock}
            onExtendBlock={handleExtendBlock}
            onNextBlock={handleNextBlock}
            distractions={distractions}
            setDistractions={setDistractions}
          />
        )}
        {currentTab === 'analytics' && (
          <DayAnalytics
            blocks={blocks}
            distractions={distractions}
            preferences={preferences}
            selectedDate={selectedDate}
          />
        )}
        </div>
      </main>

      <footer className="border-t border-white/[0.04] py-4 text-center text-xs text-stone-700 font-mono">
        ChronosAI · Intelligent Priority Time-Blocking & Focus Execution
      </footer>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        preferences={preferences}
        onSavePreferences={(newPrefs) => {
          setPreferences(newPrefs);
          setIsSettingsOpen(false);
          if (tasks.length > 0) {
            const res = generateAISchedule(tasks, newPrefs);
            setBlocks(res.blocks);
            setWarnings(res.warnings);
          }
        }}
      />

      <PresetsModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        onSelectPreset={handleSelectPreset}
      />
    </div>
  );
}

export default App;
