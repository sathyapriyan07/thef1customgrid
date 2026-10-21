import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AdminLayout } from './components/layout/AdminLayout';

// Public Pages
import { HomePage } from './pages/HomePage';
import { DriversPage } from './pages/DriversPage';
import { DriverDetailPage } from './pages/DriverDetailPage';
import { TeamsPage } from './pages/TeamsPage';
import { TeamDetailPage } from './pages/TeamDetailPage';
import { SeasonsPage } from './pages/SeasonsPage';
import { GridBuilderPage } from './pages/GridBuilderPage';
import { MyGridsPage } from './pages/MyGridsPage';
import { GridDetailPage } from './pages/GridDetailPage';
import { PosterStudioPage } from './pages/PosterStudioPage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminTeamsPage } from './pages/admin/AdminTeamsPage';
import { AdminCarsPage } from './pages/admin/AdminCarsPage';
import { AdminDriversPage } from './pages/admin/AdminDriversPage';
import { AdminSeasonsPage } from './pages/admin/AdminSeasonsPage';
import { AdminAssignmentsPage } from './pages/admin/AdminAssignmentsPage';
import { AdminLineupsPage } from './pages/admin/AdminLineupsPage';
import { AdminMediaPage } from './pages/admin/AdminMediaPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

export function AppContent() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route matching logic
  const renderRoute = () => {
    // Admin Routes
    if (currentPath === '/admin/login') {
      return <AdminLoginPage navigate={navigate} />;
    }

    if (currentPath.startsWith('/admin')) {
      let adminComponent = <AdminOverviewPage navigate={navigate} />;
      if (currentPath === '/admin/teams' || currentPath.startsWith('/admin/teams/')) {
        adminComponent = <AdminTeamsPage />;
      } else if (currentPath === '/admin/cars') {
        adminComponent = <AdminCarsPage />;
      } else if (currentPath === '/admin/drivers' || currentPath.startsWith('/admin/drivers/')) {
        adminComponent = <AdminDriversPage />;
      } else if (currentPath === '/admin/seasons') {
        adminComponent = <AdminSeasonsPage />;
      } else if (currentPath === '/admin/assignments') {
        adminComponent = <AdminAssignmentsPage />;
      } else if (currentPath === '/admin/lineups') {
        adminComponent = <AdminLineupsPage navigate={navigate} />;
      } else if (currentPath === '/admin/media') {
        adminComponent = <AdminMediaPage />;
      } else if (currentPath === '/admin/settings') {
        adminComponent = <AdminSettingsPage />;
      }

      return (
        <AdminLayout currentPath={currentPath} navigate={navigate}>
          {adminComponent}
        </AdminLayout>
      );
    }

    // Public Dynamic Detail Routes
    if (currentPath.startsWith('/drivers/')) {
      const driverId = currentPath.replace('/drivers/', '');
      return <DriverDetailPage driverId={driverId} navigate={navigate} />;
    }

    if (currentPath.startsWith('/teams/')) {
      const teamId = currentPath.replace('/teams/', '');
      return <TeamDetailPage teamId={teamId} navigate={navigate} />;
    }

    if (currentPath.startsWith('/grids/') && currentPath.endsWith('/poster')) {
      const gridId = currentPath.replace('/grids/', '').replace('/poster', '');
      return <PosterStudioPage gridId={gridId} navigate={navigate} />;
    }

    if (currentPath.startsWith('/grids/')) {
      const gridId = currentPath.replace('/grids/', '');
      return <GridDetailPage gridId={gridId} navigate={navigate} />;
    }

    // Builder Route with optional query
    if (currentPath.startsWith('/builder')) {
      const urlParams = new URLSearchParams(window.location.search);
      const editId = urlParams.get('edit') || undefined;
      return <GridBuilderPage navigate={navigate} editGridId={editId} />;
    }

    // Main Public Routes
    switch (currentPath) {
      case '/drivers':
        return <DriversPage navigate={navigate} />;
      case '/teams':
        return <TeamsPage navigate={navigate} />;
      case '/seasons':
        return <SeasonsPage navigate={navigate} />;
      case '/my-grids':
        return <MyGridsPage navigate={navigate} />;
      case '/':
      default:
        return <HomePage navigate={navigate} />;
    }
  };

  const isAdminRoute = currentPath.startsWith('/admin') && currentPath !== '/admin/login';

  return (
    <div className="min-h-screen bg-[#0c0d10] text-zinc-100 flex flex-col font-sans">
      {!isAdminRoute && <Navbar currentPath={currentPath} navigate={navigate} />}
      <div className="flex-1">
        {renderRoute()}
      </div>
      {!isAdminRoute && <Footer navigate={navigate} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
