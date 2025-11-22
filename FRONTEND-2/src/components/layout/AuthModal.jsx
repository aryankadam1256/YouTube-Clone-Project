import React, { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AuthModal = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('signin'); // 'signin' or 'signup'
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { login, register, isLoading } = useAuth();
    const navigate = useNavigate();

    const [signInData, setSignInData] = useState({
        username: '',
        password: '',
    });

    const [signUpData, setSignUpData] = useState({
        username: '',
        email: '',
        fullname: '',
        password: '',
        confirmPassword: '',
        avatar: null,
    });

    const [error, setError] = useState('');

    const handleSignIn = async (e) => {
        e.preventDefault();
        setError('');

        if (!signInData.username.trim() || !signInData.password) {
            setError('Please fill in all fields');
            return;
        }

        const result = await login(signInData);
        if (result.success) {
            onClose();
            navigate('/');
        } else {
            setError(result.error);
        }
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');

        if (!signUpData.username.trim() || !signUpData.email.trim() ||
            !signUpData.fullname.trim() || !signUpData.password) {
            setError('Please fill in all required fields');
            return;
        }

        if (signUpData.password !== signUpData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        const result = await register(signUpData);
        if (result.success) {
            onClose();
            navigate('/');
        } else {
            setError(result.error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 transition-colors z-10"
                >
                    <X className="h-5 w-5 text-slate-600" />
                </button>

                {/* Logo */}
                <div className="text-center pt-8 pb-6">
                    <h1 className="bg-gradient-to-r from-brand-blue to-brand-cyan bg-clip-text text-transparent font-bold text-3xl tracking-tight">
                        VidFlow
                    </h1>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200">
                    <button
                        onClick={() => setActiveTab('signin')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'signin'
                                ? 'text-brand-blue border-b-2 border-brand-blue'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => setActiveTab('signup')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'signup'
                                ? 'text-brand-blue border-b-2 border-brand-blue'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        Sign Up
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {activeTab === 'signin' ? (
                        <form onSubmit={handleSignIn} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Username or Email
                                </label>
                                <input
                                    type="text"
                                    value={signInData.username}
                                    onChange={(e) => setSignInData({ ...signInData, username: e.target.value })}
                                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all"
                                    placeholder="Enter your username or email"
                                    disabled={isLoading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={signInData.password}
                                        onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                                        className="w-full h-10 px-3 pr-10 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all"
                                        placeholder="Enter your password"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 rounded-lg bg-error/10 text-error text-sm">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-11 rounded-xl bg-brand-gradient text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Signing In...' : 'Sign In'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleSignUp} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Username *
                                </label>
                                <input
                                    type="text"
                                    value={signUpData.username}
                                    onChange={(e) => setSignUpData({ ...signUpData, username: e.target.value })}
                                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                                    placeholder="Choose a username"
                                    disabled={isLoading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    value={signUpData.email}
                                    onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                                    placeholder="Enter your email"
                                    disabled={isLoading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    value={signUpData.fullname}
                                    onChange={(e) => setSignUpData({ ...signUpData, fullname: e.target.value })}
                                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                                    placeholder="Enter your full name"
                                    disabled={isLoading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Password *
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={signUpData.password}
                                        onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                                        className="w-full h-10 px-3 pr-10 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                                        placeholder="Create a password"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Confirm Password *
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={signUpData.confirmPassword}
                                        onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                                        className="w-full h-10 px-3 pr-10 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                                        placeholder="Confirm your password"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Avatar Image
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setSignUpData({ ...signUpData, avatar: e.target.files[0] })}
                                    className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                                    disabled={isLoading}
                                />
                            </div>

                            {error && (
                                <div className="p-3 rounded-lg bg-error/10 text-error text-sm">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-11 rounded-xl bg-brand-gradient text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
