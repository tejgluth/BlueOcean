import { Database, Hospital, Lock, ShieldCheck, Trash2, UploadCloud } from 'lucide-react';
import { useDemoStore } from '../store/demoStore';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { cn } from '../lib/utils';

export function IntegrationsPrivacyPage() {
  const state = useDemoStore();
  const cfg = state.data.integrationConfig;
  const auditLog = state.data.auditLog;

  const integrationRows = [
    { key: 'nurseCallEnabled', label: 'Nurse call systems', statusKey: 'nurseCall', syncKey: 'nurseCall' },
    { key: 'ehrEnabled', label: 'EHR integration', statusKey: 'ehr', syncKey: 'ehr' },
    { key: 'bedManagementEnabled', label: 'Bed management mapping', statusKey: 'bedManagement', syncKey: 'bedManagement' },
    { key: 'pagingEnabled', label: 'Hospital paging for critical escalations', statusKey: 'paging', syncKey: 'paging' },
  ] as const;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="text-[15px]">Integrations</CardTitle>
              <p className="mt-0.5 text-xs text-slate-500">Demo connectivity status and feature toggles</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {integrationRows.map((row) => {
              const enabled = cfg[row.key];
              const status = cfg.integrationStatus[row.statusKey];
              return (
                <div key={row.key} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{row.label}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <StatusBadge status={status} />
                        <span>Last sync: {cfg.lastSyncs[row.syncKey]}</span>
                      </div>
                    </div>
                    <Switch checked={Boolean(enabled)} onCheckedChange={(checked) => state.setIntegrationToggle(row.key, checked)} />
                  </div>
                  {row.key === 'ehrEnabled' && cfg.ehrEnabled ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(['Structured note template', 'Flowsheet entry', 'Both'] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => state.setEhrMode(mode)}
                          className={cn(
                            'rounded-full border px-2.5 py-1 text-xs',
                            cfg.ehrMode === mode ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600',
                          )}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle className="text-[15px]">Privacy Controls</CardTitle>
              <p className="mt-0.5 text-xs text-slate-500">Demo policy toggles and retention settings</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <ToggleRow label="Hide identifiers on unit board" checked={cfg.hideIdentifiersOnUnitBoard} onCheckedChange={(v) => state.setIntegrationToggle('hideIdentifiersOnUnitBoard', v)} />
            <ToggleRow label="Require elevated role to reveal MRN" checked={cfg.requireElevatedRoleForMrn} onCheckedChange={(v) => state.setIntegrationToggle('requireElevatedRoleForMrn', v)} />
            <ToggleRow label="Audit logging enabled for every view/action" checked={cfg.auditLoggingEnabled} onCheckedChange={(v) => state.setIntegrationToggle('auditLoggingEnabled', v)} />

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm font-medium text-slate-900">Data retention policy</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                <li>• {cfg.dataRetentionRawSignals}</li>
                <li>• {cfg.dataRetentionReviewLabels}</li>
                <li>• {cfg.dataRetentionAuditLogs}</li>
              </ul>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Button variant="secondary" disabled title="Demo only"> <UploadCloud className="h-4 w-4" /> Export data bundle </Button>
              <Button variant="secondary" disabled title="Demo only"> <Trash2 className="h-4 w-4" /> Purge retained data </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-[15px]">Audit Log Viewer (demo)</CardTitle>
            <p className="mt-0.5 text-xs text-slate-500">Recent actions with user, object, and outcome</p>
          </div>
          <Badge className="border-slate-200 bg-slate-50 text-slate-600">{auditLog.length} entries</Badge>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <div className="max-h-[420px] overflow-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Timestamp</th>
                    <th className="px-3 py-2">User</th>
                    <th className="px-3 py-2">Action</th>
                    <th className="px-3 py-2">Object</th>
                    <th className="px-3 py-2">Outcome</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLog.map((entry) => (
                    <tr key={entry.id} className="border-t border-slate-100">
                      <td className="px-3 py-2 text-slate-600">{entry.timestamp}</td>
                      <td className="px-3 py-2">{entry.user}</td>
                      <td className="px-3 py-2">{entry.action}</td>
                      <td className="px-3 py-2">{entry.object}</td>
                      <td className="px-3 py-2">
                        <Badge className="border-slate-200 bg-slate-50 text-slate-700">{entry.outcome}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ToggleRow({ label, checked, onCheckedChange }: { label: string; checked: boolean; onCheckedChange: (value: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3">
      <p className="text-sm text-slate-800">{label}</p>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function StatusBadge({ status }: { status: 'Connected' | 'Test mode' | 'Disabled' }) {
  const cls = status === 'Connected' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : status === 'Test mode' ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 bg-slate-50 text-slate-600';
  return <Badge className={cls}>{status}</Badge>;
}
