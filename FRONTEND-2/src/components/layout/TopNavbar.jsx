import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Upload, Bell, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TopNavbar = ({ onAuthModalOpen }) => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <nav className="sticky top-0 z-50 h-14 bg-white border-b border-slate-200">
            <div className="flex h-full items-center justify-between px-4 lg:px-6">
                {/* Left: Logo */}
                <Link to="/" className="flex items-center gap-2 flex-shrink-0">
                    <span className="bg-gradient-to-r from-brand-blue to-brand-cyan bg-clip-text text-transparent font-bold text-xl tracking-tight">
                        VidFlow
                    </span>
                </Link>

                {/* Center: Search Bar */}
                <form
                    onSubmit={handleSearchSubmit}
                    className="flex-1 max-w-2xl mx-4 hidden sm:block"
                >
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search videos..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-4 pr-12 rounded-full bg-slate-100 border border-transparent text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all"
                        />
                        <button
                            type="submit"
                            className="absolute right-0 top-0 h-10 px-4 flex items-center justify-center text-slate-600 hover:text-brand-blue transition-colors"
                        >
                            <Search className="h-5 w-5" />
                        </button>
                    </div>
                </form>

                {/* Right: Actions */}
                <div className="flex items-center gap-3 flex-shrink-0">
                    {isAuthenticated ? (
                        <>
                            {/* Upload Button */}
                            <Link
                                to="/upload"
                                className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                                title="Upload Video"
                            >
                                <Upload className="h-5 w-5 text-slate-700" />
                            </Link>

                            {/* Notifications */}
                            <button
                                className="p-2 rounded-full hover:bg-slate-100 transition-colors relative"
                                title="Notifications"
                            >
                                <Bell className="h-5 w-5 text-slate-700" />
                                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-error rounded-full"></span>
                            </button>

                            {/* User Avatar */}
                            <Link to="/profile" className="flex items-center gap-2">
                                <img
                                    src={user?.avatar || '/default-avatar.png'}
                                    alt={user?.username}
                                    className="h-8 w-8 rounded-full border-2 border-slate-200 hover:border-brand-blue transition-colors"
                                />
                            </Link>
                        </>
                    ) : (
                        <>
                            {/* Sign In Button */}
                            <button
                                onClick={onAuthModalOpen}
                                className="px-4 py-1.5 rounded-full border-2 border-brand-blue text-brand-blue text-sm font-medium hover:bg-brand-blue hover:text-white transition-all"
                            >
                                Sign In
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Mobile Search Bar */}
            <form
                onSubmit={handleSearchSubmit}
                className="sm:hidden px-4 pb-3"
            >
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-9 pl-4 pr-10 rounded-full bg-slate-100 border border-transparent text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                    />
                    <button
                        type="submit"
                        className="absolute right-0 top-0 h-9 px-3 flex items-center justify-center text-slate-600"
                    >
                        <Search className="h-4 w-4" />
                    </button>
                </div>
            </form>
        </nav>
    );
};

export default TopNavbar;
