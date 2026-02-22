import type { TrendPoint } from '../types/demo';

export type TrendWindow = '15m' | '1h' | 'full';

export function getWindowedTrend(patientTrend1h: TrendPoint[], sessionTrend: TrendPoint[], window: TrendWindow) {
  if (window === 'full') return sessionTrend;
  if (window === '15m') return patientTrend1h.slice(-4);
  return patientTrend1h;
}

export function weakQualitySegments(points: TrendPoint[]) {
  const segments: Array<{ start: string; end: string }> = [];
  let openStart: string | null = null;

  for (let i = 0; i < points.length; i += 1) {
    const p = points[i];
    if (p.quality === 'weak' && !openStart) openStart = p.time;
    const next = points[i + 1];
    if (openStart && (!next || next.quality !== 'weak')) {
      segments.push({ start: openStart, end: p.time });
      openStart = null;
    }
  }

  return segments;
}
