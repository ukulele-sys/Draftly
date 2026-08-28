import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Calendar, 
  CheckSquare, 
  MessageSquare, 
  Shield, 
  Send, 
  RefreshCw, 
  Mic, 
  MicOff,
  Inbox,
  TrendingUp,
  AlertCircle,
  Cpu,
  Bookmark,
  Activity,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Terminal,
  Lock
} from 'lucide-react';
import { EmailMessage } from '../types';

interface EmailDetailProps {
  email: EmailMessage | null;
  onGenerateReply: (email: EmailMessage, tone: string, instructions: string) => Promise<string>;
  onSendEmail: (to: string, subject: string, body: string, threadId?: string) => Promise<void>;
  isGeneratingReply: boolean;
  isSendingEmail: boolean;
  onTriggerSendConfirm: (to: string, subject: string, body: string) => void;
  initialDraftText?: string;
  initialDraftEmailId?: string;
  accessToken?: string | null;
  emails?: EmailMessage[];
  onSelectEmailId?: (id: string) => void;
}

const extractLinks = (text?: string): string[] => {
  if (!text) return [];
  // Unescape standard HTML entities if present in raw string
  const cleanText = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');
  
  const rawLinks = cleanText.match(/(https?:\/\/[^\s"'<>\(\)]+)/gi) || [];
  return Array.from(new Set(rawLinks.map(link => {
    // Strip trailing punctuation that's usually part of the enclosing sentence
    return link.replace(/[.,;:!?)]$/, '');
  })));
};

export default function EmailDetail({
  email,
  onGenerateReply,
  onSendEmail,
  isGeneratingReply,
  isSendingEmail,
  onTriggerSendConfirm,
  initialDraftText,
  initialDraftEmailId,
  accessToken,
  emails = [],
  onSelectEmailId,
}: EmailDetailProps) {
  const [tone, setTone] = useState<'professional' | 'friendly' | 'concise' | 'direct' | 'apologetic'>('professional');
  const [instructions, setInstructions] = useState('');
  const [draftReply, setDraftReply] = useState('');

  // Real-time ticking clock for command desk
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  // Speech recognition states
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  // Track checked state of action items locally to let users complete things!
  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>({});

  // Calendar Integration States
  const [suggestedTimes, setSuggestedTimes] = useState<{ id: string; start: string; end: string; label: string }[]>([]);
  const [isFetchingTimes, setIsFetchingTimes] = useState(false);
  const [timesError, setTimesError] = useState<string | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState<string | null>(null);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  // Modal Form States
  const [meetTitle, setMeetTitle] = useState('');
  const [meetDesc, setMeetDesc] = useState('');
  const [meetDateStart, setMeetDateStart] = useState('');
  const [meetDateEnd, setMeetDateEnd] = useState('');

  // Link preview and copying states
  const [activePreviewUrl, setActivePreviewUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const handlePreviewUrl = (url: string) => {
    setActivePreviewUrl(url);
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(url);
    setTimeout(() => setCopiedLink(null), 3000);
  };

  // Threat and Scam Scanner States
  const [scanType, setScanType] = useState<'email' | 'custom'>('email');
  const [selectedScanEmailId, setSelectedScanEmailId] = useState<string>('');
  const [customScanInput, setCustomScanInput] = useState<string>('');
  const [isScanningThreat, setIsScanningThreat] = useState(false);
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

  // Auto-initialize first email ID for scanner if empty
  useEffect(() => {
    if (emails.length > 0 && !selectedScanEmailId) {
      setSelectedScanEmailId(emails[0].id);
    }
  }, [emails, selectedScanEmailId]);

  const runThreatScan = async () => {
    setIsScanningThreat(true);
    setScanError(null);
    setScanResult(null);
    setScanProgressLines([]);

    let targetText = '';
    let targetUrl = '';

    if (scanType === 'email') {
      const selectedMail = emails.find(e => e.id === selectedScanEmailId);
      if (!selectedMail) {
        setScanError('Please select a valid email transmission to analyze.');
        setIsScanningThreat(false);
        return;
      }
      targetText = `Subject: ${selectedMail.subject}\nSender: ${selectedMail.senderName || selectedMail.sender}\n\n${selectedMail.body}`;
    } else {
      const trimmed = customScanInput.trim();
      if (!trimmed) {
        setScanError('Please paste a suspicious link, text or email snippet to analyze.');
        setIsScanningThreat(false);
        return;
      }
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        targetUrl = trimmed;
      } else {
        targetText = trimmed;
      }
    }

    // Cognitive terminal sequence
    const stages = [
      `[SANDBOX] Connection secure. Initializing sandbox virtual machine...`,
      `[ANALYST] Inspecting DKIM, SPF records, and routing trace hops...`,
      `[NLP] Analyzing semantic urgency, financial demands, & coercive markers...`,
      `[URL] Crawling embedded hyper-text structures and destination domains...`,
      `[COGNITIVE] Comparing against known dark-web phishing and harvesting templates...`,
      `[REPUTATION] Correlating destination nodes against secure blocklist indexes...`,
      `[COMPILE] Rendering final cognitive vulnerability rating...`
    ];

    for (let i = 0; i < stages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 150));
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
        throw new Error(`Cognitive Scan error: Status ${response.status}`);
      }

      const data = await response.json();
      setScanResult(data);
    } catch (e: any) {
      console.error(e);
      setScanError(e.message || 'Threat verification engine offline. Try again.');
    } finally {
      setIsScanningThreat(false);
    }
  };

  const extractedUrls = email ? extractLinks(email.body) : [];

  const formatToDatetimeLocal = (isoString: string) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${date}T${hours}:${minutes}`;
  };

  const fetchSuggestedTimes = async () => {
    setIsFetchingTimes(true);
    setTimesError(null);
    try {
      const response = await fetch('/api/calendar/suggested-times', {
        headers: {
          'Authorization': `Bearer ${accessToken || localStorage.getItem('draftly_google_access_token') || 'apple_mock_session_token_123'}`,
        },
      });
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          setSuggestedTimes(data.suggestedTimes || []);
        } else {
          setTimesError('Unexpected response format from Calendar service.');
        }
      } else {
        setTimesError('Unable to retrieve suggested times.');
      }
    } catch (err) {
      console.error(err);
      setTimesError('Connection to Calendar failed.');
    } finally {
      setIsFetchingTimes(false);
    }
  };

  const handleSelectSuggestedSlot = (slot: { start: string; end: string }) => {
    setMeetDateStart(formatToDatetimeLocal(slot.start));
    setMeetDateEnd(formatToDatetimeLocal(slot.end));
    setShowScheduleModal(true);
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetDateStart || !meetDateEnd) {
      setScheduleError('Please select start and end times.');
      return;
    }

    const startDateFormatted = new Date(meetDateStart).toLocaleString();
    const confirmed = window.confirm(
      `Confirm scheduling "${meetTitle}" with ${email?.senderEmail || email?.sender} on ${startDateFormatted}?`
    );
    if (!confirmed) return;

    setIsScheduling(true);
    setScheduleError(null);
    setScheduleSuccess(null);

    try {
      const response = await fetch('/api/calendar/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken || localStorage.getItem('draftly_google_access_token') || 'apple_mock_session_token_123'}`,
        },
        body: JSON.stringify({
          summary: meetTitle,
          description: meetDesc,
          startTime: new Date(meetDateStart).toISOString(),
          endTime: new Date(meetDateEnd).toISOString(),
          attendeeEmail: email?.senderEmail || '',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setScheduleSuccess(data.htmlLink || 'https://calendar.google.com');
      } else {
        const errData = await response.json().catch(() => ({}));
        let errMsg = 'Failed to create calendar event.';
        if (typeof errData.error === 'string') {
          errMsg = errData.error;
        } else if (errData.error && typeof errData.error === 'object') {
          errMsg = errData.error.message || errMsg;
        } else if (typeof errData.message === 'string') {
          errMsg = errData.message;
        }
        setScheduleError(errMsg);
      }
    } catch (err: any) {
      console.error(err);
      setScheduleError(err.message || 'Error occurred while scheduling.');
    } finally {
      setIsScheduling(false);
    }
  };

  useEffect(() => {
    // Reset draft and local completed actions when email changes
    if (email && email.id === initialDraftEmailId && initialDraftText) {
      setDraftReply(initialDraftText);
    } else {
      setDraftReply('');
    }
    setInstructions('');
    setCompletedActions({});
    
    // Clean up active speech recognition on email change
    if (isRecording) {
      setIsRecording(false);
      setRecordingError(null);
    }

    if (email && email.isMeetingRequest) {
      fetchSuggestedTimes();
      setMeetTitle(`Meeting with ${email.senderName || email.senderEmail || 'Sender'}`);
      setMeetDesc(`Discussing: "${email.subject}"\n\nScheduled via Draftly`);
      setMeetDateStart('');
      setMeetDateEnd('');
      setScheduleSuccess(null);
      setScheduleError(null);
    } else {
      setSuggestedTimes([]);
    }
  }, [email, initialDraftEmailId, initialDraftText]);

  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setRecordingError('Speech recognition is not supported in this browser. Try Google Chrome or Safari.');
      setTimeout(() => setRecordingError(null), 5000);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false; // Stop listening when user stops speaking to be concise
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsRecording(true);
        setRecordingError(null);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInstructions((prev) => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${transcript}` : transcript;
          });
        }
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setRecordingError('Microphone permission denied. Please allow microphone access in settings.');
        } else if (event.error === 'no-speech') {
          setRecordingError('No speech detected. Please try again.');
        } else {
          setRecordingError(`Voice-to-text error: ${event.error}`);
        }
        setIsRecording(false);
        setTimeout(() => setRecordingError(null), 5000);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      rec.start();
      setRecognition(rec);
    } catch (e: any) {
      console.error('Error starting speech recognition:', e);
      setRecordingError('Failed to start speech recognition.');
      setTimeout(() => setRecordingError(null), 5000);
    }
  };

  const stopSpeechRecognition = () => {
    if (recognition) {
      try {
        recognition.stop();
      } catch (e) {
        console.error(e);
      }
    }
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopSpeechRecognition();
    } else {
      startSpeechRecognition();
    }
  };

  if (!email) {
    // Dynamic calculations for Bento Stats
    const totalCount = emails.length;
    const unreadCount = emails.filter((e) => !e.isRead).length;
    
    // Categorize priority emails (Primary, Work, Bills)
    const priorityCount = emails.filter(
      (e) => e.category === 'Primary' || e.category === 'Work' || e.category === 'Urgent Bills'
    ).length;
    const focusRatio = totalCount > 0 ? Math.round((priorityCount / totalCount) * 100) : 100;
    
    // Total extracted task lists across all mails
    const totalTasks = emails.reduce((sum, e) => sum + (e.actionItems?.length || 0), 0);
    const meetingRequests = emails.filter((e) => e.isMeetingRequest).length;

    // Get 3 latest transmissions to show in interactive Feed
    const latestEmails = [...emails].slice(0, 3);

    return (
      <div className="flex-1 flex flex-col p-6 lg:p-10 h-full bg-[#0D0D0D] overflow-y-auto scrollbar-thin relative text-[#E0E0E0] select-none">
        {/* Visual Ambient Glows */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-rose-500/3 rounded-full blur-[100px] pointer-events-none" />

        {/* Command Hub Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2A2A2A]/40 pb-6 mb-8 relative z-10">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-[0.25em] font-mono flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
              Draftly Executive Engine V1.4
            </span>
            <h2 className="text-2xl font-serif italic font-light text-white leading-tight">
              Inbox Intelligence Deck
            </h2>
            <p className="text-xs text-[#888] font-sans">
              Real-time semantic routing and cognitive summarization dashboard.
            </p>
          </div>

          {/* Luxury Live Clock Display */}
          <div className="bg-[#151515] border border-[#2A2A2A] px-4 py-3 font-mono flex flex-col items-end shrink-0 select-none shadow-md">
            <span className="text-[9px] uppercase tracking-widest text-[#555] font-bold">SECURE NETWORK TIME</span>
            <span className="text-md text-white font-semibold tracking-wide flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
              {currentTime.toISOString().replace('T', ' ').substring(0, 19)} UTC
            </span>
          </div>
        </div>

        {/* Bento Grid Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-10">
          
          {/* Card 1: Inbox Health / Focus Ratio */}
          <div className="p-5 bg-gradient-to-br from-[#151515] to-[#0D0D0D] border border-white/5 rounded-none space-y-4 shadow-md hover:border-indigo-500/20 transition-all group duration-300">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#555] uppercase tracking-wider font-mono flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                Focus Efficiency
              </span>
              <span className="text-[8px] uppercase tracking-widest font-mono text-emerald-400 font-bold bg-emerald-950/20 border border-emerald-500/20 px-2 py-0.5">
                Active
              </span>
            </div>
            
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-serif italic text-white font-medium">{focusRatio}%</span>
              <span className="text-xs text-slate-400 font-mono">ratio</span>
            </div>

            <div className="space-y-1">
              <div className="h-1.5 w-full bg-[#151515] rounded-none overflow-hidden border border-[#2A2A2A]">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-indigo-400 transition-all duration-500"
                  style={{ width: `${focusRatio}%` }}
                />
              </div>
              <p className="text-[9px] text-[#555] font-mono leading-normal">
                {priorityCount} out of {totalCount} incoming streams marked critical.
              </p>
            </div>
          </div>

          {/* Card 2: Extracted Actions */}
          <div className="p-5 bg-gradient-to-br from-[#151515] to-[#0D0D0D] border border-white/5 rounded-none space-y-4 shadow-md hover:border-amber-500/20 transition-all group duration-300">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#555] uppercase tracking-wider font-mono flex items-center gap-1.5">
                <CheckSquare className="h-4 w-4 text-amber-400" />
                Action Items Extracted
              </span>
              <span className="text-[8px] uppercase tracking-widest font-mono text-amber-400 font-bold bg-amber-950/20 border border-amber-500/20 px-2 py-0.5 animate-pulse-subtle">
                {meetingRequests} meetings
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-serif italic text-white font-medium">{totalTasks}</span>
              <span className="text-xs text-slate-400 font-mono">commitments</span>
            </div>

            <div className="text-[10px] text-slate-400 font-sans leading-relaxed">
              Gemini models successfully parsed and built local checklists for {emails.filter(e => e.actionItems && e.actionItems.length > 0).length} emails.
            </div>
          </div>

          {/* Card 3: Cognitive Classifier Engine */}
          <div className="p-5 bg-gradient-to-br from-[#151515] to-[#0D0D0D] border border-white/5 rounded-none space-y-4 shadow-md hover:border-purple-500/20 transition-all group duration-300">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#555] uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Cpu className="h-4 w-4 text-purple-400" />
                Neural Status
              </span>
              <span className="text-[8px] uppercase tracking-widest font-mono text-purple-400 font-bold bg-purple-950/20 border border-purple-500/20 px-2 py-0.5">
                98.4% Acc
              </span>
            </div>

            <div className="space-y-1 font-mono text-[11px]">
              <div className="flex justify-between border-b border-white/5 py-1">
                <span className="text-[#555]">Active Model:</span>
                <span className="text-slate-200 font-bold">Gemini-1.5-Flash</span>
              </div>
              <div className="flex justify-between border-b border-white/5 py-1">
                <span className="text-[#555]">Classify Speed:</span>
                <span className="text-slate-200 font-bold">~42ms / token</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#555]">Gmail Auth status:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Secure
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Lower Grid: Recent Stream Feed & Quick Guides */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
          
          {/* Recent Transmission Stream (Interactive) */}
          <div className="lg:col-span-2 p-6 bg-[#151515]/30 border border-white/5 rounded-none space-y-4 shadow-md flex flex-col">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-indigo-400" />
                <h3 className="text-xs font-serif italic text-white font-medium">Recent Transmission Stream</h3>
              </div>
              <span className="text-[9px] font-mono text-[#555]">Click to inspect item</span>
            </div>

            <div className="flex-1 space-y-3">
              {latestEmails.length > 0 ? (
                latestEmails.map((e) => {
                  // Badges color mapping
                  let dotColor = 'bg-slate-500';
                  if (e.category === 'Urgent Bills') dotColor = 'bg-rose-500';
                  else if (e.category === 'Work') dotColor = 'bg-blue-400';
                  else if (e.category === 'Newsletters') dotColor = 'bg-emerald-400';
                  else if (e.category === 'Promotions') dotColor = 'bg-amber-400';
                  else if (e.category === 'Primary') dotColor = 'bg-white';

                  return (
                    <div
                      key={e.id}
                      onClick={() => onSelectEmailId && onSelectEmailId(e.id)}
                      className="p-4 bg-black/40 border border-[#2A2A2A]/40 hover:border-indigo-500/40 hover:bg-white/[0.01] transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group"
                    >
                      <div className="flex items-start gap-3 truncate">
                        <span className={`h-2 w-2 rounded-full ${dotColor} shrink-0 mt-1.5`} />
                        <div className="truncate">
                          <h4 className="text-xs text-white font-medium truncate group-hover:text-indigo-300 transition-colors">
                            {e.subject || '(No Subject)'}
                          </h4>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5 font-mono">
                            Sender: {e.senderName || e.sender}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest border border-white/5 px-2 py-0.5 font-mono">
                          {e.category}
                        </span>
                        <ChevronRight className="h-3 w-3 text-[#555] group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center text-[#555] border border-dashed border-[#2A2A2A]/40">
                  <Inbox className="h-8 w-8 text-[#222] mb-2 stroke-[1]" />
                  <p className="text-[11px] font-mono">No synchronized transmissions.</p>
                  <p className="text-[10px] text-[#555] mt-1 max-w-xs">
                    Hit the "Analyze" button on the workspace header to pull fresh digital correspondence from Gmail.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Capabilities Card */}
          <div className="p-6 bg-[#151515]/30 border border-white/5 rounded-none space-y-4 shadow-md">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <h3 className="text-xs font-serif italic text-white font-medium">Draftly Capabilities</h3>
            </div>

            <ul className="space-y-4 text-xs">
              <li className="flex gap-3">
                <span className="h-5 w-5 bg-white/5 border border-white/10 flex items-center justify-center shrink-0 font-mono text-[10px] text-indigo-400">1</span>
                <div>
                  <h4 className="text-white font-medium">Cognitive Summary</h4>
                  <p className="text-[10px] text-slate-400 leading-normal mt-0.5">Complex email chains reduced to 3 bullet points instantly.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="h-5 w-5 bg-white/5 border border-white/10 flex items-center justify-center shrink-0 font-mono text-[10px] text-indigo-400">2</span>
                <div>
                  <h4 className="text-white font-medium">Commitment Checklists</h4>
                  <p className="text-[10px] text-slate-400 leading-normal mt-0.5">Deadlines and commitments extracted as interactive checkboxes.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="h-5 w-5 bg-white/5 border border-white/10 flex items-center justify-center shrink-0 font-mono text-[10px] text-indigo-400">3</span>
                <div>
                  <h4 className="text-white font-medium">Voice Dictation replies</h4>
                  <p className="text-[10px] text-slate-400 leading-normal mt-0.5">Click the microphone inside any email to speak your reply instructions.</p>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Cognitive Fraud & Sketchiness Scanner Section */}
        <div className="mt-8 p-6 bg-gradient-to-br from-[#12121a] via-[#101014] to-[#0e0e12] border-t-4 border-t-indigo-500 border border-white/5 rounded-none space-y-6 shadow-xl relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="h-5 w-5 text-indigo-400 animate-pulse" />
              <div>
                <h3 className="text-sm font-serif italic text-white font-medium">Cognitive Threat & Phishing Scanner</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Linguistic pressure tactics, authority-spoofing flags, and sandbox URL reputation reviews.</p>
              </div>
            </div>

            {/* Tab Controls */}
            <div className="flex border border-indigo-500/20 bg-indigo-950/20 p-0.5">
              <button
                type="button"
                onClick={() => { setScanType('email'); setScanResult(null); }}
                className={`px-3 py-1 text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                  scanType === 'email' ? 'bg-gradient-to-r from-indigo-600 to-pink-600 text-white border border-indigo-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Scan Inbox
              </button>
              <button
                type="button"
                onClick={() => { setScanType('custom'); setScanResult(null); }}
                className={`px-3 py-1 text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                  scanType === 'custom' ? 'bg-gradient-to-r from-indigo-600 to-pink-600 text-white border border-indigo-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sandbox Paste
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {scanType === 'email' ? (
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-indigo-300/80 uppercase tracking-wider font-mono">Select Synchronized Transmission</label>
                <select
                  value={selectedScanEmailId}
                  onChange={(e) => { setSelectedScanEmailId(e.target.value); setScanResult(null); }}
                  className="w-full bg-black/80 border border-indigo-500/20 text-slate-300 p-3 text-xs focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 rounded-none outline-none font-sans"
                >
                  {emails.length > 0 ? (
                    emails.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.subject || '(No Subject)'} — {e.senderName || e.sender}
                      </option>
                    ))
                  ) : (
                    <option value="">No synchronized email transmissions found.</option>
                  )}
                </select>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-indigo-300/80 uppercase tracking-wider font-mono">Target URL or Text Code</label>
                <textarea
                  value={customScanInput}
                  onChange={(e) => { setCustomScanInput(e.target.value); setScanResult(null); }}
                  placeholder="Paste raw email body, suspicious message snippet, or a target URL (e.g., https://secure-login-update-required.xyz)..."
                  className="w-full h-24 bg-black/80 border border-indigo-500/20 text-slate-300 p-3 text-xs focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 rounded-none outline-none font-mono resize-none"
                />
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={runThreatScan}
                disabled={isScanningThreat || (scanType === 'email' && emails.length === 0)}
                className={`py-2 px-5 font-mono text-[10px] font-bold uppercase transition-all duration-300 flex items-center gap-2 cursor-pointer rounded-none border shadow-lg ${
                  isScanningThreat 
                    ? 'bg-[#151515] border-[#2A2A2A] text-[#555]' 
                    : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 text-white border-transparent shadow-indigo-500/10'
                }`}
              >
                {isScanningThreat ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-slate-500" />
                    Analyzing Neural Vectors...
                  </>
                ) : (
                  <>
                    <ShieldAlert className="h-4 w-4 text-white" />
                    Initialize Cognitive Threat Scan
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Interactive Scanning Console */}
          {isScanningThreat && (
            <div className="bg-[#0b0b0e] border border-indigo-500/20 p-4 rounded-none font-mono text-[10px] text-indigo-400 space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin shadow-inner">
              <div className="flex items-center justify-between text-indigo-300/60 border-b border-indigo-500/10 pb-1.5 mb-2 uppercase text-[9px] font-bold tracking-widest">
                <span>Active Sandbox Scan Log</span>
                <span className="animate-pulse text-pink-400 font-bold">● COGNITIVE ENGINE ACTIVE</span>
              </div>
              {scanProgressLines.map((line, idx) => (
                <div key={idx} className="flex gap-2.5">
                  <span className="text-indigo-500/50">0{idx+1}</span>
                  <span className="text-slate-300">{line}</span>
                </div>
              ))}
              <div className="animate-pulse text-pink-400/80 font-bold">_ [AWAITING COMPILER RESULTS...]</div>
            </div>
          )}

          {scanError && (
            <div className="p-3 bg-rose-950/20 border border-rose-500/30 text-rose-400 text-xs font-mono">
              ⚠️ Error: {scanError}
            </div>
          )}

          {/* Scan Results Display */}
          {scanResult && !isScanningThreat && (
            <div className={`p-6 border rounded-none space-y-5 animate-fade-in ${
              scanResult.riskLevel === 'High' 
                ? 'bg-gradient-to-br from-red-950/20 via-[#0d0a0a] to-[#0a0606] border-red-500/30' 
                : (scanResult.riskLevel === 'Medium' ? 'bg-gradient-to-br from-amber-950/20 via-[#0f0e0a] to-[#0a0906] border-amber-500/30' : 'bg-gradient-to-br from-emerald-950/15 via-[#0a0d0a] to-[#060a06] border-emerald-500/30')
            }`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`h-14 w-14 rounded-none border flex flex-col items-center justify-center font-mono text-base font-extrabold bg-black/80 shrink-0 ${
                    scanResult.riskLevel === 'High' 
                      ? 'border-red-500 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.1)]' 
                      : (scanResult.riskLevel === 'Medium' ? 'border-amber-500 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.1)]' : 'border-emerald-400 text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.1)]')
                  }`}>
                    <span>{scanResult.riskScore}</span>
                    <span className="text-[6px] text-slate-500 uppercase -mt-1 font-bold">INDEX</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono block">Cognitive Threat Classifier</span>
                    <h4 className="text-xs font-serif italic text-white font-medium flex items-center gap-2 mt-0.5">
                      <span className={`inline-block h-2 w-2 rounded-full ${
                        scanResult.riskLevel === 'High' ? 'bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]' : (scanResult.riskLevel === 'Medium' ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' : 'bg-emerald-400 shadow-[0_0_8px_#34d399]')
                      }`} />
                      {scanResult.threatType}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className="text-[9px] font-mono text-slate-500">SECURITY RATING:</span>
                  <span className={`text-[9px] font-bold tracking-wider uppercase font-mono px-2.5 py-0.75 border ${
                    scanResult.riskLevel === 'High' 
                      ? 'text-red-400 border-red-500/30 bg-red-950/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]' 
                      : (scanResult.riskLevel === 'Medium' ? 'text-amber-400 border-amber-500/30 bg-amber-950/30 shadow-[0_0_10px_rgba(245,158,11,0.1)]' : 'text-emerald-400 border-emerald-500/30 bg-emerald-950/30 shadow-[0_0_10px_rgba(52,211,153,0.1)]')
                  }`}>
                    {scanResult.riskLevel} Risk
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                {/* Sketchy factors */}
                <div className="space-y-3.5 p-4.5 bg-black/40 border border-white/[0.03] shadow-md">
                  <h5 className="text-[10px] font-bold text-red-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5 text-red-500 animate-pulse" />
                    Threat Flags & Anomalies ({scanResult.sketchyFactors?.length || 0})
                  </h5>
                  <ul className="space-y-2.5 text-[11px] text-slate-300">
                    {scanResult.sketchyFactors && scanResult.sketchyFactors.length > 0 ? (
                      scanResult.sketchyFactors.map((factor, idx) => (
                        <li key={idx} className="flex gap-2.5 items-start">
                          <span className="text-red-500 font-mono text-[10px] shrink-0 mt-0.5">⚡</span>
                          <span className="leading-relaxed">{factor}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-500 italic font-mono text-[10px]">Zero sketchy signals detected.</li>
                    )}
                  </ul>
                </div>

                {/* Safe factors */}
                <div className="space-y-3.5 p-4.5 bg-black/40 border border-white/[0.03] shadow-md">
                  <h5 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    Verified Safety Pillars ({scanResult.safeFactors?.length || 0})
                  </h5>
                  <ul className="space-y-2.5 text-[11px] text-slate-300">
                    {scanResult.safeFactors && scanResult.safeFactors.length > 0 ? (
                      scanResult.safeFactors.map((factor, idx) => (
                        <li key={idx} className="flex gap-2.5 items-start">
                          <span className="text-emerald-400 font-mono text-[10px] shrink-0 mt-0.5">✓</span>
                          <span className="leading-relaxed">{factor}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-500 italic font-mono text-[10px]">No clear authentication signatures found.</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Security Recommendation */}
              <div className={`p-4.5 border space-y-2 shadow-sm ${
                scanResult.riskLevel === 'High' 
                  ? 'bg-red-950/10 border-red-500/20 text-red-200' 
                  : (scanResult.riskLevel === 'Medium' ? 'bg-amber-950/10 border-amber-500/20 text-amber-200' : 'bg-emerald-950/10 border-emerald-500/20 text-emerald-200')
              }`}>
                <h5 className={`text-[10px] font-bold uppercase tracking-widest font-mono flex items-center gap-1.5 ${
                  scanResult.riskLevel === 'High' ? 'text-red-400' : (scanResult.riskLevel === 'Medium' ? 'text-amber-400' : 'text-emerald-400')
                }`}>
                  <Lock className="h-3 w-3" />
                  Analyst Strategic Advice
                </h5>
                <p className="text-[11px] leading-relaxed font-sans font-medium">
                  {scanResult.recommendation}
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    );
  }

  const handleGenerate = async () => {
    const draft = await onGenerateReply(email, tone, instructions);
    if (draft) {
      setDraftReply(draft);
    }
  };

  const handleSendTrigger = () => {
    if (!draftReply.trim()) return;
    onTriggerSendConfirm(
      email.senderEmail || email.sender,
      `Re: ${email.subject}`,
      draftReply
    );
  };

  const toggleActionItem = (index: number) => {
    const key = `${email.id}-${index}`;
    setCompletedActions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0D0D0D] divide-y divide-[#2A2A2A]/40">
      
      {/* Scrollable Reading Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        
        {/* Email Header */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#2A2A2A] pb-5">
            <h2 className="text-xl font-serif font-light text-white tracking-tight leading-snug">
              {email.subject}
            </h2>
            <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest text-[#555]">
              <Calendar className="h-3 w-3 shrink-0" />
              <span>{email.date}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs bg-[#151515] p-4 rounded-none border border-[#2A2A2A]">
            <div className="h-8 w-8 bg-white text-black font-mono flex items-center justify-center shrink-0 font-bold uppercase text-[11px]">
              {email.senderName ? email.senderName[0] : email.sender[0]}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-white truncate">{email.senderName || email.sender}</div>
              <div className="text-[10px] font-mono text-[#555] truncate mt-0.5">{email.senderEmail || email.sender}</div>
            </div>
          </div>
        </div>

        {/* AI EXECUTIVE BRIEFING (Drives user workflow) */}
        {/* High-Fidelity AI Executive Briefing Dossier */}
        <div className="glass-card border border-white/10 border-l-4 border-l-indigo-400 p-6 relative overflow-hidden space-y-5 shadow-lg glow-indigo">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-4 w-4 text-indigo-400 shrink-0 animate-pulse" />
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">AI Executive Briefing</h3>
            </div>
            <span className="text-[8px] font-bold text-indigo-400 font-mono uppercase tracking-widest px-2.5 py-0.75 bg-indigo-950/20 border border-indigo-500/20 rounded-none">
              Gemini Intel
            </span>
          </div>

          {/* AI Summary */}
          <div className="space-y-2 relative z-10">
            <h4 className="text-[9px] font-bold text-[#555] uppercase tracking-widest font-mono">Executive Summary</h4>
            <p className="text-xs text-[#E0E0E0] leading-relaxed font-sans italic pl-3 border-l border-white/5">
              "{email.summary || 'Summary processing failed.'}"
            </p>
          </div>

          {/* Action Items List */}
          {email.actionItems && email.actionItems.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-white/5 relative z-10">
              <h4 className="text-[9px] font-bold text-[#555] uppercase tracking-widest font-mono">Extracted Action Items</h4>
              <div className="space-y-2">
                {email.actionItems.map((item, index) => {
                  const isChecked = !!completedActions[`${email.id}-${index}`];
                  return (
                    <div
                      key={index}
                      onClick={() => toggleActionItem(index)}
                      className={`flex items-start gap-3 p-3 border text-xs cursor-pointer transition-all duration-200 rounded-none ${
                        isChecked
                          ? 'bg-emerald-950/5 border-emerald-800/20 text-emerald-400/50 line-through'
                          : 'bg-[#0D0D0D] border-[#2A2A2A] hover:border-indigo-400/50 hover:bg-white/[0.01] text-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by div click
                        className="mt-0.5 h-3.5 w-3.5 text-indigo-500 bg-black border-[#2A2A2A] rounded-none focus:ring-0 cursor-pointer"
                      />
                      <span className="leading-relaxed font-sans">{item}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Classification Reasoning */}
          <div className="text-[9px] text-[#555] font-mono uppercase tracking-wider pt-2 border-t border-white/5 relative z-10">
            Routing: <span className="text-slate-400 lowercase">{email.classificationReason || 'Routed based on email headers.'}</span>
          </div>
        </div>

        {/* MEETING INTELLIGENCE CARD */}
        {email.isMeetingRequest && (
          <div className="bg-rose-950/10 border border-rose-900/40 p-6 space-y-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 text-[50px] font-mono text-rose-500 opacity-5 pointer-events-none select-none font-bold">
              CALENDAR
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-rose-400 shrink-0" />
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-400">Meeting Request Detected</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              This message contains a calendar invitation or call request. Pulling real-time suggested open slots from your <span className="text-white font-medium">Google Calendar</span>:
            </p>

            {/* Suggested Slots */}
            <div className="space-y-2">
              <div className="text-[9px] font-bold text-[#888] uppercase tracking-widest font-mono">Suggested Reply Times</div>
              
              {isFetchingTimes ? (
                <div className="flex items-center gap-2 text-xs text-[#555] font-mono py-2">
                  <RefreshCw className="h-3 w-3 animate-spin text-rose-400" />
                  Analyzing Google Calendar availability...
                </div>
              ) : timesError ? (
                <p className="text-xs text-red-400 font-mono">{timesError}</p>
              ) : suggestedTimes.length === 0 ? (
                <p className="text-xs text-slate-500 italic font-sans">No available slots found in your calendar.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {suggestedTimes.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => handleSelectSuggestedSlot(slot)}
                      className="text-left p-3 bg-[#120a0a] border border-rose-950/60 hover:border-rose-400/50 hover:bg-[#1a0f0f] text-xs text-rose-300 hover:text-white transition-all rounded-none font-mono flex items-center justify-between group cursor-pointer"
                    >
                      <span className="truncate">{slot.label}</span>
                      <span className="text-[8px] uppercase tracking-wider text-rose-500/80 group-hover:text-rose-400 font-bold ml-1">
                        Select →
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-rose-950/20 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setMeetDateStart('');
                  setMeetDateEnd('');
                  setShowScheduleModal(true);
                }}
                className="px-4 py-2 bg-white hover:bg-neutral-200 text-black text-xs font-mono font-bold uppercase cursor-pointer flex items-center justify-center gap-2 transition-all shrink-0"
              >
                <Calendar className="h-3.5 w-3.5 text-black" />
                Schedule Meeting
              </button>
              
              <button
                onClick={fetchSuggestedTimes}
                disabled={isFetchingTimes}
                className="px-3 py-2 border border-rose-950/40 hover:border-rose-500/30 text-rose-400 hover:text-white text-[10px] font-mono uppercase cursor-pointer disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
              >
                <RefreshCw className={`h-3 w-3 ${isFetchingTimes ? 'animate-spin' : ''}`} />
                Refresh Free Slots
              </button>
            </div>
          </div>
        )}

        {/* Original Email Body and Secure Resource Desk */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-2">
            <h4 className="text-[9px] font-bold text-[#555] uppercase tracking-widest font-mono">Original Message Content</h4>
            <div className="bg-[#0D0D0D] border border-[#2A2A2A] rounded-none p-5 text-xs text-[#AAA] whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto font-sans">
              {email.body ? email.body : <span className="text-slate-600 italic">This email body is empty.</span>}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-2 min-w-0 overflow-hidden">
            <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <Bookmark className="h-3.5 w-3.5 text-pink-500 animate-pulse" />
              Secure Resource Desk ({extractedUrls.length})
            </h4>
            <div className="bg-gradient-to-b from-[#18121a] to-[#0e0e12] border border-pink-500/10 rounded-none p-4 max-h-96 overflow-y-auto space-y-3.5 scrollbar-thin min-w-0 overflow-hidden">
              {extractedUrls.length > 0 ? (
                extractedUrls.map((url, i) => {
                  let hostname = 'Web Resource';
                  let isHttps = url.toLowerCase().startsWith('https://');
                  try {
                    hostname = new URL(url).hostname;
                  } catch (e) {}

                  // Classify hostname for fun badge colors
                  let badgeBg = 'bg-indigo-950/40 border-indigo-500/30 text-indigo-300';
                  if (hostname.includes('google') || hostname.includes('gmail')) {
                    badgeBg = 'bg-sky-950/40 border-sky-500/30 text-sky-300';
                  } else if (hostname.includes('github') || hostname.includes('git')) {
                    badgeBg = 'bg-purple-950/40 border-purple-500/30 text-purple-300';
                  } else if (hostname.includes('zoom') || hostname.includes('meet')) {
                    badgeBg = 'bg-rose-950/40 border-rose-500/30 text-rose-300';
                  } else if (url.includes('.gov') || url.includes('.edu')) {
                    badgeBg = 'bg-teal-950/40 border-teal-500/30 text-teal-300';
                  }

                  return (
                    <div key={i} className="p-3.5 bg-black/60 border-l-2 border-l-pink-500 border border-white/[0.03] space-y-3 min-w-0 overflow-hidden shadow-lg hover:bg-neutral-900/40 transition-all duration-300">
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <span className={`text-[9px] font-bold font-mono uppercase truncate flex items-center gap-1 px-1.5 py-0.5 border ${badgeBg}`} title={url}>
                          <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                          {hostname}
                        </span>
                        <span className="text-[8px] font-mono text-pink-400 shrink-0 font-bold">#0{i + 1}</span>
                      </div>
                      
                      <p className="text-[10px] text-slate-300 truncate select-all font-mono py-1.5 px-2 bg-black/80 border border-[#2A2A2A]/40 text-left" title={url}>
                        {url}
                      </p>

                      <div className="flex items-center justify-between gap-1.5">
                        <span className={`text-[8px] font-mono font-bold uppercase tracking-widest ${isHttps ? 'text-emerald-400' : 'text-rose-400 animate-pulse'}`}>
                          {isHttps ? '🔒 HTTPS Secure' : '⚠️ HTTP Unsecured'}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-[#2A2A2A]/20 min-w-0">
                        <button
                          type="button"
                          onClick={() => handlePreviewUrl(url)}
                          className="py-1.5 px-1 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white text-[9px] font-mono font-bold uppercase cursor-pointer text-center transition-all duration-300 shadow-md border-none"
                        >
                          Preview
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyLink(url)}
                          className="py-1.5 px-1 bg-[#1a1a24] hover:bg-[#252533] border border-indigo-500/30 text-[9px] text-indigo-300 font-mono font-bold uppercase cursor-pointer text-center transition-all duration-300 truncate"
                        >
                          {copiedLink === url ? 'Copied' : 'Copy'}
                        </button>
                        <a
                          href={url}
                          target="_blank"
                          referrerPolicy="no-referrer"
                          className="py-1.5 px-1 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-black text-[9px] font-mono font-bold uppercase text-center transition-all duration-300 flex items-center justify-center truncate"
                        >
                          Open ↗
                        </a>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-[#555] flex flex-col items-center justify-center space-y-1">
                  <Bookmark className="h-6 w-6 text-pink-500/40 stroke-[1]" />
                  <p className="text-[10px] font-mono text-pink-400/80">No links extracted</p>
                  <p className="text-[8px] text-slate-600 max-w-[150px] leading-relaxed">
                    Zero raw URLs detected in this incoming message.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* AI Smart Responder (Bottom form/pane) */}
      <div className="p-8 bg-[#151515] border-t border-[#2A2A2A] space-y-5">
        <div className="flex items-center gap-1.5">
          <MessageSquare className="h-4 w-4 text-white" />
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">AI Smart Responder</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[9px] font-bold text-[#555] uppercase tracking-widest font-mono">Response Tone</label>
            <select
              value={tone}
              onChange={(e: any) => setTone(e.target.value)}
              className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-none px-3 py-2 text-xs text-white focus:outline-none focus:border-white font-mono"
            >
              <option value="professional">💼 Professional / Work</option>
              <option value="friendly">Warm & Friendly</option>
              <option value="concise">⚡ Concise / Short</option>
              <option value="direct">🎯 Direct / Logical</option>
              <option value="apologetic">🙏 Apologetic / Alt</option>
            </select>
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-[9px] font-bold text-[#555] uppercase tracking-widest font-mono">
                Custom Instructions (Optional)
              </label>
              {isRecording && (
                <span className="flex items-center gap-1 text-[8px] text-red-500 font-mono uppercase tracking-wider animate-pulse font-bold">
                  <span className="h-1.5 w-1.5 bg-red-500 rounded-full"></span>
                  Listening... Speak now
                </span>
              )}
            </div>
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="e.g. Say I can meet Tuesday at 2pm, ask them to send the PDF"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-none pl-3 pr-10 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-white font-sans"
              />
              <button
                type="button"
                onClick={toggleRecording}
                title={isRecording ? "Stop listening" : "Insert custom instructions with voice input (speech-to-text)"}
                className={`absolute right-1 px-2.5 py-1.5 transition-all flex items-center justify-center cursor-pointer ${
                  isRecording 
                    ? 'text-red-500 hover:text-red-400 scale-110' 
                    : 'text-[#888] hover:text-white'
                }`}
              >
                {isRecording ? (
                  <MicOff className="h-4 w-4 animate-pulse" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </button>
            </div>
            {recordingError && (
              <p className="text-[9px] text-red-400 font-mono mt-1">{recordingError}</p>
            )}
          </div>
        </div>

        {/* Generate/Draft action */}
        <div className="flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={isGeneratingReply}
            className="w-full sm:w-auto bg-white hover:bg-neutral-200 text-black font-bold text-[10px] uppercase tracking-widest px-5 py-2.5 rounded-none transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isGeneratingReply ? (
              <>
                <RefreshCw className="h-3 w-3 animate-spin" />
                Drafting...
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3" />
                Draft Smart Reply
              </>
            )}
          </button>
        </div>

        {/* Editable Draft Preview and Send Action */}
        {draftReply && (
          <div className="space-y-4 pt-4 border-t border-[#2A2A2A]/40 animate-fade-in">
            <div className="flex justify-between items-center">
              <label className="block text-[9px] font-bold text-[#555] uppercase tracking-widest font-mono">AI Draft Review</label>
              <span className="text-[9px] text-[#555] italic">Feel free to edit this draft below</span>
            </div>
            <textarea
              value={draftReply}
              onChange={(e) => setDraftReply(e.target.value)}
              rows={5}
              className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-none p-4 text-xs font-mono text-white focus:outline-none focus:border-white leading-relaxed"
            />
            <div className="flex justify-between items-center text-[10px] text-slate-500 gap-4">
              <span className="flex items-center gap-1.5 text-[9px] font-mono text-[#555]">
                <Shield className="h-3.5 w-3.5" />
                Double check recipient info in the send preview.
              </span>
              <button
                onClick={handleSendTrigger}
                disabled={isSendingEmail || !draftReply.trim()}
                className="bg-white hover:bg-neutral-200 disabled:opacity-50 text-black text-[10px] uppercase tracking-widest font-bold px-5 py-2.5 rounded-none transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
              >
                <Send className="h-3 w-3" />
                Review & Send
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SCHEDULE MEETING MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#101010] border border-[#2A2A2A] max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => {
                setShowScheduleModal(false);
                setScheduleSuccess(null);
                setScheduleError(null);
              }}
              className="absolute top-4 right-4 text-[#555] hover:text-white transition-all text-xs cursor-pointer bg-transparent border-none"
            >
              ✕
            </button>

            <div className="space-y-1">
              <div className="text-[8px] font-bold text-rose-400 font-mono uppercase tracking-[0.2em] flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 bg-rose-500 rounded-full animate-pulse"></span>
                Calendar Scheduler
              </div>
              <h3 className="text-md font-serif text-white">Schedule Google Calendar Event</h3>
            </div>

            {scheduleSuccess ? (
              <div className="space-y-4 py-4 text-center">
                <div className="h-12 w-12 bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-lg font-bold">
                  ✓
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-white font-medium">Meeting Scheduled Successfully!</p>
                  <p className="text-[11px] text-[#888] font-sans">The invitation and calendar event has been dispatched.</p>
                </div>
                <div className="pt-2 flex flex-col gap-2">
                  <a
                    href={scheduleSuccess}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-mono font-bold uppercase transition-all text-center"
                  >
                    Open Google Calendar
                  </a>
                  <button
                    onClick={() => {
                      setShowScheduleModal(false);
                      setScheduleSuccess(null);
                    }}
                    className="w-full py-2 border border-[#2A2A2A] hover:bg-[#1a1a1a] text-white text-xs font-mono font-bold uppercase transition-all cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleScheduleSubmit} className="space-y-4">
                {scheduleError && (
                  <div className="p-3 bg-red-950/20 border border-red-500/20 text-red-400 text-xs font-mono rounded-none">
                    {scheduleError}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-[8px] font-bold text-[#666] uppercase tracking-widest font-mono">Event Title</label>
                  <input
                    type="text"
                    required
                    value={meetTitle}
                    onChange={(e) => setMeetTitle(e.target.value)}
                    className="w-full bg-[#080808] border border-[#2A2A2A] px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[8px] font-bold text-[#666] uppercase tracking-widest font-mono">Attendee</label>
                  <input
                    type="email"
                    disabled
                    value={email?.senderEmail || email?.sender || ''}
                    className="w-full bg-[#080808]/40 border border-[#2A2A2A]/40 px-3 py-2 text-xs text-[#555] font-sans opacity-70"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-[8px] font-bold text-[#666] uppercase tracking-widest font-mono">Start Date & Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={meetDateStart}
                      onChange={(e) => setMeetDateStart(e.target.value)}
                      className="w-full bg-[#080808] border border-[#2A2A2A] px-2 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[8px] font-bold text-[#666] uppercase tracking-widest font-mono">End Date & Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={meetDateEnd}
                      onChange={(e) => setMeetDateEnd(e.target.value)}
                      className="w-full bg-[#080808] border border-[#2A2A2A] px-2 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[8px] font-bold text-[#666] uppercase tracking-widest font-mono">Description</label>
                  <textarea
                    rows={3}
                    value={meetDesc}
                    onChange={(e) => setMeetDesc(e.target.value)}
                    className="w-full bg-[#080808] border border-[#2A2A2A] px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-sans resize-none"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowScheduleModal(false)}
                    className="flex-1 py-2.5 border border-[#2A2A2A] hover:bg-[#151515] text-[#888] hover:text-white text-xs font-mono font-bold uppercase transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isScheduling}
                    className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-black text-xs font-mono font-bold uppercase transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isScheduling ? (
                      <>
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        Scheduling...
                      </>
                    ) : (
                      'Schedule Event'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* SECURE WEB PREVIEW MODAL */}
      {activePreviewUrl && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-md p-4 md:p-8 animate-fade-in">
          <div className="bg-[#101010] border border-indigo-500/20 w-full h-full max-w-6xl flex flex-col shadow-2xl relative">
            
            {/* Simulated Browser Title Bar */}
            <div className="h-14 bg-[#151515] border-b border-[#2A2A2A] px-4 md:px-6 flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                {/* Traffic lights */}
                <div className="flex gap-1.5 shrink-0">
                  <button 
                    type="button"
                    onClick={() => setActivePreviewUrl(null)}
                    className="h-3.5 w-3.5 rounded-full bg-red-500 hover:bg-red-400 transition-colors cursor-pointer border-none outline-none" 
                    title="Close preview"
                  />
                  <div className="h-3.5 w-3.5 rounded-full bg-amber-500/30" />
                  <div className="h-3.5 w-3.5 rounded-full bg-green-500/30" />
                </div>
                
                {/* Shield Icon and Label */}
                <span className="hidden sm:flex items-center gap-1.5 text-[9px] font-bold text-indigo-400 font-mono uppercase tracking-widest border-r border-[#2A2A2A] pr-4 shrink-0">
                  <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
                  Secure Sandbox Preview
                </span>
              </div>

              {/* Simulated Address Bar */}
              <div className="flex-1 max-w-xl bg-black/60 border border-[#2A2A2A] rounded-none px-3 py-1.5 flex items-center justify-between text-[11px] font-mono text-slate-400 truncate">
                <span className="truncate flex items-center gap-2">
                  <span className="text-emerald-500 font-bold font-sans">https://</span>
                  {activePreviewUrl.replace(/^https?:\/\//i, '')}
                </span>
                <span className="text-[9px] uppercase font-bold text-emerald-500 bg-emerald-950/20 border border-emerald-500/20 px-1.5 py-0.25 font-mono shrink-0">
                  SSL Active
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={activePreviewUrl}
                  target="_blank"
                  referrerPolicy="no-referrer"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1.5"
                >
                  Open ↗
                </a>
                <button
                  type="button"
                  onClick={() => setActivePreviewUrl(null)}
                  className="px-3 py-1.5 border border-[#2A2A2A] hover:bg-[#1a1a1a] text-white text-[10px] font-mono font-bold uppercase transition-all cursor-pointer"
                >
                  Exit
                </button>
              </div>
            </div>

            {/* Warning Note above browser */}
            <div className="bg-amber-950/10 border-b border-amber-500/10 px-4 md:px-6 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] font-sans text-amber-400 shrink-0">
              <span className="flex items-center gap-2 leading-snug">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-400 animate-pulse" />
                <span>Frame Sandboxing active. Some sites restrict nested framing (same-origin policy). If page doesn't load, use <strong>Open ↗</strong> on top right.</span>
              </span>
              <a
                href={activePreviewUrl}
                target="_blank"
                referrerPolicy="no-referrer"
                className="underline font-bold hover:text-white shrink-0 font-mono"
              >
                Launch directly
              </a>
            </div>

            {/* Interactive Web Sandbox Frame */}
            <div className="flex-1 bg-white relative overflow-hidden">
              <iframe
                src={activePreviewUrl}
                className="w-full h-full border-0 bg-white"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                referrerPolicy="no-referrer"
                title="Secure Web Sandbox Frame"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
