import type {
  AlertRecord,
  AnalyticsModuleData,
  AuditLogEntry,
  BedTile,
  CaseReviewCase,
  DemoDataBundle,
  DevicesModuleData,
  IntegrationsPrivacyData,
  PatientDetail,
  PodDetail,
  PodRow,
  Role,
  TimelineEvent,
  TrendPoint,
  UnitDataset,
  UnitKey,
} from '../types/demo';
import { roleDisplayNames } from '../lib/rolePermissions';

const HOSPITAL_NAME = 'St. Anne Medical Center';

const unitOptions: UnitKey[] = [
  'ICU North',
  'Oncology Infusion',
  'Emergency Department',
  'Radiology Contrast Suite',
];

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

function hhmm(minutesFromMidnight: number) {
  const h = Math.floor(minutesFromMidnight / 60);
  const m = minutesFromMidnight % 60;
  return `${pad2(h)}:${pad2(m)}`;
}

function hhmmss(minutesFromMidnight: number, seconds = 0) {
  const h = Math.floor(minutesFromMidnight / 60);
  const m = minutesFromMidnight % 60;
  return `${pad2(h)}:${pad2(m)}:${pad2(seconds)}`;
}

function createTrendPoint(
  time: string,
  tempDeltaC: number,
  thicknessDeltaPct: number,
  quality: 'good' | 'weak' = 'good',
  motionArtifact = false,
  normalBandLow = -0.2,
  normalBandHigh = 0.2,
): TrendPoint {
  return {
    time,
    tempDeltaC,
    thicknessDeltaPct,
    quality,
    motionArtifact,
    normalBandLow,
    normalBandHigh,
  };
}

const bed12Trend1h: TrendPoint[] = [
  createTrendPoint('07:15', 0.02, 0.3),
  createTrendPoint('07:20', -0.01, 0.4),
  createTrendPoint('07:25', 0.03, 0.6),
  createTrendPoint('07:30', -0.04, 0.9),
  createTrendPoint('07:35', -0.08, 1.4),
  createTrendPoint('07:40', -0.12, 2.1),
  createTrendPoint('07:45', -0.18, 3.0),
  createTrendPoint('07:50', -0.26, 4.4),
  createTrendPoint('07:55', -0.37, 6.2),
  createTrendPoint('08:00', -0.51, 8.1),
  createTrendPoint('08:05', -0.68, 10.2),
  createTrendPoint('08:10', -0.86, 12.1, 'weak', true),
  createTrendPoint('08:15', -0.95, 13.0),
];

function generateStableTrend(startMinute: number, endMinute: number, step = 5): TrendPoint[] {
  const points: TrendPoint[] = [];
  let i = 0;
  for (let minute = startMinute; minute <= endMinute; minute += step) {
    const temp = Number((Math.sin(i / 2.6) * 0.05 + Math.cos(i / 3.7) * 0.02).toFixed(2));
    const thick = Number((Math.sin(i / 4.8) * 0.25 + 0.1).toFixed(1));
    points.push(createTrendPoint(hhmm(minute), temp, thick));
    i += 1;
  }
  return points;
}

function generateBed12FullSessionTrend(): TrendPoint[] {
  const base = generateStableTrend(4 * 60 + 20, 7 * 60 + 10, 10);
  const withContactDrop: TrendPoint[] = [
    ...base.filter((p) => p.time < '05:50'),
    createTrendPoint('05:50', -0.01, 0.2),
    createTrendPoint('05:53', -0.03, 0.3, 'weak', true),
    createTrendPoint('05:56', 0.01, 0.2, 'good', false),
    ...base.filter((p) => p.time > '06:00' && p.time < '07:15'),
  ];

  const rampLeadIn = [
    createTrendPoint('07:05', 0.02, 0.2),
    createTrendPoint('07:10', 0.01, 0.2),
  ];

  return [...withContactDrop, ...rampLeadIn, ...bed12Trend1h];
}

function generateShortAlertTrend(kind: 'moderate' | 'high' | 'sensor_issue' | 'normal'): TrendPoint[] {
  const points: TrendPoint[] = [];
  const start = 7 * 60 + 40;
  for (let i = 0; i < 8; i += 1) {
    const t = hhmm(start + i * 5);
    if (kind === 'sensor_issue') {
      points.push(createTrendPoint(t, Number((Math.sin(i) * 0.05).toFixed(2)), Number((0.5 + i * 0.15).toFixed(1)), i === 4 ? 'weak' : 'good', i === 4));
      continue;
    }
    if (kind === 'moderate') {
      points.push(createTrendPoint(t, Number((-0.02 - i * 0.05).toFixed(2)), Number((0.8 + i * 0.7).toFixed(1))));
      continue;
    }
    if (kind === 'high') {
      points.push(createTrendPoint(t, Number((-0.08 - i * 0.11).toFixed(2)), Number((1.2 + i * 1.4).toFixed(1))));
      continue;
    }
    points.push(createTrendPoint(t, Number((Math.sin(i / 2) * 0.04).toFixed(2)), Number((0.2 + Math.cos(i / 2) * 0.2).toFixed(1))));
  }
  return points;
}

function timelineEvent(
  id: string,
  timestamp: string,
  actor: string,
  eventType: string,
  note?: string,
  deviceIds?: string[],
  icon: TimelineEvent['icon'] = 'system',
): TimelineEvent {
  return { id, timestamp, actor, eventType, note, deviceIds, icon };
}

const bed12Timeline: TimelineEvent[] = [
  timelineEvent('evt-12-1', '04:19', 'System', 'Device attached', 'Pod VC-POD-0417, Patch VC-PATCH-12-02', ['VC-POD-0417', 'VC-PATCH-12-02'], 'device'),
  timelineEvent('evt-12-2', '04:26', 'System', 'Baseline established', 'Contact quality good', ['VC-POD-0417'], 'status'),
  timelineEvent('evt-12-3', '05:53', 'System', 'Contact quality drop detected', 'Weak contact (temporary)', ['VC-POD-0417'], 'status'),
  timelineEvent('evt-12-4', '05:56', 'System', 'Contact restored', 'Contact quality good', ['VC-POD-0417'], 'status'),
  timelineEvent('evt-12-5', '08:06', 'System', 'Alert triggered', 'High likelihood infiltration pattern', ['VC-POD-0417', 'VC-PATCH-12-02'], 'alert'),
  timelineEvent('evt-12-6', '08:07', 'Charge RN E. Flores', 'Alert surfaced on unit board', 'Queue priority high', ['VC-POD-0417'], 'user'),
];

function makePatientDetail(seed: Partial<PatientDetail> & Pick<PatientDetail, 'bed' | 'patientAnonId' | 'patientInitials' | 'mrn' | 'siteLabel' | 'insertionTimestamp' | 'infusionType' | 'patchId' | 'podId'>): PatientDetail {
  const baseTrend = seed.temperatureTrend1h ?? generateShortAlertTrend('normal');
  return {
    bed: seed.bed,
    patientAnonId: seed.patientAnonId,
    patientInitials: seed.patientInitials,
    mrn: seed.mrn,
    siteLabel: seed.siteLabel,
    insertionTimestamp: seed.insertionTimestamp,
    infusionType: seed.infusionType,
    patchId: seed.patchId,
    podId: seed.podId,
    podBatteryPct: seed.podBatteryPct ?? 72,
    runtimeRemainingHours: seed.runtimeRemainingHours ?? 8.2,
    firmwareVersion: seed.firmwareVersion ?? 'v1.9.3',
    currentRiskState: seed.currentRiskState ?? 'WATCH',
    confidence: seed.confidence ?? 0.54,
    confidenceLabel: seed.confidenceLabel ?? 'Medium',
    dataQuality: seed.dataQuality ?? 'Good contact',
    lastStableBaseline: seed.lastStableBaseline ?? '05:14',
    contactQuality15mPct: seed.contactQuality15mPct ?? 88,
    motionArtifactSummary: seed.motionArtifactSummary ?? 'None in last 10m',
    alertTriggerTime: seed.alertTriggerTime,
    temperatureTrend1h: baseTrend,
    sessionTrend: seed.sessionTrend ?? [...generateStableTrend(5 * 60 + 30, 7 * 60 + 30, 15), ...baseTrend],
    shortTrend: seed.shortTrend,
    timeline: seed.timeline ?? [],
    noteTemplate:
      seed.noteTemplate ??
      `VeinCheck alert reviewed for Bed ${seed.bed} ${seed.siteLabel.toLowerCase()} IV site. Site assessed for swelling/blanching/pain/coolness. Infusion status and site findings documented per unit protocol. Device Pod ${seed.podId} / Patch ${seed.patchId}.`,
    ivGauge: seed.ivGauge ?? 'PIV 20G',
    hardwareRev: seed.hardwareRev ?? 'H2',
  };
}

