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
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="modal-body flex flex-col gap-4">
                        <div className="form-group !mb-0">
                            <label className="text-text-white font-semibold mb-2">Issue Title</label>
                            <input className="input-field bg-[rgba(20,10,35,0.4)]" placeholder="e.g. Large Pothole on Main Street" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                        </div>
                        <div className="form-group !mb-0">
                            <label className="text-text-white font-semibold mb-2">Description</label>
                            <textarea className="textarea-field bg-[rgba(20,10,35,0.4)] resize-none" rows="3" placeholder="Describe the issue in detail..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="form-group !mb-0">
                                <label className="text-text-white font-semibold mb-2">Category</label>
                                <select className="select-field bg-[rgba(20,10,35,0.4)]" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                                    <option value="roads">Roads</option>
                                    <option value="sanitation">Sanitation</option>
                                    <option value="water">Water</option>
                                    <option value="electricity">Electricity</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="form-group !mb-0">
                                <label className="text-text-white font-semibold mb-2">Photo (optional)</label>
                                <div className="relative w-full">
                                    <input type="file" id="photo-upload" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept="image/*" onChange={e => setPhoto(e.target.files[0])} />
                                    <div className="flex items-center gap-2 w-full py-2.5 px-3.5 border border-white/15 rounded-custom-sm text-[0.9rem] text-text-white-soft bg-[rgba(20,10,35,0.4)] transition-all duration-200 hover:bg-[rgba(30,20,50,0.6)] hover:border-accent-to/50">
                                        <Camera size={18} className="text-accent-to" />
                                        <span className="truncate">{photo ? photo.name : 'Upload an image...'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="form-group !mb-0 shrink-0">
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-text-white font-semibold !mb-0">Pick Location</label>
                                <button type="button" onClick={handleGetLocation} className="flex items-center gap-1.5 py-1.5 px-3 text-[0.8rem] font-bold rounded-lg border-none bg-blue-500/20 text-blue-300 cursor-pointer transition-all duration-200 hover:bg-blue-500/30">
                                    <MapPin size={14} /> Use My Location
                                </button>
                            </div>
                            <div className="h-[180px] rounded-[16px] overflow-hidden border border-white/20 shadow-[inset_0_4px_20px_rgba(0,0,0,0.3)]">
                                <MapContainer center={mapCenter} zoom={13} className="h-full w-full z-[1]">
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
