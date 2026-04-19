import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api';
import { Bookmark, MapPin, Camera } from 'lucide-react';

const SavedProblems = () => {
    const [issues, setIssues] = useState([]);
    const [saved, setSaved] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('issues/');
                setIssues(res.data);
                // Load saved IDs from localStorage
                const savedIds = JSON.parse(localStorage.getItem('savedProblems') || '[]');
                setSaved(savedIds);
            } catch (err) { console.error(err); }
        };
        fetchData();
    }, []);

    const toggleSave = (id) => {
        const updated = saved.includes(id) ? saved.filter(s => s !== id) : [...saved, id];
        setSaved(updated);
        localStorage.setItem('savedProblems', JSON.stringify(updated));
    };

    const savedIssues = issues.filter(i => saved.includes(i.id));

    const updateStatus = async (id, status) => {
        try {
            await api.patch(`issues/${id}/`, { status });
            const res = await api.get('issues/');
            setIssues(res.data);
        } catch (err) { alert('Status update failed'); }
    };

    return (
        <div className="dashboard-bg">
            <Navbar />
            <div className="container" style={{ maxWidth: '900px' }}>
                <div className="page-header">
                    <h1>Saved Problems</h1>
                    <p className="subtitle">Issues you've bookmarked for follow-up</p>
                </div>

                {savedIssues.length === 0 ? (
                    <div className="empty-state">
                        <Bookmark size={48} />
                        <h3>No saved problems</h3>
                        <p>Bookmark issues from All Complaints to track them here</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {savedIssues.map((issue, idx) => (
                            <div key={issue.id} className="complaint-card" style={{ animationDelay: `${idx * 0.05}s` }}>
                                <div className="complaint-card-header">
                                    <div className="avatar" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-white)', border: '1px solid rgba(255,255,255,0.15)' }}>
                                        {(issue.reporter_name || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="complaint-card-info">
                                        <h3>{issue.title}</h3>
                                        <div className="complaint-card-location">
                                            <MapPin size={12} />
                                            <span>{issue.lat}, {issue.lng}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span className={`badge ${issue.status}`}>{issue.status.replace('_', ' ')}</span>
                                        <button onClick={() => toggleSave(issue.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                                            <Bookmark size={18} fill="#f59e0b" color="#f59e0b" />
                                        </button>
                                    </div>
                                </div>
                                <div className="complaint-card-desc">{issue.description}</div>
                                <div className="complaint-card-footer">
                                    <span className="badge-category">{issue.category}</span>
                                    <select className="select-field" style={{ width: '130px', padding: '6px 10px', fontSize: '0.8rem', marginTop: 0 }} value={issue.status} onChange={e => updateStatus(issue.id, e.target.value)}>
                                        <option value="pending">Pending</option>
                                        <option value="verified">Verified</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Show all issues to bookmark */}
                {savedIssues.length < issues.length && (
                    <div style={{ marginTop: '2rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-light)' }}>All Issues — Click bookmark to save</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {issues.filter(i => !saved.includes(i.id)).map(issue => (
                                <div key={issue.id} className="glass-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{issue.title}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{issue.category} • {issue.status.replace('_', ' ')}</div>
                                    </div>
                                    <button onClick={() => toggleSave(issue.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px' }}>
                                        <Bookmark size={18} color="var(--text-muted)" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavedProblems;