const icuAlerts: AlertRecord[] = [
  {
    id: 'A-20260222-0810-B12',
    bed: 12,
    patientAnonId: 'VC-ICUN-1204',
    patientInitials: 'R.T.',
    mrn: '48522137',
    site: 'Left forearm',
    severity: 'high',
    label: 'High likelihood infiltration pattern',
    startedAt: '08:06:21',
    recommendedAction: 'Pause infusion and assess site',
    status: 'active_unacknowledged',
    linkedPodId: 'VC-POD-0417',
    linkedPatchId: 'VC-PATCH-12-02',
  },
  {
    id: 'A-20260222-0807-B04',
    bed: 4,
    patientAnonId: 'VC-ICUN-0402',
    patientInitials: 'L.M.',
    mrn: '48521988',
    site: 'Right AC',
    severity: 'moderate',
    label: 'Moderate likelihood infiltration pattern',
    startedAt: '08:01:58',
    recommendedAction: 'Reassess site and compare to baseline',
    status: 'acknowledged',
    acknowledgedBy: 'J. Patel, RN',
    acknowledgedAt: '08:04:11',
    collapsed: true,
  },
  {
    id: 'A-20260222-0805-B18',
    bed: 18,
    patientAnonId: 'VC-ICUN-1811',
    patientInitials: 'S.K.',
    mrn: '48522309',
    site: 'Left hand',
    severity: 'sensor_issue',
    label: 'Sensor issue',
    startedAt: '08:00:42',
    recommendedAction: 'Check patch contact and pod connection',
    status: 'active_unacknowledged',
  },
  {
    id: 'A-20260222-0758-B07',
    bed: 7,
    patientAnonId: 'VC-ICUN-0703',
    patientInitials: 'M.B.',
    mrn: '48521743',
    site: 'Right forearm',
    severity: 'high',
    label: 'High likelihood infiltration pattern',
    startedAt: '07:49:03',
    recommendedAction: 'Pause infusion and assess site immediately',
    status: 'escalated',
    escalatedAt: '07:56:15',
    escalatedTo: 'Charge Nurse',
    nurseCallTriggered: true,
  },
  {
    id: 'A-20260222-0752-B21',
    bed: 21,
    patientAnonId: 'VC-ICUN-2105',
    patientInitials: 'N.G.',
    mrn: '48522491',
    site: 'Left wrist',
    severity: 'moderate',
    label: 'Moderate likelihood infiltration pattern',
    startedAt: '07:41:27',
    recommendedAction: 'Inspect site and verify line patency',
    status: 'snoozed',
    snoozedUntil: '08:11:27',
  },
  {
    id: 'A-20260222-0749-B03',
    bed: 3,
    patientAnonId: 'VC-ICUN-0301',
    patientInitials: 'D.H.',
    mrn: '48521612',
    site: 'Right hand',
    severity: 'sensor_issue',
    label: 'Sensor issue',
    startedAt: '07:35:12',
    recommendedAction: 'Re-seat pod and confirm contact',
    status: 'acknowledged',
    acknowledgedBy: 'Charge RN E. Flores',
    acknowledgedAt: '07:37:02',
    collapsed: true,
  },
];

const icuBeds: BedTile[] = [
  { bed: 1, state: 'monitoring_active', sites: 1, monitoringDuration: '1h 52m', signalQuality: 'good', infusionType: 'Fluids', siteSummary: 'Left hand', lastUpdate: '08:12:29' },
  { bed: 2, state: 'no_device' },
  { bed: 3, state: 'sensor_issue_alert', sites: 1, monitoringDuration: '3h 18m', signalQuality: 'fair', infusionType: 'Fluids', siteSummary: 'Right hand', lastUpdate: '08:11:58' },
  { bed: 4, state: 'moderate_alert', sites: 1, monitoringDuration: '2h 06m', signalQuality: 'good', infusionType: 'Antibiotics', siteSummary: 'Right AC', lastUpdate: '08:12:03' },
  { bed: 5, state: 'monitoring_active', sites: 2, monitoringDuration: '4h 11m', signalQuality: 'good', infusionType: 'Fluids', siteSummary: 'Bilateral forearm', lastUpdate: '08:12:25' },
  { bed: 6, state: 'monitoring_active', sites: 1, monitoringDuration: '0h 42m', signalQuality: 'good', infusionType: 'Vasopressors', siteSummary: 'Left AC', lastUpdate: '08:12:18' },
  { bed: 7, state: 'high_alert_escalated', sites: 1, monitoringDuration: '5h 33m', signalQuality: 'good', infusionType: 'Blood products', siteSummary: 'Right forearm', lastUpdate: '08:12:11' },
  { bed: 8, state: 'offline', sites: 1, signalQuality: 'poor', siteSummary: 'Left hand', lastUpdate: '08:05:42' },
  { bed: 9, state: 'monitoring_active', sites: 1, monitoringDuration: '1h 09m', signalQuality: 'good', infusionType: 'Fluids', siteSummary: 'Left forearm', lastUpdate: '08:12:31' },
  { bed: 10, state: 'no_device' },
  { bed: 11, state: 'monitoring_active', sites: 1, monitoringDuration: '7h 26m', signalQuality: 'good', infusionType: 'Antibiotics', siteSummary: 'Right hand', lastUpdate: '08:12:20' },
  { bed: 12, state: 'high_alert_active', sites: 1, monitoringDuration: '3h 54m', signalQuality: 'good', infusionType: 'Antibiotics', siteSummary: 'Left forearm', lastUpdate: '08:12:34' },
  { bed: 13, state: 'monitoring_active', sites: 2, monitoringDuration: '6h 02m', signalQuality: 'good', infusionType: 'Fluids', siteSummary: 'Left wrist + Right hand', lastUpdate: '08:12:30' },
  { bed: 14, state: 'monitoring_active', sites: 1, monitoringDuration: '0h 31m', signalQuality: 'good', infusionType: 'Fluids', siteSummary: 'Left hand', lastUpdate: '08:12:12' },
  { bed: 15, state: 'no_device' },
  { bed: 16, state: 'monitoring_active', sites: 1, monitoringDuration: '8h 12m', signalQuality: 'good', infusionType: 'Vasopressors', siteSummary: 'Right forearm', lastUpdate: '08:12:09' },
  { bed: 17, state: 'monitoring_active', sites: 1, monitoringDuration: '2h 47m', signalQuality: 'good', infusionType: 'Fluids', siteSummary: 'Right wrist', lastUpdate: '08:12:13' },
  { bed: 18, state: 'sensor_issue_alert', sites: 1, monitoringDuration: '1h 18m', signalQuality: 'fair', infusionType: 'Unknown', siteSummary: 'Left hand', lastUpdate: '08:11:49' },
  { bed: 19, state: 'monitoring_active', sites: 1, monitoringDuration: '4h 56m', signalQuality: 'good', infusionType: 'Antibiotics', siteSummary: 'Left forearm', lastUpdate: '08:12:26' },
  { bed: 20, state: 'monitoring_active', sites: 1, monitoringDuration: '0h 58m', signalQuality: 'good', infusionType: 'Fluids', siteSummary: 'Left AC', lastUpdate: '08:12:22' },
  { bed: 21, state: 'moderate_alert_snoozed', sites: 1, monitoringDuration: '2h 29m', signalQuality: 'good', infusionType: 'Fluids', siteSummary: 'Left wrist', lastUpdate: '08:10:59' },
  { bed: 22, state: 'no_device' },
  { bed: 23, state: 'monitoring_active', sites: 1, monitoringDuration: '3h 44m', signalQuality: 'good', infusionType: 'Antibiotics', siteSummary: 'Right hand', lastUpdate: '08:12:17' },
  { bed: 24, state: 'offline', sites: 1, signalQuality: 'poor', siteSummary: 'Right forearm', lastUpdate: '08:04:37' },
];

