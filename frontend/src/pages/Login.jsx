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
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            {/* LEFT: City Image Panel */}
            <div style={{
                flex: 1,
                position: 'relative',
                backgroundImage: 'url(/Background.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '3rem',
                overflow: 'hidden',
                minHeight: '100vh',
            }}>
                {/* Gradient overlay */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'linear-gradient(to bottom, rgba(80,60,180,0.15) 0%, rgba(40,20,80,0.55) 100%)',
                    zIndex: 1,
                }} />
                {/* Branding */}
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <MapPin size={22} color="white" />
                        </div>
                        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>CivicFix</span>
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'white', marginBottom: '0.75rem', lineHeight: 1.2 }}>
                        City Explorer<br />& Reporter
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1rem', maxWidth: '380px', lineHeight: 1.6 }}>
                        Report city issues, track complaints, and improve your community together.
                    </p>
                </div>
            </div>

            {/* RIGHT: Glass Form Panel */}
            <div style={{
                width: '480px',
                flexShrink: 0,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 60%, #8E54E9 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3rem 2rem',
                position: 'relative',
            }}>
                {/* Glass card */}
                <div style={{
                    width: '100%',
                    maxWidth: '380px',
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '28px',
                    padding: '2.5rem',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                }}>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 700, textAlign: 'center', marginBottom: '0.4rem', color: 'white' }}>
                        Welcome Back
                    </h2>
                    <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                        Sign in to your CivicFix account
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginBottom: '6px' }}>Email Address</label>
                            <input
                                style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '14px', color: 'white', fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                                type="email" placeholder="you@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})} required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginBottom: '6px' }}>Password</label>
                            <input
                                style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '14px', color: 'white', fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                                type="password" placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})} required
                            />
                        </div>

                        <button type="submit" disabled={loading} style={{
                            marginTop: '0.5rem', width: '100%', padding: '13px',
                            background: 'linear-gradient(135deg, #194342, #DAE8B3)',
                            color: 'white', border: 'none', borderRadius: '14px',
                            fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
                            fontFamily: 'inherit', transition: 'all 0.3s ease',
                            boxShadow: '0 4px 20px rgba(25,67,66,0.4)',
                            opacity: loading ? 0.7 : 1,
                        }}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>

                        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                            Don't have an account?{' '}
                            <Link to="/signup" style={{ color: '#DAE8B3', textDecoration: 'none', fontWeight: 600 }}>Sign up</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
