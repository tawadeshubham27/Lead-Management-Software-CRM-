'use client';

import { useState } from 'react';

export default function TestWhatsApp() {
  const [phone, setPhone] = useState('+1234567890');
  const [message, setMessage] = useState('Hello! I am interested in your services.');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSimulate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('Sending...');

    try {
      const res = await fetch('/api/webhooks/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: phone,
          body: message
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        setStatus(`✅ Success! Lead ID: ${data.leadId}`);
        setMessage('');
      } else {
        setStatus(`❌ Error: ${data.error}`);
      }
    } catch (err) {
      setStatus(`❌ Network Error`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Simulate WhatsApp Webhook</h1>
        <p className="text-gray-500 text-sm">
          Use this tool to simulate receiving a WhatsApp message. It directly triggers your webhook endpoint `/api/webhooks/whatsapp`.
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <form onSubmit={handleSimulate} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Sender Phone (International Format)</label>
            <input 
              type="text" 
              className="input-field" 
              value={phone} 
              onChange={e => setPhone(e.target.value)}
              required
            />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Message Body</label>
            <textarea 
              className="input-field" 
              rows="4"
              value={message} 
              onChange={e => setMessage(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className={`text-sm font-medium ${status.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
              {status}
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Simulating...' : 'Trigger Webhook'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
