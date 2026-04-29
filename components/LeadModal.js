import { useState, useEffect } from 'react';

export default function LeadModal({ lead, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    source: 'Manual',
    status: 'New',
    notes: '',
    followUpDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        source: lead.source || 'Manual',
        status: lead.status || 'New',
        notes: '', // clear notes on edit, new notes go to activity
        followUpDate: lead.followUpDate ? new Date(lead.followUpDate).toISOString().split('T')[0] : ''
      });
    }
  }, [lead]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const url = lead ? `/api/leads/${lead.id}` : '/api/leads';
      const method = lead ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          followUpDate: formData.followUpDate ? new Date(formData.followUpDate).toISOString() : null
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save lead');
      }
      
      onClose(true); // Close and refresh
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            {lead ? 'Edit Lead' : 'Add New Lead'}
          </h2>
          <button 
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition" 
            onClick={() => onClose(false)}
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex flex-col gap-5">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name *</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              className="input-field" 
              value={formData.name} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                className="input-field" 
                value={formData.email} 
                onChange={handleChange} 
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number (with country code)</label>
              <input 
                type="text" 
                id="phone" 
                name="phone" 
                placeholder="+1234567890"
                className="input-field" 
                value={formData.phone} 
                onChange={handleChange} 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="source" className="text-sm font-medium text-gray-700">Lead Source</label>
              <select 
                id="source" 
                name="source" 
                className="input-field" 
                value={formData.source} 
                onChange={handleChange}
              >
                <option value="Manual">Manual</option>
                <option value="Instagram">Instagram</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Facebook Ads">Facebook Ads</option>
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label htmlFor="status" className="text-sm font-medium text-gray-700">Lead Status</label>
              <select 
                id="status" 
                name="status" 
                className="input-field" 
                value={formData.status} 
                onChange={handleChange}
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Proposal Sent">Proposal Sent</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="followUpDate" className="text-sm font-medium text-gray-700">Next Follow-up Date</label>
            <input 
              type="date" 
              id="followUpDate" 
              name="followUpDate" 
              className="input-field" 
              value={formData.followUpDate} 
              onChange={handleChange} 
            />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label htmlFor="notes" className="text-sm font-medium text-gray-700">
              {lead ? 'Add a new note / update' : 'Initial Notes'}
            </label>
            <textarea 
              id="notes" 
              name="notes" 
              className="input-field" 
              rows="3" 
              value={formData.notes} 
              onChange={handleChange}
            ></textarea>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
            <button type="button" className="btn-secondary" onClick={() => onClose(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
