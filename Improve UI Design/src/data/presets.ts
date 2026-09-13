import type { DailyPlanPreset } from '../types/planner';

export const PRESET_PLANS: DailyPlanPreset[] = [
  {
    id: 'deep-work-day',
    name: 'Deep Work Day',
    description: 'Maximise focused output on a single big project. Minimal meetings, maximum flow.',
    icon: '🎯',
    energyPeak: 'morning',
    tasks: [
      { title: 'Project deep dive — core feature', estimatedMinutes: 120, priority: 'critical', category: 'deep-work' },
      { title: 'Code review & documentation', estimatedMinutes: 60, priority: 'high', category: 'deep-work' },
      { title: 'Weekly team sync', estimatedMinutes: 30, priority: 'medium', category: 'meetings' },
      { title: 'Email & Slack triage', estimatedMinutes: 30, priority: 'low', category: 'admin' },
      { title: 'Planning next sprint tasks', estimatedMinutes: 45, priority: 'medium', category: 'admin' },
    ],
  },
  {
    id: 'meeting-heavy',
    name: 'Meeting-Heavy Day',
    description: 'Lots of collaboration scheduled. Protect a focused block and stay sane between calls.',
    icon: '🤝',
    energyPeak: 'afternoon',
    tasks: [
      { title: 'Prepare meeting agendas', estimatedMinutes: 30, priority: 'high', category: 'admin' },
      { title: 'Client kickoff call', estimatedMinutes: 60, priority: 'critical', category: 'meetings' },
      { title: 'Design review session', estimatedMinutes: 45, priority: 'high', category: 'meetings' },
      { title: '1:1 with manager', estimatedMinutes: 30, priority: 'high', category: 'meetings' },
      { title: 'Team retrospective', estimatedMinutes: 60, priority: 'medium', category: 'meetings' },
      { title: 'Post-meeting action items', estimatedMinutes: 30, priority: 'high', category: 'admin' },
    ],
  },
  {
    id: 'creative-sprint',
    name: 'Creative Sprint',
    description: 'Brainstorming, writing, and design. High creative energy — protect the afternoon flow.',
    icon: '✨',
    energyPeak: 'morning',
    tasks: [
      { title: 'Brand strategy brainstorm', estimatedMinutes: 90, priority: 'critical', category: 'deep-work' },
      { title: 'Write feature announcement copy', estimatedMinutes: 60, priority: 'high', category: 'deep-work' },
      { title: 'Design mockups — v2 iteration', estimatedMinutes: 90, priority: 'high', category: 'deep-work' },
      { title: 'Stakeholder feedback review', estimatedMinutes: 30, priority: 'medium', category: 'meetings' },
      { title: 'Personal learning — design books', estimatedMinutes: 30, priority: 'low', category: 'personal' },
    ],
  },
  {
    id: 'catch-up-day',
    name: 'Catch-Up Day',
    description: 'Clear the backlog. Emails, admin tasks, and small fixes that have been piling up.',
    icon: '📋',
    energyPeak: 'afternoon',
    tasks: [
      { title: 'Process email inbox to zero', estimatedMinutes: 45, priority: 'high', category: 'admin' },
      { title: 'Update project tracking board', estimatedMinutes: 30, priority: 'medium', category: 'admin' },
      { title: 'Small bug fixes & housekeeping', estimatedMinutes: 60, priority: 'medium', category: 'deep-work' },
      { title: 'Write weekly summary report', estimatedMinutes: 30, priority: 'high', category: 'admin' },
      { title: 'Schedule next week\'s priorities', estimatedMinutes: 30, priority: 'medium', category: 'admin' },
      { title: 'Personal development reading', estimatedMinutes: 30, priority: 'low', category: 'personal' },
    ],
  },
];
