export type Role =
  | 'Staff Nurse'
  | 'Charge Nurse'
  | 'Leadership'
  | 'QA Reviewer'
  | 'Biomed Tech'
  | 'Unit Manager'
  | 'Admin';

export type UnitKey =
  | 'ICU North'
  | 'Oncology Infusion'
  | 'Emergency Department'
  | 'Radiology Contrast Suite';

export type AppTab =
  | 'unit-board'
  | 'devices'
  | 'analytics'
  | 'integrations'
  | 'demo-settings';

export type NetworkStatus = 'online' | 'degraded' | 'offline';
export type DemoClockMode = 'fixed' | 'live';

export type AlertSeverity = 'high' | 'moderate' | 'sensor_issue';
export type AlertStatus =
  | 'active_unacknowledged'
  | 'acknowledged'
  | 'escalated'
  | 'snoozed'
  | 'resolved';

export interface AlertRecord {
  id: string;
  bed: number;
  patientAnonId: string;
  patientInitials: string;
  mrn: string;
  site: string;
  severity: AlertSeverity;
  label: string;
  startedAt: string; // HH:mm:ss local demo day
  recommendedAction: string;
  status: AlertStatus;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  escalatedAt?: string;
  escalatedTo?: string;
  nurseCallTriggered?: boolean;
  snoozedUntil?: string;
  linkedPodId?: string;
  linkedPatchId?: string;
  autoEscalated?: boolean;
  collapsed?: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  uiPulseEscalated?: boolean;
}

export type BedState =
  | 'monitoring_active'
  | 'no_device'
  | 'offline'
  | 'high_alert_active'
  | 'high_alert_escalated'
  | 'moderate_alert'
  | 'moderate_alert_snoozed'
  | 'sensor_issue_alert';

export interface BedTile {
  bed: number;
  state: BedState;
  sites?: number;
  monitoringDuration?: string; // e.g. 1h 52m
  signalQuality?: 'good' | 'fair' | 'poor';
  infusionType?: string;
  siteSummary?: string;
  lastUpdate?: string; // HH:mm:ss
}

export interface UnitMetrics {
  activeMonitoredSites: number;
  alertsLastHour: number;
  medianAcknowledge: string;
  medianResolve: string;
  falseAlertReviewQueue: number;
  monitoredIvHours24h: number;
  onlinePodsCurrent: string;
  contactQualityGoodPct: number;
  unackOver5m: number;
}

export interface TrendPoint {
  time: string; // HH:mm for display
  isoTime?: string;
  tempDeltaC: number;
  thicknessDeltaPct: number;
  quality: 'good' | 'weak';
  motionArtifact: boolean;
  normalBandLow: number;
  normalBandHigh: number;
}

export interface TimelineEvent {
  id: string;
  timestamp: string; // HH:mm
  actor: string;
  eventType: string;
  note?: string;
  deviceIds?: string[];
  icon?: 'system' | 'alert' | 'user' | 'note' | 'device' | 'status';
}

export interface PatientDetail {
  bed: number;
  patientAnonId: string;
  patientInitials: string;
  mrn: string;
  siteLabel: string;
  insertionTimestamp: string; // yyyy-MM-dd HH:mm
  infusionType: string;
  patchId: string;
  podId: string;
  podBatteryPct: number;
  runtimeRemainingHours: number;
  firmwareVersion: string;
  currentRiskState: 'NORMAL' | 'WATCH' | 'ALERT';
  confidence: number;
  confidenceLabel: 'Low' | 'Medium' | 'High';
  dataQuality: string;
  lastStableBaseline: string; // HH:mm
  contactQuality15mPct: number;
  motionArtifactSummary: string;
  alertTriggerTime?: string; // HH:mm
  temperatureTrend1h: TrendPoint[];
  thicknessTrend1h?: TrendPoint[]; // optional alias not used
  sessionTrend: TrendPoint[];
  shortTrend?: TrendPoint[];
  timeline: TimelineEvent[];
  noteTemplate: string;
  ivGauge?: string;
  hardwareRev?: string;
}

export interface UnitDataset {
  unit: UnitKey;
  hospital: string;
  beds: BedTile[];
  alerts: AlertRecord[];
  metrics: UnitMetrics;
  patientsByBed: Record<number, PatientDetail>;
}

export type PodStatus = 'In use' | 'Storage' | 'Charging' | 'Maintenance';

export interface PodRow {
  podId: string;
  unit: UnitKey;
  status: PodStatus;
  batteryPct: number;
  firmware: string;
  lastCalibrationCheck: string;
  connectivityIssues7d: number;
  lastAssignedBed: string;
  lastSeen: string;
  hardwareRev?: string;
}

