import { format } from 'date-fns';
import type { AlertRecord } from '../types/demo';

export const DEMO_DAY = { year: 2026, monthIndex: 1, day: 22 };

export function demoDateFromClock(time: string) {
  const [hh, mm, ss = '0'] = time.split(':');
  return new Date(DEMO_DAY.year, DEMO_DAY.monthIndex, DEMO_DAY.day, Number(hh), Number(mm), Number(ss));
}

export function demoDateFromDateTime(value: string) {
  const [datePart, timePart] = value.split(' ');
  const [y, m, d] = datePart.split('-').map(Number);
  const [hh, mm] = timePart.split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm, 0);
}

export function formatTime(date: Date) {
  return format(date, 'HH:mm:ss');
}

export function formatClock(date: Date) {
  return format(date, 'HH:mm');
}

export function formatDateTime(value: string) {
  return format(demoDateFromDateTime(value), 'MMM d, yyyy HH:mm');
}

export function formatTimeSince(now: Date, startedAt: string) {
  const diffMs = Math.max(0, now.getTime() - demoDateFromClock(startedAt).getTime());
  const mins = Math.floor(diffMs / 60000);
  const hrs = Math.floor(mins / 60);
  if (hrs > 0) return `${hrs}h ${mins % 60}m`;
  return `${mins}m`;
}

export function formatCountdown(now: Date, targetTime: string) {
  const diffMs = demoDateFromClock(targetTime).getTime() - now.getTime();
  if (diffMs <= 0) return '0:00';
  const totalSec = Math.floor(diffMs / 1000);
  const mins = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${mins}:${String(sec).padStart(2, '0')}`;
}

export function formatElapsedCompact(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  if (mins > 0) return `${mins}m ${sec}s`;
  return `${sec}s`;
}

export function formatPercent(value: number) {
  return `${value}%`;
}

export function formatBattery(value: number) {
  return `${value}%`;
}

export function alertElapsedMinutes(now: Date, alert: AlertRecord) {
  return Math.floor((now.getTime() - demoDateFromClock(alert.startedAt).getTime()) / 60000);
}
