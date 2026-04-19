import React, { useContext } from 'react';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Shield, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="dashboard-bg">
            <Navbar />
            <div className="container" style={{ maxWidth: '600px' }}>
                <div className="page-header">
                    <h1>My Profile</h1>
                    <p className="subtitle">Manage your account settings</p>
                </div>

                <div className="profile-card">
                    <div className="profile-avatar">
                        {(user?.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '4px' }}>{user?.email}</h2>
                    <span className={`badge ${user?.role === 'admin' ? 'verified' : 'pending'}`} style={{ marginBottom: '1.5rem' }}>
                        {user?.role}
                    </span>

                    <div style={{ textAlign: 'left', marginTop: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                            <Mail size={20} color="var(--text-light)" />
                            <div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email</div>
                                <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>{user?.email}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                            <Shield size={20} color="var(--text-light)" />
                            <div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Role</div>
                                <div style={{ fontSize: '0.95rem', fontWeight: 500, textTransform: 'capitalize' }}>{user?.role}</div>
                            </div>
                        </div>
                    </div>

                    <button className="btn-primary" onClick={handleLogout} style={{ marginTop: '2rem', width: '100%', background: 'var(--danger)' }}>
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
