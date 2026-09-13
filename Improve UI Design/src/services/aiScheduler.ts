import type { TaskInput, ScheduleBlock, UserPreferences, EnergyPeak } from '../types/planner';

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

function getPeakWindows(energyPeak: EnergyPeak, workStart: number, workEnd: number) {
  if (energyPeak === 'morning') return { peak: [workStart, workStart + 180], low: [workStart + 180, workEnd] };
  if (energyPeak === 'afternoon') return { peak: [workStart + 180, workStart + 360], low: [workStart, workStart + 180] };
  return { peak: [workStart + 360, workEnd], low: [workStart, workStart + 360] };
}

export function generateAISchedule(
  tasks: TaskInput[],
  prefs: UserPreferences
): { blocks: ScheduleBlock[]; warnings: string[] } {
  const warnings: string[] = [];
  const blocks: ScheduleBlock[] = [];

  const workStart = timeToMinutes(prefs.workStartTime);
  const workEnd = timeToMinutes(prefs.workEndTime);
  const lunchStart = timeToMinutes(prefs.lunchStartTime);
  const lunchEnd = lunchStart + prefs.lunchDuration;

  const sorted = [...tasks].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

  getPeakWindows(prefs.energyPeak, workStart, workEnd); // reserved for future priority scheduling
  let cursor = workStart;
  let blockCount = 0;

  const addBreak = (start: number, duration: number, label: string) => {
    blocks.push({
      id: `break-${blockCount++}`,
      title: label,
      startTime: minutesToTime(start),
      durationMinutes: duration,
      category: 'break',
      isBreak: true,
      status: 'pending',
    });
  };

  for (const task of sorted) {
    if (cursor >= workEnd) {
      warnings.push(`"${task.title}" could not be scheduled — day is full.`);
      continue;
    }

    // Insert lunch if we'd cross it
    if (cursor < lunchStart && cursor + task.estimatedMinutes > lunchStart) {
      addBreak(lunchStart, prefs.lunchDuration, 'Lunch break');
      cursor = lunchEnd;
    }

    // Skip over lunch if we're past it
    if (cursor >= lunchStart && cursor < lunchEnd) {
      if (blocks.every((b) => b.startTime !== minutesToTime(lunchStart) || b.title !== 'Lunch break')) {
        addBreak(lunchStart, prefs.lunchDuration, 'Lunch break');
      }
      cursor = lunchEnd;
    }

    const buffer = Math.round(task.estimatedMinutes * prefs.bufferRatio);
    const totalDuration = task.estimatedMinutes + buffer;

    if (cursor + totalDuration > workEnd) {
      warnings.push(`"${task.title}" was trimmed to fit the remaining work day.`);
    }

    const actualDuration = Math.min(totalDuration, workEnd - cursor);

    blocks.push({
      id: `block-${blockCount++}`,
      taskId: task.id,
      title: task.title,
      startTime: minutesToTime(cursor),
      durationMinutes: actualDuration,
      priority: task.priority,
      category: task.category,
      isBreak: false,
      status: 'pending',
      notes: task.notes,
    });

    cursor += actualDuration;

    // Short break after deep work
    if (task.category === 'deep-work' && cursor + prefs.shortBreakDuration <= workEnd && cursor < lunchStart) {
      addBreak(cursor, prefs.shortBreakDuration, 'Short break');
      cursor += prefs.shortBreakDuration;
    }
  }

  // Sort by start time
  blocks.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  return { blocks, warnings };
}

export function rebalanceSchedule(
  blocks: ScheduleBlock[],
  completedBlockId: string,
  actualMinutes: number
): ScheduleBlock[] {
  const idx = blocks.findIndex((b) => b.id === completedBlockId);
  if (idx === -1) return blocks;

  const updated = blocks.map((b) =>
    b.id === completedBlockId ? { ...b, status: 'completed' as const, durationMinutes: actualMinutes } : b
  );

  // Shift subsequent blocks
  let cursor = timeToMinutes(updated[idx].startTime) + actualMinutes;
  for (let i = idx + 1; i < updated.length; i++) {
    updated[i] = { ...updated[i], startTime: minutesToTime(cursor) };
    cursor += updated[i].durationMinutes;
  }

  return updated;
}
