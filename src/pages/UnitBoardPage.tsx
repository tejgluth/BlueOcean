import {
  AlertTriangle,
  Battery,
  Bell,
  BellRing,
  CheckCircle2,
  ChevronRight,
  Copy,
  Cpu,
  Gauge,
  HeartPulse,
  Info,
  Link2,
  MoonStar,
  PauseCircle,
  ShieldAlert,
  Signal,
  Smartphone,
  Timer,
  Wrench,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { copyText } from '../lib/copy';
import { getWindowedTrend, type TrendWindow, weakQualitySegments } from '../lib/chartUtils';
import { alertElapsedMinutes, demoDateFromClock, formatBattery, formatCountdown, formatDateTime, formatPercent, formatTimeSince } from '../lib/formatters';
import { canViewFalseAlertQueue } from '../lib/rolePermissions';
import { getAlertFilterMatch, selectCurrentUnitState, useDemoStore } from '../store/demoStore';
import type { AlertRecord, BedTile, TrendPoint } from '../types/demo';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { cn } from '../lib/utils';

const alertFilterChips = ['All', 'High', 'Moderate', 'Sensor', 'Acknowledged', 'Snoozed'] as const;

export function UnitBoardPage() {
  const state = useDemoStore();
  const unit = selectCurrentUnitState(state);
  const now = new Date(state.currentTimeMs);
  const selectedBed = state.selectedBedByUnit[state.selectedUnit] ?? unit.beds[0]?.bed;
  const patient = unit.patientsByBed[selectedBed];
  const [trendWindow, setTrendWindow] = useState<TrendWindow>('1h');
  const [noteDraft, setNoteDraft] = useState('');

  const identifiersVisible =
    (!state.data.integrationConfig.hideIdentifiersOnUnitBoard || state.revealIdentifiersRequested) &&
    (!state.data.integrationConfig.requireElevatedRoleForMrn || state.role === 'Admin');

  const searchQuery = state.globalSearchQuery.trim().toLowerCase();

  const filteredAlerts = useMemo(() => {
    return unit.alerts
      .filter((alert) => getAlertFilterMatch(state.alertFilter, alert))
      .filter((alert) => {
        if (!searchQuery) return true;
        const values = [
          alert.id,
          `bed ${alert.bed}`,
          String(alert.bed),
          alert.patientAnonId,
          alert.linkedPodId ?? '',
          alert.linkedPatchId ?? '',
          alert.site,
        ];
        if (identifiersVisible) values.push(alert.mrn, alert.patientInitials);
        return values.some((v) => v.toLowerCase().includes(searchQuery));
      });
  }, [unit.alerts, state.alertFilter, searchQuery, identifiersVisible]);

  const effectiveBeds = useMemo(() => applyAlertOverlayToBeds(unit.beds, unit.alerts), [unit.beds, unit.alerts]);

  const filteredBeds = useMemo(() => {
    if (!searchQuery) return effectiveBeds;
    return effectiveBeds.filter((bed) => {
      const p = unit.patientsByBed[bed.bed];
      const values = [String(bed.bed), `bed ${bed.bed}`, p?.patientAnonId ?? '', p?.podId ?? '', p?.patchId ?? ''];
      if (identifiersVisible && p) values.push(p.mrn, p.patientInitials);
      return values.some((v) => v.toLowerCase().includes(searchQuery));
    });
  }, [effectiveBeds, searchQuery, unit.patientsByBed, identifiersVisible]);

  const queueCounts = useMemo(() => {
    const activeAlerts = unit.alerts.filter((a) => a.status !== 'resolved');
    return {
      total: activeAlerts.length,
      unack: activeAlerts.filter((a) => a.status === 'active_unacknowledged').length,
      escalated: activeAlerts.filter((a) => a.status === 'escalated').length,
    };
  }, [unit.alerts]);

  if (!patient) {
    return <Card><CardContent className="py-8 text-sm text-slate-500">No patient detail available for selected bed.</CardContent></Card>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[360px_minmax(0,1fr)_420px]">
        <section className="space-y-4" aria-label="Alert queue">
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-slate-100 pb-3">
              <div>
                <CardTitle className="text-[15px]">Alert Queue</CardTitle>
                <p className="mt-0.5 text-xs text-slate-500">Newest first • actionable list</p>
              </div>
              <div className="flex gap-2 text-xs">
                <Badge className="border-slate-200 bg-slate-50 text-slate-700">{queueCounts.total} active</Badge>
                <Badge className="border-amber-200 bg-amber-50 text-amber-700">{queueCounts.unack} unack</Badge>
                <Badge className="border-red-200 bg-red-50 text-red-700">{queueCounts.escalated} escalated</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-3">
              <div className="flex flex-wrap gap-1.5">
                {alertFilterChips.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => state.setAlertFilter(chip)}
                    className={cn(
                      'rounded-full border px-2.5 py-1 text-xs transition',
                      state.alertFilter === chip
                        ? 'border-blue-200 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                    )}
                  >
                    {chip}
                  </button>
                ))}
              </div>

              <div className="max-h-[calc(100vh-260px)] space-y-2 overflow-y-auto pr-1">
                {filteredAlerts.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    now={now}
                    selected={alert.bed === selectedBed}
                    identifiersVisible={identifiersVisible}
                    screenshotMode={state.screenshotMode}
                    nurseCallEnabled={state.data.integrationConfig.nurseCallEnabled}
                    onSelectBed={() => state.selectBed(alert.bed)}
                    onAcknowledge={() => state.acknowledgeAlert(alert.id)}
                    onEscalate={() => state.escalateAlert(alert.id)}
                    onResolve={() => state.resolveAlert(alert.id)}
                    onSnooze={() => state.snoozeAlert(alert.id)}
                  />
                ))}
                {!filteredAlerts.length ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                    No alerts match current filters/search.
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4" aria-label="Unit map and status">
          <Card>
            <CardHeader className="pb-3">
              <div>
                <CardTitle className="text-[15px]">{state.selectedUnit} Unit Map</CardTitle>
                <p className="mt-0.5 text-xs text-slate-500">24-bed overview with monitoring and alert state</p>
              </div>
              <Badge className="border-slate-200 bg-slate-50 text-slate-600">{filteredBeds.length} visible beds</Badge>
            </CardHeader>
            <CardContent>
              <div className={cn('grid gap-2', unit.beds.length <= 12 ? 'grid-cols-3 md:grid-cols-4' : 'grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6')}>
                {filteredBeds.map((bed) => (
                  <BedTileCard
                    key={bed.bed}
                    bed={bed}
                    selected={bed.bed === selectedBed}
                    patient={unit.patientsByBed[bed.bed]}
                    highlighted={state.highlightTarget?.bed === bed.bed}
                    onClick={() => state.selectBed(bed.bed)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4" aria-label="Metrics and patient detail">
          <MetricsPanel />
          <PatientDetailPanel
            patient={patient}
            bedTile={effectiveBeds.find((b) => b.bed === selectedBed)}
            trendWindow={trendWindow}
            onTrendWindowChange={setTrendWindow}
            identifiersVisible={identifiersVisible}
            onCopy={async (value, label) => {
              await copyText(value);
              state.pushToast(`${label} copied`, value);
            }}
            onCopyNote={async () => {
              await copyText(patient.noteTemplate);
              state.pushToast('Note template copied', `Bed ${patient.bed} structured text copied to clipboard.`);
            }}
            onPushStructuredNote={() => state.pushToast('Structured note pushed (demo)', 'Simulated EHR push completed in demo mode.')}
            onPopulateFlowsheet={() => state.pushToast('Flowsheet populated (demo)', 'Simulated flowsheet entry created in demo mode.')}
            integrationConfig={state.data.integrationConfig}
            noteDraft={noteDraft}
            onNoteDraftChange={setNoteDraft}
            onAddNote={() => {
              if (!noteDraft.trim()) return;
              state.addPatientNoteEvent(patient.bed, noteDraft.trim());
              state.pushToast('Note added', 'Timeline event appended to patient audit trail.');
              setNoteDraft('');
            }}
          />
        </section>
      </div>
    </div>
  );
}

function applyAlertOverlayToBeds(beds: BedTile[], alerts: AlertRecord[]) {
  const activeAlertsByBed = new Map<number, AlertRecord[]>();
  alerts.forEach((alert) => {
    if (alert.status === 'resolved') return;
    const arr = activeAlertsByBed.get(alert.bed) ?? [];
    arr.push(alert);
    activeAlertsByBed.set(alert.bed, arr);
  });

  return beds.map((bed) => {
    const bedAlerts = activeAlertsByBed.get(bed.bed);
    if (!bedAlerts?.length) {
      if (bed.state === 'high_alert_active' || bed.state === 'high_alert_escalated' || bed.state === 'moderate_alert' || bed.state === 'moderate_alert_snoozed' || bed.state === 'sensor_issue_alert') {
        return { ...bed, state: 'monitoring_active' as const };
      }
      return bed;
    }

    const priority = [...bedAlerts].sort((a, b) => severityRank(b) - severityRank(a))[0];
    if (priority.severity === 'high') {
      return { ...bed, state: (priority.status === 'escalated' ? 'high_alert_escalated' : 'high_alert_active') as BedTile['state'] };
    }
    if (priority.severity === 'moderate') {
      return { ...bed, state: (priority.status === 'snoozed' ? 'moderate_alert_snoozed' : 'moderate_alert') as BedTile['state'] };
    }
    return { ...bed, state: 'sensor_issue_alert' as const };
  });
}

function severityRank(alert: AlertRecord) {
  if (alert.severity === 'high') return 3;
  if (alert.severity === 'moderate') return 2;
  return 1;
}

function AlertCard(props: {
  alert: AlertRecord;
  now: Date;
  selected: boolean;
  identifiersVisible: boolean;
  screenshotMode: boolean;
  nurseCallEnabled: boolean;
  onSelectBed: () => void;
  onAcknowledge: () => void;
  onEscalate: () => void;
  onResolve: () => void;
  onSnooze: () => void;
}) {
  const { alert, now, selected, identifiersVisible, screenshotMode, nurseCallEnabled } = props;
  const compact = alert.status === 'acknowledged' && alert.collapsed;
  const severityStyle = getSeverityStyles(alert);
  const snoozeActive = alert.status === 'snoozed';

  return (
    <div
      className={cn(
        'rounded-xl border p-3 transition-all',
        compact ? 'bg-slate-50/80' : 'bg-white',
        selected ? 'border-blue-300 shadow-sm shadow-blue-200/40' : severityStyle.cardBorder,
        alert.uiPulseEscalated && !screenshotMode ? 'animate-[pulse_1.4s_ease-out_1]' : '',
        snoozeActive ? 'opacity-80' : '',
      )}
    >
      <button type="button" className="mb-2 block w-full text-left" onClick={props.onSelectBed}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">Bed {alert.bed}</span>
              <Badge className={severityStyle.badge}>{alert.label}</Badge>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {identifiersVisible ? `${alert.patientInitials} • MRN ${alert.mrn}` : alert.patientAnonId} • {alert.site}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-slate-600">{formatTimeSince(now, alert.startedAt)}</p>
            <p className="text-[11px] text-slate-400">since {alert.startedAt.slice(0, 5)}</p>
          </div>
        </div>
      </button>

      {compact ? (
        <div className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs text-slate-600">
          Acknowledged by {alert.acknowledgedBy} at {alert.acknowledgedAt?.slice(0, 5)}
        </div>
      ) : (
        <>
          <div className="mb-2 rounded-lg bg-slate-50 px-2 py-2 text-xs text-slate-600">Recommended action: {alert.recommendedAction}</div>

          <div className="mb-2 flex flex-wrap gap-1.5">
            {alert.status === 'escalated' ? <Badge className="border-red-200 bg-red-50 text-red-700"><ShieldAlert className="h-3 w-3" /> Escalated</Badge> : null}
            {alert.status === 'acknowledged' ? <Badge className="border-slate-200 bg-slate-100 text-slate-700"><CheckCircle2 className="h-3 w-3" /> Acknowledged</Badge> : null}
            {alert.status === 'snoozed' && alert.snoozedUntil ? <Badge className="border-amber-200 bg-amber-50 text-amber-700"><Timer className="h-3 w-3" /> Snoozed {formatCountdown(now, alert.snoozedUntil)}</Badge> : null}
            {alert.nurseCallTriggered && nurseCallEnabled ? <Badge className="border-red-200 bg-red-50 text-red-700"><BellRing className="h-3 w-3" /> nurse call triggered</Badge> : null}
          </div>

          {alert.status === 'acknowledged' && alert.acknowledgedBy ? (
            <p className="mb-2 text-[11px] text-slate-500">Acknowledged by {alert.acknowledgedBy} at {alert.acknowledgedAt?.slice(0, 5)}</p>
          ) : null}

          <div className="grid grid-cols-2 gap-1.5">
            <Button size="sm" variant="secondary" onClick={props.onAcknowledge} disabled={alert.status === 'acknowledged' || alert.status === 'resolved'}>
              Acknowledge
            </Button>
            <Button size="sm" variant="secondary" onClick={props.onEscalate} disabled={alert.status === 'escalated' || alert.status === 'resolved'}>
              Escalate
            </Button>
            <Button size="sm" variant="success" onClick={props.onResolve} disabled={alert.status === 'resolved'}>
              Mark resolved
            </Button>
            <Button size="sm" variant="subtle" onClick={props.onSnooze} disabled={alert.status === 'resolved'}>
              Snooze 5 min
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function getSeverityStyles(alert: AlertRecord) {
  if (alert.status === 'escalated' || alert.severity === 'high') {
    return {
      cardBorder: 'border-red-200',
      badge: 'border-red-200 bg-red-50 text-red-700',
    };
  }
  if (alert.severity === 'moderate') {
    return {
      cardBorder: 'border-amber-200',
      badge: 'border-amber-200 bg-amber-50 text-amber-700',
    };
  }
  return {
    cardBorder: 'border-slate-200',
    badge: 'border-slate-200 bg-slate-50 text-slate-700',
  };
}

function BedTileCard(props: {
  bed: BedTile;
  selected: boolean;
  highlighted: boolean;
  patient?: { podId: string; patchId: string; infusionType: string; siteLabel: string };
  onClick: () => void;
}) {
  const style = bedStateStyles(props.bed.state);
  return (
    <button
      type="button"
      onClick={props.onClick}
      title={`Bed ${props.bed.bed} • ${style.label} • ${props.bed.siteSummary ?? 'No device'} • ${props.bed.infusionType ?? 'Unknown'} • Last update ${props.bed.lastUpdate ?? '—'}`}
      className={cn(
        'group rounded-xl border p-2 text-left transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30',
        style.tile,
        props.selected && 'ring-2 ring-blue-400/60',
        props.highlighted && 'ring-2 ring-amber-400/60',
      )}
    >
      <div className="mb-1 flex items-start justify-between gap-2">
        <span className="text-sm font-semibold text-slate-900">{props.bed.bed}</span>
        <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-medium', style.badge)}>{style.label}</span>
      </div>
      <div className="flex items-center gap-1 text-[11px] text-slate-600">
        <span className={cn('h-2 w-2 rounded-full', props.bed.signalQuality === 'poor' ? 'bg-slate-400' : props.bed.signalQuality === 'fair' ? 'bg-amber-400' : 'bg-emerald-400')} />
        <span>{props.bed.monitoringDuration ?? 'Offline'}</span>
      </div>
      <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-slate-500">
        <span className="truncate">{props.bed.siteSummary ?? 'No device'}</span>
        {props.bed.sites && props.bed.sites > 1 ? <span className="rounded bg-slate-100 px-1.5 py-0.5">{props.bed.sites} sites</span> : null}
      </div>
    </button>
  );
}

function bedStateStyles(state: BedTile['state']) {
  switch (state) {
    case 'high_alert_active':
      return { label: 'High alert', tile: 'border-red-200 bg-red-50/80', badge: 'bg-red-100 text-red-700' };
    case 'high_alert_escalated':
      return { label: 'Escalated', tile: 'border-red-300 bg-red-50', badge: 'bg-red-200 text-red-800' };
    case 'moderate_alert':
      return { label: 'Watch', tile: 'border-amber-200 bg-amber-50/70', badge: 'bg-amber-100 text-amber-700' };
    case 'moderate_alert_snoozed':
      return { label: 'Snoozed', tile: 'border-amber-200 bg-amber-50/50', badge: 'bg-amber-100 text-amber-700' };
    case 'sensor_issue_alert':
      return { label: 'Sensor', tile: 'border-slate-300 bg-slate-50', badge: 'bg-slate-200 text-slate-700' };
    case 'offline':
      return { label: 'Offline', tile: 'border-slate-300 bg-slate-100/80', badge: 'bg-slate-300 text-slate-700' };
    case 'no_device':
      return { label: 'No device', tile: 'border-slate-200 bg-slate-50/60', badge: 'bg-slate-100 text-slate-600' };
    default:
      return { label: 'Monitoring', tile: 'border-slate-200 bg-white', badge: 'bg-blue-50 text-blue-700' };
  }
}

function MetricsPanel() {
  const state = useDemoStore();
  const metrics = selectCurrentUnitState(state).metrics;
  const showFalseQueue = canViewFalseAlertQueue(state.role);

  const items = [
    { label: 'Active monitored IV sites now', value: metrics.activeMonitoredSites },
    { label: 'Alerts in last hour', value: metrics.alertsLastHour },
    { label: 'Median time to acknowledgement today', value: metrics.medianAcknowledge },
    { label: 'Median time alert → resolved today', value: metrics.medianResolve },
    ...(showFalseQueue ? [{ label: 'False alert review queue', value: metrics.falseAlertReviewQueue }] : []),
    { label: 'Last 24h monitored IV hours', value: metrics.monitoredIvHours24h },
    { label: 'Current online pods', value: metrics.onlinePodsCurrent },
    { label: 'Contact quality good', value: `${metrics.contactQualityGoodPct}%` },
    { label: 'Unacknowledged >5 min', value: metrics.unackOver5m },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div>
          <CardTitle className="text-[15px]">Key Metrics</CardTitle>
          <p className="mt-0.5 text-xs text-slate-500">Leadership-ready unit snapshot</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <p className="text-[11px] text-slate-500">{item.label}</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function PatientDetailPanel(props: {
  patient: any;
  bedTile?: BedTile;
  trendWindow: TrendWindow;
  onTrendWindowChange: (w: TrendWindow) => void;
  identifiersVisible: boolean;
  onCopy: (value: string, label: string) => Promise<void>;
  onCopyNote: () => Promise<void>;
  onPushStructuredNote: () => void;
  onPopulateFlowsheet: () => void;
  integrationConfig: any;
  noteDraft: string;
  onNoteDraftChange: (v: string) => void;
  onAddNote: () => void;
}) {
  const { patient, trendWindow, onTrendWindowChange, identifiersVisible, integrationConfig } = props;
  const trendData = getWindowedTrend(patient.temperatureTrend1h, patient.sessionTrend, trendWindow);
  const weakSegments = weakQualitySegments(trendData);
  const triggerMarker = nearestTriggerMarker(trendData, patient.alertTriggerTime);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-slate-100 pb-3">
        <div>
          <CardTitle className="text-[15px]">Patient Detail • Bed {patient.bed}</CardTitle>
          <p className="mt-0.5 text-xs text-slate-500">One-click trend and action workflow</p>
        </div>
        <Badge className="border-slate-200 bg-slate-50 text-slate-600">{patient.patientAnonId}</Badge>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">Bed {patient.bed}</span>
                <Badge className="border-blue-200 bg-blue-50 text-blue-700">{patient.patientAnonId}</Badge>
                {identifiersVisible ? <Badge className="border-slate-200 bg-white text-slate-700">{patient.patientInitials} • MRN {patient.mrn}</Badge> : null}
              </div>
              <p className="text-sm text-slate-700">{patient.siteLabel}</p>
              <p className="text-xs text-slate-500">Inserted {formatDateTime(patient.insertionTimestamp)} • Infusion: {patient.infusionType}</p>
            </div>
            <div className="grid grid-cols-1 gap-2 text-xs text-slate-600 sm:grid-cols-2">
              <button type="button" onClick={() => props.onCopy(patient.patchId, 'Patch ID')} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 hover:bg-slate-50">
                <span className="truncate">Patch: {patient.patchId}</span>
                <Copy className="h-3.5 w-3.5 text-slate-400" />
              </button>
              <button type="button" onClick={() => props.onCopy(patient.podId, 'Pod ID')} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 hover:bg-slate-50">
                <span className="truncate">Pod: {patient.podId}</span>
                <Copy className="h-3.5 w-3.5 text-slate-400" />
              </button>
              <div className="rounded-lg border border-slate-200 bg-white px-2 py-1.5">Pod battery: {formatBattery(patient.podBatteryPct)}</div>
              <div className="rounded-lg border border-slate-200 bg-white px-2 py-1.5">Runtime est: {patient.runtimeRemainingHours}h</div>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">Firmware {patient.firmwareVersion}</p>
        </div>

        <div className="rounded-xl border border-red-100 bg-white p-3 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Badge className={cn('border px-2.5 py-1 text-xs', patient.currentRiskState === 'ALERT' ? 'border-red-200 bg-red-50 text-red-700' : patient.currentRiskState === 'WATCH' ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700')}>
                  {patient.currentRiskState}
                </Badge>
                <span className="text-sm font-semibold text-slate-900">Confidence {patient.confidence.toFixed(2)} ({patient.confidenceLabel})</span>
              </div>
              <p className="mt-2 text-xs text-slate-600">Data quality: {patient.dataQuality} • Last stable baseline: {patient.lastStableBaseline}</p>
              <p className="mt-1 text-xs text-slate-600">Contact quality (15m): {formatPercent(patient.contactQuality15mPct)} • Motion artifact: {patient.motionArtifactSummary}</p>
            </div>
            <div className="w-full max-w-[180px]">
              <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                <span>Confidence meter</span>
                <span>{Math.round(patient.confidence * 100)}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className={cn(
                    'h-2 rounded-full',
                    patient.currentRiskState === 'ALERT' ? 'bg-red-500' : patient.currentRiskState === 'WATCH' ? 'bg-amber-500' : 'bg-emerald-500',
                  )}
                  style={{ width: `${Math.round(patient.confidence * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <Card className="border-slate-200 shadow-none">
          <CardHeader className="pb-2">
            <div className="flex w-full flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle className="text-sm">Trend Charts</CardTitle>
                <p className="mt-0.5 text-xs text-slate-500">Synchronized hover • alert trigger marker</p>
              </div>
              <Tabs value={trendWindow} onValueChange={(v) => onTrendWindowChange(v as TrendWindow)}>
                <TabsList>
                  <TabsTrigger value="15m">15m</TabsTrigger>
                  <TabsTrigger value="1h">1h</TabsTrigger>
                  <TabsTrigger value="full">Full session</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <ChartBlock
              title="ΔTemp vs baseline (°C)"
              data={trendData}
              dataKey="tempDeltaC"
              color="#2563EB"
              yDomain={[-1.2, 0.4]}
              triggerMarker={triggerMarker}
              weakSegments={weakSegments}
              showBand
            />
            <ChartBlock
              title="Thickness proxy Δ (%)"
              data={trendData}
              dataKey="thicknessDeltaPct"
              color="#DC2626"
              yDomain={[-1, 14.5]}
              triggerMarker={triggerMarker}
              weakSegments={weakSegments}
              showBand={false}
            />
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-[1.05fr_.95fr]">
          <Card className="border-slate-200 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Event Log Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[300px] space-y-3 overflow-y-auto pr-1">
                {patient.timeline.map((event: any) => (
                  <div key={event.id} className="relative pl-5">
                    <div className="absolute left-0 top-1 h-2.5 w-2.5 rounded-full bg-blue-500" />
                    <div className="absolute left-[4px] top-4 h-[calc(100%+6px)] w-px bg-slate-200 last:hidden" />
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-medium text-slate-800">{event.eventType}</p>
                        <p className="text-[11px] text-slate-500">{event.actor}</p>
                        {event.note ? <p className="mt-0.5 text-[11px] text-slate-600">{event.note}</p> : null}
                        {event.deviceIds?.length ? <p className="text-[11px] text-slate-400">{event.deviceIds.join(', ')}</p> : null}
                      </div>
                      <span className="text-[11px] text-slate-400">{event.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Action Panel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <ActionChecklist title="Step 1: Assess site" items={['swelling', 'blanching', 'pain/tenderness', 'coolness', 'leakage']} />
              <ActionChecklist title="Step 2: Follow unit protocol" items={['Pause infusion if indicated', 'Compare to baseline and contralateral site', 'Consider line replacement per protocol']} />
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="mb-2 text-sm font-medium text-slate-800">Step 3: Document outcome in EHR</p>
                <div className="grid grid-cols-1 gap-2">
                  <Button size="sm" variant="secondary" onClick={props.onCopyNote}>Copy note template</Button>
                  {integrationConfig.ehrEnabled ? (
                    <>
                      {(integrationConfig.ehrMode === 'Structured note template' || integrationConfig.ehrMode === 'Both') ? (
                        <Button size="sm" variant="secondary" onClick={props.onPushStructuredNote}>Push structured note</Button>
                      ) : null}
                      {(integrationConfig.ehrMode === 'Flowsheet entry' || integrationConfig.ehrMode === 'Both') ? (
                        <Button size="sm" variant="secondary" onClick={props.onPopulateFlowsheet}>Populate flowsheet entry</Button>
                      ) : null}
                    </>
                  ) : null}
                </div>
                <p className="mt-2 text-[11px] text-slate-500">Buttons simulate integration behavior in demo mode only.</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="mb-2 text-sm font-medium text-slate-800">Add note</p>
                <Input value={props.noteDraft} onChange={(e) => props.onNoteDraftChange(e.target.value)} placeholder="Add de-identified note for timeline" />
                <Button size="sm" variant="secondary" className="mt-2" onClick={props.onAddNote}>Add note event</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}

function nearestTriggerMarker(points: TrendPoint[], triggerTime?: string) {
  if (!triggerTime) return undefined;
  if (points.some((p) => p.time === triggerTime)) return triggerTime;
  const triggerDate = demoDateFromClock(`${triggerTime}:00`);
  let best = points[0]?.time;
  let bestDiff = Number.POSITIVE_INFINITY;
  for (const point of points) {
    const d = demoDateFromClock(`${point.time}:00`);
    const diff = Math.abs(d.getTime() - triggerDate.getTime());
    if (diff < bestDiff) {
      bestDiff = diff;
      best = point.time;
    }
  }
  return best;
}

function ChartBlock(props: {
  title: string;
  data: TrendPoint[];
  dataKey: 'tempDeltaC' | 'thicknessDeltaPct';
  color: string;
  yDomain: [number, number];
  triggerMarker?: string;
  weakSegments: Array<{ start: string; end: string }>;
  showBand: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-2">
      <div className="mb-1 flex items-center justify-between px-2">
        <p className="text-xs font-medium text-slate-700">{props.title}</p>
        <p className="text-[11px] text-slate-400">Shared time axis</p>
      </div>
      <div className="h-[180px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={props.data} syncId="patient-trends" margin={{ top: 12, right: 10, left: 8, bottom: 2 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5EAF2" />
            <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748B' }} minTickGap={14} />
            <YAxis domain={props.yDomain} tick={{ fontSize: 11, fill: '#64748B' }} width={48} />
            <Tooltip contentStyle={{ borderRadius: 10, borderColor: '#E5EAF2', boxShadow: '0 8px 24px rgba(15,23,42,0.08)' }} labelStyle={{ color: '#0F172A', fontWeight: 600 }} />
            {props.showBand ? <ReferenceArea y1={-0.2} y2={0.2} fill="#DBEAFE" fillOpacity={0.45} /> : null}
            {props.dataKey === 'tempDeltaC' ? <ReferenceLine y={0} stroke="#94A3B8" strokeDasharray="4 4" /> : null}
            {props.weakSegments.map((seg) => (
              <ReferenceArea key={`${seg.start}-${seg.end}`} x1={seg.start} x2={seg.end} fill="#F59E0B" fillOpacity={0.12} />
            ))}
            {props.triggerMarker ? (
              <ReferenceLine x={props.triggerMarker} stroke="#DC2626" strokeWidth={1} label={{ value: 'alert', position: 'top', fill: '#DC2626', fontSize: 10 }} />
            ) : null}
            <Area type="monotone" dataKey={props.dataKey} fill={props.color} fillOpacity={0.12} stroke="none" />
            <Line type="monotone" dataKey={props.dataKey} stroke={props.color} strokeWidth={2.2} dot={false} activeDot={{ r: 4 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ActionChecklist({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="mb-2 text-sm font-medium text-slate-800">{title}</p>
      <div className="space-y-1.5">
        {items.map((item) => (
          <label key={item} className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            <span>{item}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
