import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, NavLink, Outlet } from 'react-router-dom';
import { useApp } from './context';

const Auth = lazy(() => import('./pages/Auth')), Dashboard = lazy(() => import('./pages/Dashboard')),
  Farms = lazy(() => import('./pages/Farms')), Crops = lazy(() => import('./pages/Crops')),
  Weather = lazy(() => import('./pages/Weather')), Shop = lazy(() => import('./pages/Shop')),
  Community = lazy(() => import('./pages/Community')), Admin = lazy(() => import('./pages/Admin'));

function Layout() {
  const { user, logout, t, lang, changeLang } = useApp();
  if (!user) return <Navigate to="/login" replace />;
  const links = [['/', 'dashboard'], ['/farms', 'farms'], ['/crops', 'crops'], ['/weather', 'weather'], ['/shop', 'shop'], ['/community', 'community'],
    ...(user.role === 'admin' ? [['/admin', 'admin']] : [])];
  return (
    <div className="shell">
      <nav className="side" aria-label="Main">
        <div className="brand">Agri-Tech</div>
        {links.map(([to, k]) => <NavLink key={to} to={to} end={to === '/'}>{t(k)}</NavLink>)}
        <div className="mt-auto d-grid gap-2">
          <select className="form-select form-select-sm" value={lang} onChange={e => changeLang(e.target.value)} aria-label={t('language')}>
            <option value="en">English</option><option value="hi">हिन्दी</option>
          </select>
          <button className="btn btn-outline-light btn-sm" onClick={logout}>{t('logout')}</button>
        </div>
      </nav>
      <main className="main"><Suspense fallback={<p>Loading…</p>}><Outlet /></Suspense></main>
    </div>
  );
}

export default function App() {
  const { ready, user } = useApp();
  if (!ready) return null;
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Auth />} />
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="farms" element={<Farms />} />
          <Route path="crops" element={<Crops />} />
          <Route path="weather" element={<Weather />} />
          <Route path="shop" element={<Shop />} />
          <Route path="community" element={<Community />} />
          <Route path="admin" element={user?.role === 'admin' ? <Admin /> : <Navigate to="/" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
