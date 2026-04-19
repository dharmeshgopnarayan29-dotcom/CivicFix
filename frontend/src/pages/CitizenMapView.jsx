import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import MapView from '../components/MapView';
import { MapPin } from 'lucide-react';
import api from '../api';

const CitizenMapView = () => {
    const [issues, setIssues] = useState([]);
    const [userLocation, setUserLocation] = useState(null);

    useEffect(() => {
        const fetchIssues = async () => {
            try {
                const res = await api.get('issues/');
                setIssues(res.data);
            } catch (err) {
                console.error('Failed to fetch', err);
            }
        };
        fetchIssues();
    }, []);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    try {
                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                        const data = await res.json();
                        const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || 'Unknown Location';
                        const suburb = data.address?.suburb || data.address?.neighbourhood || '';
                        const name = suburb ? `${suburb}, ${city}` : city;
                        setUserLocation({ lat, lng, name });
                    } catch (error) {
                        setUserLocation({ lat, lng, name: 'Your Location' });
                    }
                },
                (error) => {
                    console.log('Geolocation failed or denied. Using default location (Whitefield).');
                    setUserLocation({ lat: 12.9698, lng: 77.7499, name: 'Whitefield, Bangalore' });
                }
            );
        } else {
            setUserLocation({ lat: 12.9698, lng: 77.7499, name: 'Whitefield, Bangalore' });
        }
    }, []);

    return (
        <div className="dashboard-bg">
            <Navbar />
            <div className="container-wide">
                <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-white)' }}>Map View</h1>
                        <p className="subtitle" style={{ color: 'var(--text-white-muted)' }}>Geographic distribution of complaints in your area</p>
                    </div>
                    {userLocation && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.08)', padding: '10px 20px', borderRadius: '100px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 8px 25px rgba(0,0,0,0.15)' }}>
                            <MapPin size={18} color="#86efac" />
                            <span style={{ fontWeight: 600, color: 'var(--text-white)', fontSize: '0.95rem' }}>{userLocation.name}</span>
                        </div>
                    )}
                </div>
                <MapView issues={issues} isAdmin={false} userLocation={userLocation} />
            </div>
        </div>
    );
};

export default CitizenMapView;