const icuPatientsByBed: Record<number, PatientDetail> = {
  3: makePatientDetail({
    bed: 3,
    patientAnonId: 'VC-ICUN-0301',
    patientInitials: 'D.H.',
    mrn: '48521612',
    siteLabel: 'Right hand, PIV 22G',
    insertionTimestamp: '2026-02-22 04:54',
    infusionType: 'IV Fluids (Maintenance)',
    patchId: 'VC-PATCH-03-01',
    podId: 'VC-POD-0391',
    podBatteryPct: 58,
    runtimeRemainingHours: 6.1,
    currentRiskState: 'WATCH',
    confidence: 0.42,
    confidenceLabel: 'Medium',
    dataQuality: 'Intermittent weak contact',
    lastStableBaseline: '05:01',
    contactQuality15mPct: 74,
    motionArtifactSummary: 'Minor artifact at 07:58',
    alertTriggerTime: '08:00',
    temperatureTrend1h: generateShortAlertTrend('sensor_issue'),
    sessionTrend: [...generateStableTrend(4 * 60 + 55, 7 * 60 + 35, 20), ...generateShortAlertTrend('sensor_issue')],
    timeline: [
      timelineEvent('evt-3-1', '04:55', 'System', 'Device attached', 'Pod VC-POD-0391, Patch VC-PATCH-03-01', ['VC-POD-0391', 'VC-PATCH-03-01'], 'device'),
      timelineEvent('evt-3-2', '05:01', 'System', 'Baseline established', 'Contact quality good', ['VC-POD-0391'], 'status'),
      timelineEvent('evt-3-3', '08:00', 'System', 'Sensor issue flagged', 'Patch contact variability detected', ['VC-POD-0391'], 'alert'),
      timelineEvent('evt-3-4', '07:37', 'Charge RN E. Flores', 'Alert acknowledged', 'Re-seat pod and confirm contact', ['VC-POD-0391'], 'user'),
    ],
  }),
  4: makePatientDetail({
    bed: 4,
    patientAnonId: 'VC-ICUN-0402',
    patientInitials: 'L.M.',
    mrn: '48521988',
    siteLabel: 'Right AC, PIV 20G',
    insertionTimestamp: '2026-02-22 06:06',
    infusionType: 'Antibiotics (Piperacillin/Tazobactam)',
    patchId: 'VC-PATCH-04-01',
    podId: 'VC-POD-0412',
    podBatteryPct: 76,
    runtimeRemainingHours: 9.0,
    currentRiskState: 'WATCH',
    confidence: 0.68,
    confidenceLabel: 'High',
    dataQuality: 'Good contact',
    lastStableBaseline: '06:13',
    contactQuality15mPct: 95,
    motionArtifactSummary: 'None in last 10m',
    alertTriggerTime: '08:02',
    temperatureTrend1h: generateShortAlertTrend('moderate'),
    timeline: [
      timelineEvent('evt-4-1', '06:07', 'System', 'Device attached', 'Pod VC-POD-0412, Patch VC-PATCH-04-01', ['VC-POD-0412'], 'device'),
      timelineEvent('evt-4-2', '06:13', 'System', 'Baseline established', 'Contact quality good', ['VC-POD-0412'], 'status'),
      timelineEvent('evt-4-3', '08:02', 'System', 'Alert triggered', 'Moderate likelihood infiltration pattern', ['VC-POD-0412'], 'alert'),
      timelineEvent('evt-4-4', '08:04', 'J. Patel, RN', 'Alert acknowledged', 'Reassess site and compare to baseline', ['VC-POD-0412'], 'user'),
    ],
  }),
  7: makePatientDetail({
    bed: 7,
    patientAnonId: 'VC-ICUN-0703',
    patientInitials: 'M.B.',
    mrn: '48521743',
    siteLabel: 'Right forearm, PIV 20G',
    insertionTimestamp: '2026-02-22 02:39',
    infusionType: 'Blood products',
    patchId: 'VC-PATCH-07-01',
    podId: 'VC-POD-0404',
    podBatteryPct: 49,
    runtimeRemainingHours: 5.3,
    currentRiskState: 'ALERT',
    confidence: 0.91,
    confidenceLabel: 'High',
    dataQuality: 'Good contact',
    lastStableBaseline: '02:46',
    contactQuality15mPct: 90,
    motionArtifactSummary: 'None in last 10m',
    alertTriggerTime: '07:49',
    temperatureTrend1h: generateShortAlertTrend('high'),
    timeline: [
      timelineEvent('evt-7-1', '02:40', 'System', 'Device attached', 'Pod VC-POD-0404, Patch VC-PATCH-07-01', ['VC-POD-0404'], 'device'),
      timelineEvent('evt-7-2', '02:46', 'System', 'Baseline established', 'Contact quality good', ['VC-POD-0404'], 'status'),
      timelineEvent('evt-7-3', '07:49', 'System', 'Alert triggered', 'High likelihood infiltration pattern', ['VC-POD-0404'], 'alert'),
      timelineEvent('evt-7-4', '07:56', 'System', 'Escalated to Charge Nurse', 'Nurse call triggered', ['VC-POD-0404'], 'alert'),
      timelineEvent('evt-7-5', '07:57', 'E. Flores, RN', 'Escalation viewed', 'Queue priority high', ['VC-POD-0404'], 'user'),
    ],
  }),
  12: makePatientDetail({
    bed: 12,
    patientAnonId: 'VC-ICUN-1204',
    patientInitials: 'R.T.',
    mrn: '48522137',
    siteLabel: 'Left forearm, PIV 20G',
    insertionTimestamp: '2026-02-22 04:18',
    infusionType: 'Antibiotics (Vancomycin)',
    patchId: 'VC-PATCH-12-02',
    podId: 'VC-POD-0417',
    podBatteryPct: 62,
    runtimeRemainingHours: 7.8,
    firmwareVersion: 'v1.9.3',
    currentRiskState: 'ALERT',
    confidence: 0.87,
    confidenceLabel: 'High',
    dataQuality: 'Good contact',
    lastStableBaseline: '04:26',
    contactQuality15mPct: 92,
    motionArtifactSummary: 'None in last 10m',
    alertTriggerTime: '08:06',
    temperatureTrend1h: bed12Trend1h,
    sessionTrend: generateBed12FullSessionTrend(),
    timeline: bed12Timeline,
    noteTemplate:
      'VeinCheck alert reviewed for Bed 12 left forearm IV site. Site assessed for swelling/blanching/pain/coolness. Infusion status and site findings documented per unit protocol. Device Pod VC-POD-0417 / Patch VC-PATCH-12-02.',
  }),
  18: makePatientDetail({
    bed: 18,
    patientAnonId: 'VC-ICUN-1811',
    patientInitials: 'S.K.',
    mrn: '48522309',
    siteLabel: 'Left hand, PIV 22G',
    insertionTimestamp: '2026-02-22 06:54',
    infusionType: 'Unknown',
    patchId: 'VC-PATCH-18-01',
    podId: 'VC-POD-0426',
    podBatteryPct: 38,
    runtimeRemainingHours: 3.7,
    currentRiskState: 'WATCH',
    confidence: 0.33,
    confidenceLabel: 'Low',
    dataQuality: 'Weak contact',
    lastStableBaseline: '07:01',
    contactQuality15mPct: 63,
    motionArtifactSummary: 'Motion artifact at 08:09',
    alertTriggerTime: '08:01',
    temperatureTrend1h: generateShortAlertTrend('sensor_issue'),
    timeline: [
      timelineEvent('evt-18-1', '06:55', 'System', 'Device attached', 'Pod VC-POD-0426, Patch VC-PATCH-18-01', ['VC-POD-0426'], 'device'),
      timelineEvent('evt-18-2', '07:01', 'System', 'Baseline established', 'Contact quality good', ['VC-POD-0426'], 'status'),
      timelineEvent('evt-18-3', '08:01', 'System', 'Sensor issue flagged', 'Check patch contact and pod connection', ['VC-POD-0426'], 'alert'),
    ],
  }),
  21: makePatientDetail({
    bed: 21,
    patientAnonId: 'VC-ICUN-2105',
    patientInitials: 'N.G.',
    mrn: '48522491',
    siteLabel: 'Left wrist, PIV 22G',
    insertionTimestamp: '2026-02-22 05:43',
    infusionType: 'IV Fluids (Maintenance)',
    patchId: 'VC-PATCH-21-01',
    podId: 'VC-POD-0431',
    podBatteryPct: 67,
    runtimeRemainingHours: 8.4,
    currentRiskState: 'WATCH',
    confidence: 0.59,
    confidenceLabel: 'Medium',
    dataQuality: 'Good contact',
    lastStableBaseline: '05:50',
    contactQuality15mPct: 93,
    motionArtifactSummary: 'None in last 10m',
    alertTriggerTime: '07:41',
    temperatureTrend1h: generateShortAlertTrend('moderate'),
    timeline: [
      timelineEvent('evt-21-1', '05:44', 'System', 'Device attached', 'Pod VC-POD-0431, Patch VC-PATCH-21-01', ['VC-POD-0431'], 'device'),
      timelineEvent('evt-21-2', '05:50', 'System', 'Baseline established', 'Contact quality good', ['VC-POD-0431'], 'status'),
      timelineEvent('evt-21-3', '07:41', 'System', 'Alert triggered', 'Moderate likelihood infiltration pattern', ['VC-POD-0431'], 'alert'),
      timelineEvent('evt-21-4', '07:52', 'J. Patel, RN', 'Alert snoozed', 'Snooze 5 min pending reassessment', ['VC-POD-0431'], 'user'),
    ],
  }),
};

