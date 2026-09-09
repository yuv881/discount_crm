import { useNavigate, useLocation } from 'react-router-dom';
import { Store, TrendingUp, Settings, X, LogOut } from 'lucide-react';

const Sidebar = ({ isOpen = false, onClose, onLogout }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { text: 'Stores Directory', icon: <Store className="w-4 h-4" />, path: '/' },
        { text: 'Analytics', icon: <TrendingUp className="w-4 h-4" />, path: '/analytics' },
    ];

    const handleNavigate = (path) => {
        navigate(path);
        if (onClose) onClose();
    };

    const handleLogoutClick = () => {
        if (onLogout) {
            onLogout();
        } else {
            localStorage.removeItem('auth_user');
            window.location.reload();
        }
    };

    return (
        <>
            {/* Mobile Backdrop overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden transition-opacity"
                    onClick={onClose}
                />
            )}

            <aside
                className={`fixed md:sticky top-0 left-0 h-screen w-64 md:w-60 bg-white border-r border-slate-200 flex flex-col justify-between select-none z-50 transition-transform duration-200 ease-in-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                }`}
            >
            <div>
                {/* Brand Header */}
                <div className="p-5 flex items-center justify-between border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-semibold shadow-xs">
                            <Store className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-slate-900 text-base leading-tight">
                                Discount Ninja
                            </h1>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">CRM Dashboard</p>
                        </div>
                    </div>
                    {/* Mobile close button */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Close Menu"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="p-3">
                    <span className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        Main Menu
                    </span>
                    <ul className="space-y-1">
                        {menuItems.map((item) => {
                            const isActive =
                                location.pathname === item.path ||
                                (item.path === '/' && location.pathname.startsWith('/store/'));

                            return (
                                <li key={item.text}>
                                    <button
                                        type="button"
                                        onClick={() => handleNavigate(item.path)}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                                            isActive
                                                ? 'bg-slate-100 text-slate-900 font-bold'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                    >
                                        <span className={isActive ? 'text-slate-900' : 'text-slate-500'}>
                                            {item.icon}
                                        </span>
                                        {item.text}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>

            {/* Footer / Settings & Logout */}
            <div className="p-3 border-t border-slate-100 space-y-1">
                <button
                    type="button"
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                    <Settings className="w-4 h-4 text-slate-500" />
                    Settings
                </button>
                <button
                    type="button"
                    onClick={handleLogoutClick}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    Sign Out
                </button>
            </div>
        </aside>
        </>
    );
};

export default Sidebar;