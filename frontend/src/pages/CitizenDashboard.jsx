import React, { useState, useEffect, useContext } from 'react';
import Navbar from '../components/Navbar';
import StatsBar from '../components/StatsBar';
import CommunityFeed from '../components/CommunityFeed';
import ReportIssueModal from '../components/ReportIssueModal';
import api from '../api';
import { Camera, Plus, FileText, TrendingUp, Eye, MapPin, Download } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const CitizenDashboard = () => {
    const { user } = useContext(AuthContext);
    const [issues, setIssues] = useState([]);
    const [userIssues, setUserIssues] = useState([]);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => { 
        fetchIssues(); 
        fetchUserIssues();
    }, []);

    const fetchIssues = async () => {
        try {
            const res = await api.get('issues/');
            setIssues(res.data);
        } catch (err) { console.error('Failed to fetch issues', err); }
    };

    const fetchUserIssues = async () => {
        try {
            const res = await api.get('issues/my/');
            setUserIssues(res.data);
        } catch (err) { console.error('Failed to fetch user issues', err); }
    };

    const handleSubmitReport = async (formData) => {
        try {
            await api.post('issues/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setShowModal(false);
            fetchIssues();
            fetchUserIssues();
        } catch (err) { alert('Failed to report issue.'); }
    };

    const totalComplaints = issues.length;
    const resolvedCount = issues.filter(i => i.status === 'resolved').length;
    const pendingCount = issues.filter(i => i.status === 'pending').length;

    // User Specific Stats
    const userTotalComplaints = userIssues.length;
    const userResolvedCount = userIssues.filter(i => i.status === 'resolved').length;
    const userPendingCount = userIssues.filter(i => i.status === 'pending').length;

    const stats = [
        { icon: <FileText size={28} />, value: totalComplaints, label: 'Total Complaints', color: '#93c5fd' },
        { icon: <TrendingUp size={28} />, value: resolvedCount, label: 'Resolved Issues', color: '#86efac' },
        { icon: <Eye size={28} />, value: pendingCount, label: 'Pending Review', color: '#fdba74' },
    ];

    const username = user?.email ? user.email.split('@')[0] : 'Citizen';
    const initial = username.charAt(0).toUpperCase();

    return (
        <div className="dashboard-bg">
            <Navbar />

            <div className="citizen-layout">
                {/* LEFT SIDEBAR: Profile & Personal Insights */}
                <div className="left-sidebar">
                    {/* Keep Profile as Base */}
                    <div style={{ padding: '2rem 1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-from), var(--accent-to))', color: '#194342', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 700, margin: '0 auto 1.25rem', boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}>
                            {initial}
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-white)', margin: '0' }}>Hii {username}!</h3>
                    </div>

                    {/* Smart Location Card */}
                    <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.06)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-white)', fontWeight: 700, fontSize: '0.95rem' }}>
                            <MapPin size={16} color="#86efac" /> Whitefield, Bangalore
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-white-muted)', paddingLeft: '24px' }}>Moderate issue activity in your area</span>
                    </div>

                    {/* Personal Summary */}
                    <div style={{ padding: '0 0.5rem' }}>
                        <h4 style={{ fontSize: '0.85rem', color: 'var(--text-white-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', fontWeight: 600 }}>Your Activity</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-white-soft)' }}>
                                <span>Complaints Reported:</span>
                                <strong style={{ color: 'var(--text-white)' }}>{userTotalComplaints}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-white-soft)' }}>
                                <span>Resolved:</span>
                                <strong style={{ color: '#86efac' }}>{userResolvedCount}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-white-soft)' }}>
                                <span>Pending:</span>
                                <strong style={{ color: '#fdba74' }}>{userPendingCount}</strong>
                            </div>
                        </div>
                    </div>

                    {/* Primary Action */}
                    <button className="btn-primary" onClick={() => setShowModal(true)} style={{ width: '100%', justifyContent: 'center', padding: '14px', borderRadius: '100px', margin: '0.5rem 0' }}>
                        <Plus size={16} /> Report New Issue
                    </button>

                    {/* Recent Activity */}
                    {userIssues.length > 0 && (
                        <div style={{ padding: '0 0.5rem', marginTop: 'auto' }}>
                            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-white-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', fontWeight: 600 }}>Recent Actions</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {userIssues.slice(0, 3).map((issue, idx) => (
                                    <div key={issue.id || idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-white-muted)', marginTop: '6px', flexShrink: 0 }} />
                                        <div style={{ fontSize: '0.85rem' }}>
                                            <div style={{ color: 'var(--text-white)', fontWeight: 500, marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{issue.title}</div>
                                            <div style={{ color: 'var(--text-white-muted)', fontSize: '0.75rem', textTransform: 'capitalize' }}>{issue.status.replace('_', ' ')} &middot; {issue.created_at ? new Date(issue.created_at).toLocaleDateString() : 'Recently'}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* CENTER: Main Feed */}
                <div className="center-content">
                    <CommunityFeed issues={issues} />
                </div>

                {/* RIGHT SIDEBAR: Actions & Stats */}
                <div className="right-sidebar">
                    {/* Hero Action Card */}
                    <div className="action-card glass">
                        <h3>Report Issues in Your Community</h3>
                        <p>Take photos, add descriptions, and track the progress of your complaints.</p>
                        <div className="action-buttons">
                            <button className="btn-primary" onClick={() => setShowModal(true)} style={{ width: '100%', justifyContent: 'center', padding: '16px' }}>
                                <Plus size={18} /> Add Complaint
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <StatsBar stats={stats} />
                </div>
            </div>

            <ReportIssueModal isOpen={showModal} onClose={() => setShowModal(false)} onSubmit={handleSubmitReport} />
        </div>
    );
};

export default CitizenDashboard;