// Add lightweight generic patient records for remaining ICU beds so detail panel remains populated.
for (const bed of icuBeds) {
  if (!icuPatientsByBed[bed.bed]) {
    icuPatientsByBed[bed.bed] = makePatientDetail({
      bed: bed.bed,
      patientAnonId: `VC-ICUN-${String(bed.bed).padStart(2, '0')}99`,
      patientInitials: `${String.fromCharCode(65 + ((bed.bed * 3) % 26))}.${String.fromCharCode(65 + ((bed.bed * 7) % 26))}.`,
      mrn: `4852${String(1000 + bed.bed * 17)}`,
      siteLabel: `${bed.siteSummary ?? 'Forearm'}${(bed.siteSummary ?? '').includes(',') ? '' : ', PIV 20G'}`,
      insertionTimestamp: `2026-02-22 ${pad2(3 + (bed.bed % 5))}:${pad2((bed.bed * 7) % 60)}`,
      infusionType: bed.infusionType ?? 'Unknown',
      patchId: `VC-PATCH-${String(bed.bed).padStart(2, '0')}-01`,
      podId: `VC-POD-${String(430 + bed.bed).padStart(4, '0')}`,
      podBatteryPct: 45 + (bed.bed * 3) % 44,
      runtimeRemainingHours: Number((4.2 + ((bed.bed * 0.7) % 6)).toFixed(1)),
      currentRiskState:
        bed.state === 'high_alert_active' || bed.state === 'high_alert_escalated'
          ? 'ALERT'
          : bed.state === 'moderate_alert' || bed.state === 'moderate_alert_snoozed' || bed.state === 'sensor_issue_alert'
            ? 'WATCH'
            : 'NORMAL',
      confidence: Number((0.28 + (bed.bed % 9) * 0.07).toFixed(2)),
      confidenceLabel: bed.state.includes('high') ? 'High' : bed.state.includes('moderate') ? 'Medium' : 'Low',
      dataQuality: bed.state === 'offline' ? 'No signal' : 'Good contact',
      alertTriggerTime: bed.state.includes('alert') ? '08:00' : undefined,
      temperatureTrend1h: generateShortAlertTrend(
        bed.state.includes('high') ? 'high' : bed.state.includes('moderate') ? 'moderate' : bed.state.includes('sensor') ? 'sensor_issue' : 'normal',
      ),
      timeline: [timelineEvent(`evt-${bed.bed}-gen-1`, '06:00', 'System', 'Device attached', `Pod assigned to Bed ${bed.bed}`, undefined, 'device')],
    });
  }
}

const icuDataset: UnitDataset = {
  unit: 'ICU North',
  hospital: HOSPITAL_NAME,
  beds: icuBeds,
  alerts: icuAlerts,
  metrics: {
    activeMonitoredSites: 19,
    alertsLastHour: 6,
    medianAcknowledge: '2m 14s',
    medianResolve: '11m 42s',
    falseAlertReviewQueue: 7,
    monitoredIvHours24h: 187.6,
    onlinePodsCurrent: '18 / 20',
    contactQualityGoodPct: 84,
    unackOver5m: 2,
  },
  patientsByBed: icuPatientsByBed,
};

function makeAltBeds(params: {
  count: number;
  unitCode: string;
  moreNoDevice?: boolean;
  moreOffline?: boolean;
  shortSessions?: boolean;
  alertBeds: Array<{ bed: number; state: BedTile['state']; site: string; infusion: string }>;
}) {
  const beds: BedTile[] = [];
  for (let i = 1; i <= params.count; i += 1) {
    const alertMatch = params.alertBeds.find((a) => a.bed === i);
    if (alertMatch) {
      beds.push({
        bed: i,
        state: alertMatch.state,
        sites: 1,
        monitoringDuration: params.shortSessions ? `${(i % 2) + 0}h ${pad2((i * 7) % 60)}m` : `${1 + (i % 5)}h ${pad2((i * 11) % 60)}m`,
        signalQuality: alertMatch.state === 'sensor_issue_alert' ? 'fair' : 'good',
        infusionType: alertMatch.infusion,
        siteSummary: alertMatch.site,
        lastUpdate: hhmmss(8 * 60 + 12 - (i % 3), (i * 9) % 60),
      });
      continue;
    }

    if (params.moreNoDevice && i % 5 === 0) {
      beds.push({ bed: i, state: 'no_device' });
      continue;
    }
    if (params.moreOffline && i % 7 === 0) {
      beds.push({ bed: i, state: 'offline', sites: 1, siteSummary: 'Unknown', signalQuality: 'poor', lastUpdate: '08:03:12' });
      continue;
    }

    beds.push({
      bed: i,
      state: 'monitoring_active',
      sites: i % 6 === 0 ? 2 : 1,
      monitoringDuration: params.shortSessions ? `${i % 2}h ${pad2((12 + i * 5) % 60)}m` : `${1 + (i % 6)}h ${pad2((7 + i * 9) % 60)}m`,
      signalQuality: i % 9 === 0 ? 'fair' : 'good',
      infusionType: i % 3 === 0 ? 'Antibiotics' : i % 4 === 0 ? 'Contrast' : 'Fluids',
      siteSummary: i % 2 === 0 ? 'Left forearm' : 'Right hand',
      lastUpdate: hhmmss(8 * 60 + 12, (i * 5) % 60),
    });
  }
  return beds;
}

