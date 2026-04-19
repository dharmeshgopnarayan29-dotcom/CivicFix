import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api';
import { AlertTriangle, CheckCircle2, Clock, TrendingUp, Activity, AlertCircle, ArrowUpRight, ArrowDownRight, Minus, Lightbulb, Info } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const Analytics = () => {
    const [issues, setIssues] = useState([]);
    const [analytics, setAnalytics] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [issRes, anaRes] = await Promise.all([
                    api.get('issues/'),
                    api.get('issues/analytics/')
                ]);
                setIssues(issRes.data);
                setAnalytics(anaRes.data);
            } catch (err) { console.error(err); }
        };
        fetchData();
    }, []);

    const total = issues.length;
    
    const solved = issues.filter(i => i.status === 'resolved').length;
    const pendingCount = issues.filter(i => i.status === 'pending').length;
    const avgResTime = '4.2 days'; 
    const successRate = total > 0 ? Math.round((solved / total) * 100) : 0;

    // Category distribution
    const categoryData = {};
    issues.forEach(i => { categoryData[i.category] = (categoryData[i.category] || 0) + 1; });
    const categoryArray = Object.entries(categoryData)
        .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
        .sort((a, b) => b.value - a.value);
    const topCategoryName = categoryArray.length > 0 ? categoryArray[0].name : 'N/A';

    // Status distribution
    const statusData = {};
    issues.forEach(i => { statusData[i.status] = (statusData[i.status] || 0) + 1; });
    const statusArray = Object.entries(statusData)
        .map(([name, count]) => ({ name: name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()), count }));

    // Time Series Data
    const timeDataMap = {};
    issues.forEach(i => {
        if (!i.created_at) return;
        const dateObj = new Date(i.created_at);
        const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        timeDataMap[dateStr] = (timeDataMap[dateStr] || 0) + 1;
    });
    const timeSeriesArray = Object.entries(timeDataMap).map(([dateStr, count]) => {
        return { dateStr, count, dateObj: new Date(`${dateStr}, ${new Date().getFullYear()}`) };
    }).sort((a, b) => a.dateObj - b.dateObj).map(item => ({ date: item.dateStr, complaints: item.count }));

    // Top Stats with Trend Data
    const topStats = [
        { icon: <AlertTriangle size={28} />, value: total, label: 'Total Problems', color: '#f97316', trend: '+12%', trendType: 'negative' },
        { icon: <CheckCircle2 size={28} />, value: solved, label: 'Solved', color: '#22c55e', trend: '+5%', trendType: 'positive' },
        { icon: <TrendingUp size={28} />, value: `${successRate}%`, label: 'Success Rate', color: '#8b5cf6', trend: '+2%', trendType: 'positive' },
        { icon: <AlertCircle size={28} />, value: pendingCount, label: 'Pending Reviews', color: '#facc15', trend: '-3%', trendType: 'positive' }, 
        { icon: <Activity size={28} />, value: topCategoryName, label: 'Top Category', color: '#ec4899', trend: null, trendType: 'neutral' },
        { icon: <Clock size={28} />, value: avgResTime, label: 'Avg Resolution Time', color: '#3b82f6', trend: '-1 day', trendType: 'positive' },
    ];

    const statusColors = {
        'Pending': '#f97316', 'Verified': '#3b82f6', 'In Progress': '#eab308', 'Resolved': '#22c55e', 'Rejected': '#ef4444'
    };

    const COLORS = ['#3b82f6', '#f97316', '#22c55e', '#eab308', '#8b5cf6', '#ec4899'];

    // Generate Insights
    let insights = [];
    if (total > 0) {
        if (pendingCount > solved) {
            insights.push({ 
                text: <>There are currently more pending issues (<strong className="text-text-white">{pendingCount}</strong>) than resolved ones (<strong className="text-text-white">{solved}</strong>).</>,
                type: 'negative'
            });
        } else {
            insights.push({ 
                text: <>Great job! More issues are resolved (<strong className="text-text-white">{solved}</strong>) than pending (<strong className="text-text-white">{pendingCount}</strong>).</>,
                type: 'positive'
            });
        }

        if (categoryArray.length > 0) {
            const top = categoryArray[0];
            const pct = Math.round((top.value / total) * 100);
            insights.push({ 
                text: <><strong className="text-text-white">{top.name}</strong> complaints make up the highest proportion (<strong className="text-text-white">{pct}%</strong>) of all reports.</>,
                type: 'neutral'
            });
        }
        
        if (successRate >= 50) {
            insights.push({ 
                text: <>The resolution success rate is solid at <strong className="text-text-white">{successRate}%</strong>.</>,
                type: 'positive'
            });
        } else {
            insights.push({ 
                text: <>The success rate is at <strong className="text-text-white">{successRate}%</strong>. Need to prioritize resolving active issues.</>,
                type: 'negative'
            });
        }
    }

    const getInsightColor = (type) => {
        if(type === 'positive') return '#4ade80';
        if(type === 'negative') return '#f87171';
        return '#fbbf24';
    };

    // Custom Tooltip style for glassmorphism
    const customTooltipStyle = {
        backgroundColor: 'rgba(20,15,35,0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '12px',
        color: '#fff',
        boxShadow: '0 15px 40px rgba(0,0,0,0.4)',
        padding: '12px'
    };

    return (
        <div className="dashboard-bg">
            <Navbar />
            <div className="container-wide">
                <div className="page-header mb-12">
                    <h1>Analytics Dashboard</h1>
                    <p className="subtitle">Data-driven insights for your city's performance</p>
                </div>

                {/* 1. OVERVIEW (STATS) */}
                <div className="mb-[60px]">
                    <div className="section-label">Overview</div>
                    <div className="analytics-stats-grid">
                        {topStats.map((stat, index) => (
                            <div key={index} className="stat-card" style={{ animationDelay: `${index * 0.05}s` }}>
                                {/* Trend Indicator */}
                                {stat.trend && (
                                    <div className={`stat-trend ${stat.trendType}`}>
                                        {stat.trendType === 'positive' && <ArrowUpRight size={14} />}
                                        {stat.trendType === 'negative' && <ArrowUpRight size={14} />}
                                        {stat.trendType === 'neutral' && <Minus size={14} />}
                                        {stat.trend}
                                    </div>
                                )}

                                <div className="stat-icon" style={{ color: stat.color || 'white', background: `linear-gradient(135deg, ${stat.color}33, transparent)`, border: `1px solid ${stat.color}44` }}>
                                    {stat.icon}
                                </div>
                                <div className="stat-info">
                                    <div className="stat-value">{stat.value}</div>
                                    <div className="stat-label">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. INSIGHTS */}
                <div className="mb-[60px]">
                    <div className="insights-panel">
                        <h3 className="flex items-center gap-2.5 text-[1.15rem] font-bold mb-5">
                            <Activity size={22} color="var(--info)" />
                            Key Insights
                        </h3>
                        <ul className="list-none p-0 m-0 flex flex-col gap-3">
                            {insights.length > 0 ? insights.map((insight, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-text-white-soft leading-[1.6] text-[0.95rem]">
                                    <div className="mt-0.5 flex items-center justify-center bg-white/5 p-1.5 rounded-full" style={{ color: getInsightColor(insight.type) }}>
                                        <Lightbulb size={16} />
                                    </div>
                                    <div className="self-center">
                                        {insight.text}
                                    </div>
                                </li>
                            )) : (
                                <li className="text-text-white-muted flex items-center gap-2">
                                    <Info size={16} /> Not enough data to generate insights yet.
                                </li>
                            )}
                        </ul>
                    </div>
                </div>

                {/* 3. TRENDS (CHARTS) */}
                <div className="mb-[60px]">
                    <div className="section-label">Performance Trends</div>
                    <div className="chart-card">
                        <h3>Complaints Over Time</h3>
                        <div className="h-[320px] mt-6">
                            {timeSeriesArray.length === 0 ? (
                                <div className="empty-state h-full flex flex-col justify-center">
                                    <Info size={32} color="var(--text-white-muted)" className="mx-auto mb-3" />
                                    <p>No complaints reported yet to generate this trend line.</p>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={timeSeriesArray} margin={{ top: 15, right: 30, left: -20, bottom: 5 }}>
                                        <defs>
                                            <linearGradient id="colorComplaints" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--accent-to)" stopOpacity={0.6}/>
                                                <stop offset="60%" stopColor="var(--accent-to)" stopOpacity={0.1}/>
                                                <stop offset="95%" stopColor="var(--accent-to)" stopOpacity={0}/>
                                            </linearGradient>
                                            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                                <feGaussianBlur stdDeviation="3" result="blur" />
                                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                            </filter>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                                        <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" tick={{fill: 'rgba(255,255,255,0.6)', fontSize: 12}} tickMargin={12} axisLine={false} tickLine={false} />
                                        <YAxis stroke="rgba(255,255,255,0.4)" tick={{fill: 'rgba(255,255,255,0.6)', fontSize: 12}} allowDecimals={false} axisLine={false} tickLine={false} />
                                        <RechartsTooltip contentStyle={customTooltipStyle} itemStyle={{ color: '#fff' }} cursor={{stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1}} />
                                        <Area type="monotone" dataKey="complaints" stroke="var(--accent-to)" strokeWidth={4} fillOpacity={1} fill="url(#colorComplaints)" dot={{ r: 4, strokeWidth: 2, stroke: 'rgba(255,255,255,0.8)', fill: 'var(--accent-to)' }} activeDot={{ r: 7, strokeWidth: 2, stroke: '#fff', fill: 'var(--accent-to)' }} style={{ filter: 'url(#glow)' }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>

                {/* 4. BREAKDOWN (CHARTS) */}
                <div className="mb-[60px]">
                    <div className="section-label">Issue Breakdown</div>
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-6">
                        
                        {/* Bar Chart */}
                        <div className="chart-card">
                            <h3>Status Distribution</h3>
                            <div className="h-[280px] mt-6">
                                {statusArray.length === 0 ? (
                                    <div className="empty-state h-full flex flex-col justify-center">
                                        <p>No status data available.</p>
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={statusArray} margin={{ top: 15, right: 10, left: -20, bottom: 5 }}>
                                            <defs>
                                                {Object.entries(statusColors).map(([name, color]) => (
                                                    <linearGradient key={`grad-${name}`} id={`grad-${name.replace(' ', '')}`} x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={color} stopOpacity={0.9}/>
                                                        <stop offset="95%" stopColor={color} stopOpacity={0.2}/>
                                                    </linearGradient>
                                                ))}
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                                            <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" tick={{fill: 'rgba(255,255,255,0.6)', fontSize: 11}} tickMargin={12} axisLine={false} tickLine={false} />
                                            <YAxis stroke="rgba(255,255,255,0.4)" tick={{fill: 'rgba(255,255,255,0.6)', fontSize: 12}} allowDecimals={false} axisLine={false} tickLine={false} />
                                            <RechartsTooltip contentStyle={customTooltipStyle} cursor={{fill: 'rgba(255,255,255,0.03)'}} />
                                            <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={50}>
                                                {statusArray.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={`url(#grad-${entry.name.replace(' ', '')})`} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        {/* Pie Chart */}
                        <div className="chart-card">
                            <h3>Complaints by Category</h3>
                            <div className="h-[280px] mt-6">
                                {categoryArray.length === 0 ? (
                                    <div className="empty-state h-full flex flex-col justify-center">
                                        <p>No category data available.</p>
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={categoryArray}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={70}
                                                outerRadius={105}
                                                paddingAngle={6}
                                                dataKey="value"
                                                stroke="rgba(255,255,255,0.05)"
                                                strokeWidth={2}
                                            >
                                                {categoryArray.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip contentStyle={customTooltipStyle} itemStyle={{ color: '#fff' }} />
                                            <Legend wrapperStyle={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', paddingTop: '15px' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default Analytics;
