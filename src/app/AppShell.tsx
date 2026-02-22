import { Outlet } from 'react-router-dom';
import { AppHeader } from '../components/header/AppHeader';
import { ToastViewport } from '../components/shared/ToastViewport';

export function AppShell() {
  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-900">
      <AppHeader />
      <main className="px-4 py-4 md:px-5 xl:px-6">
        <Outlet />
      </main>
      <ToastViewport />
    </div>
  );
}
