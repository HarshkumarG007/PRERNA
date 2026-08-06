import React, { useState } from 'react';

export const TrustedAdultConnector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [adultName, setAdultName] = useState('');
  const [adultEmail, setAdultEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (adultName && adultEmail) {
      // In production: send an email inviting the adult to the dashboard
      setSent(true);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium underline"
      >
        Want to loop in a trusted adult? (Optional)
      </button>
    );
  }

  if (sent) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-md">
        <p className="text-sm text-green-800 font-medium">Invitation sent!</p>
        <p className="text-sm text-green-700 mt-1">We've reached out to {adultName}. You can manage their access from your settings anytime.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <h3 className="text-md font-bold text-gray-900">Connect a Trusted Adult</h3>
      <p className="text-sm text-gray-600 mb-4">
        You can choose to share your PRERNA journey with a teacher, counselor, or another relative. This is completely up to you.
      </p>
      <form onSubmit={handleSend} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700">Their Name</label>
          <input type="text" required value={adultName} onChange={(e) => setAdultName(e.target.value)} className="mt-1 block w-full p-2 border rounded-md text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700">Their Email</label>
          <input type="email" required value={adultEmail} onChange={(e) => setAdultEmail(e.target.value)} className="mt-1 block w-full p-2 border rounded-md text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700">A short message (optional)</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="mt-1 block w-full p-2 border rounded-md text-sm" rows={2} />
        </div>
        <div className="flex space-x-2 pt-2">
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
            Send Invite
          </button>
          <button type="button" onClick={() => setIsOpen(false)} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
