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

    const inputStyle = {
        width: '100%', padding: '12px 16px',
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '14px', color: 'white',
        fontSize: '0.9rem', fontFamily: 'inherit',
        outline: 'none', boxSizing: 'border-box',
    };
    const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginBottom: '6px' };

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
                        Join Your<br />Community
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1rem', maxWidth: '380px', lineHeight: 1.6 }}>
                        Create an account and start reporting civic issues to make your city better.
                    </p>
                    {/* Feature pills */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '1.5rem' }}>
                        {['📍 Report issues instantly', '🗺️ Track on interactive map', '🔔 Get real-time updates'].map(f => (
                            <div key={f} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', borderRadius: '100px', padding: '8px 16px', fontSize: '0.85rem', color: 'white', width: 'fit-content' }}>
                                {f}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT: Glass Form Panel */}
            <div style={{
                width: '500px',
                flexShrink: 0,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 60%, #8E54E9 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3rem 2rem',
            }}>
                <div style={{
                    width: '100%', maxWidth: '400px',
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '28px',
                    padding: '2.5rem',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                }}>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 700, textAlign: 'center', marginBottom: '0.4rem', color: 'white' }}>
                        Create Account
                    </h2>
                    <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                        Join CivicFix today
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        <div>
                            <label style={labelStyle}>Display Name</label>
                            <input style={inputStyle} type="text" placeholder="John Doe" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} required />
                        </div>
                        <div>
                            <label style={labelStyle}>Email Address</label>
                            <input style={inputStyle} type="email" placeholder="you@example.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                        </div>
                        <div>
                            <label style={labelStyle}>Password</label>
                            <input style={inputStyle} type="password" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                        </div>
                        <div>
                            <label style={labelStyle}>I am a</label>
                            <select style={{ ...inputStyle, cursor: 'pointer' }} value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                                <option value="citizen" style={{ background: '#4a2d8a' }}>Citizen</option>
                                <option value="admin" style={{ background: '#4a2d8a' }}>Admin</option>
                            </select>
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
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>

                        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                            Already have an account?{' '}
                            <Link to="/login" style={{ color: '#DAE8B3', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Signup;
