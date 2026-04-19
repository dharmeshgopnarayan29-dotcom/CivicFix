import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api';
import { FileBarChart, Download } from 'lucide-react';

const Reports = () => {
    const [issues, setIssues] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('issues/');
                setIssues(res.data);
            } catch (err) { console.error(err); }
        };
        fetchData();
    }, []);

    const total = issues.length;
    const resolved = issues.filter(i => i.status === 'resolved').length;
    const pending = issues.filter(i => i.status === 'pending').length;
    const inProgress = issues.filter(i => i.status === 'in_progress').length;

    // Group by category
    const categoryGroups = {};
    issues.forEach(i => {
        if (!categoryGroups[i.category]) categoryGroups[i.category] = [];
        categoryGroups[i.category].push(i);
    });

    const exportCSV = () => {
        const headers = 'Title,Category,Status,Reporter,Date\n';
        const rows = issues.map(i =>
            `"${i.title}","${i.category}","${i.status}","${i.reporter_name || ''}","${new Date(i.created_at).toLocaleDateString()}"`
        ).join('\n');
        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'civicfix-report.csv';
        a.click();
    };

    return (
        <div className="dashboard-bg">
            <Navbar />
            <div className="container-wide">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div className="page-header" style={{ marginBottom: 0 }}>
                        <h1>Reports</h1>
                        <p className="subtitle">Generate and export reports</p>
                    </div>
                    <button className="btn-primary" onClick={exportCSV}>
                        <Download size={16} /> Export CSV
                    </button>
                </div>

                {/* Summary Table */}
                <div className="table-container" style={{ marginBottom: '1.5rem' }}>
                    <div className="table-header">
                        <h2>Summary Report</h2>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Metric</th>
                                <th>Count</th>
                                <th>Percentage</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td style={{ fontWeight: 500 }}>Total Complaints</td><td>{total}</td><td>100%</td></tr>
                            <tr><td style={{ fontWeight: 500 }}>Resolved</td><td style={{ color: '#22c55e', fontWeight: 600 }}>{resolved}</td><td>{total > 0 ? Math.round((resolved/total)*100) : 0}%</td></tr>
                            <tr><td style={{ fontWeight: 500 }}>Pending</td><td style={{ color: '#f97316', fontWeight: 600 }}>{pending}</td><td>{total > 0 ? Math.round((pending/total)*100) : 0}%</td></tr>
                            <tr><td style={{ fontWeight: 500 }}>In Progress</td><td style={{ color: '#3b82f6', fontWeight: 600 }}>{inProgress}</td><td>{total > 0 ? Math.round((inProgress/total)*100) : 0}%</td></tr>
                        </tbody>
                    </table>
                </div>

                {/* By Category */}
                <div className="table-container">
                    <div className="table-header">
                        <h2>By Category</h2>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Total</th>
                                <th>Resolved</th>
                                <th>Pending</th>
                                <th>Resolution Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(categoryGroups).map(([cat, catIssues]) => {
                                const catResolved = catIssues.filter(i => i.status === 'resolved').length;
                                const catPending = catIssues.filter(i => i.status === 'pending').length;
                                const rate = catIssues.length > 0 ? Math.round((catResolved / catIssues.length) * 100) : 0;
                                return (
                                    <tr key={cat}>
                                        <td style={{ textTransform: 'capitalize', fontWeight: 500 }}>{cat}</td>
                                        <td>{catIssues.length}</td>
                                        <td style={{ color: '#22c55e', fontWeight: 600 }}>{catResolved}</td>
                                        <td style={{ color: '#f97316', fontWeight: 600 }}>{catPending}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                                                    <div style={{ height: '100%', width: `${rate}%`, background: '#22c55e', borderRadius: '3px' }} />
                                                </div>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{rate}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reports;
