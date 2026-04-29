'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import StatusBadge from '../../../components/StatusBadge';

export default function LeadDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    fetchLead();
  }, [id]);

  const fetchLead = async () => {
    try {
      const res = await fetch(`/api/leads/${id}`);
      if (!res.ok) {
        if (res.status === 404) router.push('/leads');
        return;
      }
      const data = await res.json();
      setLead(data);
    } catch (error) {
      console.error('Error fetching lead:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    
    setSavingNote(true);
    try {
      await fetch(`/api/leads/${id}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'NOTE', content: newNote })
      });
      setNewNote('');
      fetchLead(); // Refresh timeline
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setSavingNote(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse py-10 text-gray-500">Loading lead details...</div>;
  }

  if (!lead) return null;

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
        <Link href="/leads" className="hover:text-indigo-600 transition">Leads</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{lead.name}</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{lead.name}</h1>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">✉️ {lead.email || 'No email'}</span>
              <span className="flex items-center gap-1">📱 {lead.phone || 'No phone'}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={lead.status} />
            <span className="text-sm text-gray-500">Source: {lead.source}</span>
          </div>
        </div>
        
        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 flex flex-col gap-8">
            {/* Timeline / Activities */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Activity Timeline</h2>
              
              <div className="flex flex-col gap-4">
                {lead.activities?.length > 0 ? (
                  lead.activities.map(activity => (
                    <div key={activity.id} className="flex gap-4">
                      <div className="mt-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${activity.type === 'NOTE' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}>
                          {activity.type === 'NOTE' ? '📝' : '🔄'}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 flex-1 border border-gray-100">
                        <p className="text-gray-900 text-sm whitespace-pre-wrap">{activity.content}</p>
                        <span className="text-xs text-gray-500 mt-2 block">
                          {new Date(activity.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No activities recorded yet.</p>
                )}
              </div>
            </div>

            {/* Add Note Form */}
            <div className="bg-indigo-50/50 rounded-xl p-5 border border-indigo-100">
              <h3 className="text-sm font-semibold text-indigo-900 mb-3">Add a Note</h3>
              <form onSubmit={handleAddNote} className="flex flex-col gap-3">
                <textarea 
                  className="input-field bg-white border-indigo-200 focus:border-indigo-500" 
                  rows="3" 
                  placeholder="Type your note here..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  required
                ></textarea>
                <div className="flex justify-end">
                  <button type="submit" className="btn-primary" disabled={savingNote}>
                    {savingNote ? 'Saving...' : 'Add Note'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {/* Lead Details Sidebar */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Lead Info</h3>
              
              <div className="flex flex-col gap-3 text-sm">
                <div>
                  <span className="text-gray-500 block mb-1">Follow-up Date</span>
                  <div className={`font-medium ${lead.followUpDate && new Date(lead.followUpDate) < new Date() ? 'text-red-600' : 'text-gray-900'}`}>
                    {lead.followUpDate ? new Date(lead.followUpDate).toLocaleDateString() : 'Not scheduled'}
                  </div>
                </div>
                
                <div>
                  <span className="text-gray-500 block mb-1">Added On</span>
                  <div className="text-gray-900 font-medium">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp Messages preview */}
            <div className="bg-green-50 rounded-xl p-5 border border-green-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-green-900 flex items-center gap-2">
                  <span>💬</span> WhatsApp History
                </h3>
              </div>
              
              <div className="flex flex-col gap-3">
                {lead.messages?.length > 0 ? (
                  lead.messages.slice(0, 3).map(msg => (
                    <div key={msg.id} className={`p-3 rounded-lg text-sm max-w-[90%] ${msg.direction === 'INCOMING' ? 'bg-white border border-gray-200 self-start' : 'bg-green-100 text-green-900 self-end'}`}>
                      <p>{msg.content}</p>
                      <span className="text-[10px] text-gray-500 mt-1 block">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-green-800/70 text-center py-2">No messages yet.</p>
                )}
                
                {lead.messages?.length > 3 && (
                  <button className="text-sm font-medium text-green-700 hover:text-green-800 text-center mt-2">
                    View full history
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
