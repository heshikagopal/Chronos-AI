export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type EnergyPeak = 'morning' | 'afternoon' | 'evening';
export type BlockStatus = 'pending' | 'in-progress' | 'completed' | 'skipped';
export type TaskCategory = 'deep-work' | 'meetings' | 'admin' | 'personal' | 'break';

export interface TaskInput {
  id: string;
  title: string;
  estimatedMinutes: number;
  priority: Priority;
  category: TaskCategory;
  notes?: string;
}

export interface ScheduleBlock {
  id: string;
  taskId?: string;
  title: string;
  startTime: string;
  durationMinutes: number;
  priority?: Priority;
  category: TaskCategory;
  isBreak: boolean;
  status: BlockStatus;
  notes?: string;
}

export interface UserPreferences {
  workStartTime: string;
  workEndTime: string;
  energyPeak: EnergyPeak;
  preferredFocusDuration: number;
  shortBreakDuration: number;
  lunchStartTime: string;
  lunchDuration: number;
  bufferRatio: number;
}

export interface DistractionNote {
  id: string;
  blockId: string;
  timestamp: string;
  note: string;
}

export interface DailyPlanPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  energyPeak: EnergyPeak;
  tasks: Omit<TaskInput, 'id'>[];
}
