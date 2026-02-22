import { BatteryCharging, Filter, Package, PlugZap, SearchX, Wrench } from 'lucide-react';
import { demoData } from '../data/demoData';
import { canViewDevices } from '../lib/rolePermissions';
import { useDemoStore } from '../store/demoStore';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { cn } from '../lib/utils';

export function DevicesPage() {
  const state = useDemoStore();
  if (!canViewDevices(state.role)) {
    return (
      <Card>
        <CardContent className="py-10 text-sm text-slate-600">Devices module is visible to Biomed Tech, Unit Manager, and Admin roles.</CardContent>
      </Card>
    );
  }

  const { summary, pods, podDetails, patchInventory } = demoData.devices;
  const filters = state.devicesFilters;
  const searchQuery = state.globalSearchQuery.trim().toLowerCase();

  const firmwareOptions = Array.from(new Set(pods.map((p) => p.firmware))).sort();

  const filteredPods = pods.filter((pod) => {
    if (filters.unit !== 'All units' && pod.unit !== filters.unit) return false;
    if (filters.status !== 'All' && pod.status !== filters.status) return false;
    if (filters.firmware !== 'All' && pod.firmware !== filters.firmware) return false;
    if (filters.connectivityIssuesOnly && pod.connectivityIssues7d === 0) return false;
    if (filters.batteryRange !== 'All') {
      const [min, max] = filters.batteryRange.split('-').map(Number);
      if (pod.batteryPct < min || pod.batteryPct > max) return false;
    }
    if (searchQuery) {
      const values = [pod.podId, pod.unit, pod.lastAssignedBed, pod.firmware];
      if (!values.some((v) => v.toLowerCase().includes(searchQuery))) return false;
    }
    return true;
  });

  const selectedPodId = state.selectedPodId ?? 'VC-POD-0417';
  const selectedPod = pods.find((p) => p.podId === selectedPodId) ?? pods[0];
  const podDetail = selectedPod ? podDetails[selectedPod.podId] : null;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <SummaryTile label="Pods in circulation (unit)" value={summary.podsInCirculation} icon={PlugZap} />
            <SummaryTile label="Pods in storage" value={summary.podsInStorage} icon={Package} />
            <SummaryTile label="Pods needing charge" value={summary.podsNeedingCharge} icon={BatteryCharging} tone="amber" />
            <SummaryTile label="Pods flagged for maintenance" value={summary.podsFlaggedMaintenance} icon={Wrench} tone="red" />
            <SummaryTile label="Pods w/ connectivity issues (7d)" value={summary.podsConnectivityIssues7d} icon={Filter} />
            <SummaryTile label="Patch inventory on hand" value={summary.patchInventoryOnHand} icon={Package} />
            <SummaryTile label="Predicted patch runout" value={summary.predictedPatchRunoutDate} icon={Package} className="md:col-span-2" />
          </div>

          <Card>
            <CardHeader>
              <div>
                <CardTitle className="text-[15px]">Device Fleet</CardTitle>
                <p className="mt-0.5 text-xs text-slate-500">Filterable pod inventory and assignment status</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-5">
                <select className="h-9 rounded-[10px] border border-slate-200 bg-white px-3 text-sm" value={filters.unit} onChange={(e) => state.setDevicesFilters({ unit: e.target.value as any })}>
                  <option>All units</option>
                  <option>ICU North</option>
                  <option>Oncology Infusion</option>
                  <option>Emergency Department</option>
                  <option>Radiology Contrast Suite</option>
                </select>
                <select className="h-9 rounded-[10px] border border-slate-200 bg-white px-3 text-sm" value={filters.status} onChange={(e) => state.setDevicesFilters({ status: e.target.value as any })}>
                  <option>All</option>
                  <option>In use</option>
                  <option>Storage</option>
                  <option>Charging</option>
                  <option>Maintenance</option>
                </select>
                <select className="h-9 rounded-[10px] border border-slate-200 bg-white px-3 text-sm" value={filters.batteryRange} onChange={(e) => state.setDevicesFilters({ batteryRange: e.target.value as any })}>
                  <option>All</option>
                  <option>0-25</option>
                  <option>26-50</option>
                  <option>51-75</option>
                  <option>76-100</option>
                </select>
                <select className="h-9 rounded-[10px] border border-slate-200 bg-white px-3 text-sm" value={filters.firmware} onChange={(e) => state.setDevicesFilters({ firmware: e.target.value })}>
                  <option value="All">All firmware</option>
                  {firmwareOptions.map((fw) => (
                    <option key={fw} value={fw}>{fw}</option>
                  ))}
                </select>
                <label className="flex items-center gap-2 rounded-[10px] border border-slate-200 bg-white px-3 text-sm text-slate-700">
                  <input type="checkbox" checked={filters.connectivityIssuesOnly} onChange={(e) => state.setDevicesFilters({ connectivityIssuesOnly: e.target.checked })} />
                  Connectivity issues only
                </label>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200">
                <div className="max-h-[520px] overflow-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-3 py-2">Pod ID</th>
                        <th className="px-3 py-2">Unit</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Battery %</th>
                        <th className="px-3 py-2">Firmware</th>
                        <th className="px-3 py-2">Last calibration</th>
                        <th className="px-3 py-2">Conn issues (7d)</th>
                        <th className="px-3 py-2">Last assigned bed</th>
                        <th className="px-3 py-2">Last seen</th>
                        <th className="px-3 py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPods.map((pod) => (
                        <tr key={pod.podId} className={cn('border-t border-slate-100', state.highlightTarget?.podId === pod.podId && 'bg-amber-50', state.selectedPodId === pod.podId && 'bg-blue-50/40')}>
                          <td className="px-3 py-2 font-medium text-slate-900">{pod.podId}</td>
                          <td className="px-3 py-2 text-slate-600">{pod.unit}</td>
                          <td className="px-3 py-2"><StatusBadge status={pod.status} /></td>
                          <td className="px-3 py-2 text-slate-700">{pod.batteryPct}%</td>
                          <td className="px-3 py-2 text-slate-600">{pod.firmware}</td>
                          <td className="px-3 py-2 text-slate-600">{pod.lastCalibrationCheck}</td>
                          <td className="px-3 py-2 text-slate-700">{pod.connectivityIssues7d}</td>
                          <td className="px-3 py-2 text-slate-600">{pod.lastAssignedBed}</td>
                          <td className="px-3 py-2 text-slate-600">{pod.lastSeen}</td>
                          <td className="px-3 py-2">
                            <Button size="sm" variant="secondary" onClick={() => state.selectPod(pod.podId)}>View details</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {!filteredPods.length ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  <SearchX className="mx-auto mb-2 h-5 w-5 text-slate-400" />
                  No devices match current filters/search.
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle className="text-[15px]">Patch Inventory</CardTitle>
                <p className="mt-0.5 text-xs text-slate-500">Predicted runout dates by patch type</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-3">
                {patchInventory.map((item) => (
                  <div key={item.patchType} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-sm font-medium text-slate-900">{item.patchType}</p>
                    <p className="mt-1 text-xl font-semibold text-slate-900">{item.onHand}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <Badge className={cn(item.runoutDays < 7 ? 'border-red-200 bg-red-50 text-red-700' : item.runoutDays <= 7 ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-slate-200 bg-white text-slate-700')}>
                        runout {item.runoutDays} days
                      </Badge>
                      <span className="text-slate-500">{item.predictedRunoutDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="sticky top-[124px]">
            <CardHeader>
              <div>
                <CardTitle className="text-[15px]">Pod Detail</CardTitle>
                <p className="mt-0.5 text-xs text-slate-500">Traceability and maintenance context</p>
              </div>
              {selectedPod ? <Badge className="border-blue-200 bg-blue-50 text-blue-700">{selectedPod.podId}</Badge> : null}
            </CardHeader>
            <CardContent className="space-y-3">
              {podDetail ? (
                <>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <Field label="Pod ID" value={podDetail.podId} />
                    <Field label="Firmware" value={podDetail.firmware} />
                    <Field label="Hardware rev" value={podDetail.hardwareRev} />
                    <Field label="Calibration" value={`${podDetail.lastCalibrationCheck} (${podDetail.calibrationResult})`} />
                    <Field label="Battery health" value={`${podDetail.batteryHealthPct}%`} />
                    <Field label="Estimated cycle count" value={podDetail.estimatedCycleCount} />
                    <Field label="Current assignment" value={podDetail.currentAssignment} className="col-span-2" />
                    <Field label="Patch paired" value={podDetail.patchPaired} className="col-span-2" />
                  </div>

                  <PanelList title="Connection history (last 24h)" rows={podDetail.connectionHistory.map((r) => `${r.time} • ${r.event}`)} />
                  <PanelList title="Error codes" rows={podDetail.errorCodes} />
                  <PanelList title="Recommended fixes" rows={podDetail.recommendedFixes} />

                  <div className="rounded-xl border border-slate-200">
                    <div className="border-b border-slate-100 px-3 py-2 text-sm font-medium text-slate-800">Assignment History</div>
                    <div className="max-h-[240px] overflow-auto">
                      <table className="min-w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500">
                          <tr>
                            <th className="px-3 py-2">Unit</th>
                            <th className="px-3 py-2">Bed</th>
                            <th className="px-3 py-2">Start</th>
                            <th className="px-3 py-2">End</th>
                            <th className="px-3 py-2">Outcome</th>
                          </tr>
                        </thead>
                        <tbody>
                          {podDetail.assignmentHistory.map((row, idx) => (
                            <tr key={`${row.unit}-${idx}`} className="border-t border-slate-100">
                              <td className="px-3 py-2">{row.unit}</td>
                              <td className="px-3 py-2">{row.bed}</td>
                              <td className="px-3 py-2">{row.start}</td>
                              <td className="px-3 py-2">{row.end}</td>
                              <td className="px-3 py-2">{row.outcome}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-sm text-slate-500">Select a pod to view details.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SummaryTile({ label, value, icon: Icon, tone = 'slate', className }: any) {
  const toneCls = tone === 'amber' ? 'bg-amber-50 border-amber-200' : tone === 'red' ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200';
  return (
    <Card className={cn('border', toneCls, className)}>
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
        </div>
        <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
          <Icon className="h-4 w-4" />
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cls = status === 'Maintenance'
    ? 'border-red-200 bg-red-50 text-red-700'
    : status === 'Charging'
      ? 'border-amber-200 bg-amber-50 text-amber-700'
      : status === 'In use'
        ? 'border-blue-200 bg-blue-50 text-blue-700'
        : 'border-slate-200 bg-slate-50 text-slate-700';
  return <Badge className={cls}>{status}</Badge>;
}

function Field({ label, value, className }: { label: string; value: any; className?: string }) {
  return (
    <div className={cn('rounded-lg border border-slate-200 bg-slate-50 p-2', className)}>
      <p className="text-[11px] text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

function PanelList({ title, rows }: { title: string; rows: string[] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="mb-2 text-sm font-medium text-slate-800">{title}</p>
      <ul className="space-y-1 text-xs text-slate-600">
        {rows.map((row) => (
          <li key={row}>• {row}</li>
        ))}
      </ul>
    </div>
  );
}
