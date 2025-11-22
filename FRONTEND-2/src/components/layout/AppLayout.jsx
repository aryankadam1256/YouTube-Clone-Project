import React, { useState } from 'react';
import TopNavbar from './TopNavbar';
import AppSidebar from './AppSidebar';
import AuthModal from './AuthModal';

const AppLayout = ({ children }) => {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
            {/* Top Navbar */}
            <TopNavbar onAuthModalOpen={() => setIsAuthModalOpen(true)} />

            {/* Main Layout */}
            <div className="flex">
                {/* Sidebar */}
                <AppSidebar />

                {/* Main Content */}
                <main className="flex-1 lg:ml-64 pt-6 pb-12 px-4 lg:px-8">
                    <div className="max-w-[1800px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>

            {/* Auth Modal */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </div>
    );
};

export default AppLayout;
