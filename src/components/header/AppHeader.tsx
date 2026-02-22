import {
  Activity,
  ChevronDown,
  Circle,
  FilePlus2,
  Globe,
  Search,
  Shield,
  UserCircle2,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { demoData } from '../../data/demoData';
import { formatTime } from '../../lib/formatters';
import { buildSearchResults } from '../../lib/search';
import {
  canCreateReport,
  canRevealIdentifiers,
  canViewAnalytics,
  canViewDevices,
} from '../../lib/rolePermissions';
import { useDemoStore } from '../../store/demoStore';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { cn } from '../../lib/utils';

const tabs = [
  { label: 'Unit Board', path: '/', tab: 'unit-board' as const },
  { label: 'Devices', path: '/devices', tab: 'devices' as const },
  { label: 'Analytics', path: '/analytics', tab: 'analytics' as const },
  { label: 'Integrations & Privacy', path: '/integrations', tab: 'integrations' as const },
  { label: 'Demo Controls', path: '/demo-settings', tab: 'demo-settings' as const },
];

function NetworkPill({ status }: { status: 'online' | 'degraded' | 'offline' }) {
  const config = {
    online: { icon: Wifi, label: 'Online', cls: 'text-emerald-200' },
    degraded: { icon: Globe, label: 'Degraded', cls: 'text-amber-200' },
    offline: { icon: WifiOff, label: 'Offline', cls: 'text-red-200' },
  }[status];
  const Icon = config.icon;
  return (
    <div className="flex items-center gap-1.5 text-xs text-blue-100">
      <Icon className={cn('h-3.5 w-3.5', config.cls)} />
      <span>{config.label}</span>
    </div>
  );
}

export function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchFocused, setSearchFocused] = useState(false);

  const role = useDemoStore((s) => s.role);
  const selectedUnit = useDemoStore((s) => s.selectedUnit);
  const currentTimeMs = useDemoStore((s) => s.currentTimeMs);
  const networkStatus = useDemoStore((s) => s.networkStatus);
  const query = useDemoStore((s) => s.globalSearchQuery);
  const setQuery = useDemoStore((s) => s.setGlobalSearchQuery);
  const setRole = useDemoStore((s) => s.setRole);
  const setUnit = useDemoStore((s) => s.setSelectedUnit);
  const revealIdentifiersRequested = useDemoStore((s) => s.revealIdentifiersRequested);
  const setReveal = useDemoStore((s) => s.setRevealIdentifiersRequested);
  const pushToast = useDemoStore((s) => s.pushToast);
  const applySearchResult = useDemoStore((s) => s.applySearchResult);
  const mutableUnits = useDemoStore((s) => s.data.units);
  const privacyConfig = useDemoStore((s) => s.data.integrationConfig);

  const identifiersVisible =
    (!privacyConfig.hideIdentifiersOnUnitBoard || revealIdentifiersRequested) &&
    (!privacyConfig.requireElevatedRoleForMrn || canRevealIdentifiers(role));

  const searchResults = useMemo(
    () =>
      buildSearchResults({
        query,
        demoData: {
          ...demoData,
          analytics: { ...demoData.analytics, caseReviewCases: useDemoStore.getState().data.analyticsCases },
          units: mutableUnits,
          integrations: { ...demoData.integrations, config: privacyConfig, auditLog: useDemoStore.getState().data.auditLog },
        },
        unitData: mutableUnits[selectedUnit],
        identifiersVisible,
      }),
    [query, mutableUnits, selectedUnit, identifiersVisible, privacyConfig],
  );

  const visibleTabs = tabs.filter((tab) => {
    if (tab.tab === 'devices') return canViewDevices(role);
    if (tab.tab === 'analytics') return canViewAnalytics(role);
    return true;
  });

  const fixedLastData = new Date(currentTimeMs - 3000);

  return (
    <header className="sticky top-0 z-50 border-b border-[#0a3b64] bg-[#0F4C81] shadow-sm">
      <div className="px-4 py-3 md:px-5 xl:px-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3 text-white">
            <div className="mr-1 flex min-w-[220px] items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.12em] text-blue-100">St. Anne Medical Center</p>
                <p className="text-sm font-semibold">VeinCheck Command</p>
              </div>
            </div>

            <label className="relative min-w-[180px]">
              <span className="sr-only">Select unit</span>
              <select
                className="h-9 w-full appearance-none rounded-[10px] border border-white/20 bg-white/10 pl-3 pr-8 text-sm text-white outline-none ring-0 transition hover:bg-white/15"
                value={selectedUnit}
                onChange={(e) => setUnit(e.target.value as typeof selectedUnit)}
              >
                {demoData.unitOptions.map((unit) => (
                  <option key={unit} value={unit} className="text-slate-900">
                    {unit}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-2 h-4 w-4 text-blue-100" />
            </label>

            <div className="relative min-w-[300px] flex-1 max-w-[560px]">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => window.setTimeout(() => setSearchFocused(false), 120)}
                placeholder="Search patient, bed, pod, patch, MRN, case"
                className="bg-white pl-8 text-slate-900"
              />
              {searchFocused && query.trim() ? (
                <div className="absolute left-0 right-0 top-11 z-50 rounded-xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10">
                  {searchResults.length ? (
                    <div className="max-h-[360px] overflow-y-auto">
                      {(['Beds', 'Active alerts', 'Devices', 'Review cases'] as const).map((category) => {
                        const group = searchResults.filter((r) => r.category === category);
                        if (!group.length) return null;
                        return (
                          <div key={category} className="mb-1 last:mb-0">
                            <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{category}</div>
                            {group.map((result) => (
                              <button
                                key={result.id}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                  applySearchResult(result);
                                  navigate(
                                    result.target.tab === 'unit-board'
                                      ? '/'
                                      : result.target.tab === 'devices'
                                        ? '/devices'
                                        : result.target.tab === 'analytics'
                                          ? '/analytics'
                                          : result.target.tab === 'integrations'
                                            ? '/integrations'
                                            : '/demo-settings',
                                  );
                                }}
                                className="flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left hover:bg-slate-50"
                              >
                                <div className="mt-0.5 h-2 w-2 rounded-full bg-blue-500" />
                                <div className="min-w-0">
                                  <div className="truncate text-sm text-slate-800">{result.label}</div>
                                  {result.sublabel ? <div className="truncate text-xs text-slate-500">{result.sublabel}</div> : null}
                                </div>
                              </button>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="px-2 py-3 text-sm text-slate-500">No matches</div>
                  )}
                </div>
              ) : null}
            </div>

            <div className="ml-auto flex items-center gap-3">
              <div className="hidden items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-3 py-2 md:flex">
                <div className="flex items-center gap-2 text-xs text-blue-100">
                  <Circle className="h-2.5 w-2.5 fill-emerald-300 text-emerald-300" />
                  <span className="font-medium text-white">Live</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-blue-100">
                  <Activity className="h-3.5 w-3.5" />
                  <span>Last data: {formatTime(fixedLastData)}</span>
                </div>
                <NetworkPill status={networkStatus} />
              </div>

              <label className="relative min-w-[150px]">
                <span className="sr-only">Select role</span>
                <select
                  className="h-9 w-full appearance-none rounded-[10px] border border-white/20 bg-white/10 pl-3 pr-8 text-sm text-white outline-none transition hover:bg-white/15"
                  value={role}
                  onChange={(e) => setRole(e.target.value as typeof role)}
                >
                  {Object.keys(demoData.roleUsers).map((roleName) => (
                    <option key={roleName} value={roleName} className="text-slate-900">
                      {roleName}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-2 h-4 w-4 text-blue-100" />
              </label>

              <div className="hidden items-center gap-2 rounded-[10px] border border-white/15 bg-white/10 px-2 py-1.5 sm:flex">
                <span className="text-xs text-blue-100">Reveal identifiers</span>
                <Switch
                  checked={revealIdentifiersRequested}
                  onCheckedChange={(checked) => {
                    if (privacyConfig.requireElevatedRoleForMrn && !canRevealIdentifiers(role)) {
                      pushToast('Restricted', 'Reveal identifiers requires Admin role in this demo policy.');
                      return;
                    }
                    setReveal(checked);
                  }}
                  disabled={privacyConfig.requireElevatedRoleForMrn && !canRevealIdentifiers(role)}
                />
              </div>

              {canCreateReport(role) ? (
                <Button
                  size="sm"
                  className="bg-white text-[#0F4C81] hover:bg-blue-50"
                  onClick={() => pushToast('Report created (demo)', 'A snapshot report job was queued for this unit.')}
                >
                  <FilePlus2 className="h-4 w-4" />
                  Create report
                </Button>
              ) : null}

              <button type="button" className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/15">
                <UserCircle2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {visibleTabs.map((tab) => {
              const active = location.pathname === tab.path;
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={cn(
                    'rounded-[10px] px-3 py-1.5 text-sm transition',
                    active ? 'bg-white text-[#0F4C81] shadow-sm' : 'text-blue-100 hover:bg-white/10 hover:text-white',
                  )}
                >
                  {tab.label}
                </Link>
              );
            })}
            <div className="ml-auto flex items-center gap-2">
              <Badge className="border-white/20 bg-white/10 text-blue-100">{roleDisplayLabel(role)}</Badge>
              <Badge className="border-white/20 bg-white/10 text-blue-100">Demo data / not for clinical use</Badge>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function roleDisplayLabel(role: string) {
  return role;
}
