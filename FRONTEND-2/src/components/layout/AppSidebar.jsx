import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, TrendingUp, Library, Video } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AppSidebar = () => {
    const location = useLocation();
    const { isAuthenticated } = useAuth();

    const menuItems = [
        { path: '/', name: 'Home', icon: Home },
        { path: '/trending', name: 'Trending', icon: TrendingUp },
        { path: '/library', name: 'Library', icon: Library, authRequired: true },
    ];

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <aside className="fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-64 bg-white border-r border-slate-200 hidden lg:block overflow-y-auto">
            <nav className="p-3 space-y-1">
                {menuItems.map((item) => {
                    // Skip auth-required items if not authenticated
                    if (item.authRequired && !isAuthenticated) {
                        return null;
                    }

                    const Icon = item.icon;
                    const active = isActive(item.path);

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`
                flex items-center gap-4 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                ${active
                                    ? 'bg-blue-50 text-brand-blue border-l-4 border-brand-blue pl-3'
                                    : 'text-slate-700 hover:bg-slate-100'
                                }
              `}
                        >
                            <Icon className="h-5 w-5 flex-shrink-0" />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}

                {/* Divider */}
                <div className="border-t border-slate-200 my-3"></div>

                {/* Subscriptions Section (if authenticated) */}
                {isAuthenticated && (
                    <div className="px-4 py-2">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                            Subscriptions
                        </h3>
                        <div className="space-y-1">
                            <Link
                                to="/subscriptions"
                                className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                                <Video className="h-4 w-4" />
                                <span>All Subscriptions</span>
                            </Link>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="px-4 py-6 text-xs text-slate-500">
                    <p className="mb-2">© 2025 VidFlow</p>
                    <p className="text-slate-400">A modern video platform</p>
                </div>
            </nav>
        </aside>
    );
};

export default AppSidebar;
