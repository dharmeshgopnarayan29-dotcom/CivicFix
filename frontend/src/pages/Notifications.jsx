import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api';
import { Bell, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

const getTimeAgo = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
};

const getNotificationIcon = (status) => {
    switch (status) {
        case 'resolved': return <CheckCircle2 size={20} color="#22c55e" />;
        case 'rejected': return <AlertTriangle size={20} color="#ef4444" />;
        case 'in_progress': return <Info size={20} color="#3b82f6" />;
        default: return <Bell size={20} color="#f97316" />;
    }
};

const Notifications = () => {
    const [issues, setIssues] = useState([]);

    useEffect(() => {
        const fetchIssues = async () => {
            try {
                const res = await api.get('issues/');
                setIssues(res.data.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)));
            } catch (err) {
                console.error('Failed to fetch', err);
            }
        };
        fetchIssues();
    }, []);

    return (
        <div className="dashboard-bg">
            <Navbar />
            <div className="container" style={{ maxWidth: '720px' }}>
                <div className="page-header">
                    <h1>Notifications</h1>
                    <p className="subtitle">Stay updated on your reported issues</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {issues.length === 0 ? (
                        <div className="empty-state">
                            <Bell size={48} />
                            <h3>No notifications yet</h3>
                            <p>You'll be notified when there are updates on your complaints</p>
                        </div>
                    ) : (
                        issues.map((issue, idx) => (
                            <div key={issue.id} className={`notification-card ${issue.status !== 'resolved' ? 'unread' : ''}`} style={{ animationDelay: `${idx * 0.03}s`, animation: 'fadeInUp 0.3s ease forwards' }}>
                                {getNotificationIcon(issue.status)}
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>
                                        {issue.title}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                                        Status changed to <span className={`badge ${issue.status}`} style={{ marginLeft: '4px' }}>{issue.status.replace('_', ' ')}</span>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                                        {getTimeAgo(issue.updated_at)}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notifications;