function makeAltPatients(unit: UnitKey, beds: BedTile[], prefix: string): Record<number, PatientDetail> {
  const out: Record<number, PatientDetail> = {};
  beds.forEach((bed) => {
    out[bed.bed] = makePatientDetail({
      bed: bed.bed,
      patientAnonId: `VC-${prefix}-${String(bed.bed).padStart(2, '0')}${String((bed.bed % 7) + 1).padStart(2, '0')}`,
      patientInitials: `${String.fromCharCode(65 + (bed.bed % 26))}.${String.fromCharCode(65 + ((bed.bed + 8) % 26))}.`,
      mrn: `49${String(500000 + bed.bed * 29)}`,
      siteLabel: `${bed.siteSummary ?? 'Left forearm'}, PIV ${bed.bed % 2 === 0 ? '20G' : '22G'}`,
      insertionTimestamp: `2026-02-22 ${pad2(6 + (bed.bed % 2))}:${pad2((bed.bed * 6) % 60)}`,
      infusionType: `${bed.infusionType ?? 'Unknown'}${unit === 'Radiology Contrast Suite' && bed.infusionType === 'Contrast' ? ' (Iohexol)' : ''}`,
      patchId: `VC-PATCH-${String(bed.bed).padStart(2, '0')}-01`,
      podId: `VC-POD-${String(500 + bed.bed + prefix.length * 10).padStart(4, '0')}`,
      currentRiskState: bed.state.includes('high') ? 'ALERT' : bed.state.includes('moderate') || bed.state.includes('sensor') ? 'WATCH' : 'NORMAL',
      confidence: bed.state.includes('high') ? 0.84 : bed.state.includes('moderate') ? 0.66 : 0.29,
      confidenceLabel: bed.state.includes('high') ? 'High' : bed.state.includes('moderate') ? 'Medium' : 'Low',
      dataQuality: bed.state === 'offline' ? 'No signal' : bed.state.includes('sensor') ? 'Weak contact' : 'Good contact',
      alertTriggerTime: bed.state.includes('alert') ? '08:04' : undefined,
      temperatureTrend1h: generateShortAlertTrend(bed.state.includes('high') ? 'high' : bed.state.includes('moderate') ? 'moderate' : bed.state.includes('sensor') ? 'sensor_issue' : 'normal'),
      timeline: [timelineEvent(`evt-${prefix}-${bed.bed}-1`, '07:02', 'System', 'Device attached', `${unit} Bed ${bed.bed}`, undefined, 'device')],
    });
  });
  return out;
}

function makeAltAlerts(unit: UnitKey, entries: Array<Partial<AlertRecord> & Pick<AlertRecord, 'id' | 'bed' | 'patientAnonId' | 'patientInitials' | 'mrn' | 'site' | 'severity' | 'label' | 'startedAt' | 'recommendedAction' | 'status'>>): AlertRecord[] {
  return entries.map((entry) => ({ ...entry }));
}

const oncologyBeds = makeAltBeds({
  count: 20,
  unitCode: 'ONC',
  alertBeds: [
    { bed: 6, state: 'moderate_alert', site: 'Left forearm', infusion: 'Antibiotics' },
    { bed: 11, state: 'sensor_issue_alert', site: 'Right hand', infusion: 'Chemotherapy adjunct' },
    { bed: 15, state: 'moderate_alert_snoozed', site: 'Left wrist', infusion: 'Antibiotics' },
  ],
});
const oncologyDataset: UnitDataset = {
  unit: 'Oncology Infusion',
  hospital: HOSPITAL_NAME,
  beds: oncologyBeds,
  alerts: makeAltAlerts('Oncology Infusion', [
    {
      id: 'A-20260222-0811-B06', bed: 6, patientAnonId: 'VC-ONC-0603', patientInitials: 'P.R.', mrn: '49610012', site: 'Left forearm', severity: 'moderate', label: 'Moderate likelihood infiltration pattern', startedAt: '08:07:44', recommendedAction: 'Reassess site and compare to baseline', status: 'active_unacknowledged', linkedPodId: 'VC-POD-0526', linkedPatchId: 'VC-PATCH-06-01',
    },
    {
      id: 'A-20260222-0804-B11', bed: 11, patientAnonId: 'VC-ONC-1102', patientInitials: 'A.T.', mrn: '49610073', site: 'Right hand', severity: 'sensor_issue', label: 'Sensor issue', startedAt: '08:00:12', recommendedAction: 'Check patch contact and pod connection', status: 'acknowledged', acknowledgedBy: 'J. Patel, RN', acknowledgedAt: '08:02:03', collapsed: true,
    },
    {
      id: 'A-20260222-0759-B15', bed: 15, patientAnonId: 'VC-ONC-1504', patientInitials: 'B.L.', mrn: '49610115', site: 'Left wrist', severity: 'moderate', label: 'Moderate likelihood infiltration pattern', startedAt: '07:54:40', recommendedAction: 'Inspect site and verify line patency', status: 'snoozed', snoozedUntil: '08:14:40',
    },
  ]),
  metrics: {
    activeMonitoredSites: 26,
    alertsLastHour: 4,
    medianAcknowledge: '1m 58s',
    medianResolve: '9m 41s',
    falseAlertReviewQueue: 5,
    monitoredIvHours24h: 224.2,
    onlinePodsCurrent: '24 / 25',
    contactQualityGoodPct: 89,
    unackOver5m: 1,
  },
  patientsByBed: makeAltPatients('Oncology Infusion', oncologyBeds, 'ONC'),
};

const edBeds = makeAltBeds({
  count: 24,
  unitCode: 'ED',
  moreNoDevice: true,
  moreOffline: true,
  shortSessions: true,
  alertBeds: [
    { bed: 2, state: 'high_alert_active', site: 'Right AC', infusion: 'Contrast' },
    { bed: 9, state: 'sensor_issue_alert', site: 'Left hand', infusion: 'Fluids' },
    { bed: 14, state: 'moderate_alert', site: 'Left forearm', infusion: 'Antibiotics' },
    { bed: 19, state: 'high_alert_escalated', site: 'Right forearm', infusion: 'Vasopressors' },
  ],
});
const edDataset: UnitDataset = {
  unit: 'Emergency Department',
  hospital: HOSPITAL_NAME,
  beds: edBeds,
  alerts: makeAltAlerts('Emergency Department', [
    { id: 'A-20260222-0812-B02', bed: 2, patientAnonId: 'VC-ED-0208', patientInitials: 'J.C.', mrn: '49720031', site: 'Right AC', severity: 'high', label: 'High likelihood infiltration pattern', startedAt: '08:08:09', recommendedAction: 'Pause infusion and assess site', status: 'active_unacknowledged', linkedPodId: 'VC-POD-0602', linkedPatchId: 'VC-PATCH-02-01' },
    { id: 'A-20260222-0808-B09', bed: 9, patientAnonId: 'VC-ED-0903', patientInitials: 'T.N.', mrn: '49720102', site: 'Left hand', severity: 'sensor_issue', label: 'Sensor issue', startedAt: '08:03:11', recommendedAction: 'Re-seat pod and confirm contact', status: 'active_unacknowledged' },
    { id: 'A-20260222-0802-B14', bed: 14, patientAnonId: 'VC-ED-1407', patientInitials: 'C.P.', mrn: '49720143', site: 'Left forearm', severity: 'moderate', label: 'Moderate likelihood infiltration pattern', startedAt: '07:58:55', recommendedAction: 'Reassess site and compare to baseline', status: 'acknowledged', acknowledgedBy: 'E. Flores, RN', acknowledgedAt: '08:00:21', collapsed: true },
    { id: 'A-20260222-0757-B19', bed: 19, patientAnonId: 'VC-ED-1905', patientInitials: 'M.S.', mrn: '49720201', site: 'Right forearm', severity: 'high', label: 'High likelihood infiltration pattern', startedAt: '07:50:31', recommendedAction: 'Pause infusion and assess site immediately', status: 'escalated', escalatedAt: '07:57:40', escalatedTo: 'Charge Nurse', nurseCallTriggered: true },
  ]),
  metrics: {
    activeMonitoredSites: 14,
    alertsLastHour: 8,
    medianAcknowledge: '1m 42s',
    medianResolve: '8m 12s',
    falseAlertReviewQueue: 9,
    monitoredIvHours24h: 118.4,
    onlinePodsCurrent: '12 / 16',
    contactQualityGoodPct: 76,
    unackOver5m: 3,
  },
  patientsByBed: makeAltPatients('Emergency Department', edBeds, 'ED'),
};

