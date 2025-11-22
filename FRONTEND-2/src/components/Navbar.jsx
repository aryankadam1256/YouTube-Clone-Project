import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, Upload, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { searchAPI } from '../api';
import { cn } from '../lib/utils';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Debounced search suggestions
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const response = await searchAPI.getSuggestions(searchQuery);
        setSuggestions(response.data.data || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === 'video') {
      navigate(`/video/${suggestion.id}`);
    } else if (suggestion.type === 'channel') {
      navigate(`/channel/${suggestion.username}`);
    }
    setSearchQuery('');
    setShowSuggestions(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 via-blue-700 to-orange-600 px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
              VF
            </div>
            <span className="hidden sm:inline-block text-lg font-semibold text-foreground">
              VidFlow
            </span>
          </Link>

          {/* Search Bar */}
          <div ref={searchRef} className="relative flex-1 max-w-2xl mx-4">
            <form onSubmit={handleSearchSubmit} className="flex w-full">
              <input
                type="text"
                placeholder="Search videos..."
                className={cn(
                  "flex-1 h-9 rounded-l-full border border-input bg-background px-4 py-1 text-sm",
                  "transition-colors placeholder:text-muted-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0"
                )}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
              />
              <button
                type="submit"
                className={cn(
                  "flex items-center justify-center h-9 px-4 rounded-r-full",
                  "bg-gradient-to-r from-blue-600 to-blue-700 text-white",
                  "hover:brightness-110 transition-all"
                )}
              >
                <Search className="h-4 w-4" />
              </button>
            </form>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-accent transition-colors border-b border-border/50 last:border-0"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion.type === 'video' ? (
                      <>
                        <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">
                            {suggestion.display}
                          </div>
                          <div className="text-xs text-muted-foreground">Video</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <img
                          src={suggestion.avatar || '/default-avatar.png'}
                          alt={suggestion.username}
                          className="h-8 w-8 rounded-full object-cover border border-border flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">
                            {suggestion.display}
                          </div>
                          <div className="text-xs text-muted-foreground">Channel</div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Menu */}
          {isAuthenticated ? (
            <div className="relative flex items-center gap-2 flex-shrink-0">
              <img
                src={user?.avatar || '/default-avatar.png'}
                alt="Profile"
                className="h-8 w-8 rounded-full object-cover cursor-pointer border-2 border-border hover:border-primary transition-colors"
                onClick={() => setShowUserMenu(!showUserMenu)}
              />
              <span className="hidden md:inline-block text-sm font-medium text-foreground">
                {user?.username}
              </span>

              {showUserMenu && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-popover border border-border rounded-lg shadow-lg overflow-hidden z-50">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-popover-foreground hover:bg-accent transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                  <Link
                    to="/upload"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-popover-foreground hover:bg-accent transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Upload className="h-4 w-4" />
                    Upload Video
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-popover-foreground hover:bg-accent transition-colors border-t border-border/50"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                to="/login"
                className={cn(
                  "inline-flex items-center justify-center h-9 px-4 py-2 rounded-md",
                  "bg-gradient-to-r from-blue-600 via-blue-700 to-orange-600 text-white text-sm font-medium",
                  "hover:brightness-110 transition-all shadow-sm"
                )}
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;