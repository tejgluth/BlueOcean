import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { demoData } from '../data/demoData';
import { demoDateFromClock } from '../lib/formatters';
import { roleDisplayNames } from '../lib/rolePermissions';
import type {
  AlertRecord,
  AlertStatus,
  AppTab,
  AuditLogEntry,
  CaseLabel,
  DemoClockMode,
  IntegrationConfig,
  NetworkStatus,
  Role,
  SearchResult,
  UnitKey,
} from '../types/demo';

const FIXED_NOW = new Date(2026, 1, 22, 8, 12, 34).getTime();

export type AlertFilter = 'All' | 'High' | 'Moderate' | 'Sensor' | 'Acknowledged' | 'Snoozed';
export type AnalyticsSubtab = 'overview' | 'case-review';

interface ToastItem {
  id: string;
  title: string;
  description?: string;
}

interface DevicesFilters {
  unit: UnitKey | 'All units';
  status: 'All' | 'In use' | 'Storage' | 'Charging' | 'Maintenance';
  batteryRange: 'All' | '0-25' | '26-50' | '51-75' | '76-100';
  firmware: 'All' | string;
  connectivityIssuesOnly: boolean;
}

interface CaseReviewFilters {
  highSeverityOnly: boolean;
  prolongedAlerts: boolean;
  repeatedAlerts: boolean;
  unlabeledOnly: boolean;
  dateRange: 'Last 7 days' | 'Last 30 days' | 'Last 12 weeks';
}

interface HighlightTarget {
  tab: AppTab;
  bed?: number;
  alertId?: string;
  podId?: string;
  caseId?: string;
  id?: string;
}

interface MutableState {
  units: typeof demoData.units;
  analyticsCases: typeof demoData.analytics.caseReviewCases;
  integrationConfig: IntegrationConfig;
  auditLog: AuditLogEntry[];
}

interface DemoState {
  data: MutableState;
  role: Role;
  selectedUnit: UnitKey;
  revealIdentifiersRequested: boolean;
  currentTimeMs: number;
  clockMode: DemoClockMode;
  screenshotMode: boolean;
  networkStatus: NetworkStatus;
  autoEscalationThresholdMin: number;
  removeResolvedAlertsFromQueue: boolean;
  alertFilter: AlertFilter;
  selectedBedByUnit: Record<UnitKey, number>;
  selectedPodId: string | null;
  analyticsSubtab: AnalyticsSubtab;
  selectedCaseId: string | null;
  comparePreviousPeriod: boolean;
  globalSearchQuery: string;
  highlightTarget: HighlightTarget | null;
  devicesFilters: DevicesFilters;
  caseReviewFilters: CaseReviewFilters;
  toasts: ToastItem[];
  initFromQueryParams: (search: string) => void;
  tick: () => void;
  setClockMode: (mode: DemoClockMode) => void;
  setScreenshotMode: (value: boolean) => void;
  setRole: (role: Role) => void;
  setSelectedUnit: (unit: UnitKey) => void;
  setRevealIdentifiersRequested: (value: boolean) => void;
  setNetworkStatus: (status: NetworkStatus) => void;
  setAutoEscalationThresholdMin: (value: number) => void;
  setRemoveResolvedAlertsFromQueue: (value: boolean) => void;
  setAlertFilter: (filter: AlertFilter) => void;
  selectBed: (bed: number) => void;
  selectPod: (podId: string | null) => void;
  setAnalyticsSubtab: (tab: AnalyticsSubtab) => void;
  selectCase: (caseId: string | null) => void;
  setComparePreviousPeriod: (value: boolean) => void;
  setGlobalSearchQuery: (value: string) => void;
  applySearchResult: (result: SearchResult) => void;
  clearHighlight: () => void;
  acknowledgeAlert: (alertId: string) => void;
  escalateAlert: (alertId: string) => void;
  resolveAlert: (alertId: string) => void;
  snoozeAlert: (alertId: string) => void;
  addPatientNoteEvent: (bed: number, note: string) => void;
  setIntegrationToggle: (key: keyof Pick<IntegrationConfig, 'nurseCallEnabled' | 'ehrEnabled' | 'bedManagementEnabled' | 'pagingEnabled' | 'hideIdentifiersOnUnitBoard' | 'requireElevatedRoleForMrn' | 'auditLoggingEnabled'>, value: boolean) => void;
  setEhrMode: (mode: IntegrationConfig['ehrMode']) => void;
  setDevicesFilters: (patch: Partial<DevicesFilters>) => void;
  setCaseReviewFilters: (patch: Partial<CaseReviewFilters>) => void;
  setCaseLabel: (caseId: string, label: CaseLabel) => void;
  pushToast: (title: string, description?: string) => void;
  dismissToast: (id: string) => void;
}

