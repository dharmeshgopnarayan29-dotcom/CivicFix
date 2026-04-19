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

            <div className="container-wide admin-layout pt-[100px]">
                <div className="page-header !mb-0">
                    <h1>Admin Dashboard</h1>
                    <span className="role-badge">Admin</span>
                </div>

                {/* 1. STATS SECTION */}
                <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mb-6">
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
                <div className="action-panel flex flex-row items-center justify-between py-4 px-6 mb-8 flex-wrap">
                    <div className="flex items-center gap-5 flex-wrap">
                        <div>
                            <h3 className="text-[1.1rem] !m-0 flex items-center gap-2"><Filter size={18} /> Filter Issues</h3>
                            <p className="text-[0.85rem] text-text-white-soft mt-1 mb-0 mx-0">Select a status to filter map and feed</p>
                        </div>
                        <select 
                            className="select-field w-[220px] py-2.5 px-3.5 !m-0 text-[0.9rem]" 
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
                        <div className="flex items-center gap-4">
                            <div className="text-[0.9rem] text-text-white">
                                Showing <strong className="text-accent-to text-[1.1rem]">{displayedIssues.length}</strong> filtered results
                            </div>
                            <button className="btn-secondary btn-sm py-1.5 px-3" onClick={() => setFilter('all')}>
                                Clear Filter
                            </button>
                        </div>
                    )}
                </div>

                {/* Middle Row: Map Section */}
                <div className="admin-map-panel">
                    <div className="admin-map-container">
                        <MapContainer center={mapCenter} zoom={12} className="h-full w-full z-[1]">
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
                                <h3 className="text-[1.2rem] mb-2 font-bold">{selectedIssue.title}</h3>
                                <span className={`badge ${selectedIssue.status} self-start`}>{selectedIssue.status.replace('_', ' ')}</span>
                                
                                <div className="text-[0.9rem] text-text-white-soft mt-4">
                                    <strong className="text-text-white">Reported By:</strong> {selectedIssue.reporter_name || 'Anonymous'}<br />
                                    <strong className="text-text-white">Category:</strong> {selectedIssue.category}<br />
                                    <strong className="text-text-white">Location:</strong> {selectedIssue.lat}, {selectedIssue.lng}
                                </div>
                                
                                <div className="text-[0.95rem] leading-[1.6] my-4 text-text-white">
                                    {selectedIssue.description}
                                </div>

                                <div className="mt-auto flex flex-col gap-2">
                                    <strong className="text-[0.8rem] text-text-white-muted tracking-[1px]">ADMIN ACTIONS</strong>
                                    {selectedIssue.status === 'pending' && (
                                        <button className="btn-primary p-2.5 text-[0.9rem] justify-center" onClick={() => updateStatus(selectedIssue.id, 'verified')}>Approve Issue</button>
                                    )}
                                    {selectedIssue.status === 'verified' && (
                                        <button className="btn-outline p-2.5 text-[0.9rem] justify-center" onClick={() => updateStatus(selectedIssue.id, 'in_progress')}>Mark In Progress</button>
                                    )}
                                    {selectedIssue.status === 'in_progress' && (
                                        <button className="btn-primary p-2.5 text-[0.9rem] justify-center !bg-green-500" onClick={() => updateStatus(selectedIssue.id, 'resolved')}>Mark Resolved</button>
                                    )}
                                    <button className="btn-secondary p-2.5 text-[0.9rem] justify-center" onClick={() => setSelectedIssueId(null)}>Close Details</button>
                                </div>
                            </>
                        ) : (
                            <div className="empty-state py-16 px-4">
                                <AlertTriangle size={36} className="opacity-50 mb-4" />
                                <h3>No Issue Selected</h3>
                                <p className="text-text-white-soft">Click on a map marker to view detailed information and manage the report.</p>
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
