import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { MapPin } from 'lucide-react';

const Login = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const role = await login(formData.email, formData.password);
            navigate(role === 'admin' ? '/admin' : '/dashboard');
        } catch (err) {
            alert('Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen font-inherit">
            {/* LEFT: City Image Panel */}
            <div className="flex-1 relative bg-[url('/Background.png')] bg-cover bg-center bg-no-repeat flex flex-col justify-end p-12 overflow-hidden min-h-screen">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-[rgba(80,60,180,0.15)] to-[rgba(40,20,80,0.55)] z-[1]" />
                {/* Branding */}
                <div className="relative z-[2]">
                    <div className="flex items-center gap-2.5 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-[10px] flex items-center justify-center">
                            <MapPin size={22} color="white" />
                        </div>
                        <span className="text-[1.5rem] font-extrabold text-white tracking-[-0.5px]">CivicFix</span>
                    </div>
                    <h2 className="text-[2rem] font-bold text-white mb-3 leading-[1.2]">
                        City Explorer<br />& Reporter
                    </h2>
                    <p className="text-white/75 text-base max-w-[380px] leading-relaxed">
                        Report city issues, track complaints, and improve your community together.
                    </p>
                </div>
            </div>

            {/* RIGHT: Glass Form Panel */}
            <div className="w-[480px] shrink-0 bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#8E54E9] flex items-center justify-center py-12 px-8 relative">
                {/* Glass card */}
                <div className="w-full max-w-[380px] bg-white/10 backdrop-blur-[24px] border border-white/20 rounded-[28px] p-10 shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
                    <h2 className="text-[1.6rem] font-bold text-center mb-1.5 text-white">
                        Welcome Back
                    </h2>
                    <p className="text-center text-white/60 text-[0.9rem] mb-8">
                        Sign in to your CivicFix account
                    </p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-[0.8rem] font-medium text-white/70 mb-1.5">Email Address</label>
                            <input
                                className="w-full py-3 px-4 bg-white/10 border border-white/15 rounded-xl text-white text-[0.9rem] font-inherit outline-none box-border"
                                type="email" placeholder="you@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})} required
                            />
                        </div>
                        <div>
                            <label className="block text-[0.8rem] font-medium text-white/70 mb-1.5">Password</label>
                            <input
                                className="w-full py-3 px-4 bg-white/10 border border-white/15 rounded-xl text-white text-[0.9rem] font-inherit outline-none box-border"
                                type="password" placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})} required
                            />
                        </div>

                        <button type="submit" disabled={loading} className={`mt-2 w-full py-3 bg-gradient-to-br from-[#194342] to-[#DAE8B3] text-white border-none rounded-xl font-bold text-base cursor-pointer font-inherit transition-all duration-300 shadow-[0_4px_20px_rgba(25,67,66,0.4)] ${loading ? 'opacity-70' : 'opacity-100'}`}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>

                        <p className="text-center text-white/60 text-[0.875rem] mt-2">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-[#DAE8B3] no-underline font-semibold">Sign up</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