export interface AssignmentHistoryRow {
  unit: UnitKey;
  bed: string;
  start: string;
  end: string;
  outcome: string;
}

export interface PodDetail {
  podId: string;
  firmware: string;
  hardwareRev: string;
  lastCalibrationCheck: string;
  calibrationResult: 'Pass' | 'Fail';
  batteryHealthPct: number;
  estimatedCycleCount: number;
  currentAssignment: string;
  patchPaired: string;
  connectionHistory: Array<{ time: string; event: string }>;
  errorCodes: string[];
  recommendedFixes: string[];
  assignmentHistory: AssignmentHistoryRow[];
}

export interface PatchInventoryItem {
  patchType: string;
  onHand: number;
  runoutDays: number;
  predictedRunoutDate: string;
}

export interface DevicesModuleData {
  summary: {
    podsInCirculation: number;
    podsInStorage: number;
    podsNeedingCharge: number;
    podsFlaggedMaintenance: number;
    podsConnectivityIssues7d: number;
    patchInventoryOnHand: number;
    predictedPatchRunoutDate: string;
  };
  pods: PodRow[];
  podDetails: Record<string, PodDetail>;
  patchInventory: PatchInventoryItem[];
}

export interface AnalyticsKpis {
  totalMonitoredHours: number;
  totalAlerts: number;
  alertsPer100Hours: number;
  medianAck: string;
  medianIntervention: string;
  labeledFalseAlerts: number;
  labeledTrueInfiltrations: number;
  unclearReviewCases: number;
  reviewCompletionRatePct: number;
}

export interface TimeSeriesPoint {
  label: string;
  value: number;
  previous?: number;
  annotation?: string;
}

export interface DistributionBin {
  bin: string;
  count: number;
}

export interface CategoryValue {
  label: string;
  value: number;
}

export type CaseLabel = 'true' | 'false' | 'unclear' | 'unlabeled';

export interface CaseReviewCase {
  caseId: string;
  bed: number;
  severity: AlertSeverity;
  duration: string;
  site: string;
  infusionCategory: string;
  currentLabel: CaseLabel;
  reviewer?: string;
  lastUpdated: string;
  prolonged: boolean;
  repeated: boolean;
  linkedPatientBed?: number;
  notesSummary: string;
  eventNotes: string[];
  miniTrend: TrendPoint[];
}

export interface AnalyticsModuleData {
  kpis: AnalyticsKpis;
  alertsPer100IvHoursWeekly: TimeSeriesPoint[];
  ackDistribution: DistributionBin[];
  interventionDistribution: DistributionBin[];
  repeatAlertsBySite: CategoryValue[];
  alertsByInfusionCategory: CategoryValue[];
  unacknowledgedOverTime: TimeSeriesPoint[];
  caseReviewCases: CaseReviewCase[];
}

export interface IntegrationConfig {
  nurseCallEnabled: boolean;
  ehrEnabled: boolean;
  ehrMode: 'Structured note template' | 'Flowsheet entry' | 'Both';
  bedManagementEnabled: boolean;
  pagingEnabled: boolean;
  hideIdentifiersOnUnitBoard: boolean;
  requireElevatedRoleForMrn: boolean;
  auditLoggingEnabled: boolean;
  dataRetentionRawSignals: string;
  dataRetentionReviewLabels: string;
  dataRetentionAuditLogs: string;
  integrationStatus: {
    nurseCall: 'Connected' | 'Test mode' | 'Disabled';
    ehr: 'Connected' | 'Test mode' | 'Disabled';
    bedManagement: 'Connected' | 'Test mode' | 'Disabled';
    paging: 'Connected' | 'Test mode' | 'Disabled';
  };
  lastSyncs: Record<'nurseCall' | 'ehr' | 'bedManagement' | 'paging', string>;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  object: string;
  outcome: string;
}

export interface IntegrationsPrivacyData {
  config: IntegrationConfig;
  auditLog: AuditLogEntry[];
}

export interface SearchResult {
  id: string;
  category: 'Beds' | 'Active alerts' | 'Devices' | 'Review cases';
  label: string;
  sublabel?: string;
  target: {
    tab: AppTab;
    bed?: number;
    alertId?: string;
    podId?: string;
    caseId?: string;
  };
}

export interface DemoDataBundle {
  hospitalName: string;
  unitOptions: UnitKey[];
  roleUsers: Record<Role, string>;
  units: Record<UnitKey, UnitDataset>;
  devices: DevicesModuleData;
  analytics: AnalyticsModuleData;
  integrations: IntegrationsPrivacyData;
}
