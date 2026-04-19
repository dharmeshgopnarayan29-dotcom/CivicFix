import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { MapPin } from 'lucide-react';

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'citizen' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('users/register/', formData);
            navigate('/login');
        } catch (err) {
            alert('Registration failed. Please check your inputs or try a different email.');
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
                        Join Your<br />Community
                    </h2>
                    <p className="text-white/75 text-base max-w-[380px] leading-relaxed">
                        Create an account and start reporting civic issues to make your city better.
                    </p>
                    {/* Feature pills */}
                    <div className="flex flex-col gap-2.5 mt-6">
                        {['📍 Report issues instantly', '🗺️ Track on interactive map', '🔔 Get real-time updates'].map(f => (
                            <div key={f} className="inline-flex items-center gap-2 bg-white/12 backdrop-blur-[10px] rounded-full py-2 px-4 text-[0.85rem] text-white w-fit">
                                {f}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT: Glass Form Panel */}
            <div className="w-[500px] shrink-0 bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#8E54E9] flex items-center justify-center py-12 px-8 relative">
                <div className="w-full max-w-[400px] bg-white/10 backdrop-blur-[24px] border border-white/20 rounded-[28px] p-10 shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
                    <h2 className="text-[1.6rem] font-bold text-center mb-1.5 text-white">
                        Create Account
                    </h2>
                    <p className="text-center text-white/60 text-[0.9rem] mb-8">
                        Join CivicFix today
                    </p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-[0.85rem]">
                        <div>
                            <label className="block text-[0.8rem] font-medium text-white/70 mb-1.5">Display Name</label>
                            <input className="w-full py-3 px-4 bg-white/10 border border-white/15 rounded-xl text-white text-[0.9rem] font-inherit outline-none box-border" type="text" placeholder="John Doe" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} required />
                        </div>
                        <div>
                            <label className="block text-[0.8rem] font-medium text-white/70 mb-1.5">Email Address</label>
                            <input className="w-full py-3 px-4 bg-white/10 border border-white/15 rounded-xl text-white text-[0.9rem] font-inherit outline-none box-border" type="email" placeholder="you@example.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                        </div>
                        <div>
                            <label className="block text-[0.8rem] font-medium text-white/70 mb-1.5">Password</label>
                            <input className="w-full py-3 px-4 bg-white/10 border border-white/15 rounded-xl text-white text-[0.9rem] font-inherit outline-none box-border" type="password" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                        </div>
                        <div>
                            <label className="block text-[0.8rem] font-medium text-white/70 mb-1.5">I am a</label>
                            <select className="w-full py-3 px-4 bg-white/10 border border-white/15 rounded-xl text-white text-[0.9rem] font-inherit outline-none box-border cursor-pointer" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                                <option value="citizen" className="bg-[#4a2d8a]">Citizen</option>
                                <option value="admin" className="bg-[#4a2d8a]">Admin</option>
                            </select>
                        </div>

                        <button type="submit" disabled={loading} className={`mt-2 w-full py-3 bg-gradient-to-br from-[#194342] to-[#DAE8B3] text-white border-none rounded-xl font-bold text-base cursor-pointer font-inherit transition-all duration-300 shadow-[0_4px_20px_rgba(25,67,66,0.4)] ${loading ? 'opacity-70' : 'opacity-100'}`}>
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>

                        <p className="text-center text-white/60 text-[0.875rem] mt-1">
                            Already have an account?{' '}
                            <Link to="/login" className="text-[#DAE8B3] no-underline font-semibold">Sign in</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Signup;
