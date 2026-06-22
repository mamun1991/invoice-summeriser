'use client';

import { useState } from 'react';

export default function Workspace() {
  // agent of summerizer
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --------------agent of invoice-----------
  const [clientName, setClientName] = useState('');
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceResult, setInvoiceResult] = useState('');

  // Agent of email --------------
  const [emailTo, setEmailTo] = useState('');
  const [emailContext, setEmailContext] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailResult, setEmailResult] = useState('');

  const handleSummarize = async () => {
    if (!text.trim()) {
      setError('Please enter some text to summarize.');
      return;
    }

    setLoading(true);
    setError('');
    setSummary('');

    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to summarize');
      }

      setSummary(data.summary);
    } catch (err: any) {
      console.error("Something wrong:", err);
      setError(err.message || 'Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async () => {
    if (!clientName.trim()) return;
    setInvoiceLoading(true);

    // Mocking some line items for the demo
    const payload = {
      clientName: clientName,
      items: [
        { description: 'Web Development Services', price: 500 },
        { description: 'AI Agent Setup', price: 250 }
      ],
      totalAmount: 750
    };

    try {
      const res = await fetch('/api/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        setInvoiceResult(`Success! File saved as: ${data.fileId}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setInvoiceLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!emailTo.trim() || !emailContext.trim()) return;
    
    setEmailLoading(true);
    setEmailResult('');

    try {
      const res = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toEmail: emailTo, context: emailContext })
      });
      const data = await res.json();
      
      if (res.ok) {
        setEmailResult(data.generatedBody);
      } else {
        setEmailResult('Error: ' + data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8 font-sans text-gray-900">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">AI Agent Workspace</h1>
          <p className="text-gray-500 mt-2">Your $0 multi-agent architecture running on Cloudflare</p>
        </header>

        {/* Agent 1: Summarizer Section */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 text-blue-700 p-2 rounded-lg mr-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <h2 className="text-xl font-bold">Agent 1: Document Summarizer</h2>
          </div>

          <textarea
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[150px] mb-4"
            placeholder="Paste your long document, meeting notes, or article here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <button
            className={`px-6 py-3 rounded-lg font-medium text-white transition-all ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'}`}
            onClick={handleSummarize}
            disabled={loading}
          >
            {loading ? 'Agent is analyzing...' : 'Summarize Text'}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {summary && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Agent Output:</h3>
              <div className="p-5 bg-gray-50 border border-gray-200 rounded-lg prose prose-blue max-w-none whitespace-pre-wrap">
                {summary}
              </div>
            </div>
          )}
        </section>

        {/* Agent 2: Invoice Creator Section */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className="bg-green-100 text-green-700 p-2 rounded-lg mr-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <h2 className="text-xl font-bold">Agent 2: Invoice Creator</h2>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              placeholder="e.g., Acme Corp"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </div>

          <button
            className={`px-6 py-3 rounded-lg font-medium text-white transition-all ${invoiceLoading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg'}`}
            onClick={handleCreateInvoice}
            disabled={invoiceLoading}
          >
            {invoiceLoading ? 'Generating PDF...' : 'Generate $750 Invoice'}
          </button>

          {invoiceResult && (
            <div className="mt-4 p-4 bg-green-50 text-green-800 rounded-lg border border-green-200 font-mono text-sm">
              {invoiceResult}
            </div>
          )}
        </section>

        {/* Agent 3: Email Automator Section */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className="bg-purple-100 text-purple-700 p-2 rounded-lg mr-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <h2 className="text-xl font-bold">Agent 3: Automated Communicator</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Email</label>
              <input 
                type="email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="client@company.com"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Agent Command</label>
              <input 
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="e.g., Let them know the website is done"
                value={emailContext}
                onChange={(e) => setEmailContext(e.target.value)}
              />
            </div>
          </div>
          
          <button 
            className={`px-6 py-3 rounded-lg font-medium text-white transition-all ${emailLoading ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg'}`}
            onClick={handleSendEmail}
            disabled={emailLoading}
          >
            {emailLoading ? 'AI is drafting & sending...' : 'Draft & Send Email'}
          </button>

          {emailResult && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Message Sent:</h3>
              <div className="p-4 bg-purple-50 text-purple-900 border border-purple-200 rounded-lg whitespace-pre-wrap">
                {emailResult}
              </div>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}