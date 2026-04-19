import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { X, MapPin, Camera, Upload } from 'lucide-react';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

const LocationPicker = ({ position, setPosition }) => {
    useMapEvents({
        click(e) { setPosition(e.latlng); },
    });
    return position ? <Marker position={position} /> : null;
};

const MapUpdater = ({ mapCenter }) => {
    const map = useMap();
    useEffect(() => {
        if (mapCenter) map.flyTo(mapCenter, 15);
    }, [mapCenter, map]);
    return null;
};

const ReportIssueModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({ title: '', description: '', category: 'roads' });
    const [position, setPosition] = useState(null);
    const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]);
    const [photo, setPhoto] = useState(null);

    useEffect(() => {
        if (isOpen && "geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    setPosition(latlng);
                    setMapCenter(latlng);
                },
                () => {}
            );
        }
    }, [isOpen]);

    const handleGetLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    setPosition(latlng);
                    setMapCenter(latlng);
                },
                () => alert("Unable to fetch location. Check browser permissions.")
            );
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!position) return alert("Please pick a location on the map.");

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('category', formData.category);
        data.append('lat', position.lat.toFixed(6));
        data.append('lng', position.lng.toFixed(6));
        if (photo) data.append('photo', photo);

        onSubmit(data);
        setFormData({ title: '', description: '', category: 'roads' });
        setPosition(null);
        setPhoto(null);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Report a New Issue</h2>
                    <button className="modal-close" onClick={onClose}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label>Issue Title</label>
                            <input className="input-field" placeholder="e.g. Large Pothole on Main Street" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea className="textarea-field" rows="3" placeholder="Describe the issue in detail..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-group">
                                <label>Category</label>
                                <select className="select-field" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                                    <option value="roads">Roads</option>
                                    <option value="sanitation">Sanitation</option>
                                    <option value="water">Water</option>
                                    <option value="electricity">Electricity</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Photo (optional)</label>
                                <input type="file" className="input-field p-2" accept="image/*" onChange={e => setPhoto(e.target.files[0])} />
                            </div>
                        </div>
                        <div className="form-group">
                            <div className="flex justify-between items-center mb-2">
                                <label className="!m-0">Pick Location</label>
                                <button type="button" onClick={handleGetLocation} className="btn-secondary btn-sm">
                                    <MapPin size={14} /> Use My Location
                                </button>
                            </div>
                            <div className="h-[200px] rounded-custom-sm overflow-hidden border border-white/15">
                                <MapContainer center={mapCenter} zoom={13} className="h-full">
                                    <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                                    <MapUpdater mapCenter={mapCenter} />
                                    <LocationPicker position={position} setPosition={setPosition} />
                                </MapContainer>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary">
                            <Upload size={16} /> Submit Report
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportIssueModal;