const radiologyBeds = makeAltBeds({
  count: 12,
  unitCode: 'RAD',
  shortSessions: true,
  alertBeds: [
    { bed: 3, state: 'moderate_alert', site: 'Left AC', infusion: 'Contrast' },
    { bed: 8, state: 'sensor_issue_alert', site: 'Right hand', infusion: 'Contrast' },
  ],
});
const radiologyDataset: UnitDataset = {
  unit: 'Radiology Contrast Suite',
  hospital: HOSPITAL_NAME,
  beds: radiologyBeds,
  alerts: makeAltAlerts('Radiology Contrast Suite', [
    { id: 'A-20260222-0810-B03', bed: 3, patientAnonId: 'VC-RAD-0302', patientInitials: 'H.W.', mrn: '49830017', site: 'Left AC', severity: 'moderate', label: 'Moderate likelihood infiltration pattern', startedAt: '08:06:45', recommendedAction: 'Inspect site and verify line patency', status: 'active_unacknowledged', linkedPodId: 'VC-POD-0713', linkedPatchId: 'VC-PATCH-03-01' },
    { id: 'A-20260222-0806-B08', bed: 8, patientAnonId: 'VC-RAD-0804', patientInitials: 'R.D.', mrn: '49830088', site: 'Right hand', severity: 'sensor_issue', label: 'Sensor issue', startedAt: '08:02:10', recommendedAction: 'Check patch contact and pod connection', status: 'acknowledged', acknowledgedBy: 'J. Patel, RN', acknowledgedAt: '08:03:24', collapsed: true },
  ]),
  metrics: {
    activeMonitoredSites: 9,
    alertsLastHour: 3,
    medianAcknowledge: '1m 31s',
    medianResolve: '6m 54s',
    falseAlertReviewQueue: 2,
    monitoredIvHours24h: 62.8,
    onlinePodsCurrent: '8 / 9',
    contactQualityGoodPct: 91,
    unackOver5m: 0,
  },
  patientsByBed: makeAltPatients('Radiology Contrast Suite', radiologyBeds, 'RAD'),
};

function buildPodRows(): PodRow[] {
  const rows: PodRow[] = [];
  const seeds: Array<Partial<PodRow> & Pick<PodRow, 'podId'>> = [
    {
      podId: 'VC-POD-0417',
      unit: 'ICU North',
      status: 'In use',
      batteryPct: 62,
      firmware: 'v1.9.3',
      lastCalibrationCheck: '2026-02-15 13:20',
      connectivityIssues7d: 1,
      lastAssignedBed: 'ICU North Bed 12',
      lastSeen: '2026-02-22 08:12',
      hardwareRev: 'H2',
    },
    { podId: 'VC-POD-0404', unit: 'ICU North', status: 'In use', batteryPct: 49, firmware: 'v1.9.2', lastCalibrationCheck: '2026-02-14 10:05', connectivityIssues7d: 0, lastAssignedBed: 'ICU North Bed 7', lastSeen: '2026-02-22 08:12' },
    { podId: 'VC-POD-0391', unit: 'ICU North', status: 'In use', batteryPct: 58, firmware: 'v1.9.1', lastCalibrationCheck: '2026-02-16 09:44', connectivityIssues7d: 2, lastAssignedBed: 'ICU North Bed 3', lastSeen: '2026-02-22 08:11' },
    { podId: 'VC-POD-0412', unit: 'ICU North', status: 'In use', batteryPct: 76, firmware: 'v1.9.3', lastCalibrationCheck: '2026-02-18 11:30', connectivityIssues7d: 0, lastAssignedBed: 'ICU North Bed 4', lastSeen: '2026-02-22 08:12' },
    { podId: 'VC-POD-0426', unit: 'ICU North', status: 'In use', batteryPct: 38, firmware: 'v1.9.2', lastCalibrationCheck: '2026-02-11 08:10', connectivityIssues7d: 3, lastAssignedBed: 'ICU North Bed 18', lastSeen: '2026-02-22 08:11' },
    { podId: 'VC-POD-0431', unit: 'ICU North', status: 'In use', batteryPct: 67, firmware: 'v1.9.3', lastCalibrationCheck: '2026-02-13 14:06', connectivityIssues7d: 0, lastAssignedBed: 'ICU North Bed 21', lastSeen: '2026-02-22 08:10' },
  ];

  seeds.forEach((seed) => {
    rows.push(seed as PodRow);
  });

  const units: UnitKey[] = ['ICU North', 'Oncology Infusion', 'Emergency Department', 'Radiology Contrast Suite'];
  const statuses: PodRow['status'][] = ['In use', 'Storage', 'Charging', 'Maintenance'];
  for (let i = 0; i < 24; i += 1) {
    const num = 450 + i;
    const podId = `VC-POD-${String(num).padStart(4, '0')}`;
    if (rows.some((r) => r.podId === podId)) continue;
    const unit = units[i % units.length];
    const status = statuses[(i + 1) % statuses.length];
    rows.push({
      podId,
      unit,
      status,
      batteryPct: status === 'Charging' ? 18 + (i * 7) % 50 : status === 'Storage' ? 65 + (i * 3) % 30 : 30 + (i * 5) % 65,
      firmware: ['v1.9.1', 'v1.9.2', 'v1.9.3', 'v1.8.9'][i % 4],
      lastCalibrationCheck: `2026-02-${pad2(10 + (i % 10))} ${pad2(8 + (i % 7))}:${pad2((i * 6) % 60)}`,
      connectivityIssues7d: i % 6 === 0 ? 3 : i % 4 === 0 ? 1 : 0,
      lastAssignedBed: status === 'Storage' ? 'Storage Shelf B' : `${unit} Bed ${1 + (i % (unit === 'Radiology Contrast Suite' ? 12 : 24))}`,
      lastSeen: `2026-02-22 ${pad2(7 + (i % 2))}:${pad2((12 + i * 2) % 60)}`,
      hardwareRev: i % 5 === 0 ? 'H1' : 'H2',
    });
  }

  return rows.slice(0, 24);
}

function genericPodDetail(row: PodRow): PodDetail {
  return {
    podId: row.podId,
    firmware: row.firmware,
    hardwareRev: row.hardwareRev ?? 'H2',
    lastCalibrationCheck: row.lastCalibrationCheck,
    calibrationResult: 'Pass',
    batteryHealthPct: 84 + (row.podId.charCodeAt(row.podId.length - 1) % 11),
    estimatedCycleCount: 120 + (row.podId.charCodeAt(row.podId.length - 2) % 90),
    currentAssignment: row.lastAssignedBed,
    patchPaired: row.status === 'In use' ? `VC-PATCH-${row.lastAssignedBed.replace(/\D/g, '').slice(-2).padStart(2, '0') || '00'}-01` : 'None',
    connectionHistory: [
      { time: '2026-02-22 06:22', event: 'Heartbeat stable' },
      { time: '2026-02-22 07:13', event: 'Heartbeat stable' },
      { time: row.lastSeen, event: 'Last seen' },
    ],
    errorCodes: row.connectivityIssues7d > 0 ? ['E112 Weak contact (informational)', 'No critical errors'] : ['No critical errors'],
    recommendedFixes: ['Re-seat patch', 'Inspect adhesive edge', 'Verify pod latch'],
    assignmentHistory: Array.from({ length: 8 }, (_, idx) => ({
      unit: row.unit,
      bed: `${1 + ((idx * 3) % 24)}`,
      start: `2026-02-${pad2(14 - idx)} ${pad2(7 + (idx % 3))}:10`,
      end: `2026-02-${pad2(14 - idx)} ${pad2(9 + (idx % 3))}:40`,
      outcome: idx === 2 && row.connectivityIssues7d > 0 ? 'Contact issue noted' : 'Normal use',
    })),
  };
}

