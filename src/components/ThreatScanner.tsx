import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  RefreshCw, 
  FileText, 
  UploadCloud, 
  Trash2, 
  Link2, 
  Mail, 
  Terminal, 
  Lock, 
  CheckCircle,
  HelpCircle,
  Clock,
  Sparkles,
  Search,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { EmailMessage } from '../types';

interface ThreatScannerProps {
  emails: EmailMessage[];
  onClose: () => void;
}

export default function ThreatScanner({ emails, onClose }: ThreatScannerProps) {
  const [activeTab, setActiveTab] = useState<'email' | 'link' | 'file'>('email');
  const [selectedEmailId, setSelectedEmailId] = useState<string>('');
  const [customLinkInput, setCustomLinkInput] = useState<string>('');
  
  // Search and Sort states for emails
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  
  // File scanner states
  const [scannedFile, setScannedFile] = useState<{ name: string; size: number; type: string; content?: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  
  // Scanning engine states
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgressLines, setScanProgressLines] = useState<string[]>([]);
  const [scanResult, setScanResult] = useState<{
    riskScore: number;
    riskLevel: 'Low' | 'Medium' | 'High';
    threatType: string;
    sketchyFactors: string[];
    safeFactors: string[];
    recommendation: string;
  } | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  // Compute sorted and filtered emails
  const sortedAndFilteredEmails = React.useMemo(() => {
    let list = [...emails];
    
    // Sort by date (descending by default)
    list.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(e => 
        (e.subject || '').toLowerCase().includes(term) ||
        (e.body || '').toLowerCase().includes(term) ||
        (e.sender || '').toLowerCase().includes(term) ||
        (e.senderName || '').toLowerCase().includes(term) ||
        (e.senderEmail || '').toLowerCase().includes(term)
      );
    }
    return list;
  }, [emails, searchTerm, sortOrder]);

  // Auto-select first email in the filtered list if current selection is invalid or empty
  useEffect(() => {
    if (sortedAndFilteredEmails.length > 0) {
      const exists = sortedAndFilteredEmails.some(e => e.id === selectedEmailId);
      if (!exists) {
        setSelectedEmailId(sortedAndFilteredEmails[0].id);
      }
    } else {
      setSelectedEmailId('');
    }
  }, [sortedAndFilteredEmails, selectedEmailId]);

  // Handle Drag & Drop for files
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      setScannedFile({
        name: file.name,
        size: file.size,
        type: file.type || 'unknown/binary',
        content: typeof event.target?.result === 'string' ? event.target.result : undefined
      });
      setScanResult(null);
      setScanError(null);
    };
    
    // If it's a text/JSON/code file, read as text, else read as data url
    if (file.type.startsWith('text/') || file.name.endsWith('.eml') || file.name.endsWith('.txt') || file.name.endsWith('.json') || file.name.endsWith('.log')) {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file); // This works for mock binary content
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setScannedFile(null);
    setScanResult(null);
  };

  // Run the Unified Cognitive Threat Scan
  const triggerScan = async () => {
    setIsScanning(true);
    setScanError(null);
    setScanResult(null);
    setScanProgressLines([]);

    let targetText = '';
    let targetUrl = '';

    if (activeTab === 'email') {
      const mail = emails.find(e => e.id === selectedEmailId);
      if (!mail) {
        setScanError('Please select an email transmission to analyze.');
        setIsScanning(false);
        return;
      }
      targetText = `Subject: ${mail.subject}\nSender: ${mail.senderName || mail.sender} (${mail.senderEmail || mail.sender})\nBody:\n${mail.body}`;
    } else if (activeTab === 'link') {
      const link = customLinkInput.trim();
      if (!link) {
        setScanError('Please enter a target URL or link address to scan.');
        setIsScanning(false);
        return;
      }
      targetUrl = link;
    } else if (activeTab === 'file') {
      if (!scannedFile) {
        setScanError('Please drop or select a file to analyze.');
        setIsScanning(false);
        return;
      }
      // Construct a text representation for Gemini to audit
      targetText = `Auditing File Upload:\nFile Name: ${scannedFile.name}\nFile Size: ${scannedFile.size} bytes\nFile Type: ${scannedFile.type}\n\nFile Headers/Content Preview:\n${
        scannedFile.content ? scannedFile.content.substring(0, 5000) : '[Binary Data / Signature Extraction Active]'
      }`;
    }

    // Terminal sequence stages
    const stages = [
      `[SECURITY] Setting up a safe scanning window...`,
      `[SENDER CHECK] Verifying sender address and email domain...`,
      `[TEXT ANALYZER] Checking message text for high pressure or fake urgency...`,
      `[LINK CHECK] Testing website links against known spam databases...`,
      `[ATTACHMENT AUDIT] Checking for unsafe file extensions or tricky signatures...`,
      `[REPORT GENERATOR] Preparing final safety assessment...`
    ];

    for (let i = 0; i < stages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 250 + Math.random() * 200));
      setScanProgressLines(prev => [...prev, stages[i]]);
    }

    try {
      const response = await fetch('/api/emails/scan-security', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: targetText || undefined,
          url: targetUrl || undefined
        })
      });

      if (!response.ok) {
        throw new Error(`Threat analyzer reported error code: ${response.status}`);
      }

      const data = await response.json();
      setScanResult(data);
    } catch (err: any) {
      console.error('Scan error:', err);
      setScanError(err.message || 'The scan service is temporarily offline. Please try again in a moment.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div id="threat-scanner-panel-wrapper" className="flex-1 flex flex-col bg-[#0D0D0D] overflow-y-auto scrollbar-thin relative text-[#E0E0E0]">
      {/* Visual glowing accent borders */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-pink-500/3 rounded-full blur-[100px] pointer-events-none" />

      {/* Header Panel */}
      <div className="p-8 border-b border-[#2A2A2A]/40 bg-[#151515]/10 flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
            <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-indigo-400 font-bold">DRAFTLY EMAIL SECURITY SCANNER</p>
          </div>
          <h1 className="text-2xl font-serif italic text-white font-medium tracking-tight">
            Scam & Link Scanner
          </h1>
          <p className="text-xs text-slate-400 font-sans">
            Scan your emails, suspicious links, and files to make sure they are safe from phishing, scams, and malware.
          </p>
        </div>

        <button
          onClick={onClose}
          className="px-4 py-2 self-start md:self-auto bg-[#151515] hover:bg-white hover:text-black text-slate-200 border border-[#2A2A2A] text-xs font-mono font-bold uppercase transition-all duration-300 cursor-pointer"
        >
          Return to Inbox
        </button>
      </div>

      {/* Main Body */}
      <div className="p-8 max-w-5xl w-full mx-auto space-y-8 relative z-10">
        
        {/* Colorful Feature Introduction Card */}
        <div className="p-6 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-pink-950/20 border border-indigo-500/20 shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1.5 flex-1">
            <h3 className="text-sm font-serif italic text-white font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-pink-400 animate-pulse" />
              Smart Scam Detection
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Draftly uses smart AI to check for sneaky phishing tricks, fake urgent requests, suspicious website links, and other tricky things hackers use to steal your information.
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
            <span className="text-[9px] font-mono text-indigo-300 font-bold uppercase tracking-wider px-2 py-0.75 bg-indigo-950/40 border border-indigo-500/30">
              Safe Scan Mode
            </span>
          </div>
        </div>

        {/* Workspace Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-[#101014] border border-[#2A2A2A]/60 shadow-md">
          <button
            type="button"
            onClick={() => { setActiveTab('email'); setScanResult(null); setScanError(null); }}
            className={`py-3.5 px-4 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'email' 
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-800 text-white shadow-lg border border-indigo-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <Mail className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">1. Scan Emails</span>
            <span className="sm:hidden">Email</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('link'); setScanResult(null); setScanError(null); }}
            className={`py-3.5 px-4 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'link' 
                ? 'bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-lg border border-purple-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <Link2 className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">2. Check a Link</span>
            <span className="sm:hidden">Link</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('file'); setScanResult(null); setScanError(null); }}
            className={`py-3.5 px-4 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'file' 
                ? 'bg-gradient-to-r from-pink-600 to-pink-800 text-white shadow-lg border border-pink-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <FileText className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">3. Scan a File</span>
            <span className="sm:hidden">File</span>
          </button>
        </div>

        {/* Input Workspaces */}
        <div className="bg-[#111116]/80 border border-white/5 p-6 shadow-md relative">
          
          <AnimatePresence mode="wait">
            {/* TAB 1: EMAIL AUDIT */}
            {activeTab === 'email' && (
              <motion.div
                key="tab-email"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[480px]">
                  {/* Left Column: Email List Selector */}
                  <div className="lg:col-span-5 flex flex-col space-y-3 bg-black/40 border border-[#2A2A2A]/40 p-4 h-[550px]">
                    <div className="flex items-center justify-between border-b border-[#2A2A2A]/40 pb-2">
                      <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest font-mono">
                        My Emails ({sortedAndFilteredEmails.length})
                      </span>
                      {/* Sort Order Toggle */}
                      <button
                        type="button"
                        onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                        className="text-[9px] font-mono text-slate-400 hover:text-indigo-400 flex items-center gap-1 bg-black/60 px-2 py-1 border border-white/5 transition-all cursor-pointer"
                      >
                        <span>Date:</span>
                        <span className="text-indigo-400 font-bold uppercase">{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
                      </button>
                    </div>

                    {/* Search Field */}
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search by sender, subject, content..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black/90 border border-white/10 text-slate-200 pl-9 pr-3 py-2 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-none outline-none font-sans"
                      />
                    </div>

                    {/* Scrollable List */}
                    <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2 pr-1">
                      {sortedAndFilteredEmails.length > 0 ? (
                        sortedAndFilteredEmails.map((e, idx) => {
                          const isSelected = e.id === selectedEmailId;
                          const formattedDate = new Date(e.date).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          });

                          // Assign color pill based on category
                          let categoryColor = 'bg-slate-950/40 text-slate-400 border-slate-800';
                          if (e.category === 'Primary' || e.category?.toLowerCase().includes('work')) {
                            categoryColor = 'bg-sky-950/40 text-sky-400 border-sky-900/50';
                          } else if (e.category?.toLowerCase().includes('bill') || e.category?.toLowerCase().includes('urgent')) {
                            categoryColor = 'bg-red-950/40 text-red-400 border-red-900/50';
                          } else if (e.category?.toLowerCase().includes('newsletter') || e.category === 'Promotions') {
                            categoryColor = 'bg-purple-950/40 text-purple-400 border-purple-900/50';
                          }

                          return (
                            <motion.button
                              key={e.id}
                              type="button"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2, delay: Math.min(idx * 0.03, 0.3) }}
                              whileHover={{ scale: 1.005, x: 2 }}
                              whileTap={{ scale: 0.995 }}
                              onClick={() => {
                                setSelectedEmailId(e.id);
                                setScanResult(null);
                                setScanError(null);
                              }}
                              className={`w-full text-left p-3 border transition-all duration-200 cursor-pointer flex flex-col space-y-1.5 relative ${
                                isSelected
                                  ? 'bg-indigo-950/20 border-indigo-500/80 shadow-[0_0_12px_rgba(99,102,241,0.1)]'
                                  : 'bg-black/60 border-white/5 hover:border-indigo-500/30 hover:bg-neutral-900/40'
                              }`}
                            >
                              {/* Selection glowing pointer */}
                              {isSelected && (
                                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-indigo-500" />
                              )}

                              <div className="flex items-center justify-between gap-2 min-w-0">
                                <span className="text-[10px] font-bold text-slate-300 truncate max-w-[70%]">
                                  {e.senderName || e.senderEmail || e.sender}
                                </span>
                                <span className="text-[8px] font-mono text-slate-500 whitespace-nowrap font-bold">
                                  {formattedDate}
                                </span>
                              </div>

                              <h4 className={`text-[11px] leading-tight font-medium truncate ${isSelected ? 'text-white font-bold' : 'text-slate-300'}`}>
                                {e.subject || '(No Subject)'}
                              </h4>

                              <p className="text-[10px] text-slate-500 truncate line-clamp-1">
                                {e.snippet || e.body || ''}
                              </p>

                              <div className="flex items-center justify-between pt-1 border-t border-white/[0.03] text-[8px] font-mono">
                                <span className={`px-1.5 py-0.5 border uppercase font-bold tracking-wider ${categoryColor}`}>
                                  {e.category}
                                </span>
                                {e.isMeetingRequest && (
                                  <span className="text-amber-400 font-bold uppercase tracking-wider">📅 Schedule Request</span>
                                )}
                              </div>
                            </motion.button>
                          );
                        })
                      ) : (
                        <div className="py-12 text-center text-[#555] flex flex-col items-center justify-center space-y-1.5">
                          <Mail className="h-6 w-6 text-slate-800" />
                          <p className="text-[10px] font-mono text-slate-600">No emails matched filters</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Sandbox Inspector Vault */}
                  <div className="lg:col-span-7 flex flex-col bg-gradient-to-b from-[#111115] to-[#0A0A0C] border border-white/5 p-5 h-[550px] overflow-hidden">
                    <AnimatePresence mode="wait">
                      {(() => {
                        const selectedMail = emails.find(e => e.id === selectedEmailId);
                        if (!selectedMail) {
                          return (
                            <motion.div
                              key="no-selected-email"
                              initial={{ opacity: 0, scale: 0.96 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.96 }}
                              transition={{ duration: 0.15 }}
                              className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-2"
                            >
                              <Lock className="h-8 w-8 text-indigo-500/20 stroke-[1] animate-pulse" />
                              <p className="text-xs font-mono text-indigo-400/80 uppercase tracking-widest font-bold">READY TO SCAN</p>
                              <p className="text-[11px] text-slate-500 max-w-[280px] leading-relaxed">
                                Choose an email from the list on the left to review its content and run a safety scan.
                              </p>
                            </motion.div>
                          );
                        }

                        const formattedDateFull = new Date(selectedMail.date).toLocaleDateString(undefined, {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        });

                        return (
                          <motion.div
                            key={selectedMail.id}
                            initial={{ opacity: 0, x: 12 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -12 }}
                            transition={{ duration: 0.18, ease: "easeOut" }}
                            className="flex-1 flex flex-col min-h-0"
                          >
                            {/* Header of Inspector */}
                            <div className="border-b border-[#2A2A2A]/40 pb-4 space-y-3 shrink-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[9px] font-mono px-2 py-0.5 bg-indigo-950/30 border border-indigo-500/30 text-indigo-300 font-bold uppercase tracking-widest">
                                  Selected Email Preview
                                </span>
                                <span className="text-[9px] font-mono text-slate-500">ID: {selectedMail.id.substring(0, 12)}...</span>
                              </div>

                              <h3 className="text-sm font-semibold text-white tracking-tight leading-snug line-clamp-2 text-left">
                                {selectedMail.subject || '(No Subject)'}
                              </h3>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] font-mono bg-black/40 p-2.5 border border-white/[0.03] text-left">
                                <div className="space-y-0.5 truncate">
                                  <span className="text-slate-500 uppercase font-bold text-[8px] block">Sender Info</span>
                                  <span className="text-indigo-300 font-semibold truncate block">
                                    {selectedMail.senderName || 'Anonymous'}
                                  </span>
                                  <span className="text-slate-400 block truncate">{selectedMail.senderEmail || selectedMail.sender}</span>
                                </div>
                                <div className="space-y-0.5">
                                  <span className="text-slate-500 uppercase font-bold text-[8px] block">Date Received</span>
                                  <span className="text-slate-300 font-medium block">{formattedDateFull}</span>
                                </div>
                              </div>
                            </div>

                            {/* Scrollable Email Body */}
                            <div className="flex-1 overflow-y-auto scrollbar-thin my-4 pr-1 text-xs space-y-4 bg-black/60 p-4 border border-white/[0.02] text-left">
                              <div className="text-slate-300 leading-relaxed font-sans whitespace-pre-wrap select-text break-words">
                                {selectedMail.body || <span className="italic text-slate-500">This email has no text content.</span>}
                              </div>
                            </div>

                            {/* Quick details & Call to scan */}
                            <div className="pt-3 border-t border-[#2A2A2A]/40 shrink-0 flex items-center justify-between gap-4">
                              <p className="text-[9px] text-slate-400 max-w-[65%] leading-snug text-left">
                                Ready to check this email's text and links for scams or harmful content?
                              </p>
                              <button
                                type="button"
                                onClick={triggerScan}
                                disabled={isScanning}
                                className={`py-2 px-4 font-mono text-[9px] font-bold uppercase transition-all duration-300 flex items-center gap-1.5 cursor-pointer shadow-lg border-none ${
                                  isScanning 
                                    ? 'bg-neutral-800 text-slate-500 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                                }`}
                              >
                                <ShieldAlert className="h-3.5 w-3.5" />
                                Scan Email
                              </button>
                            </div>
                          </motion.div>
                        );
                      })()}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: LINK AUDIT */}
            {activeTab === 'link' && (
              <motion.div
                key="tab-link"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-purple-300 uppercase tracking-widest font-mono">Website Link to Check</label>
                  <input
                    type="url"
                    placeholder="Paste link here (e.g., https://example-scam-link.com)"
                    value={customLinkInput}
                    onChange={(e) => { setCustomLinkInput(e.target.value); setScanResult(null); }}
                    className="w-full bg-black/90 border border-purple-500/20 text-slate-200 p-4 text-xs focus:border-purple-400 focus:ring-1 focus:ring-purple-400 rounded-none outline-none font-mono shadow-inner"
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-sans">
                  We will safely inspect this link to see if it redirects to a fake login form or is a known scam page, without actually opening it on your device.
                </p>
              </motion.div>
            )}

            {/* TAB 3: FILE AUDIT */}
            {activeTab === 'file' && (
              <motion.div
                key="tab-file"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-pink-300 uppercase tracking-widest font-mono">Attachment Scanner</label>
                  
                  {scannedFile ? (
                    <div className="p-5 bg-black/80 border border-pink-500/20 flex items-center justify-between shadow-lg">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="h-10 w-10 bg-pink-950/20 border border-pink-500/30 flex items-center justify-center text-pink-400 shrink-0">
                          <FileText className="h-5 w-5 animate-pulse" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate font-mono">{scannedFile.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                            {(scannedFile.size / 1024).toFixed(1)} KB • Type: {scannedFile.type}
                          </p>
                        </div>
                      </div>
                      
                      <button
                        onClick={removeFile}
                        className="p-2 bg-transparent text-slate-500 hover:text-red-400 transition-colors cursor-pointer border-none"
                        title="Remove selected file"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`h-40 border border-dashed flex flex-col items-center justify-center p-6 text-center transition-all duration-300 cursor-pointer ${
                        dragOver 
                          ? 'border-pink-500 bg-pink-950/10 text-white' 
                          : 'border-[#2A2A2A] hover:border-pink-500/40 hover:bg-white/[0.01] text-[#555]'
                      }`}
                      onClick={() => document.getElementById('file-input')?.click()}
                    >
                      <input
                        type="file"
                        id="file-input"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      <UploadCloud className={`h-8 w-8 mb-2 transition-all ${dragOver ? 'text-pink-400 scale-110' : 'text-slate-600'}`} />
                      <p className="text-xs text-slate-300 font-medium">Drag & drop your suspicious attachment here, or <span className="text-pink-400 underline">browse</span></p>
                      <p className="text-[10px] text-slate-500 font-mono mt-1">Accepts invoice PDFs, .eml, .txt, .html, .log files (Max 5MB)</p>
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 font-sans">
                  Files are scanned safely in the cloud. We will look for tricky code, hidden web links, and other warning signs of computer viruses.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Core Trigger Button (Only for non-email tabs) */}
          {activeTab !== 'email' && (
            <div className="flex justify-end mt-6 pt-4 border-t border-[#2A2A2A]/40">
              <button
                onClick={triggerScan}
                disabled={isScanning || (activeTab === 'file' && !scannedFile)}
                className={`py-3 px-6 font-mono text-[11px] font-bold uppercase transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-lg border-none ${
                  isScanning 
                    ? 'bg-neutral-800 text-slate-500 cursor-not-allowed' 
                    : activeTab === 'link'
                      ? 'bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:from-purple-400 text-white shadow-purple-500/10'
                      : 'bg-gradient-to-r from-pink-500 via-pink-600 to-pink-700 hover:from-pink-400 text-white shadow-pink-500/10'
                }`}
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-slate-500" />
                    ANALYZING Neural Payload...
                  </>
                ) : (
                  <>
                    <ShieldAlert className="h-4 w-4" />
                    Run Isolated Threat Check
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Scrolling Telemetry Terminal */}
        {isScanning && (
          <div className="bg-[#08080C] border border-white/5 p-5 font-mono text-[11px] text-indigo-400 space-y-2 shadow-2xl relative">
            <div className="flex items-center justify-between text-slate-500 border-b border-white/5 pb-2 mb-3 uppercase text-[9px] font-extrabold tracking-widest">
              <span>Security Scan Progress</span>
              <span className="animate-pulse text-pink-400">● Scanning Now</span>
            </div>
            {scanProgressLines.map((line, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                className="flex gap-3"
              >
                <span className="text-indigo-500/40">0{idx+1}</span>
                <span className="text-slate-300 leading-relaxed">{line}</span>
              </motion.div>
            ))}
            <div className="animate-pulse text-pink-400/80 font-bold mt-1">_ [FINISHING SAFETY ASSESSMENT...]</div>
          </div>
        )}

        {/* Error Alert */}
        {scanError && (
          <div className="p-4 bg-rose-950/20 border border-rose-500/30 text-rose-400 text-xs font-mono shadow-md">
            ⚠️ SYSTEM ALERT: {scanError}
          </div>
        )}

        {/* Scan Results Panel */}
        {scanResult && !isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className={`p-6 md:p-8 border rounded-none space-y-6 shadow-2xl ${
              scanResult.riskLevel === 'High' 
                ? 'bg-gradient-to-br from-red-950/20 via-[#0e0a0a] to-[#0a0505] border-red-500/30' 
                : (scanResult.riskLevel === 'Medium' ? 'bg-gradient-to-br from-amber-950/20 via-[#0f0e0a] to-[#0a0805] border-amber-500/30' : 'bg-gradient-to-br from-emerald-950/15 via-[#0a0d0a] to-[#050a05] border-emerald-500/30')
            }`}
          >
            
            {/* Classification Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-5">
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ scale: 0.6, rotate: -8, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 120 }}
                  className={`h-16 w-16 rounded-none border flex flex-col items-center justify-center font-mono text-lg font-extrabold bg-black/80 shrink-0 ${
                    scanResult.riskLevel === 'High' 
                      ? 'border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)]' 
                      : (scanResult.riskLevel === 'Medium' ? 'border-amber-500 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]' : 'border-emerald-400 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.15)]')
                  }`}
                >
                  <span>{scanResult.riskScore}</span>
                  <span className="text-[7px] text-slate-500 uppercase -mt-1 font-bold">SCORE</span>
                </motion.div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono block">Security Scan Report</span>
                  <h4 className="text-sm font-serif italic text-white font-medium flex items-center gap-2 mt-1">
                    <span className={`inline-block h-2 w-2 rounded-full ${
                      scanResult.riskLevel === 'High' ? 'bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]' : (scanResult.riskLevel === 'Medium' ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' : 'bg-emerald-400 shadow-[0_0_8px_#34d399]')
                    }`} />
                    {scanResult.threatType}
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto font-mono text-[10px]">
                <span className="text-slate-500">SCAM RISK LEVEL:</span>
                <span className={`font-bold tracking-wider uppercase px-3 py-1 border ${
                  scanResult.riskLevel === 'High' 
                    ? 'text-red-400 border-red-500/30 bg-red-950/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]' 
                    : (scanResult.riskLevel === 'Medium' ? 'text-amber-400 border-amber-500/30 bg-amber-950/30 shadow-[0_0_10px_rgba(245,158,11,0.1)]' : 'text-emerald-400 border-emerald-500/30 bg-emerald-950/30 shadow-[0_0_10px_rgba(52,211,153,0.1)]')
                }`}>
                  {scanResult.riskLevel} Risk
                </span>
              </div>
            </div>

            {/* Side-by-side Flags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              
              {/* Anomalies Detected */}
              <div className="space-y-4 p-5 bg-black/40 border border-white/[0.03] shadow-lg">
                <h5 className="text-[10px] font-bold text-red-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-red-500" />
                  Scam Flags Found ({scanResult.sketchyFactors?.length || 0})
                </h5>
                <ul className="space-y-3 text-[11px] text-slate-300">
                  {scanResult.sketchyFactors && scanResult.sketchyFactors.length > 0 ? (
                    scanResult.sketchyFactors.map((factor, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: 0.1 + idx * 0.05 }}
                        className="flex gap-2.5 items-start"
                      >
                        <span className="text-red-500 font-mono text-[10px] shrink-0 mt-0.5">⚠️</span>
                        <span className="leading-relaxed">{factor}</span>
                      </motion.li>
                    ))
                  ) : (
                    <li className="text-slate-500 italic font-mono text-[10px]">No warning signs or sketchy things found.</li>
                  )}
                </ul>
              </div>

              {/* Verified Safety */}
              <div className="space-y-4 p-5 bg-black/40 border border-white/[0.03] shadow-lg">
                <h5 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Safe Features Found ({scanResult.safeFactors?.length || 0})
                </h5>
                <ul className="space-y-3 text-[11px] text-slate-300">
                  {scanResult.safeFactors && scanResult.safeFactors.length > 0 ? (
                    scanResult.safeFactors.map((factor, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: 0.1 + idx * 0.05 }}
                        className="flex gap-2.5 items-start"
                      >
                        <span className="text-emerald-400 font-mono text-[10px] shrink-0 mt-0.5">✓</span>
                        <span className="leading-relaxed">{factor}</span>
                      </motion.li>
                    ))
                  ) : (
                    <li className="text-slate-500 italic font-mono text-[10px]">No strong safe indicators found. Be cautious.</li>
                  )}
                </ul>
              </div>

            </div>

            {/* Strategic Advice */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: 0.2 }}
              className={`p-5 border space-y-2.5 shadow-md ${
                scanResult.riskLevel === 'High' 
                  ? 'bg-red-950/10 border-red-500/20 text-red-100' 
                  : (scanResult.riskLevel === 'Medium' ? 'bg-amber-950/10 border-amber-500/20 text-amber-100' : 'bg-emerald-950/10 border-emerald-500/20 text-emerald-100')
              }`}
            >
              <h5 className={`text-[10px] font-bold uppercase tracking-widest font-mono flex items-center gap-1.5 ${
                scanResult.riskLevel === 'High' ? 'text-red-400' : (scanResult.riskLevel === 'Medium' ? 'text-amber-400' : 'text-emerald-400')
              }`}>
                <Lock className="h-3.5 w-3.5" />
                Recommended Safety Steps
              </h5>
              <p className="text-xs leading-relaxed font-sans font-medium">
                {scanResult.recommendation}
              </p>
            </motion.div>

          </motion.div>
        )}

      </div>
    </div>
  );
}
