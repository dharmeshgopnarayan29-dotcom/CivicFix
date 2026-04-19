import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api';
import { Search } from 'lucide-react';

const AllComplaints = () => {
    const [issues, setIssues] = useState([]);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

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

    const filtered = issues
        .filter(i => filter === 'all' || i.status === filter)
        .filter(i => i.title.toLowerCase().includes(search.toLowerCase()) || i.reporter_name?.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="dashboard-bg">
            <Navbar />
            <div className="container-wide">
                <div className="page-header">
                    <h1>All Complaints</h1>
                    <p className="subtitle">Manage and triage all reported issues</p>
                </div>

                {/* Search + Filters */}
                <div className="flex gap-4 mb-6 flex-wrap items-center">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-white-muted" />
                        <input className="input-field pl-9" placeholder="Search complaints..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="tabs !mb-0">
                        {['all', 'pending', 'verified', 'in_progress', 'resolved', 'rejected'].map(s => (
                            <button key={s} className={`tab-btn ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
                                {s === 'all' ? 'All' : s.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Reporter</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan="5" className="text-center p-8 text-text-white-muted">No complaints found</td></tr>
                            ) : (
                                filtered.map(iss => (
                                    <tr key={iss.id}>
                                        <td>
                                            <div className="font-medium">{iss.title}</div>
                                            <div className="text-[0.8rem] text-text-white-muted mt-0.5">{iss.description?.substring(0, 60)}...</div>
                                        </td>
                                        <td>{iss.reporter_name || 'Unknown'}</td>
                                        <td className="capitalize">{iss.category}</td>
                                        <td><span className={`badge ${iss.status}`}>{iss.status.replace('_', ' ')}</span></td>
                                        <td>
                                            <select className="select-field w-[130px] py-1.5 px-2.5 text-[0.8rem]" value={iss.status} onChange={e => updateStatus(iss.id, e.target.value)}>
                                                <option value="pending">Pending</option>
                                                <option value="verified">Verified</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="resolved">Resolved</option>
                                                <option value="rejected">Rejected</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AllComplaints;
