import { Camera, Clock3, Network, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { useDemoStore } from '../store/demoStore';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { formatTime } from '../lib/formatters';

export function DemoSettingsPage() {
  const state = useDemoStore();

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="text-[15px]">Demo Clock / Screenshot Mode</CardTitle>
              <p className="mt-0.5 text-xs text-slate-500">Deterministic screenshots with optional live-clock simulation</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm text-slate-800">Current demo time</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">2026-02-22 {formatTime(new Date(state.currentTimeMs))}</p>
              <p className="mt-1 text-xs text-slate-500">Default fixed clock: February 22, 2026 at 08:12:34 local</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant={state.clockMode === 'fixed' ? 'default' : 'secondary'} onClick={() => state.setClockMode('fixed')}>Fixed clock</Button>
              <Button size="sm" variant={state.clockMode === 'live' ? 'default' : 'secondary'} onClick={() => state.setClockMode('live')}>Live clock</Button>
              <Button size="sm" variant="secondary" onClick={() => state.pushToast('Clock mode updated', `Clock set to ${state.clockMode}.`)}>Confirm mode</Button>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
              <div>
                <p className="text-sm font-medium text-slate-900">Screenshot mode</p>
                <p className="text-xs text-slate-500">Disables pulsing/noisy motion and keeps rendering stable</p>
              </div>
              <Switch checked={state.screenshotMode} onCheckedChange={(checked) => state.setScreenshotMode(checked)} />
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-sm font-medium text-slate-900">URL examples</p>
              <div className="mt-2 space-y-1 text-xs text-slate-600">
                <div><code>?demoClock=fixed</code></div>
                <div><code>?demoClock=live</code></div>
                <div><code>?demoClock=fixed&screenshot=1</code></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle className="text-[15px]">Simulation Controls</CardTitle>
              <p className="mt-0.5 text-xs text-slate-500">Network status and alert queue behavior</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-slate-200 p-3">
              <p className="mb-2 text-sm font-medium text-slate-900">Network status</p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant={state.networkStatus === 'online' ? 'default' : 'secondary'} onClick={() => state.setNetworkStatus('online')}>Online</Button>
                <Button size="sm" variant={state.networkStatus === 'degraded' ? 'default' : 'secondary'} onClick={() => state.setNetworkStatus('degraded')}>Degraded</Button>
                <Button size="sm" variant={state.networkStatus === 'offline' ? 'default' : 'secondary'} onClick={() => state.setNetworkStatus('offline')}>Offline</Button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-3">
              <p className="mb-2 text-sm font-medium text-slate-900">Auto-escalation threshold (minutes)</p>
              <input
                type="range"
                min={1}
                max={15}
                value={state.autoEscalationThresholdMin}
                onChange={(e) => state.setAutoEscalationThresholdMin(Number(e.target.value))}
                className="w-full"
              />
              <p className="mt-1 text-xs text-slate-500">Current: {state.autoEscalationThresholdMin} min (default 7 min)</p>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
              <div>
                <p className="text-sm font-medium text-slate-900">Remove resolved alerts from queue</p>
                <p className="text-xs text-slate-500">If off, alerts remain visible in resolved state</p>
              </div>
              <Switch checked={state.removeResolvedAlertsFromQueue} onCheckedChange={state.setRemoveResolvedAlertsFromQueue} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
