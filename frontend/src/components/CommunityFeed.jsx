import React from 'react';
import { MapPin, Camera, Check, X, Play, CheckCircle } from 'lucide-react';

const getTimeAgo = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
};

const CommunityFeed = ({ issues, isAdmin = false, onStatusChange, emptyTitle, emptyDesc }) => {
    return (
        <div>
            <div className="section-header">
                <h2>{isAdmin ? 'Complaint Management' : 'Community Feed'}</h2>
                <p>{isAdmin ? 'Manage and update incoming reports' : 'Recent complaints from your community'}</p>
            </div>

            <div className="feed-list">
                {issues.length === 0 ? (
                    <div className="empty-state">
                        <Camera size={48} />
                        <h3>{emptyTitle || "No issues reported yet"}</h3>
                        <p>{emptyDesc || (isAdmin ? 'No pending issues to manage.' : 'Be the first to report an issue in your community.')}</p>
                    </div>
                ) : (
                    issues.map((issue, idx) => (
                        <div key={issue.id} className="complaint-card" style={{ animationDelay: `${idx * 0.05}s` }}>
                            <div className="complaint-card-header">
                                <div className="avatar">
                                    {(issue.reporter_name || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div className="complaint-card-info">
                                    <h3>{issue.title}</h3>
                                    <div className="complaint-card-meta">
                                        by {issue.reporter_name || 'Unknown'} • {getTimeAgo(issue.created_at)}
                                    </div>
                                    <div className="complaint-card-location">
                                        <MapPin size={12} />
                                        <span>{issue.lat}, {issue.lng}</span>
                                    </div>
                                </div>
                                <span className={`badge ${issue.status}`}>
                                    {issue.status.replace('_', ' ')}
                                </span>
                            </div>

                            <div className="complaint-card-desc">
                                {issue.description}
                            </div>

                            {issue.photo && (
                                <img
                                    src={`http://localhost:8000${issue.photo}`}
                                    alt={issue.title}
                                    className="complaint-card-photo"
                                />
                            )}

                            <div className="complaint-card-footer flex-wrap">
                                <span className="badge-category">{issue.category}</span>
                                
                                {isAdmin && onStatusChange && (
                                    <div className="quick-action-row !mt-0">
                                        {issue.status === 'pending' && (
                                            <>
                                                <button className="quick-action-btn approve" onClick={() => onStatusChange(issue.id, 'verified')}>
                                                    <Check size={14} /> Verify
                                                </button>
                                                <button className="quick-action-btn reject" onClick={() => onStatusChange(issue.id, 'rejected')}>
                                                    <X size={14} /> Reject
                                                </button>
                                            </>
                                        )}
                                        {issue.status === 'verified' && (
                                            <button className="quick-action-btn resolve" onClick={() => onStatusChange(issue.id, 'in_progress')}>
                                                <Play size={14} /> Start
                                            </button>
                                        )}
                                        {issue.status === 'in_progress' && (
                                            <button className="quick-action-btn approve" onClick={() => onStatusChange(issue.id, 'resolved')}>
                                                <CheckCircle size={14} /> Resolve
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CommunityFeed;
