import { Download, Info, TrendingUp } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { canViewAnalytics } from '../lib/rolePermissions';
import { demoData } from '../data/demoData';
import { useDemoStore } from '../store/demoStore';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { cn } from '../lib/utils';

const chartPalette = ['#2563EB', '#0EA5E9', '#14B8A6', '#F59E0B', '#DC2626', '#64748B'];

export function AnalyticsPage() {
  const state = useDemoStore();
  if (!canViewAnalytics(state.role)) {
    return (
      <Card>
        <CardContent className="py-10 text-sm text-slate-600">Analytics is visible to Leadership, QA Reviewer, Unit Manager, and Admin roles.</CardContent>
      </Card>
    );
  }

  const source = demoData.analytics;

  const searchQuery = state.globalSearchQuery.trim().toLowerCase();
  const cases = state.data.analyticsCases.filter((c) => {
    if (state.caseReviewFilters.highSeverityOnly && c.severity !== 'high') return false;
    if (state.caseReviewFilters.prolongedAlerts && !c.prolonged) return false;
    if (state.caseReviewFilters.repeatedAlerts && !c.repeated) return false;
    if (state.caseReviewFilters.unlabeledOnly && c.currentLabel !== 'unlabeled') return false;
    if (searchQuery && ![c.caseId, `bed ${c.bed}`, String(c.bed)].some((v) => v.toLowerCase().includes(searchQuery))) return false;
    return true;
  });

  const selectedCase = state.data.analyticsCases.find((c) => c.caseId === state.selectedCaseId) ?? cases[0];

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-5">
            <select className="h-9 rounded-[10px] border border-slate-200 bg-white px-3 text-sm">
              <option>Last 12 weeks</option>
              <option>Last 30 days</option>
              <option>Last 7 days</option>
            </select>
            <select className="h-9 rounded-[10px] border border-slate-200 bg-white px-3 text-sm" value={state.selectedUnit} onChange={(e) => state.setSelectedUnit(e.target.value as any)}>
              <option>ICU North</option>
              <option>Oncology Infusion</option>
              <option>Emergency Department</option>
              <option>Radiology Contrast Suite</option>
            </select>
            <select className="h-9 rounded-[10px] border border-slate-200 bg-white px-3 text-sm">
              <option>All severities</option>
              <option>High only</option>
              <option>Moderate only</option>
              <option>Sensor issue</option>
            </select>
            <select className="h-9 rounded-[10px] border border-slate-200 bg-white px-3 text-sm">
              <option>All infusion categories</option>
              <option>Fluids</option>
              <option>Antibiotics</option>
              <option>Contrast</option>
            </select>
            <label className="flex items-center gap-2 rounded-[10px] border border-slate-200 bg-white px-3 text-sm text-slate-700">
              <input type="checkbox" checked={state.comparePreviousPeriod} onChange={(e) => state.setComparePreviousPeriod(e.target.checked)} />
              Compare previous period
            </label>
          </div>
        </CardContent>
      </Card>

      <Tabs value={state.analyticsSubtab} onValueChange={(v) => state.setAnalyticsSubtab(v as any)}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="case-review">Case Review</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-5">
            <KpiCard label="Total monitored IV hours (period)" value={source.kpis.totalMonitoredHours.toLocaleString()} />
            <KpiCard label="Total alerts" value={source.kpis.totalAlerts} />
            <KpiCard label="Alerts / 100 monitored IV hours" value={source.kpis.alertsPer100Hours} />
            <KpiCard label="Median acknowledge time" value={source.kpis.medianAck} />
            <KpiCard label="Median alert → intervention" value={source.kpis.medianIntervention} />
            <KpiCard label="Labeled false alerts" value={source.kpis.labeledFalseAlerts} tone="amber" />
            <KpiCard label="Labeled true infiltrations" value={source.kpis.labeledTrueInfiltrations} tone="green" />
            <KpiCard label="Unclear review cases" value={source.kpis.unclearReviewCases} tone="slate" />
            <KpiCard label="Review completion rate" value={`${source.kpis.reviewCompletionRatePct}%`} tone="blue" />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <ChartCard title="Alerts per 100 monitored IV hours (weekly trend)">
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={source.alertsPer100IvHoursWeekly} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="#E5EAF2" strokeDasharray="3 3" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} width={38} />
                    <Tooltip />
                    {state.comparePreviousPeriod ? <Line type="monotone" dataKey="previous" stroke="#94A3B8" strokeDasharray="4 4" dot={false} /> : null}
                    <Line type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard title="Unacknowledged alerts count over time">
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={source.unacknowledgedOverTime} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="#E5EAF2" strokeDasharray="3 3" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} width={34} />
                    <Tooltip />
                    <ReferenceLine x="07:00" stroke="#F59E0B" strokeDasharray="4 4" />
                    <ReferenceLine x="19:00" stroke="#F59E0B" strokeDasharray="4 4" />
                    <Line type="monotone" dataKey="value" stroke="#0EA5E9" strokeWidth={2.3} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {source.unacknowledgedOverTime.filter((p) => p.annotation).map((point) => (
                  <Badge key={point.label} className="border-amber-200 bg-amber-50 text-amber-700">{point.annotation}</Badge>
                ))}
              </div>
            </ChartCard>

            <ChartCard title="Time to acknowledgement distribution">
              <MiniBarChart data={source.ackDistribution} xKey="bin" barKey="count" color="#2563EB" />
            </ChartCard>
            <ChartCard title="Time from alert to intervention distribution">
              <MiniBarChart data={source.interventionDistribution} xKey="bin" barKey="count" color="#0EA5E9" />
            </ChartCard>
            <ChartCard title="Repeat alerts by site location">
              <MiniBarChart data={source.repeatAlertsBySite} xKey="label" barKey="value" color="#14B8A6" rotateLabels />
            </ChartCard>
            <ChartCard title="Alerts by infusion category">
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={source.alertsByInfusionCategory} dataKey="value" nameKey="label" innerRadius={55} outerRadius={82} paddingAngle={2}>
                      {source.alertsByInfusionCategory.map((entry, index) => (
                        <Cell key={entry.label} fill={chartPalette[index % chartPalette.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => `${value}%`} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>
        </TabsContent>

        <TabsContent value="case-review" className="mt-4 space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-5">
                <label className="flex items-center gap-2 rounded-[10px] border border-slate-200 bg-white px-3 text-sm">
                  <input type="checkbox" checked={state.caseReviewFilters.highSeverityOnly} onChange={(e) => state.setCaseReviewFilters({ highSeverityOnly: e.target.checked })} />
                  High severity only
                </label>
                <label className="flex items-center gap-2 rounded-[10px] border border-slate-200 bg-white px-3 text-sm">
                  <input type="checkbox" checked={state.caseReviewFilters.prolongedAlerts} onChange={(e) => state.setCaseReviewFilters({ prolongedAlerts: e.target.checked })} />
                  Prolonged alerts
                </label>
                <label className="flex items-center gap-2 rounded-[10px] border border-slate-200 bg-white px-3 text-sm">
                  <input type="checkbox" checked={state.caseReviewFilters.repeatedAlerts} onChange={(e) => state.setCaseReviewFilters({ repeatedAlerts: e.target.checked })} />
                  Repeated alerts
                </label>
                <label className="flex items-center gap-2 rounded-[10px] border border-slate-200 bg-white px-3 text-sm">
                  <input type="checkbox" checked={state.caseReviewFilters.unlabeledOnly} onChange={(e) => state.setCaseReviewFilters({ unlabeledOnly: e.target.checked })} />
                  Unlabeled only
                </label>
                <select className="h-9 rounded-[10px] border border-slate-200 bg-white px-3 text-sm" value={state.caseReviewFilters.dateRange} onChange={(e) => state.setCaseReviewFilters({ dateRange: e.target.value as any })}>
                  <option>Last 12 weeks</option>
                  <option>Last 30 days</option>
                  <option>Last 7 days</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_520px]">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle className="text-[15px]">Case List</CardTitle>
                  <p className="mt-0.5 text-xs text-slate-500">Label workflow for QA and clinical operations review</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <div className="max-h-[520px] overflow-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="px-3 py-2">Case ID</th>
                          <th className="px-3 py-2">Bed</th>
                          <th className="px-3 py-2">Severity</th>
                          <th className="px-3 py-2">Duration</th>
                          <th className="px-3 py-2">Site</th>
                          <th className="px-3 py-2">Infusion</th>
                          <th className="px-3 py-2">Label</th>
                          <th className="px-3 py-2">Reviewer</th>
                          <th className="px-3 py-2">Last updated</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cases.map((c) => (
                          <tr key={c.caseId} className={cn('cursor-pointer border-t border-slate-100 hover:bg-slate-50', state.selectedCaseId === c.caseId && 'bg-blue-50/50', state.highlightTarget?.caseId === c.caseId && 'bg-amber-50')} onClick={() => state.selectCase(c.caseId)}>
                            <td className="px-3 py-2 font-medium text-slate-900">{c.caseId}</td>
                            <td className="px-3 py-2">{c.bed}</td>
                            <td className="px-3 py-2"><SeverityBadge severity={c.severity} /></td>
                            <td className="px-3 py-2">{c.duration}</td>
                            <td className="px-3 py-2">{c.site}</td>
                            <td className="px-3 py-2">{c.infusionCategory}</td>
                            <td className="px-3 py-2"><CaseLabelBadge label={c.currentLabel} /></td>
                            <td className="px-3 py-2 text-slate-600">{c.reviewer || '—'}</td>
                            <td className="px-3 py-2 text-slate-600">{c.lastUpdated}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle className="text-[15px]">Case Detail</CardTitle>
                  <p className="mt-0.5 text-xs text-slate-500">Sensor mini-trends + nursing documentation summary</p>
                </div>
                {selectedCase ? <Badge className="border-blue-200 bg-blue-50 text-blue-700">{selectedCase.caseId}</Badge> : null}
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedCase ? (
                  <>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <Field label="Bed" value={selectedCase.bed} />
                      <Field label="Severity" value={selectedCase.severity} />
                      <Field label="Duration" value={selectedCase.duration} />
                      <Field label="Current label" value={selectedCase.currentLabel} />
                      <Field label="Site" value={selectedCase.site} className="col-span-2" />
                      <Field label="Infusion category" value={selectedCase.infusionCategory} className="col-span-2" />
                    </div>

                    <div className="grid gap-3">
                      <ChartCard title="Temperature mini trend">
                        <MiniTrendChart data={selectedCase.miniTrend} dataKey="tempDeltaC" color="#2563EB" />
                      </ChartCard>
                      <ChartCard title="Thickness mini trend">
                        <MiniTrendChart data={selectedCase.miniTrend} dataKey="thicknessDeltaPct" color="#DC2626" />
                      </ChartCard>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-sm font-medium text-slate-800">Nurse documentation summary / event notes</p>
                      <p className="mt-2 text-sm text-slate-700">{selectedCase.notesSummary}</p>
                      <ul className="mt-2 space-y-1 text-xs text-slate-600">
                        {selectedCase.eventNotes.map((note) => (
                          <li key={note}>• {note}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-3">
                      <p className="mb-2 text-sm font-medium text-slate-800">Label actions</p>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <Button size="sm" variant="danger" onClick={() => state.setCaseLabel(selectedCase.caseId, 'true')}>Label as true infiltration</Button>
                        <Button size="sm" variant="secondary" onClick={() => state.setCaseLabel(selectedCase.caseId, 'false')}>Label as false alert</Button>
                        <Button size="sm" variant="subtle" onClick={() => state.setCaseLabel(selectedCase.caseId, 'unclear')}>Label as unclear</Button>
                        <Button size="sm" variant="secondary" onClick={() => state.pushToast('CSV export (demo)', 'Selected review case dataset export simulated.')}>Export selected dataset (CSV demo only)</Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-slate-500">Select a case to review.</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KpiCard({ label, value, tone = 'blue' }: { label: string; value: any; tone?: 'blue' | 'amber' | 'green' | 'slate' }) {
  const toneCls = tone === 'amber' ? 'border-amber-200 bg-amber-50/60' : tone === 'green' ? 'border-emerald-200 bg-emerald-50/60' : tone === 'slate' ? 'border-slate-200 bg-slate-50/80' : 'border-blue-200 bg-blue-50/40';
  return (
    <Card className={cn('border', toneCls)}>
      <CardContent className="p-4">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
      </CardContent>
    </Card>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function MiniBarChart({ data, xKey, barKey, color, rotateLabels = false }: any) {
  return (
    <div className="h-[240px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: rotateLabels ? 32 : 0 }}>
          <CartesianGrid stroke="#E5EAF2" strokeDasharray="3 3" />
          <XAxis dataKey={xKey} tick={{ fontSize: 11 }} angle={rotateLabels ? -20 : 0} textAnchor={rotateLabels ? 'end' : 'middle'} interval={0} />
          <YAxis tick={{ fontSize: 11 }} width={34} />
          <Tooltip />
          <Bar dataKey={barKey} fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function MiniTrendChart({ data, dataKey, color }: any) {
  return (
    <div className="h-[140px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#E5EAF2" strokeDasharray="3 3" />
          <XAxis dataKey="time" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} width={34} />
          <Tooltip />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const cls = severity === 'high' ? 'border-red-200 bg-red-50 text-red-700' : severity === 'moderate' ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-slate-200 bg-slate-50 text-slate-700';
  return <Badge className={cls}>{severity}</Badge>;
}

function CaseLabelBadge({ label }: { label: string }) {
  const cls = label === 'true' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : label === 'false' ? 'border-amber-200 bg-amber-50 text-amber-700' : label === 'unclear' ? 'border-slate-200 bg-slate-100 text-slate-700' : 'border-blue-200 bg-blue-50 text-blue-700';
  return <Badge className={cls}>{label}</Badge>;
}

function Field({ label, value, className }: any) {
  return (
    <div className={cn('rounded-lg border border-slate-200 bg-slate-50 p-2', className)}>
      <p className="text-[11px] text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}
