import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Upload, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { path: '/', name: 'Home', icon: Home },
    { path: '/upload', name: 'Upload', icon: Upload },
    { path: '/profile', name: 'Profile', icon: User },
  ];

  return (
    <>
      {/* Toggle Button */}
      <button
        className={cn(
          "fixed top-20 z-50 flex items-center justify-center",
          "h-8 w-8 rounded-full bg-sidebar border border-sidebar-border",
          "hover:bg-sidebar-accent transition-all shadow-md",
          isCollapsed ? "left-20" : "left-60"
        )}
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-sidebar-foreground" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-sidebar-foreground" />
        )}
      </button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-14 h-[calc(100vh-3.5rem)] bg-sidebar border-r border-sidebar-border",
          "transition-all duration-300 overflow-y-auto z-40",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <nav className="p-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                  "text-sm font-medium",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}
                title={isCollapsed ? item.name : ''}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="transition-opacity duration-300">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;