const podRows = buildPodRows();
const podDetails: Record<string, PodDetail> = Object.fromEntries(podRows.map((row) => [row.podId, genericPodDetail(row)]));
podDetails['VC-POD-0417'] = {
  podId: 'VC-POD-0417',
  firmware: 'v1.9.3',
  hardwareRev: 'H2',
  lastCalibrationCheck: '2026-02-15 13:20',
  calibrationResult: 'Pass',
  batteryHealthPct: 91,
  estimatedCycleCount: 184,
  currentAssignment: 'ICU North Bed 12',
  patchPaired: 'VC-PATCH-12-02',
  connectionHistory: [
    { time: '2026-02-22 05:53', event: 'dropout 3m (weak contact)' },
    { time: '2026-02-22 05:56', event: 'restored' },
    { time: '2026-02-22 08:12', event: 'otherwise stable' },
  ],
  errorCodes: ['E112 Weak contact (informational)', 'No critical errors'],
  recommendedFixes: ['Re-seat patch', 'Inspect adhesive edge', 'Verify pod latch'],
  assignmentHistory: [
    { unit: 'ICU North', bed: '12', start: '2026-02-22 04:19', end: 'Current', outcome: 'In use' },
    { unit: 'ICU North', bed: '16', start: '2026-02-21 20:42', end: '2026-02-22 03:58', outcome: 'Normal use' },
    { unit: 'ICU North', bed: '8', start: '2026-02-21 11:05', end: '2026-02-21 18:44', outcome: 'Removed after transfer' },
    { unit: 'Emergency Department', bed: '4', start: '2026-02-20 23:16', end: '2026-02-21 03:02', outcome: 'Discharged from ED' },
    { unit: 'ICU North', bed: '5', start: '2026-02-20 12:14', end: '2026-02-20 18:33', outcome: 'Normal use' },
    { unit: 'Oncology Infusion', bed: '9', start: '2026-02-19 15:01', end: '2026-02-19 17:46', outcome: 'Normal use' },
    { unit: 'Radiology Contrast Suite', bed: '3', start: '2026-02-18 10:09', end: '2026-02-18 11:02', outcome: 'Contrast session complete' },
    { unit: 'ICU North', bed: '14', start: '2026-02-17 04:56', end: '2026-02-17 12:41', outcome: 'Normal use' },
  ],
};

const devicesData: DevicesModuleData = {
  summary: {
    podsInCirculation: 58,
    podsInStorage: 22,
    podsNeedingCharge: 9,
    podsFlaggedMaintenance: 3,
    podsConnectivityIssues7d: 4,
    patchInventoryOnHand: 416,
    predictedPatchRunoutDate: '2026-03-03',
  },
  pods: podRows,
  podDetails,
  patchInventory: [
    { patchType: 'Adult forearm patch', onHand: 220, runoutDays: 9, predictedRunoutDate: '2026-03-03' },
    { patchType: 'Adult hand/wrist patch', onHand: 128, runoutDays: 7, predictedRunoutDate: '2026-03-01' },
    { patchType: 'Pediatric small patch', onHand: 68, runoutDays: 14, predictedRunoutDate: '2026-03-08' },
  ],
};

const analyticsCases: CaseReviewCase[] = [
  {
    caseId: 'CR-2026-0222-12',
    bed: 12,
    severity: 'high',
    duration: '14m',
    site: 'Left forearm',
    infusionCategory: 'Antibiotics',
    currentLabel: 'unlabeled',
    reviewer: '',
    lastUpdated: '2026-02-22 08:08',
    prolonged: false,
    repeated: false,
    linkedPatientBed: 12,
    notesSummary: 'Bed 12 alert with sustained cooling + thickness rise. Awaiting QA label after nursing documentation review.',
    eventNotes: ['Alert triggered 08:06', 'Charge RN surfaced 08:07', 'Trend quality dip at 08:10 with motion artifact flag'],
    miniTrend: bed12Trend1h,
  },
  {
    caseId: 'CR-2026-0219-03',
    bed: 7,
    severity: 'high',
    duration: '28m',
    site: 'Right forearm',
    infusionCategory: 'Blood products',
    currentLabel: 'true',
    reviewer: 'K. Singh, QA',
    lastUpdated: '2026-02-20 14:12',
    prolonged: true,
    repeated: false,
    notesSummary: 'Clear correlated trend pattern and bedside documentation consistent with intervention.',
    eventNotes: ['Escalated to charge nurse', 'Line replaced per protocol'],
    miniTrend: generateShortAlertTrend('high'),
  },
  {
    caseId: 'CR-2026-0218-11',
    bed: 11,
    severity: 'sensor_issue',
    duration: '9m',
    site: 'Left hand',
    infusionCategory: 'Antibiotics',
    currentLabel: 'false',
    reviewer: 'K. Singh, QA',
    lastUpdated: '2026-02-19 09:33',
    prolonged: false,
    repeated: true,
    notesSummary: 'Weak contact + adhesive lift. No clinical change noted.',
    eventNotes: ['Repeated contact loss after repositioning', 'Patch replaced'],
    miniTrend: generateShortAlertTrend('sensor_issue'),
  },
  {
    caseId: 'CR-2026-0217-22',
    bed: 22,
    severity: 'moderate',
    duration: '18m',
    site: 'Right AC',
    infusionCategory: 'Fluids',
    currentLabel: 'unclear',
    reviewer: 'M. Chen, Director',
    lastUpdated: '2026-02-18 16:05',
    prolonged: true,
    repeated: false,
    notesSummary: 'Partial documentation; trend pattern present but intervention timing ambiguous.',
    eventNotes: ['Documentation delayed during shift change'],
    miniTrend: generateShortAlertTrend('moderate'),
  },
  {
    caseId: 'CR-2026-0216-08',
    bed: 8,
    severity: 'sensor_issue',
    duration: '6m',
    site: 'Left hand',
    infusionCategory: 'Unknown',
    currentLabel: 'false',
    reviewer: 'K. Singh, QA',
    lastUpdated: '2026-02-16 13:41',
    prolonged: false,
    repeated: true,
    notesSummary: 'Offline pod transition event; no patient intervention required.',
    eventNotes: ['Pod battery low; swapped device'],
    miniTrend: generateShortAlertTrend('sensor_issue'),
  },
  {
    caseId: 'CR-2026-0215-14',
    bed: 14,
    severity: 'moderate',
    duration: '12m',
    site: 'Left forearm',
    infusionCategory: 'Antibiotics',
    currentLabel: 'true',
    reviewer: 'K. Singh, QA',
    lastUpdated: '2026-02-15 18:22',
    prolonged: false,
    repeated: false,
    notesSummary: 'Moderate pattern reviewed; site edema documented and line replaced.',
    eventNotes: ['EHR note and flowsheet both present'],
    miniTrend: generateShortAlertTrend('moderate'),
  },
  {
    caseId: 'CR-2026-0214-05',
    bed: 5,
    severity: 'high',
    duration: '35m',
    site: 'Left wrist',
    infusionCategory: 'Vasopressors',
    currentLabel: 'true',
    reviewer: 'M. Chen, Director',
    lastUpdated: '2026-02-14 11:07',
    prolonged: true,
    repeated: false,
    notesSummary: 'Prolonged high-severity alert during staffing surge, reviewed for workflow timing.',
    eventNotes: ['Escalation acknowledged after 7m threshold'],
    miniTrend: generateShortAlertTrend('high'),
  },
  {
    caseId: 'CR-2026-0213-19',
    bed: 19,
    severity: 'moderate',
    duration: '10m',
    site: 'Right forearm',
    infusionCategory: 'Fluids',
    currentLabel: 'unlabeled',
    reviewer: '',
    lastUpdated: '2026-02-13 08:54',
    prolonged: false,
    repeated: true,
    notesSummary: 'Pending QA review due to repeated alert pattern at same site in 24h.',
    eventNotes: ['Possible positional artifact vs early site change'],
    miniTrend: generateShortAlertTrend('moderate'),
  },
];

