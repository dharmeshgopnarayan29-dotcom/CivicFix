import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { publicApi } from '../api';
import { MapPin, Calendar, ThumbsUp, MessageCircle, ArrowLeft, LogIn, User, Tag, ImageIcon } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow });

const PublicIssuePage = () => {
    const { id } = useParams();
    const [issue, setIssue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchIssue = async () => {
            setLoading(true);
            try {
                // Uses publicApi (no credentials/cookies) for unauthenticated access
                const res = await publicApi.get(`issues/public/${id}/`);
                setIssue(res.data);
            } catch (err) {
                console.error('Failed to fetch public issue', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchIssue();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-500 font-medium text-sm">Loading issue...</span>
                </div>
            </div>
        );
    }

    if (error || !issue) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-6">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <MapPin size={32} className="text-gray-300" />
                    </div>
                    <h2 className="text-xl font-bold text-black mb-2">Issue Not Found</h2>
                    <p className="text-gray-500 text-sm mb-6">This issue may have been removed, hidden, or doesn't exist.</p>
                    <Link to="/login" className="inline-flex items-center gap-2 py-2.5 px-5 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors no-underline">
                        <ArrowLeft size={16} /> Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    const hasCoords = issue.lat && issue.lng;
    const photoUrl = issue.photo_url;
    const resolutionPhotoUrl = issue.resolution_photo_url;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Bar */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link to="/login" className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors no-underline text-sm font-medium">
                        <ArrowLeft size={16} /> CivicFix
                    </Link>
                    <Link to="/login" className="flex items-center gap-2 py-2 px-4 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors no-underline">
                        <LogIn size={14} /> Login
                    </Link>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-4 py-8">
                {/* Status Badge + Category */}
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <span className={`badge ${issue.status}`}>{issue.status.replace('_', ' ')}</span>
                    <span className="inline-flex items-center gap-1.5 py-1 px-3 bg-gray-100 text-gray-700 text-xs font-bold rounded-full capitalize">
                        <Tag size={12} /> {issue.category}
                    </span>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-extrabold text-black mb-2 leading-tight">{issue.title}</h1>

                {/* Meta row */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 flex-wrap">
                    <span className="flex items-center gap-1.5">
                        <User size={14} /> {issue.reporter_name || 'Anonymous'}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Calendar size={14} /> {issue.created_at ? new Date(issue.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown date'}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <ThumbsUp size={14} /> {issue.upvote_count || 0} upvotes
                    </span>
                    <span className="flex items-center gap-1.5">
                        <MessageCircle size={14} /> {issue.comment_count || 0} comments
                    </span>
                </div>

                {/* Description */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h3>
                    <p className="text-[0.95rem] text-gray-700 leading-relaxed whitespace-pre-wrap">{issue.description}</p>
                </div>

                {/* Photo */}
                {photoUrl && (
                    <div className="mb-5">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Issue Photo</h3>
                        <img
                            src={photoUrl}
                            alt={issue.title}
                            className="w-full rounded-2xl border border-gray-200 object-cover max-h-[400px]"
                        />
                    </div>
                )}

                {/* Resolution Photo */}
                {resolutionPhotoUrl && (
                    <div className="mb-5">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <ImageIcon size={14} className="text-green-600" /> Resolution Photo
                        </h3>
                        <img
                            src={resolutionPhotoUrl}
                            alt="Resolution"
                            className="w-full rounded-2xl border border-green-200 object-cover max-h-[400px]"
                        />
                    </div>
                )}

                {/* Location */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Location</h3>
                    <div className="flex items-start gap-2 text-sm text-gray-700 mb-3">
                        <MapPin size={16} className="shrink-0 mt-0.5 text-gray-400" />
                        <span>{issue.address || (hasCoords ? `${issue.lat}, ${issue.lng}` : 'Location not available')}</span>
                    </div>
                    {hasCoords && (
                        <div className="h-[250px] rounded-xl overflow-hidden border border-gray-200">
                            <MapContainer
                                center={[parseFloat(issue.lat), parseFloat(issue.lng)]}
                                zoom={15}
                                className="h-full w-full z-[1]"
                                scrollWheelZoom={false}
                            >
                                <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                                <Marker position={[parseFloat(issue.lat), parseFloat(issue.lng)]}>
                                    <Popup><b>{issue.title}</b></Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                    )}
                </div>

                {/* CTA */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
                    <h3 className="text-base font-bold text-black mb-1.5">Want to upvote or comment?</h3>
                    <p className="text-sm text-gray-500 mb-4">Login to interact with issues in your community.</p>
                    <Link to="/login" className="inline-flex items-center gap-2 py-2.5 px-6 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors no-underline">
                        <LogIn size={16} /> Login to Participate
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PublicIssuePage;
