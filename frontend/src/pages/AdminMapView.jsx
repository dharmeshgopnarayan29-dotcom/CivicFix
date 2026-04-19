import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import MapView from '../components/MapView';
import api from '../api';

const AdminMapView = () => {
    const [issues, setIssues] = useState([]);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const res = await api.get('issues/');
            setIssues(res.data);
        } catch (err) { console.error(err); }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.patch(`issues/${id}/`, { status });
            fetchData();
        } catch (err) { alert('Status update failed'); }
    };

    return (
        <div className="dashboard-bg">
            <Navbar />
            <div className="container-wide">
                <div className="page-header">
                    <h1>Map View</h1>
                    <p className="subtitle">Geographic distribution of complaints</p>
                </div>
                <MapView issues={issues} isAdmin={true} onStatusChange={updateStatus} />
            </div>
        </div>
    );
};

export default AdminMapView;
