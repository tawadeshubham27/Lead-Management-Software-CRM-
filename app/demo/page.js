'use client';

import { useState } from 'react';

export default function DemoPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    source: 'Website',
  });
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [newLead, setNewLead] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create lead');
      }

      setNewLead(data);
      
      // Trigger mock notification on server
      await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          leadId: data.id,
          message: `🚀 New lead: ${data.name} from ${data.source}`
        }),
      });

      setSubmitted(true);
      setMessage('✅ Lead registered successfully!');
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (submitted && newLead) {
    return (
      <div className="max-w-lg mx-auto p-8 bg-white rounded-2xl shadow-2xl mt-16 text-center border border-indigo-50">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
          ✅
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Registration Complete!</h2>
        <p className="text-gray-600 mb-8">Thank you, <span className="font-semibold text-indigo-600">{newLead.name}</span>. Your details have been securely captured.</p>
        
        <div className="space-y-4">
          <button 
            onClick={() => setSubmitted(false)}
            className="text-indigo-600 font-medium hover:underline"
          >
            Fill form again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-8 bg-white rounded-2xl shadow-xl mt-12 border border-gray-100">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-2xl text-white shadow-indigo-200 shadow-lg">
          🚀
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lead Capture Demo</h2>
          <p className="text-sm text-gray-500">Test the CRM ingestion & notification flow</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">Full Name</label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="John Doe"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
            value={form.name}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="john@example.com"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
            value={form.email}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">Phone Number (with country code)</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+1234567890"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
            value={form.phone}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="source">Lead Source</label>
          <select
            id="source"
            name="source"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none appearance-none bg-white"
            value={form.source}
            onChange={handleChange}
          >
            <option value="Website">Website</option>
            <option value="Instagram">Instagram</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Facebook Ads">Facebook Ads</option>
            <option value="Referral">Referral</option>
          </select>
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className={`w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : 'Register Lead'}
        </button>
      </form>
      {message && !submitted && (
        <p className={`mt-6 text-center font-medium ${message.includes('❌') ? 'text-red-500' : 'text-green-500'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
