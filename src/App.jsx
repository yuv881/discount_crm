import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import All_Stores from './pages/All_Stores';
import Store_Details from './pages/Store_Details';
import Analytics from './pages/Analytics';
import Sidebar from './components/Sidebar';
import DateFilter from './components/DateFilter';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, Copy, Check } from 'lucide-react';


function NavigationBar({
  totalCount = 0,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [copied, setCopied] = useState(false);
  const isStoreDetail = location.pathname.startsWith('/store/');
  const storeDomain = isStoreDetail ? decodeURIComponent(location.pathname.replace('/store/', '')) : '';
  const storeName = storeDomain ? storeDomain.split('.')[0] : '';

  const datePreset = searchParams.get('datePreset') || 'all';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';

  const handleDateFilterChange = ({ preset, startDate: start, endDate: end }) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (!preset || preset === 'all') {
        next.delete('datePreset');
      } else {
        next.set('datePreset', preset);
      }
      if (start) {
        next.set('startDate', start);
      } else {
        next.delete('startDate');
      }
      if (end) {
        next.set('endDate', end);
      } else {
        next.delete('endDate');
      }
      next.set('page', '1');
      return next;
    });
  };

  const handleCopyDomain = () => {
    if (storeDomain) {
      navigator.clipboard.writeText(storeDomain);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getPageTitle = () => {
    if (location.pathname === '/') return 'Merchants';
    if (location.pathname === '/analytics') return 'Analytics';
    if (location.pathname === '/promotions') return 'Promotions';
    if (location.pathname === '/dashboard') return 'Dashboard';
    const formatted = location.pathname.replace('/', '');
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="w-full px-4 md:px-8 py-3 flex items-center justify-between min-h-16">
        {isStoreDetail ? (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="p-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors text-slate-700 shadow-xs"
              title="Back to Directory"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="font-bold text-slate-900 text-lg leading-tight capitalize">
                {storeName}
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs font-medium text-slate-500">{storeDomain}</span>
                <button
                  type="button"
                  onClick={handleCopyDomain}
                  className="p-1 text-slate-400 hover:text-slate-700 transition-colors rounded-md"
                  title={copied ? 'Copied!' : 'Copy Domain'}
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <div>
              <h1 className="font-bold text-slate-900 text-xl tracking-tight">
                {getPageTitle()}
              </h1>
              {location.pathname === '/' && (
                <span className="text-xs font-medium text-slate-500 block mt-0.5">
                  Total stores: {totalCount}
                </span>
              )}
            </div>

            {/* Date Filter component placed in header */}
            {location.pathname === '/' && (
              <DateFilter
                selectedPreset={datePreset}
                startDate={startDate}
                endDate={endDate}
                onDateFilterChange={handleDateFilterChange}
                onClear={() => handleDateFilterChange({ preset: 'all', startDate: '', endDate: '' })}
              />
            )}
          </div>
        )}
      </div>
    </header>
  );
}

function App() {
  const [totalStoresCount, setTotalStoresCount] = useState(0);

  return (
    <Router>
      <AppContent totalStoresCount={totalStoresCount} setTotalStoresCount={setTotalStoresCount} />
    </Router>
  );
}

function AppContent({ totalStoresCount, setTotalStoresCount }) {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <NavigationBar
          totalCount={totalStoresCount}
        />
        <main className="flex-1">
          <Routes>
            <Route
              path="/"
              element={
                <All_Stores
                  onTotalCountChange={setTotalStoresCount}
                />
              }
            />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/store/:domain" element={<Store_Details />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
