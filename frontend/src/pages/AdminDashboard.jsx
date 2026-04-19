import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import CommunityFeed from '../components/CommunityFeed';
import api from '../api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { AlertTriangle, Clock, Users, CheckCircle2, ArrowUpRight, Minus, Filter, UserPlus, FileText } from 'lucide-react';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow });

const AdminDashboard = () => {
    const [issues, setIssues] = useState([]);
    const [selectedIssueId, setSelectedIssueId] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const res = await api.get('issues/');
            setIssues(res.data);
        } catch (err) {
            console.error('Failed to fetch issues', err);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.patch(`issues/${id}/`, { status });
            fetchData();
            if (selectedIssueId === id) setSelectedIssueId(null);
        } catch (err) {
            alert('Status update failed');
        }
    };

    const immediateCount = issues.filter(i => i.status === 'rejected').length;
    const pendingCount = issues.filter(i => i.status === 'pending').length;
    const assignedCount = issues.filter(i => i.status === 'in_progress' || i.status === 'verified').length;
    const completedCount = issues.filter(i => i.status === 'resolved').length;

    // 2x2 Stats Grid
    const stats = [
        { icon: <AlertTriangle size={28} />, value: immediateCount, label: 'Immediate Attention', color: '#ef4444', trend: '+2', trendType: 'negative' },
        { icon: <Clock size={28} />, value: pendingCount, label: 'Pending Reviews', color: '#f97316', trend: '-5%', trendType: 'positive' },
        { icon: <Users size={28} />, value: assignedCount, label: 'Assigned / Active', color: '#3b82f6', trend: '+12%', trendType: 'positive' },
        { icon: <CheckCircle2 size={28} />, value: completedCount, label: 'Completed', color: '#22c55e', trend: '+8%', trendType: 'positive' },
    ];

    const mapCenter = issues.length > 0
        ? [parseFloat(issues[0].lat), parseFloat(issues[0].lng)]
        : [28.6139, 77.2090];

    const displayedIssues = filter === 'all' ? issues : issues.filter(i => i.status === filter);
    const selectedIssue = issues.find(i => i.id === selectedIssueId);

    return (
        <div className="dashboard-bg">
            <Navbar />

            <div className="container-wide admin-layout" style={{ paddingTop: '100px' }}>
                <div className="page-header" style={{ marginBottom: 0 }}>
                    <h1>Admin Dashboard</h1>
                    <span className="role-badge">Admin</span>
                </div>

                {/* 1. STATS SECTION */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-card" style={{ animationDelay: `${index * 0.05}s` }}>
                            {stat.trend && (
                                <div className={`stat-trend ${stat.trendType}`}>
                                    {stat.trendType === 'positive' && <ArrowUpRight size={14} />}
                                    {stat.trendType === 'negative' && <ArrowUpRight size={14} />}
                                    {stat.trendType === 'neutral' && <Minus size={14} />}
                                    {stat.trend}
                                </div>
                            )}
                            <div className="stat-icon" style={{ color: stat.color || 'white', background: `linear-gradient(135deg, ${stat.color}33, transparent)`, border: `1px solid ${stat.color}44` }}>
                                {stat.icon}
                            </div>
                            <div className="stat-info">
                                <div className="stat-value">{stat.value}</div>
                                <div className="stat-label">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 2. QUICK ACTION FILTER PANEL */}
                <div className="action-panel" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><Filter size={18} /> Filter Issues</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-white-soft)', margin: '4px 0 0 0' }}>Select a status to filter map and feed</p>
                        </div>
                        <select 
                            className="select-field" 
                            style={{ width: '220px', padding: '10px 14px', margin: 0, fontSize: '0.9rem' }}
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="all">View All Issues</option>
                            <option value="pending">Review Pending</option>
                            <option value="verified">Verified (Unassigned)</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>

                    {filter !== 'all' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-white)' }}>
                                Showing <strong style={{ color: 'var(--accent-to)', fontSize: '1.1rem' }}>{displayedIssues.length}</strong> filtered results
                            </div>
                            <button className="btn-secondary btn-sm" style={{ padding: '6px 12px' }} onClick={() => setFilter('all')}>
                                Clear Filter
                            </button>
                        </div>
                    )}
                </div>

                {/* Middle Row: Map Section */}
                <div className="admin-map-panel">
                    <div className="admin-map-container">
                        <MapContainer center={mapCenter} zoom={12} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                            {displayedIssues.map(iss => (
                                <Marker 
                                    key={iss.id} 
                                    position={[parseFloat(iss.lat), parseFloat(iss.lng)]}
                                    eventHandlers={{ click: () => setSelectedIssueId(iss.id) }}
                                >
                                    <Popup><b>{iss.title}</b><br/><span className={`badge ${iss.status}`}>{iss.status.replace('_',' ')}</span></Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                    
                    <div className="admin-issue-details">
                        {selectedIssue ? (
                            <>
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: 700 }}>{selectedIssue.title}</h3>
                                <span className={`badge ${selectedIssue.status}`} style={{ alignSelf: 'flex-start' }}>{selectedIssue.status.replace('_', ' ')}</span>
                                
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-white-soft)', marginTop: '1rem' }}>
                                    <strong style={{ color: 'var(--text-white)' }}>Reported By:</strong> {selectedIssue.reporter_name || 'Anonymous'}<br />
                                    <strong style={{ color: 'var(--text-white)' }}>Category:</strong> {selectedIssue.category}<br />
                                    <strong style={{ color: 'var(--text-white)' }}>Location:</strong> {selectedIssue.lat}, {selectedIssue.lng}
                                </div>
                                
                                <div style={{ fontSize: '0.95rem', lineHeight: '1.6', margin: '1rem 0', color: 'var(--text-white)' }}>
                                    {selectedIssue.description}
                                </div>

                                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <strong style={{ fontSize: '0.8rem', color: 'var(--text-white-muted)', letterSpacing: '1px' }}>ADMIN ACTIONS</strong>
                                    {selectedIssue.status === 'pending' && (
                                        <button className="btn-primary" style={{ padding: '10px', fontSize: '0.9rem', justifyContent: 'center' }} onClick={() => updateStatus(selectedIssue.id, 'verified')}>Approve Issue</button>
                                    )}
                                    {selectedIssue.status === 'verified' && (
                                        <button className="btn-outline" style={{ padding: '10px', fontSize: '0.9rem', justifyContent: 'center' }} onClick={() => updateStatus(selectedIssue.id, 'in_progress')}>Mark In Progress</button>
                                    )}
                                    {selectedIssue.status === 'in_progress' && (
                                        <button className="btn-primary" style={{ padding: '10px', fontSize: '0.9rem', justifyContent: 'center', background: '#22c55e' }} onClick={() => updateStatus(selectedIssue.id, 'resolved')}>Mark Resolved</button>
                                    )}
                                    <button className="btn-secondary" style={{ padding: '10px', fontSize: '0.9rem', justifyContent: 'center' }} onClick={() => setSelectedIssueId(null)}>Close Details</button>
                                </div>
                            </>
                        ) : (
                            <div className="empty-state" style={{ padding: '4rem 1rem' }}>
                                <AlertTriangle size={36} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                                <h3>No Issue Selected</h3>
                                <p style={{ color: 'var(--text-white-soft)' }}>Click on a map marker to view detailed information and manage the report.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. Bottom Row: Feed */}
                <div>
                    <CommunityFeed 
                        issues={displayedIssues} 
                        isAdmin={true} 
                        onStatusChange={updateStatus} 
                        emptyTitle={filter !== 'all' ? "No results found" : "No issues reported yet"}
                        emptyDesc={filter !== 'all' ? `No issues match the "${filter.replace('_', ' ')}" filter.` : "No pending issues to manage."}
                    />
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
