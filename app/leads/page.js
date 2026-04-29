'use client';

import { useState, useEffect } from 'react';
import StatusBadge from '../../components/StatusBadge';
import LeadModal from '../../components/LeadModal';

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLead, setCurrentLead] = useState(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleAddClick = () => {
    setCurrentLead(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (lead) => {
    setCurrentLead(lead);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await fetch(`/api/leads/${id}`, { method: 'DELETE' });
        fetchLeads();
      } catch (error) {
        console.error('Error deleting lead:', error);
      }
    }
  };

  const handleModalClose = (refresh = false) => {
    setIsModalOpen(false);
    if (refresh) fetchLeads();
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (lead.phone && lead.phone.includes(searchTerm));
    const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">Leads Management</h1>
          <p className="text-gray-500">Track and manage all your agency prospects.</p>
        </div>
        <button className="btn-primary" onClick={handleAddClick}>
          <span>+</span> Add New Lead
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <input 
          type="text" 
          placeholder="Search by name, email, or phone..." 
          className="input-field max-w-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="input-field max-w-[200px]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Qualified">Qualified</option>
          <option value="Proposal Sent">Proposal Sent</option>
          <option value="Won">Won</option>
          <option value="Lost">Lost</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading leads...</div>
          ) : filteredLeads.length > 0 ? (
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Name & Source</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Follow-up Date</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{lead.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{lead.source}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 text-sm">{lead.email || '—'}</div>
                      <div className="text-gray-500 text-sm mt-1">{lead.phone || '—'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm ${lead.followUpDate && new Date(lead.followUpDate) < new Date() ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                        {lead.followUpDate ? new Date(lead.followUpDate).toLocaleDateString() : '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md mr-2 transition" 
                        onClick={() => handleEditClick(lead)}
                      >
                        Edit
                      </button>
                      <button 
                        className="text-sm font-medium text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md transition" 
                        onClick={() => handleDeleteClick(lead.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-16 px-4">
              <h3 className="text-lg font-medium text-gray-900 mb-1">No leads found</h3>
              <p className="text-gray-500">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <LeadModal 
          lead={currentLead} 
          onClose={handleModalClose} 
        />
      )}
    </div>
  );
}