function cloneData(): MutableState {
  return {
    units: structuredClone(demoData.units),
    analyticsCases: structuredClone(demoData.analytics.caseReviewCases),
    integrationConfig: structuredClone(demoData.integrations.config),
    auditLog: structuredClone(demoData.integrations.auditLog),
  };
}

function nowClockString(ms: number) {
  const d = new Date(ms);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

function nowHmString(ms: number) {
  const d = new Date(ms);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function appendAudit(state: DemoState, action: string, object: string, outcome: string, user?: string) {
  const entry: AuditLogEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: `2026-02-22 ${nowClockString(state.currentTimeMs)}`,
    user: user ?? roleDisplayNames[state.role],
    action,
    object,
    outcome,
  };
  state.data.auditLog = [entry, ...state.data.auditLog].slice(0, 60);
}

function appendPatientEvent(state: DemoState, bed: number, eventType: string, note?: string) {
  const unit = state.selectedUnit;
  const patient = state.data.units[unit].patientsByBed[bed];
  if (!patient) return;
  patient.timeline = [
    {
      id: `evt-${bed}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      timestamp: nowHmString(state.currentTimeMs),
      actor: roleDisplayNames[state.role],
      eventType,
      note,
      deviceIds: [patient.podId, patient.patchId],
      icon: 'user',
    },
    ...patient.timeline,
  ];
}

function updateAlertInCurrentUnit(state: DemoState, alertId: string, updater: (alert: AlertRecord) => void) {
  const alerts = state.data.units[state.selectedUnit].alerts;
  const target = alerts.find((alert) => alert.id === alertId);
  if (!target) return;
  updater(target);
}

function maybeAutoEscalate(state: DemoState) {
  const thresholdMin = state.autoEscalationThresholdMin;
  const now = new Date(state.currentTimeMs);

  Object.values(state.data.units).forEach((unit) => {
    unit.alerts.forEach((alert) => {
      if (alert.status !== 'active_unacknowledged') return;
      if (alert.severity === 'sensor_issue') return;
      const elapsedMs = now.getTime() - demoDateFromClock(alert.startedAt).getTime();
      if (elapsedMs < thresholdMin * 60 * 1000) return;
      alert.status = 'escalated';
      alert.escalatedAt = nowHmString(state.currentTimeMs);
      alert.escalatedTo = 'Charge Nurse';
      alert.autoEscalated = true;
      alert.uiPulseEscalated = true;
      if (state.data.integrationConfig.nurseCallEnabled) {
        alert.nurseCallTriggered = true;
      }
      const patient = unit.patientsByBed[alert.bed];
      if (patient) {
        patient.timeline = [
          {
            id: `evt-auto-${alert.id}`,
            timestamp: nowHmString(state.currentTimeMs),
            actor: 'System',
            eventType: 'Auto-escalated alert',
            note: `Threshold exceeded (${thresholdMin} min)${alert.nurseCallTriggered ? '; nurse call triggered' : ''}`,
            deviceIds: [patient.podId, patient.patchId],
            icon: 'alert',
          },
          ...patient.timeline,
        ];
      }
    });
  });
}

function addToast(state: DemoState, title: string, description?: string) {
  state.toasts = [
    ...state.toasts,
    {
      id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      title,
      description,
    },
  ].slice(-5);
}

export const useDemoStore = create<DemoState>()(immer((set, get) => ({
  data: cloneData(),
  role: 'Charge Nurse',
  selectedUnit: 'ICU North',
  revealIdentifiersRequested: false,
  currentTimeMs: FIXED_NOW,
  clockMode: 'fixed',
  screenshotMode: false,
  networkStatus: 'online',
  autoEscalationThresholdMin: 7,
  removeResolvedAlertsFromQueue: true,
  alertFilter: 'All',
  selectedBedByUnit: {
    'ICU North': 12,
    'Oncology Infusion': 6,
    'Emergency Department': 2,
    'Radiology Contrast Suite': 3,
  },
  selectedPodId: 'VC-POD-0417',
  analyticsSubtab: 'overview',
  selectedCaseId: 'CR-2026-0222-12',
  comparePreviousPeriod: true,
  globalSearchQuery: '',
  highlightTarget: null,
  devicesFilters: {
    unit: 'All units',
    status: 'All',
    batteryRange: 'All',
    firmware: 'All',
    connectivityIssuesOnly: false,
  },
  caseReviewFilters: {
    highSeverityOnly: false,
    prolongedAlerts: false,
    repeatedAlerts: false,
    unlabeledOnly: false,
    dateRange: 'Last 12 weeks',
  },
  toasts: [],

  initFromQueryParams: (search) => {
    const params = new URLSearchParams(search);
    const demoClock = params.get('demoClock');
    const screenshot = params.get('screenshot');
    set((state) => {
      if (demoClock === 'live') state.clockMode = 'live';
      if (demoClock === 'fixed') state.clockMode = 'fixed';
      state.screenshotMode = screenshot === '1';
    });
  },

  tick: () => {
    set((state) => {
      if (state.screenshotMode || state.clockMode !== 'live') return state;
      state.currentTimeMs += 1000;
      maybeAutoEscalate(state);
      return state;
    });
  },

  setClockMode: (mode) => set((state) => ({ ...state, clockMode: mode })),
  setScreenshotMode: (value) => set((state) => ({ ...state, screenshotMode: value })),

  setRole: (role) =>
    set((state) => {
      state.role = role;
      if (role !== 'Admin') state.revealIdentifiersRequested = false;
      appendAudit(state, 'switched demo role', 'Role selector', role);
      return state;
    }),

  setSelectedUnit: (unit) =>
    set((state) => {
      state.selectedUnit = unit;
      state.alertFilter = 'All';
      state.highlightTarget = null;
      appendAudit(state, 'changed selected unit', 'Unit selector', unit);
      return state;
    }),

  setRevealIdentifiersRequested: (value) =>
    set((state) => {
      state.revealIdentifiersRequested = value;
      appendAudit(state, 'toggled reveal identifiers', 'Header privacy toggle', value ? 'On' : 'Off');
      return state;
    }),

  setNetworkStatus: (status) => set((state) => ({ ...state, networkStatus: status })),
  setAutoEscalationThresholdMin: (value) => set((state) => ({ ...state, autoEscalationThresholdMin: Math.max(1, Math.min(30, Math.round(value))) })),
  setRemoveResolvedAlertsFromQueue: (value) => set((state) => ({ ...state, removeResolvedAlertsFromQueue: value })),
  setAlertFilter: (filter) => set((state) => ({ ...state, alertFilter: filter })),
  selectBed: (bed) =>
    set((state) => {
      state.selectedBedByUnit[state.selectedUnit] = bed;
      state.highlightTarget = { tab: 'unit-board', bed, id: `bed-${state.selectedUnit}-${bed}` };
      appendAudit(state, `viewed Bed ${bed} detail`, `Bed ${bed}`, 'Success');
      return state;
    }),
  selectPod: (podId) => set((state) => ({ ...state, selectedPodId: podId })),
  setAnalyticsSubtab: (tab) => set((state) => ({ ...state, analyticsSubtab: tab })),
  selectCase: (caseId) => set((state) => ({ ...state, selectedCaseId: caseId })),
  setComparePreviousPeriod: (value) => set((state) => ({ ...state, comparePreviousPeriod: value })),
  setGlobalSearchQuery: (value) => set((state) => ({ ...state, globalSearchQuery: value })),
  applySearchResult: (result) =>
    set((state) => {
      state.highlightTarget = { ...result.target, id: result.id };
      if (result.target.bed) state.selectedBedByUnit[state.selectedUnit] = result.target.bed;
      if (result.target.podId) state.selectedPodId = result.target.podId;
      if (result.target.caseId) {
        state.selectedCaseId = result.target.caseId;
        state.analyticsSubtab = 'case-review';
      }
      state.globalSearchQuery = '';
      return state;
    }),
  clearHighlight: () => set((state) => ({ ...state, highlightTarget: null })),

  acknowledgeAlert: (alertId) =>
    set((state) => {
      updateAlertInCurrentUnit(state, alertId, (alert) => {
        alert.status = 'acknowledged';
        alert.acknowledgedBy = roleDisplayNames[state.role];
        alert.acknowledgedAt = nowClockString(state.currentTimeMs);
        alert.collapsed = true;
      });
      const target = state.data.units[state.selectedUnit].alerts.find((a) => a.id === alertId);
      if (target) {
        appendPatientEvent(state, target.bed, 'Alert acknowledged', `${target.label}`);
        appendAudit(state, 'acknowledged alert', alertId, 'Logged');
        addToast(state, 'Alert acknowledged', `Bed ${target.bed} • ${target.label}`);
      }
      return state;
    }),

  escalateAlert: (alertId) =>
    set((state) => {
      updateAlertInCurrentUnit(state, alertId, (alert) => {
        alert.status = 'escalated';
        alert.escalatedAt = nowClockString(state.currentTimeMs);
        alert.escalatedTo = 'Charge Nurse';
        alert.nurseCallTriggered = state.data.integrationConfig.nurseCallEnabled;
        alert.uiPulseEscalated = true;
      });
      const target = state.data.units[state.selectedUnit].alerts.find((a) => a.id === alertId);
      if (target) {
        appendPatientEvent(state, target.bed, 'Escalated to charge nurse', target.nurseCallTriggered ? 'Nurse call triggered' : 'Queue priority high');
        appendAudit(state, 'escalated alert', alertId, 'Sent to charge nurse');
        addToast(state, 'Escalation sent', `Bed ${target.bed} routed to charge nurse`);
      }
      return state;
    }),

  resolveAlert: (alertId) =>
    set((state) => {
      const alerts = state.data.units[state.selectedUnit].alerts;
      const idx = alerts.findIndex((a) => a.id === alertId);
      if (idx === -1) return state;
      const alert = alerts[idx];
      appendPatientEvent(state, alert.bed, 'Alert marked resolved', alert.label);
      appendAudit(state, 'resolved alert', alertId, 'Logged');
      addToast(state, 'Alert resolved', `Bed ${alert.bed} resolution logged`);
      if (state.removeResolvedAlertsFromQueue) {
        alerts.splice(idx, 1);
      } else {
        alert.status = 'resolved';
        alert.resolvedAt = nowClockString(state.currentTimeMs);
        alert.resolvedBy = roleDisplayNames[state.role];
      }
      return state;
    }),

  snoozeAlert: (alertId) =>
    set((state) => {
      const newTime = new Date(state.currentTimeMs + 5 * 60 * 1000);
      const snoozeUntil = `${String(newTime.getHours()).padStart(2, '0')}:${String(newTime.getMinutes()).padStart(2, '0')}:${String(newTime.getSeconds()).padStart(2, '0')}`;
      updateAlertInCurrentUnit(state, alertId, (alert) => {
        alert.status = 'snoozed';
        alert.snoozedUntil = snoozeUntil;
      });
      const target = state.data.units[state.selectedUnit].alerts.find((a) => a.id === alertId);
      if (target) {
        appendPatientEvent(state, target.bed, 'Alert snoozed', `Snoozed until ${snoozeUntil.slice(0, 5)}`);
        appendAudit(state, 'snoozed alert 5 min', alertId, 'Logged');
        addToast(state, 'Alert snoozed', `Bed ${target.bed} until ${snoozeUntil.slice(0, 5)}`);
      }
      return state;
    }),

  addPatientNoteEvent: (bed, note) =>
    set((state) => {
      appendPatientEvent(state, bed, 'Note added', note);
      appendAudit(state, 'added patient note', `Bed ${bed}`, 'Logged');
      return state;
    }),

  setIntegrationToggle: (key, value) =>
    set((state) => {
      state.data.integrationConfig[key] = value as never;
      if (key === 'nurseCallEnabled') state.data.integrationConfig.integrationStatus.nurseCall = value ? 'Connected' : 'Disabled';
      if (key === 'ehrEnabled') state.data.integrationConfig.integrationStatus.ehr = value ? 'Test mode' : 'Disabled';
      if (key === 'bedManagementEnabled') state.data.integrationConfig.integrationStatus.bedManagement = value ? 'Connected' : 'Disabled';
      if (key === 'pagingEnabled') state.data.integrationConfig.integrationStatus.paging = value ? 'Test mode' : 'Disabled';
      appendAudit(state, 'updated integration/privacy setting', key, value ? 'Enabled' : 'Disabled');
      return state;
    }),

  setEhrMode: (mode) =>
    set((state) => {
      state.data.integrationConfig.ehrMode = mode;
      appendAudit(state, 'updated EHR mode', 'EHR integration', mode);
      return state;
    }),

  setDevicesFilters: (patch) => set((state) => ({ ...state, devicesFilters: { ...state.devicesFilters, ...patch } })),
  setCaseReviewFilters: (patch) => set((state) => ({ ...state, caseReviewFilters: { ...state.caseReviewFilters, ...patch } })),

  setCaseLabel: (caseId, label) =>
    set((state) => {
      const item = state.data.analyticsCases.find((c) => c.caseId === caseId);
      if (!item) return state;
      item.currentLabel = label;
      item.reviewer = roleDisplayNames[state.role];
      item.lastUpdated = `2026-02-22 ${nowClockString(state.currentTimeMs)}`;
      appendAudit(state, `labeled case as ${label === 'false' ? 'false alert' : label === 'true' ? 'true infiltration' : label}`, caseId, 'Saved');
      addToast(state, 'Case label updated', `${caseId} → ${label}`);
      return state;
    }),

  pushToast: (title, description) =>
    set((state) => {
      addToast(state, title, description);
      return state;
    }),

  dismissToast: (id) => set((state) => ({ ...state, toasts: state.toasts.filter((toast) => toast.id !== id) })),
})));

export function selectCurrentUnitState(state: DemoState) {
  return state.data.units[state.selectedUnit];
}

export function getAlertFilterMatch(filter: AlertFilter, alert: AlertRecord): boolean {
  if (filter === 'All') return true;
  if (filter === 'High') return alert.severity === 'high';
  if (filter === 'Moderate') return alert.severity === 'moderate';
  if (filter === 'Sensor') return alert.severity === 'sensor_issue';
  if (filter === 'Acknowledged') return alert.status === 'acknowledged';
  if (filter === 'Snoozed') return alert.status === 'snoozed';
  return true;
}

export function isAlertActiveStatus(status: AlertStatus) {
  return status !== 'resolved';
}
