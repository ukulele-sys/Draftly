import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MailMinus, 
  Check, 
  Inbox, 
  Search, 
  AlertTriangle, 
  Trash2, 
  ExternalLink, 
  Sparkles, 
  Clock, 
  ShieldAlert, 
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { EmailMessage } from '../types';

interface UnsubscribeCenterProps {
  emails: EmailMessage[];
  unsubscribedSenders: string[];
  onUnsubscribe: (senderEmail: string, emailId: string, unsubscribeUrl?: string, unsubscribeMailto?: string) => Promise<void>;
  onClose: () => void;
  accessToken: string | null;
  setAlert: (alert: { type: 'success' | 'error'; text: string } | null) => void;
}

interface SubscriptionSender {
  senderEmail: string;
  senderName: string;
  emails: EmailMessage[];
  latestEmail: EmailMessage;
  unopenedCount: number;
  isUnsubscribed: boolean;
}

export default function UnsubscribeCenter({
  emails,
  unsubscribedSenders,
  onUnsubscribe,
  onClose,
  accessToken,
  setAlert
}: UnsubscribeCenterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSenderEmail, setSelectedSenderEmail] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Compile Senders with unopened newsletters or promotional emails
  const subscriptionSenders = useMemo(() => {
    // A promotional or newsletter email with unsubscribe capability or in Promotions category
    const promotionalEmails = emails.filter(e => 
      e.category === 'Promotions' || 
      e.category?.toLowerCase() === 'newsletters' ||
      e.unsubscribeUrl || 
      e.unsubscribeMailto ||
      e.subject.toLowerCase().includes('unsubscribe') ||
      e.body.toLowerCase().includes('unsubscribe')
    );

    // Senders with unopened emails in this set
    const unopenedSubscriptions = promotionalEmails.filter(e => !e.isRead);

    const map: { [key: string]: SubscriptionSender } = {};
    unopenedSubscriptions.forEach(e => {
      const emailKey = (e.senderEmail || e.sender || '').toLowerCase();
      if (!emailKey) return;

      if (!map[emailKey]) {
        map[emailKey] = {
          senderEmail: e.senderEmail || e.sender,
          senderName: e.senderName || e.senderEmail || e.sender,
          emails: [],
          latestEmail: e,
          unopenedCount: 0,
          isUnsubscribed: unsubscribedSenders.some(s => s.toLowerCase() === emailKey),
        };
      }
      map[emailKey].emails.push(e);
      map[emailKey].unopenedCount += 1;

      // Track latest email by date
      if (new Date(e.date) > new Date(map[emailKey].latestEmail.date)) {
        map[emailKey].latestEmail = e;
      }
    });

    return Object.values(map)
      .map(sender => ({
        ...sender,
        isUnsubscribed: unsubscribedSenders.some(s => s.toLowerCase() === sender.senderEmail.toLowerCase())
      }))
      .sort((a, b) => b.unopenedCount - a.unopenedCount);
  }, [emails, unsubscribedSenders]);

  // Filter subscription senders by search term
  const filteredSenders = useMemo(() => {
    if (!searchTerm.trim()) return subscriptionSenders;
    const term = searchTerm.toLowerCase();
    return subscriptionSenders.filter(s => 
      s.senderName.toLowerCase().includes(term) || 
      s.senderEmail.toLowerCase().includes(term)
    );
  }, [subscriptionSenders, searchTerm]);

  // Handle auto-selecting the first sender if none is selected
  useMemo(() => {
    if (filteredSenders.length > 0 && !selectedSenderEmail) {
      setSelectedSenderEmail(filteredSenders[0].senderEmail);
    } else if (filteredSenders.length === 0) {
      setSelectedSenderEmail(null);
    }
  }, [filteredSenders, selectedSenderEmail]);

  // Find currently active sender details
  const activeSender = useMemo(() => {
    return filteredSenders.find(s => s.senderEmail === selectedSenderEmail) || null;
  }, [filteredSenders, selectedSenderEmail]);

  const handleTriggerUnsubscribe = async (sender: SubscriptionSender) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await onUnsubscribe(
        sender.senderEmail,
        sender.latestEmail.id,
        sender.latestEmail.unsubscribeUrl,
        sender.latestEmail.unsubscribeMailto
      );
    } catch (err: any) {
      console.error('Failed to unsubscribe:', err);
      setAlert({
        type: 'error',
        text: err.message || 'Failed to complete unsubscribe request.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div id="unsubscribe-center-container" className="flex-1 flex overflow-hidden bg-[#0D0D0D]">
      
      {/* Middle Pane: Subscription List */}
      <section className="w-80 sm:w-96 border-r border-[#2A2A2A] bg-[#0D0D0D] flex flex-col shrink-0">
        <div className="p-6 border-b border-[#2A2A2A] bg-[#151515]/10 flex items-center justify-between shrink-0">
          <div>
            <p className="text-[8px] uppercase tracking-[0.25em] text-[#888] font-mono mb-1 leading-none">Auto-Clutter Detection</p>
            <h2 className="text-lg font-serif italic text-white font-medium">Unsubscribe recommendations</h2>
          </div>
          <span className="text-[10px] font-mono text-[#555] bg-[#151515] px-2 py-1 border border-[#2A2A2A]">
            {filteredSenders.length} Senders
          </span>
        </div>

        {/* Search Input */}
        <div className="px-6 py-3 border-b border-[#2A2A2A]/60 bg-[#0D0D0D] flex flex-col gap-2 shrink-0">
          <div className="relative">
            <input
              type="text"
              placeholder="Filter subscriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#151515] border border-[#2A2A2A] rounded-none pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-white"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600" />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* List of Senders */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#2A2A2A]/40">
          {filteredSenders.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-mono text-xs">
              {searchTerm ? 'No matching subscriptions found.' : 'No subscription noise detected.'}
            </div>
          ) : (
            filteredSenders.map((sender) => {
              const isSelected = sender.senderEmail === selectedSenderEmail;
              return (
                <button
                  key={sender.senderEmail}
                  onClick={() => setSelectedSenderEmail(sender.senderEmail)}
                  className={`w-full text-left p-5 transition-all flex flex-col gap-1 cursor-pointer focus:outline-none ${
                    isSelected 
                      ? 'bg-[#151515] border-l-2 border-white pl-[18px]' 
                      : 'hover:bg-[#151515]/30 border-l-2 border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-serif italic text-sm text-slate-200 font-medium truncate">
                      {sender.senderName}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {sender.isUnsubscribed ? (
                        <span className="text-[8px] font-mono font-bold tracking-wider px-1.5 py-0.25 bg-slate-900 text-slate-400 border border-slate-800">
                          UNSUBSCRIBED
                        </span>
                      ) : (
                        <span className="text-[8px] font-mono font-bold tracking-wider px-1.5 py-0.25 bg-red-950/20 text-red-400 border border-red-900/30">
                          {sender.unopenedCount} UNREAD
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-[10px] font-mono text-[#555] truncate">
                    {sender.senderEmail}
                  </p>

                  <p className="text-xs text-slate-400 font-sans line-clamp-1 mt-1">
                    {sender.latestEmail.subject}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="h-3 w-3 text-slate-700" />
                    <span className="text-[9px] font-mono text-slate-600">
                      Latest: {sender.latestEmail.date}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </section>

      {/* Right Pane: Subscription Analytical Dashboard */}
      <section className="flex-1 bg-[#0D0D0D] flex flex-col min-w-0 overflow-y-auto">
        <AnimatePresence mode="wait">
          {!activeSender ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col items-center justify-center p-12 text-center"
            >
              <div className="h-16 w-16 bg-[#151515] border border-[#2A2A2A] flex items-center justify-center mb-6">
                <Inbox className="h-6 w-6 text-[#555]" />
              </div>
              <h3 className="text-lg font-serif italic text-white font-medium mb-2">Zero Subscription Noise</h3>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed mb-6">
                Congratulations! We didn't detect any unopened promotional emails, newsletters, or subscription lists. Your inbox is running at absolute peak efficiency.
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-white text-black hover:bg-neutral-200 text-xs font-mono font-bold uppercase transition-colors cursor-pointer"
              >
                Return to Inbox
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={activeSender.senderEmail}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col"
            >
              {/* Header Details */}
              <div className="p-8 border-b border-[#2A2A2A] bg-[#151515]/10 flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
                <div className="space-y-1">
                  <span className="text-[8px] font-mono uppercase tracking-[0.2em] text-[#888] bg-white/5 border border-white/10 px-2 py-0.5">
                    DETECTOR: {activeSender.latestEmail.unsubscribeUrl || activeSender.latestEmail.unsubscribeMailto ? 'DIRECT EMAIL HEADER' : 'SEMANTIC INBOX ANALYSIS'}
                  </span>
                  <h1 className="text-2xl font-serif italic text-white font-semibold tracking-tight mt-2">
                    {activeSender.senderName}
                  </h1>
                  <p className="text-xs font-mono text-slate-400">
                    Mailing list sender: {activeSender.senderEmail}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-[#151515] hover:bg-white hover:text-black text-slate-200 border border-[#2A2A2A] text-xs font-mono font-bold uppercase transition-all cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Main Content Pane */}
              <div className="p-8 space-y-8 flex-1">
                
                {/* Visual Recommendation Banner */}
                <div className="border border-[#2A2A2A] bg-[#151515]/30 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 text-amber-500">
                      <ShieldAlert className="h-4 w-4 shrink-0" />
                      <span className="text-[10px] font-mono uppercase tracking-widest font-bold">Unsubscribe recommendation</span>
                    </div>
                    <p className="text-xs text-slate-300 font-sans leading-relaxed mt-2">
                      You have received <strong className="text-white">{activeSender.unopenedCount} newsletters or updates</strong> from this sender in the recent past and <strong className="text-white">haven't opened a single one</strong>. We recommend removing yourself from this subscription to clean your inbox feed.
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2 text-right shrink-0">
                    <div className="text-[9px] font-mono text-[#555] uppercase">Auto-Action Method</div>
                    <span className="text-xs font-mono text-slate-300 bg-white/5 px-2.5 py-1 border border-white/10 uppercase">
                      {activeSender.latestEmail.unsubscribeUrl ? '1-Click Unsubscribe Link' : activeSender.latestEmail.unsubscribeMailto ? 'Direct Unsubscribe Email' : 'Heuristic Link Extraction'}
                    </span>
                  </div>
                </div>

                {/* Unsubscribe Controller Dashboard */}
                <div className="border border-[#2A2A2A] bg-[#151515]/10 p-8 flex flex-col items-center text-center">
                  {activeSender.isUnsubscribed ? (
                    <div className="space-y-4 py-4">
                      <div className="mx-auto h-12 w-12 rounded-none border border-emerald-900 bg-emerald-950/10 flex items-center justify-center text-emerald-400">
                        <Check className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-serif italic text-lg text-white font-medium">Successfully Unsubscribed</h4>
                        <p className="text-xs text-slate-400 font-mono mt-1">
                          Auto-sender has been blocked. No further newsletters will load.
                        </p>
                      </div>
                      {activeSender.latestEmail.unsubscribeUrl && (
                        <div className="pt-2">
                          <a
                            href={activeSender.latestEmail.unsubscribeUrl}
                            target="_blank"
                            referrerPolicy="no-referrer"
                            className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#888] hover:text-white underline transition-colors"
                          >
                            Verify unsubscribe page <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6 max-w-md w-full">
                      <div className="space-y-2">
                        <h4 className="text-sm font-mono uppercase tracking-wider text-slate-200">1-Click Unsubscribe Mechanism</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Draftly will automatically handle the cancellation flow behind the scenes. We'll send a direct unsubscribe email or trigger the cancellation web-hook on your behalf.
                        </p>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={() => handleTriggerUnsubscribe(activeSender)}
                          disabled={isProcessing}
                          className="w-full flex items-center justify-center gap-2 p-4 bg-white hover:bg-neutral-200 text-black font-mono text-xs uppercase font-bold tracking-wider disabled:opacity-45 transition-all cursor-pointer rounded-none border-none"
                        >
                          {isProcessing ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              PROCESSING AUTO-UNSUBSCRIBE...
                            </>
                          ) : (
                            <>
                              <MailMinus className="h-4 w-4 shrink-0" />
                              UNSUBSCRIBE IN 1-CLICK
                            </>
                          )}
                        </button>
                      </div>

                      {activeSender.latestEmail.unsubscribeUrl && (
                        <p className="text-[10px] font-mono text-[#555]">
                          Or unsubscribe manually: {' '}
                          <a 
                            href={activeSender.latestEmail.unsubscribeUrl} 
                            target="_blank" 
                            referrerPolicy="no-referrer"
                            className="text-slate-400 hover:text-white underline"
                          >
                            visit unsubscribe website
                          </a>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Unopened Email History Preview */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Inbox className="h-4 w-4 text-slate-500" />
                    <h3 className="text-xs font-mono uppercase tracking-wider text-slate-200">Unopened Emails From This Sender ({activeSender.emails.length})</h3>
                  </div>

                  <div className="space-y-3 divide-y divide-[#2A2A2A]/40 border border-[#2A2A2A] bg-[#0A0A0A]">
                    {activeSender.emails.map((e) => (
                      <div key={e.id} className="p-5 flex flex-col gap-1.5 transition-colors hover:bg-white/[0.01]">
                        <div className="flex justify-between items-start gap-4">
                          <h4 className="text-sm font-serif italic text-slate-100 font-medium leading-snug">
                            {e.subject}
                          </h4>
                          <span className="text-[10px] font-mono text-[#555] shrink-0">
                            {e.date}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-sans line-clamp-2 leading-relaxed">
                          {e.body}
                        </p>
                        {e.summary && (
                          <div className="mt-2 text-[10px] font-mono text-[#888] bg-white/[0.02] border border-white/5 p-2 flex items-start gap-1.5">
                            <Sparkles className="h-3 w-3 text-[#aaa] shrink-0 mt-0.5" />
                            <span>
                              <strong className="text-slate-300">A.I. Summary:</strong> {e.summary}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

    </div>
  );
}