const analyticsData: AnalyticsModuleData = {
  kpis: {
    totalMonitoredHours: 12486,
    totalAlerts: 251,
    alertsPer100Hours: 2.01,
    medianAck: '2m 23s',
    medianIntervention: '10m 58s',
    labeledFalseAlerts: 41,
    labeledTrueInfiltrations: 137,
    unclearReviewCases: 19,
    reviewCompletionRatePct: 78,
  },
  alertsPer100IvHoursWeekly: [2.4, 2.1, 2.2, 2.0, 1.9, 2.3, 2.5, 2.2, 2.0, 1.8, 2.1, 2.0].map((value, idx) => ({
    label: `W${idx + 1}`,
    value,
    previous: Number((value + 0.15 + (idx % 3) * 0.05).toFixed(2)),
  })),
  ackDistribution: [
    { bin: '0–1m', count: 31 },
    { bin: '1–2m', count: 46 },
    { bin: '2–5m', count: 58 },
    { bin: '5–10m', count: 19 },
    { bin: '10m+', count: 7 },
  ],
  interventionDistribution: [
    { bin: '0–5m', count: 22 },
    { bin: '5–10m', count: 49 },
    { bin: '10–20m', count: 61 },
    { bin: '20–30m', count: 18 },
    { bin: '30m+', count: 4 },
  ],
  repeatAlertsBySite: [
    { label: 'Left forearm', value: 18 },
    { label: 'Right forearm', value: 14 },
    { label: 'Left hand', value: 11 },
    { label: 'Right AC', value: 9 },
    { label: 'Wrist', value: 7 },
    { label: 'Other', value: 5 },
  ],
  alertsByInfusionCategory: [
    { label: 'Fluids', value: 34 },
    { label: 'Antibiotics', value: 27 },
    { label: 'Contrast', value: 16 },
    { label: 'Vasopressors', value: 8 },
    { label: 'Blood products', value: 5 },
    { label: 'Unknown', value: 10 },
  ],
  unacknowledgedOverTime: [
    { label: '00:00', value: 1 },
    { label: '03:00', value: 1 },
    { label: '06:00', value: 2 },
    { label: '07:00', value: 5, annotation: '07:00 shift change' },
    { label: '09:00', value: 2 },
    { label: '12:00', value: 1 },
    { label: '15:00', value: 2 },
    { label: '18:00', value: 3 },
    { label: '19:00', value: 6, annotation: '19:00 shift change' },
    { label: '21:00', value: 2 },
    { label: '23:00', value: 1 },
  ],
  caseReviewCases: analyticsCases,
};

const auditLog: AuditLogEntry[] = [
  { id: 'audit-1', timestamp: '2026-02-22 08:12:20', user: 'Charge RN E. Flores', action: 'viewed Bed 12 detail', object: 'Bed 12', outcome: 'Success' },
  { id: 'audit-2', timestamp: '2026-02-22 08:11:58', user: 'J. Patel, RN', action: 'acknowledged alert', object: 'A-20260222-0807-B04', outcome: 'Logged' },
  { id: 'audit-3', timestamp: '2026-02-22 08:11:42', user: 'QA Reviewer K. Singh', action: 'labeled case as false alert', object: 'CR-2026-0222-12', outcome: 'Saved' },
  { id: 'audit-4', timestamp: '2026-02-22 08:11:10', user: 'System', action: 'nurse call integration heartbeat', object: 'Nurse Call', outcome: 'Connected' },
  { id: 'audit-5', timestamp: '2026-02-22 08:10:44', user: 'M. Chen, Director', action: 'opened analytics dashboard', object: 'Analytics', outcome: 'Success' },
  { id: 'audit-6', timestamp: '2026-02-22 08:10:08', user: 'A. Romero, Biomed', action: 'viewed pod detail', object: 'VC-POD-0417', outcome: 'Success' },
  { id: 'audit-7', timestamp: '2026-02-22 08:09:51', user: 'System Admin', action: 'toggled reveal identifiers', object: 'Header privacy toggle', outcome: 'On' },
  { id: 'audit-8', timestamp: '2026-02-22 08:09:37', user: 'System', action: 'alert surfaced on unit board', object: 'A-20260222-0810-B12', outcome: 'Visible' },
  { id: 'audit-9', timestamp: '2026-02-22 08:09:03', user: 'EHR Integration', action: 'sync structured note template metadata', object: 'EHR', outcome: 'Test mode' },
  { id: 'audit-10', timestamp: '2026-02-22 08:08:49', user: 'System', action: 'alert triggered', object: 'A-20260222-0810-B12', outcome: 'Queued' },
  { id: 'audit-11', timestamp: '2026-02-22 08:08:20', user: 'Charge RN E. Flores', action: 'viewed Bed 7 detail', object: 'Bed 7', outcome: 'Success' },
  { id: 'audit-12', timestamp: '2026-02-22 08:07:58', user: 'System', action: 'nurse call triggered', object: 'A-20260222-0758-B07', outcome: 'Sent' },
  { id: 'audit-13', timestamp: '2026-02-22 08:07:11', user: 'J. Patel, RN', action: 'snoozed alert 5 min', object: 'A-20260222-0752-B21', outcome: 'Logged' },
  { id: 'audit-14', timestamp: '2026-02-22 08:06:44', user: 'System', action: 'contact drop detected', object: 'VC-POD-0417', outcome: 'Recovered' },
  { id: 'audit-15', timestamp: '2026-02-22 08:06:18', user: 'T. Wallace, Unit Manager', action: 'opened devices module', object: 'Devices', outcome: 'Success' },
  { id: 'audit-16', timestamp: '2026-02-22 08:05:54', user: 'System', action: 'bed mapping sync', object: 'Bed Management Mapping', outcome: 'Connected' },
  { id: 'audit-17', timestamp: '2026-02-22 08:05:22', user: 'System Admin', action: 'updated data retention policy view', object: 'Privacy Controls', outcome: 'Viewed' },
  { id: 'audit-18', timestamp: '2026-02-22 08:04:59', user: 'QA Reviewer K. Singh', action: 'export selected dataset', object: 'Case Review', outcome: 'Demo only' },
  { id: 'audit-19', timestamp: '2026-02-22 08:04:31', user: 'System', action: 'pod heartbeat', object: 'VC-POD-0426', outcome: 'Weak contact' },
  { id: 'audit-20', timestamp: '2026-02-22 08:03:58', user: 'Charge RN E. Flores', action: 'viewed escalated queue', object: 'Alert Queue', outcome: 'Success' },
  { id: 'audit-21', timestamp: '2026-02-22 08:03:21', user: 'System', action: 'audit logging write', object: 'Action stream', outcome: 'Success' },
];

const integrationsData: IntegrationsPrivacyData = {
  config: {
    nurseCallEnabled: true,
    ehrEnabled: true,
    ehrMode: 'Both',
    bedManagementEnabled: true,
    pagingEnabled: false,
    hideIdentifiersOnUnitBoard: true,
    requireElevatedRoleForMrn: true,
    auditLoggingEnabled: true,
    dataRetentionRawSignals: '30 days raw signals',
    dataRetentionReviewLabels: '1 year review labels',
    dataRetentionAuditLogs: '7 years audit logs',
    integrationStatus: {
      nurseCall: 'Connected',
      ehr: 'Test mode',
      bedManagement: 'Connected',
      paging: 'Disabled',
    },
    lastSyncs: {
      nurseCall: '2026-02-22 08:12:16',
      ehr: '2026-02-22 08:11:50',
      bedManagement: '2026-02-22 08:10:54',
      paging: '2026-02-22 06:00:00',
    },
  },
  auditLog,
};

export const demoData: DemoDataBundle = {
  hospitalName: HOSPITAL_NAME,
  unitOptions,
  roleUsers: roleDisplayNames as Record<Role, string>,
  units: {
    'ICU North': icuDataset,
    'Oncology Infusion': oncologyDataset,
    'Emergency Department': edDataset,
    'Radiology Contrast Suite': radiologyDataset,
  },
  devices: devicesData,
  analytics: analyticsData,
  integrations: integrationsData,
};
