"use client"
import { useEffect, useState } from 'react';
import Link from 'next/link';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

export default function Home() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeads() {
      try {
        const res = await fetch('/api/leads');
        const data = await res.json();
        setLeads(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching leads:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchLeads();
  }, []);

  const totalLeads = leads.length;
  const activeLeads = leads.filter(l => ['New', 'Contacted', 'Qualified', 'Proposal Sent'].includes(l.status)).length;
  const convertedLeads = leads.filter(l => l.status === 'Won').length;
  const conversionRate = totalLeads ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  const recentLeads = [...leads].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  const today = new Date().toISOString().split('T')[0];
  const followUpsToday = leads.filter(l => l.followUpDate && l.followUpDate.startsWith(today));

  if (loading) {
    return <div className="animate-pulse text-center py-20 text-gray-500">Loading dashboard data...</div>;
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Welcome back! 👋</h1>
          <p className="text-gray-500">Here is what's happening with your agency leads today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Leads" 
          value={totalLeads} 
          icon="👥" 
          colorClass="primary" 
        />
        <StatCard 
          title="Active Pipeline" 
          value={activeLeads} 
          icon="🔥" 
          colorClass="warning" 
        />
        <StatCard 
          title="Won / Converted" 
          value={convertedLeads} 
          icon="✅" 
          colorClass="success" 
        />
        <StatCard 
          title="Conversion Rate" 
          value={`${conversionRate}%`} 
          icon="📈" 
          colorClass="primary" 
        />
      </div>

      {followUpsToday.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">⏰</span>
            <h2 className="text-lg font-semibold text-amber-900">Follow-ups Today ({followUpsToday.length})</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {followUpsToday.map(lead => (
              <Link key={lead.id} href={`/leads/${lead.id}`} className="bg-white border border-amber-200 px-4 py-2 rounded-lg text-sm font-medium text-amber-900 hover:bg-amber-100 transition">
                {lead.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-900">Recent Leads</h2>
          <Link href="/leads" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
            View All →
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          {recentLeads.length > 0 ? (
            <table className="w-full text-left whitespace-nowrap">
              <thead className="text-xs text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Name & Source</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{lead.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{lead.source}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{lead.email || '—'}</div>
                      <div className="text-sm text-gray-500 mt-0.5">{lead.phone || '—'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 px-4">
              <h3 className="text-sm font-medium text-gray-900 mb-1">No leads yet</h3>
              <p className="text-sm text-gray-500">Get started by adding a new lead.</p>
              <Link href="/leads" className="btn-primary mt-4 inline-flex">
                Add Lead
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
