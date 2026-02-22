import type { DemoDataBundle, SearchResult, UnitDataset } from '../types/demo';

function normalize(input: string) {
  return input.trim().toLowerCase();
}

function matchesAny(query: string, values: Array<string | number | undefined>, strictNumeric = false) {
  const q = normalize(query);
  if (!q) return false;
  return values.some((value) => {
    if (value == null) return false;
    const raw = String(value).toLowerCase();
    if (strictNumeric && /^\d+$/.test(q) && /^\d+$/.test(raw)) return raw.includes(q);
    return raw.includes(q);
  });
}

export function buildSearchResults(params: {
  query: string;
  demoData: DemoDataBundle;
  unitData: UnitDataset;
  identifiersVisible: boolean;
}) {
  const { query, demoData, unitData, identifiersVisible } = params;
  if (!query.trim()) return [] as SearchResult[];

  const results: SearchResult[] = [];

  unitData.beds.forEach((bed) => {
    const patient = unitData.patientsByBed[bed.bed];
    if (
      matchesAny(query, [bed.bed, `Bed ${bed.bed}`, patient?.patientAnonId]) ||
      (identifiersVisible && matchesAny(query, [patient?.mrn, patient?.patientInitials]))
    ) {
      results.push({
        id: `bed-${unitData.unit}-${bed.bed}`,
        category: 'Beds',
        label: `Bed ${bed.bed}`,
        sublabel: patient ? `${patient.patientAnonId} • ${patient.siteLabel}` : bed.state.replaceAll('_', ' '),
        target: { tab: 'unit-board', bed: bed.bed },
      });
    }
  });

  unitData.alerts
    .filter((alert) => alert.status !== 'resolved')
    .forEach((alert) => {
      if (
        matchesAny(query, [alert.id, alert.bed, `Bed ${alert.bed}`, alert.patientAnonId, alert.linkedPodId, alert.linkedPatchId]) ||
        (identifiersVisible && matchesAny(query, [alert.mrn, alert.patientInitials]))
      ) {
        results.push({
          id: `alert-${alert.id}`,
          category: 'Active alerts',
          label: `${alert.label} • Bed ${alert.bed}`,
          sublabel: `${alert.patientAnonId} • ${alert.id}`,
          target: { tab: 'unit-board', bed: alert.bed, alertId: alert.id },
        });
      }
    });

  demoData.devices.pods.forEach((pod) => {
    if (matchesAny(query, [pod.podId, pod.lastAssignedBed, pod.unit])) {
      results.push({
        id: `pod-${pod.podId}`,
        category: 'Devices',
        label: pod.podId,
        sublabel: `${pod.unit} • ${pod.status} • ${pod.lastAssignedBed}`,
        target: { tab: 'devices', podId: pod.podId },
      });
    }
  });

  demoData.analytics.caseReviewCases.forEach((reviewCase) => {
    if (matchesAny(query, [reviewCase.caseId, reviewCase.bed, `Bed ${reviewCase.bed}`])) {
      results.push({
        id: `case-${reviewCase.caseId}`,
        category: 'Review cases',
        label: reviewCase.caseId,
        sublabel: `Bed ${reviewCase.bed} • ${reviewCase.severity} • ${reviewCase.currentLabel}`,
        target: { tab: 'analytics', caseId: reviewCase.caseId, bed: reviewCase.bed },
      });
    }
  });

  return results.slice(0, 12);
}
