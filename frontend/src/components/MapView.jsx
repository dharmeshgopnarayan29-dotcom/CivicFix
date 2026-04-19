import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Filter, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

const createColoredIcon = (color) => {
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="
            width: 16px; height: 16px; border-radius: 50%;
            background: ${color}; border: 2.5px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        popupAnchor: [0, -10],
    });
};

const priorityColors = {
    pending: '#ef4444',     // Immediate (Red)
    in_progress: '#f97316', // High (Orange)
    verified: '#eab308',    // Medium (Yellow)
    resolved: '#22c55e',    // Low/Resolved (Green)
    rejected: '#6b7280',
};

// Haversine distance calculation
const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        0.5 - Math.cos(dLat)/2 + 
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        (1 - Math.cos(dLon))/2;
    return R * 2 * Math.asin(Math.sqrt(a));
};

const UpdateMapCenter = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) map.setView(center, 13);
    }, [center, map]);
    return null;
};

const MapView = ({ issues, isAdmin = false, onStatusChange, userLocation }) => {
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterRadius, setFilterRadius] = useState(5); // Default 5km radius

    // Calculate distances and apply filters
    const issuesWithDistance = issues.map(iss => {
        const distance = userLocation ? getDistance(userLocation.lat, userLocation.lng, parseFloat(iss.lat), parseFloat(iss.lng)) : null;
        return { ...iss, distance };
    });

    const filteredIssues = issuesWithDistance.filter(iss => {
        if (filterStatus !== 'all' && iss.status !== filterStatus) return false;
        if (filterRadius !== 'all' && iss.distance !== null && iss.distance > filterRadius) return false;
        return true;
    });

    const center = userLocation ? [userLocation.lat, userLocation.lng] : (issues.length > 0 ? [parseFloat(issues[0].lat), parseFloat(issues[0].lng)] : [28.6139, 77.2090]);

    const statusCounts = {
        total: filteredIssues.length,
        pending: filteredIssues.filter(i => i.status === 'pending').length,
        in_progress: filteredIssues.filter(i => i.status === 'in_progress').length,
        resolved: filteredIssues.filter(i => i.status === 'resolved').length,
    };
    
    // Determine Area Status
    const areaStatus = statusCounts.pending > 5 ? 'high' : 'good';

    return (
        <div>
            <div className="map-view-layout">
                {/* Map */}
                <div className="glass" style={{ padding: 0, overflow: 'hidden', position: 'relative', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '24px', boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }}>
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-white)' }}>Complaint Locations</h3>
                    </div>
                    <div style={{ height: '550px', position: 'relative' }}>
                        <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                            <UpdateMapCenter center={center} />
                            {userLocation && (
                                <Marker position={[userLocation.lat, userLocation.lng]} icon={createColoredIcon('#8b5cf6')}>
                                    <Popup><b>You are here</b><br/>{userLocation.name}</Popup>
                                </Marker>
                            )}
                            {filteredIssues.map(iss => (
                                <Marker
                                    key={iss.id}
                                    position={[parseFloat(iss.lat), parseFloat(iss.lng)]}
                                    icon={createColoredIcon(priorityColors[iss.status] || '#6b7280')}
                                    eventHandlers={{ click: () => setSelectedIssue(iss) }}
                                >
                                    <Popup>
                                        <b>{iss.title}</b><br/>
                                        {iss.distance !== null && <span style={{fontSize: '0.8rem', color: '#666'}}>{iss.distance.toFixed(1)} km away<br/></span>}
                                        <span className={`badge ${iss.status}`}>{iss.status.replace('_', ' ')}</span>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>

                        {/* Floating CTA */}
                        {!isAdmin && (
                            <button className="btn-primary" style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 500, padding: '12px 24px', borderRadius: '100px', boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}>
                                <Plus size={18} /> Report Issue Near Me
                            </button>
                        )}

                        {/* Priority Legend */}
                        <div className="priority-legend" style={{ position: 'absolute', bottom: '20px', left: '20px', zIndex: 400, background: 'rgba(15,10,35,0.85)', backdropFilter: 'blur(16px)', borderRadius: '16px', padding: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text-white)' }}>Priority Levels</h4>
                            <div className="legend-item"><div className="legend-dot" style={{ background: '#ef4444' }}></div> Immediate</div>
                            <div className="legend-item"><div className="legend-dot" style={{ background: '#f97316' }}></div> High</div>
                            <div className="legend-item"><div className="legend-dot" style={{ background: '#eab308' }}></div> Medium</div>
                            <div className="legend-item"><div className="legend-dot" style={{ background: '#22c55e' }}></div> Low</div>
                        </div>
                    </div>
                </div>

                {/* Side Panel */}
                {/* Side Panel */}
                <div className="map-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Area Summary / Nearby Insights Panel */}
                    <div className="area-summary" style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 12px 30px rgba(0,0,0,0.15)' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-white)' }}>
                            Nearby Insights {userLocation && <span style={{ fontWeight: 400, opacity: 0.7, fontSize: '0.85rem' }}><br/>({userLocation.name})</span>}
                        </h3>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '12px', background: areaStatus === 'high' ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)', border: `1px solid ${areaStatus === 'high' ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`, marginBottom: '1.5rem' }}>
                            {areaStatus === 'high' ? <AlertCircle size={20} color="#fca5a5" /> : <CheckCircle2 size={20} color="#86efac" />}
                            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: areaStatus === 'high' ? '#fca5a5' : '#86efac' }}>
                                {areaStatus === 'high' ? '⚠️ High issue activity in your area' : '✅ Area is mostly resolved'}
                            </span>
                        </div>

                        <div className="summary-row" style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <span className="label" style={{ color: 'var(--text-white-muted)' }}>Total Nearby:</span>
                            <span className="value" style={{ fontWeight: 800, fontSize: '1.1rem', color: '#93c5fd' }}>{statusCounts.total}</span>
                        </div>
                        <div className="summary-row" style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <span className="label" style={{ color: 'var(--text-white-muted)' }}>Immediate:</span>
                            <span className="value red" style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fca5a5' }}>{statusCounts.pending}</span>
                        </div>
                        <div className="summary-row" style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <span className="label" style={{ color: 'var(--text-white-muted)' }}>Pending:</span>
                            <span className="value orange" style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fdba74' }}>{statusCounts.in_progress}</span>
                        </div>
                        <div className="summary-row" style={{ padding: '10px 0' }}>
                            <span className="label" style={{ color: 'var(--text-white-muted)' }}>Resolved:</span>
                            <span className="value green" style={{ fontWeight: 800, fontSize: '1.1rem', color: '#86efac' }}>{statusCounts.resolved}</span>
                        </div>
                    </div>

                    {/* Selected Complaint Detail */}
                    <div className="detail-panel" style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 12px 30px rgba(0,0,0,0.15)', flex: 1 }}>
                        {selectedIssue ? (
                            <div style={{ textAlign: 'left' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-white)' }}>{selectedIssue.title}</h3>
                                
                                {selectedIssue.distance !== null && (
                                    <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-white)', marginBottom: '1rem' }}>
                                        📍 {selectedIssue.distance.toFixed(1)} km away
                                    </div>
                                )}
                                
                                <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                                    {selectedIssue.description}
                                </p>
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '1rem' }}>
                                    <span className={`badge ${selectedIssue.status}`}>{selectedIssue.status.replace('_', ' ')}</span>
                                    <span className="badge-category" style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '100px', color: 'var(--text-white-soft)', fontSize: '0.8rem' }}>{selectedIssue.category}</span>
                                </div>
                                
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-white-muted)' }}>
                                    Reported by: <strong style={{ color: 'var(--text-white)' }}>{selectedIssue.reporter_name || 'Unknown'}</strong><br/>
                                    Time: <strong style={{ color: 'var(--text-white)' }}>{new Date(selectedIssue.created_at).toLocaleString()}</strong>
                                </p>

                                {isAdmin && onStatusChange && (
                                    <select
                                        className="select-field"
                                        style={{ marginTop: '1.5rem', width: '100%', background: 'rgba(20,15,45,0.5)', color: 'white', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)' }}
                                        value={selectedIssue.status}
                                        onChange={(e) => {
                                            onStatusChange(selectedIssue.id, e.target.value);
                                            setSelectedIssue({ ...selectedIssue, status: e.target.value });
                                        }}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="verified">Verified</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                )}
                            </div>
                        ) : (
                            <div className="empty-state" style={{ padding: '3rem 0', textAlign: 'center', opacity: 0.7 }}>
                                <MapPin size={48} color="rgba(255,255,255,0.5)" style={{ margin: '0 auto 1rem' }} />
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-white)', marginBottom: '8px' }}>Select a Complaint</h3>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-white-muted)' }}>Click on a pin in the map to view detailed information</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filter-bar" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)', padding: '1rem 1.5rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="filter-label" style={{ color: 'var(--text-white)', fontWeight: 600 }}>
                        <MapPin size={18} />
                        <span>Nearby Filter:</span>
                    </div>
                    <select className="select-field" style={{ width: '120px', padding: '8px 12px', background: 'rgba(20,15,45,0.6)', color: 'white', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)' }} value={filterRadius} onChange={(e) => setFilterRadius(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
                        <option value="1">1 km</option>
                        <option value="3">3 km</option>
                        <option value="5">5 km</option>
                        <option value="10">10 km</option>
                        <option value="all">All Issues</option>
                    </select>
                </div>

                <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)', margin: '0 8px' }}></div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="filter-label" style={{ color: 'var(--text-white)', fontWeight: 600 }}>
                        <Filter size={18} />
                        <span>Status:</span>
                    </div>
                    <select className="select-field" style={{ width: '150px', padding: '8px 12px', background: 'rgba(20,15,45,0.6)', color: 'white', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)' }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="verified">Verified</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default MapView;
