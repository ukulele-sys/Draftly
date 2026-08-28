import React, { useState, useEffect } from 'react';
import {
  Mail,
  Sparkles,
  Inbox,
  Share2,
  AlertOctagon,
  RefreshCw,
  Sliders,
  LogOut,
  Folder,
  Plus,
  Trash2,
  Menu,
  CheckSquare,
  ChevronRight,
  MailMinus,
  Sun,
  Moon,
  HelpCircle,
  Users,
  Tag,
  AlertTriangle,
  Briefcase,
  Newspaper,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Shield,
  Lock,
} from 'lucide-react';
import { User } from 'firebase/auth';

import { initAuth, googleSignIn, appleSignIn, logout } from './firebase';
import { EmailMessage, CustomRule, EmailCategory, FollowUpReminder } from './types';
import { CLIENT_SIMULATED_EMAILS, CLIENT_SIMULATED_FOLLOW_UPS } from './mockEmails';
import Onboarding from './components/Onboarding';
import RulesModal from './components/RulesModal';
import ReplyConfirmationModal from './components/ReplyConfirmationModal';
import EmailList from './components/EmailList';
import EmailDetail from './components/EmailDetail';
import UnsubscribeCenter from './components/UnsubscribeCenter';
import ThreatScanner from './components/ThreatScanner';
import UserGuideModal from './components/UserGuideModal';

const extractErrorMessage = (errData: any, defaultMsg: string): string => {
  if (!errData) return defaultMsg;
  if (typeof errData.error === 'string') return errData.error;
  if (errData.error && typeof errData.error === 'object') {
    if (typeof errData.error.message === 'string') return errData.error.message;
    if (Array.isArray(errData.error.errors) && errData.error.errors[0]?.message) {
      return errData.error.errors[0].message;
    }
  }
  if (Array.isArray(errData.errors) && errData.errors[0]?.message) {
    return errData.errors[0].message;
  }
  if (typeof errData.message === 'string') return errData.message;
  return defaultMsg;
};

const defaultCategories = ['Urgent Bills', 'Work', 'Newsletters'];
const defaultRules: CustomRule[] = [
  {
    id: 'default-rule-1',
    category: 'Urgent Bills',
    field: 'subject',
    operator: 'contains',
    value: 'invoice',
  },
  {
    id: 'default-rule-2',
    category: 'Work',
    field: 'sender',
    operator: 'contains',
    value: '@google.com',
  },
  {
    id: 'default-rule-3',
    category: 'Newsletters',
    field: 'body',
    operator: 'contains',
    value: 'unsubscribe',
  },
];

const standardCategories = ['Primary', 'Social', 'Promotions', 'Updates', 'Spam'];

// Consistent high-contrast category badges and visual accents with high fidelity glows
const categoryColors: Record<string, string> = {
  Primary: 'bg-white/5 text-white border-white/20 glow-white',
  Social: 'bg-indigo-950/20 text-indigo-400 border-indigo-500/20 glow-indigo',
  Promotions: 'bg-amber-950/20 text-amber-400 border-amber-500/20 glow-amber',
  Updates: 'bg-sky-950/20 text-sky-400 border-sky-500/20',
  Spam: 'bg-red-950/20 text-red-400 border-red-500/20',
  'Urgent Bills': 'bg-rose-950/30 text-rose-400 border-rose-500/30 font-semibold animate-pulse-subtle glow-rose',
  Work: 'bg-blue-950/20 text-blue-400 border-blue-500/20 glow-indigo',
  Newsletters: 'bg-emerald-950/20 text-emerald-400 border-emerald-500/20 glow-emerald',
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isAppleLoggingIn, setIsAppleLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLocalOnlyMode, setIsLocalOnlyMode] = useState<boolean>(() => {
    return localStorage.getItem('draftly_local_only') === 'true';
  });

  // Core email states
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<EmailCategory>('Primary');
  const [isLoading, setIsLoading] = useState(false);
  const [maxResults, setMaxResults] = useState(15);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-Unsubscribe States
  const [unsubscribedSenders, setUnsubscribedSenders] = useState<string[]>(() => {
    const cached = localStorage.getItem('draftly_unsubscribed_senders');
    return cached ? JSON.parse(cached) : [];
  });
  const [isUnsubscribeCenterActive, setIsUnsubscribeCenterActive] = useState(false);
  const [isThreatScannerActive, setIsThreatScannerActive] = useState(false);

  // Custom Categories & Rules
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [customRules, setCustomRules] = useState<CustomRule[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Modals / Overlays
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isSendConfirmOpen, setIsSendConfirmOpen] = useState(false);
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Email draft sending confirmation metadata
  const [sendConfirmData, setSendConfirmData] = useState<{ to: string; subject: string; body: string }>({
    to: '',
    subject: '',
    body: '',
  });

  // Banners / User alerts
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  // Follow-up Reminders States
  const [followUps, setFollowUps] = useState<FollowUpReminder[]>([]);
  const [dismissedReminders, setDismissedReminders] = useState<string[]>(() => {
    const cached = localStorage.getItem('draftly_dismissed_reminders');
    return cached ? JSON.parse(cached) : [];
  });
  const [isFetchingFollowUps, setIsFetchingFollowUps] = useState(false);
  const [draftingFollowUpId, setDraftingFollowUpId] = useState<string | null>(null);
  
  // Pre-populated draft states
  const [syntheticEmails, setSyntheticEmails] = useState<EmailMessage[]>([]);
  const [initialDraftText, setInitialDraftText] = useState('');
  const [initialDraftEmailId, setInitialDraftEmailId] = useState('');

  // Theme & Interactive User Guide states
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('draftly_theme') as 'dark' | 'light') || 'dark';
  });
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('draftly_theme', theme);
  }, [theme]);

  // Auto-open guide for first-time users
  useEffect(() => {
    if (user) {
      const guideSeen = localStorage.getItem('draftly_guide_seen');
      if (!guideSeen) {
        setIsGuideOpen(true);
        localStorage.setItem('draftly_guide_seen', 'true');
      }
    }
  }, [user]);

  // 1. Initial Load & Hydrate custom lists
  useEffect(() => {
    // Sync custom categories from localStorage or load defaults
    const cachedCategories = localStorage.getItem('ai_email_categories');
    if (cachedCategories) {
      setCustomCategories(JSON.parse(cachedCategories));
    } else {
      localStorage.setItem('ai_email_categories', JSON.stringify(defaultCategories));
      setCustomCategories(defaultCategories);
    }

    // Sync custom rules from localStorage or load defaults
    const cachedRules = localStorage.getItem('ai_email_rules');
    if (cachedRules) {
      setCustomRules(JSON.parse(cachedRules));
    } else {
      localStorage.setItem('ai_email_rules', JSON.stringify(defaultRules));
      setCustomRules(defaultRules);
    }

    // Connect auth listener
    initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
        setNeedsAuth(false);
      },
      () => {
        setNeedsAuth(true);
      }
    );
  }, []);

  // 2. Fetch/Re-analyze emails and follow-up reminders when auth token is received or updated
  useEffect(() => {
    if (accessToken) {
      fetchEmails();
      fetchFollowUps();
    }
  }, [accessToken, maxResults, searchQuery, isLocalOnlyMode]);

  // Alert dismiss helper
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
        setNeedsAuth(false);
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      const isPopupError = 
        err.code === 'auth/popup-closed-by-user' || 
        err.code === 'auth/popup-blocked' ||
        (err.message && (
          err.message.includes('popup-closed-by-user') || 
          err.message.includes('popup-blocked')
        ));
      
      if (isPopupError) {
        setAuthError(
          'The Sign-In popup was blocked or closed. Since Draftly is running inside an iframe preview, please ensure popups are allowed in your browser, or open the app in a new tab using the "Open in New Tab" button in the top-right corner.'
        );
      } else {
        setAuthError(err.message || 'Login failed. Please verify popup blocker permission.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAppleLogin = async () => {
    setIsAppleLoggingIn(true);
    setAuthError(null);
    try {
      const res = await appleSignIn();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
        setNeedsAuth(false);
      }
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || 'Apple login failed.');
    } finally {
      setIsAppleLoggingIn(false);
    }
  };

  const handleEnterLocalOnlyMode = () => {
    const guestUser = {
      uid: 'local-user-guest',
      email: 'private.sandbox@draftly.local',
      displayName: 'Private Sandbox Guest',
      emailVerified: true,
    } as any;
    const guestToken = 'local_only_mode_token';

    localStorage.setItem('draftly_local_only_session', JSON.stringify({ user: guestUser, token: guestToken }));
    localStorage.setItem('draftly_local_only', 'true');
    
    setIsLocalOnlyMode(true);
    setUser(guestUser);
    setAccessToken(guestToken);
    setNeedsAuth(false);
    
    setAlert({
      type: 'success',
      text: 'Secure Local Sandbox activated. No network data transfer active.'
    });
  };

  const handleToggleLocalOnlyMode = () => {
    const nextMode = !isLocalOnlyMode;
    setIsLocalOnlyMode(nextMode);
    
    if (nextMode) {
      localStorage.setItem('draftly_local_only', 'true');
      setAlert({
        type: 'success',
        text: 'Sensitive Mode Active. Cloud intelligence disabled, operations restricted to local Sandbox memory.'
      });
      // reload emails immediately from local mock
      setEmails(CLIENT_SIMULATED_EMAILS);
      if (CLIENT_SIMULATED_EMAILS.length > 0) {
        setSelectedEmailId(CLIENT_SIMULATED_EMAILS[0].id);
      }
    } else {
      localStorage.removeItem('draftly_local_only');
      // If they are a guest user, they need to log in to go to connected mode
      if (user?.uid === 'local-user-guest') {
        handleLogout();
        setAlert({
          type: 'warning',
          text: 'Exited local sandbox. Please authenticate to connect to live services.'
        });
      } else {
        setAlert({
          type: 'success',
          text: 'Connected Mode restored. Syncing with secure mail servers...'
        });
        // We will trigger fetchEmails inside a setTimeout
        setTimeout(() => {
          fetchEmails();
        }, 100);
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem('draftly_local_only_session');
    localStorage.removeItem('draftly_local_only');
    setIsLocalOnlyMode(false);
    setUser(null);
    setAccessToken(null);
    setEmails([]);
    setSelectedEmailId(null);
    setNeedsAuth(true);
    setIsUnsubscribeCenterActive(false);
    setIsThreatScannerActive(false);
  };

  // Count senders with unopened newsletters/promotions
  const unopenedSubscriptionCount = React.useMemo(() => {
    const promotionalEmails = emails.filter(e => 
      !e.isRead && (
        e.category === 'Promotions' || 
        e.category?.toLowerCase() === 'newsletters' ||
        e.unsubscribeUrl || 
        e.unsubscribeMailto ||
        e.subject.toLowerCase().includes('unsubscribe') ||
        e.body.toLowerCase().includes('unsubscribe')
      )
    );
    const uniqueSenders = new Set(promotionalEmails.map(e => (e.senderEmail || e.sender || '').toLowerCase()));
    const remainingSenders = Array.from(uniqueSenders).filter(emailKey => 
      !unsubscribedSenders.some(s => s.toLowerCase() === emailKey)
    );
    return remainingSenders.length;
  }, [emails, unsubscribedSenders]);

  const handleUnsubscribeSender = async (
    senderEmail: string,
    emailId: string,
    unsubscribeUrl?: string,
    unsubscribeMailto?: string
  ) => {
    if (!accessToken) return;

    if (isLocalOnlyMode) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const updatedUnsubscribed = [...unsubscribedSenders, senderEmail.toLowerCase()];
      setUnsubscribedSenders(updatedUnsubscribed);
      localStorage.setItem('draftly_unsubscribed_senders', JSON.stringify(updatedUnsubscribed));

      // Mark all unopened emails from this sender as read
      setEmails(prevEmails => 
        prevEmails.map(email => {
          const matchesSender = 
            email.senderEmail?.toLowerCase() === senderEmail.toLowerCase() || 
            email.sender?.toLowerCase().includes(senderEmail.toLowerCase());
          
          if (matchesSender) {
            return {
              ...email,
              isRead: true,
              unsubscribed: true,
            };
          }
          return email;
        })
      );

      setAlert({
        type: 'success',
        text: `[Sandbox Mode] Unsubscribed from ${senderEmail} (No data left your device).`,
      });
      return;
    }

    const response = await fetch('/api/emails/unsubscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        emailId,
        unsubscribeUrl,
        unsubscribeMailto,
        senderEmail,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => null);
      throw new Error(extractErrorMessage(errData, 'Server failed to handle unsubscription request.'));
    }

    const resData = await response.json();
    
    // Update local states
    const updatedUnsubscribed = [...unsubscribedSenders, senderEmail.toLowerCase()];
    setUnsubscribedSenders(updatedUnsubscribed);
    localStorage.setItem('draftly_unsubscribed_senders', JSON.stringify(updatedUnsubscribed));

    // Mark all unopened emails from this sender as read
    setEmails(prevEmails => 
      prevEmails.map(email => {
        const matchesSender = 
          email.senderEmail?.toLowerCase() === senderEmail.toLowerCase() || 
          email.sender?.toLowerCase().includes(senderEmail.toLowerCase());
        
        if (matchesSender) {
          return {
            ...email,
            isRead: true,
            unsubscribed: true,
          };
        }
        return email;
      })
    );

    setAlert({
      type: 'success',
      text: resData.message || `Successfully unsubscribed from ${senderEmail}.`,
    });
  };

  // Process / Fetch / Categorize emails from Express backend
  const fetchEmails = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    setSelectedEmailId(null);
    
    if (isLocalOnlyMode) {
      // Simulate small latency for fidelity
      await new Promise((resolve) => setTimeout(resolve, 400));
      let filteredSim = [...CLIENT_SIMULATED_EMAILS];
      if (searchQuery) {
        const queryLower = searchQuery.toLowerCase();
        filteredSim = CLIENT_SIMULATED_EMAILS.filter(e => 
          e.subject.toLowerCase().includes(queryLower) ||
          e.sender.toLowerCase().includes(queryLower) ||
          e.body.toLowerCase().includes(queryLower)
        );
      }
      setEmails(filteredSim);
      
      if (filteredSim.length > 0) {
        const inboxEmails = filteredSim.filter((e: EmailMessage) => e.category === activeCategory);
        if (inboxEmails.length > 0) {
          setSelectedEmailId(inboxEmails[0].id);
        } else {
          setSelectedEmailId(filteredSim[0].id);
        }
      }
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/emails/process', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maxResults,
          customRules,
          customCategories,
          searchQuery,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
          setAlert({
            type: 'error',
            text: 'Your session has expired. Please log in again to sync with Gmail.',
          });
          return;
        }
        
        const contentType = response.headers.get('content-type');
        const isJson = contentType && contentType.includes('application/json');
        const errData = isJson ? await response.json().catch(() => null) : null;
        throw new Error(extractErrorMessage(errData, `Server failed to fetch emails (Status ${response.status}).`));
      }

      const contentType = response.headers.get('content-type');
      if (contentType && !contentType.includes('application/json')) {
        throw new Error('Server returned an unexpected response format (non-JSON). This can occur when there is a gateway timeout.');
      }

      const data = await response.json();
      setEmails(data.emails || []);

      if (data.isFallback) {
        setAlert({
          type: 'warning',
          text: `Gemini service is temporarily unavailable. We have automatically categorized your emails using our local fallback rules.`,
        });
      }

      if (data.emails && data.emails.length > 0) {
        // Automatically select the first email
        const inboxEmails = data.emails.filter((e: EmailMessage) => e.category === activeCategory);
        if (inboxEmails.length > 0) {
          setSelectedEmailId(inboxEmails[0].id);
        } else {
          setSelectedEmailId(data.emails[0].id);
        }
      }
    } catch (err: any) {
      console.error(err);
      setAlert({ type: 'error', text: err.message || 'Error processing your inbox. Retrying...' });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch follow-up reminders
  const fetchFollowUps = async () => {
    if (!accessToken) return;
    setIsFetchingFollowUps(true);
    
    if (isLocalOnlyMode) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setFollowUps(CLIENT_SIMULATED_FOLLOW_UPS);
      setIsFetchingFollowUps(false);
      return;
    }

    try {
      const response = await fetch('/api/emails/follow-ups', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          setFollowUps(data.followUps || []);
        } else {
          console.warn('Unexpected response format for follow-ups (non-JSON)');
        }
      }
    } catch (err) {
      console.error('Error fetching follow-ups:', err);
    } finally {
      setIsFetchingFollowUps(false);
    }
  };

  // Handle draft follow-up button click
  const handleDraftFollowUp = async (reminder: FollowUpReminder) => {
    setDraftingFollowUpId(reminder.id);
    try {
      let generatedDraft = '';
      if (isLocalOnlyMode) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        generatedDraft = `Hi ${reminder.recipientName},\n\nI hope you are doing well. I wanted to follow up on my previous email regarding "${reminder.subject}" to see if you had any thoughts or questions? Please let me know if there's anything I can help with.\n\nBest regards,\n${user?.displayName || 'Private Sandbox Guest'}`;
      } else {
        const response = await fetch('/api/emails/generate-follow-up', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipientName: reminder.recipientName,
            subject: reminder.subject,
            body: reminder.body,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate follow-up draft');
        }

        const data = await response.json();
        generatedDraft = data.reply;
      }

      // Create synthetic EmailMessage representing the reminder context
      const synthEmail: EmailMessage = {
        id: reminder.id,
        threadId: reminder.threadId,
        sender: `${reminder.recipientName} <${reminder.recipientEmail}>`,
        senderName: reminder.recipientName,
        senderEmail: reminder.recipientEmail,
        subject: `Follow up: ${reminder.subject}`,
        body: reminder.body,
        snippet: reminder.body.slice(0, 200),
        date: reminder.date,
        category: 'Primary',
        isRead: true,
      };

      // Add to syntheticEmails if not present
      setSyntheticEmails(prev => {
        if (prev.some(e => e.id === synthEmail.id)) return prev;
        return [...prev, synthEmail];
      });

      // Set initial draft text to pre-populate EmailDetail
      setInitialDraftText(generatedDraft);
      setInitialDraftEmailId(reminder.id);

      // Select this email to open in detail/reading pane
      setSelectedEmailId(reminder.id);

      setAlert({
        type: 'success',
        text: `Drafted a professional follow-up for ${reminder.recipientName}! Click Send on the right to complete.`,
      });
    } catch (err: any) {
      console.error(err);
      setAlert({
        type: 'error',
        text: err.message || 'Failed to draft follow-up.',
      });
    } finally {
      setDraftingFollowUpId(null);
    }
  };

  // Dismiss a follow-up reminder
  const handleDismissReminder = (id: string) => {
    const updated = [...dismissedReminders, id];
    setDismissedReminders(updated);
    localStorage.setItem('draftly_dismissed_reminders', JSON.stringify(updated));
    setAlert({
      type: 'success',
      text: 'Reminder dismissed.',
    });
  };

  // Rules and Categories State Operations
  const handleAddRule = (rule: Omit<CustomRule, 'id'>) => {
    const newRule: CustomRule = {
      ...rule,
      id: `rule-${Date.now()}`,
    };
    const updated = [...customRules, newRule];
    setCustomRules(updated);
    localStorage.setItem('ai_email_rules', JSON.stringify(updated));
    setAlert({ type: 'success', text: 'Custom rule added. Re-process inbox to apply!' });
  };

  const handleDeleteRule = (id: string) => {
    const updated = customRules.filter((r) => r.id !== id);
    setCustomRules(updated);
    localStorage.setItem('ai_email_rules', JSON.stringify(updated));
    setAlert({ type: 'success', text: 'Rule deleted.' });
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCategoryName.trim();
    if (!name) return;

    if (customCategories.includes(name) || standardCategories.includes(name)) {
      setAlert({ type: 'error', text: 'Category already exists.' });
      return;
    }

    const updated = [...customCategories, name];
    setCustomCategories(updated);
    localStorage.setItem('ai_email_categories', JSON.stringify(updated));
    setNewCategoryName('');
    setAlert({ type: 'success', text: `Added category "${name}"` });
  };

  const handleDeleteCategory = (catName: string) => {
    const updatedCats = customCategories.filter((c) => c !== catName);
    setCustomCategories(updatedCats);
    localStorage.setItem('ai_email_categories', JSON.stringify(updatedCats));

    // Cleanup associated rules
    const updatedRules = customRules.filter((r) => r.category !== catName);
    setCustomRules(updatedRules);
    localStorage.setItem('ai_email_rules', JSON.stringify(updatedRules));

    if (activeCategory === catName) {
      setActiveCategory('Primary');
    }
    setAlert({ type: 'success', text: `Removed "${catName}" and cleared related rules.` });
  };

  // AI draft reply generator proxy
  const handleGenerateReply = async (email: EmailMessage, tone: string, additionalInstructions: string): Promise<string> => {
    setIsGeneratingReply(true);
    try {
      if (isLocalOnlyMode) {
        // Simulate local intelligence processing
        await new Promise((resolve) => setTimeout(resolve, 800));
        
        const sender = email.senderName || email.sender.split('<')[0].trim() || 'there';
        let greeting = `Dear ${sender},`;
        let closing = `Sincerely,\n${user?.displayName || 'Private Sandbox Guest'}`;
        
        if (tone === 'friendly') {
          greeting = `Hi ${sender},`;
          closing = `Best,\n${user?.displayName || 'Private Sandbox Guest'}`;
        } else if (tone === 'concise' || tone === 'direct') {
          greeting = `${sender},`;
          closing = `Regards,\n${user?.displayName || 'Private Sandbox Guest'}`;
        }

        let bodyText = '';
        if (tone === 'friendly') {
          bodyText = `Thank you for your email regarding "${email.subject}". I appreciate you reaching out! I am happy to help with this and will review the details shortly. Let me know if you need anything else in the meantime!`;
        } else if (tone === 'concise') {
          bodyText = `Thanks for writing. Regarding "${email.subject}", I will look into this right away and get back to you with updates soon.`;
        } else if (tone === 'direct') {
          bodyText = `Acknowledging receipt of your email on "${email.subject}". I am analyzing the contents and will coordinate the next steps today.`;
        } else if (tone === 'apologetic') {
          bodyText = `Thank you for your patience. I sincerely apologize for any delay or inconvenience regarding "${email.subject}". I am reviewing this personally now and will provide a complete solution as soon as possible.`;
        } else {
          // professional
          bodyText = `Thank you for your message regarding "${email.subject}". I have received your request and am currently evaluating the details. I will provide a comprehensive response once my review is complete.`;
        }

        if (additionalInstructions) {
          bodyText += `\n\n[Sensitive Sandbox Mode Info: Incorporated your note: "${additionalInstructions}"]`;
        }

        return `${greeting}\n\n${bodyText}\n\n${closing}`;
      }

      const res = await fetch('/api/emails/generate-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, tone, additionalInstructions }),
      });
      if (!res.ok) {
        throw new Error('Failed to generate smart reply.');
      }
      const data = await res.json();
      return data.reply;
    } catch (err: any) {
      setAlert({ type: 'error', text: err.message || 'Failed to draft email.' });
      return '';
    } finally {
      setIsGeneratingReply(false);
    }
  };

  // Trigger send confirmation modal
  const handleTriggerSendConfirm = (to: string, subject: string, body: string) => {
    setSendConfirmData({ to, subject, body });
    setIsSendConfirmOpen(true);
  };

  // Confirm and Send email via Gmail backend
  const handleSendEmail = async () => {
    setIsSendingEmail(true);
    try {
      const activeEmail = emails.find((e) => e.id === selectedEmailId) ||
        syntheticEmails.find((e) => e.id === selectedEmailId);

      if (isLocalOnlyMode) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        setIsSendConfirmOpen(false);
        setAlert({
          type: 'success',
          text: `[Sandbox Mode] Smart Reply virtually sent to ${sendConfirmData.to}! (No network data was transmitted to preserve 100% privacy.)`
        });
        
        if (activeEmail) {
          setEmails((prev) =>
            prev.map((e) => (e.id === activeEmail.id ? { ...e, isRead: true } : e))
          );
        }
        setIsSendingEmail(false);
        return;
      }

      const res = await fetch('/api/emails/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: sendConfirmData.to,
          subject: sendConfirmData.subject,
          body: sendConfirmData.body,
          threadId: activeEmail?.threadId,
        }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          handleLogout();
          setAlert({
            type: 'error',
            text: 'Your session has expired. Please log in again to send emails.',
          });
          return;
        }
        throw new Error('Gmail sending failed. Please check your credentials and connection.');
      }

      setIsSendConfirmOpen(false);
      setAlert({ type: 'success', text: `Smart Reply sent successfully to ${sendConfirmData.to}!` });
      
      // Mark as read or update locally
      if (activeEmail) {
        setEmails((prev) =>
          prev.map((e) => (e.id === activeEmail.id ? { ...e, isRead: true } : e))
        );
      }
    } catch (err: any) {
      setAlert({ type: 'error', text: err.message || 'Sending failed.' });
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (needsAuth) {
    return (
      <Onboarding
        onLogin={handleLogin}
        isLoggingIn={isLoggingIn}
        onAppleLogin={handleAppleLogin}
        isAppleLoggingIn={isAppleLoggingIn}
        onEnterLocalOnlyMode={handleEnterLocalOnlyMode}
        error={authError}
      />
    );
  }

  // Derived state: Categorize filtered lists
  const filteredEmails = emails.filter((e) => e.category === activeCategory);
  const activeEmail = emails.find((e) => e.id === selectedEmailId) || 
    syntheticEmails.find((e) => e.id === selectedEmailId) || null;

  // Folder Counts
  const getCategoryCount = (catName: string) => {
    return emails.filter((e) => e.category === catName).length;
  };

  const getUnreadCount = (catName: string) => {
    return emails.filter((e) => e.category === catName && !e.isRead).length;
  };

  return (
    <div id="app-workspace" className="min-h-screen bg-[#0D0D0D] text-[#E0E0E0] flex flex-col font-sans">
      
      {/* Dynamic Toast Alert banner */}
      {alert && (
        <div
          id="toast-banner"
          className={`fixed top-4 right-4 z-50 p-4 rounded-none border shadow-xl flex items-center gap-3 animate-slide-in max-w-sm ${
            alert.type === 'success'
              ? 'bg-[#151515] border-white/20 text-white'
              : alert.type === 'warning'
              ? 'bg-amber-950/50 border-amber-500/30 text-amber-200'
              : 'bg-red-950/40 border-red-500/20 text-red-300'
          }`}
        >
          <Sparkles className="h-4 w-4 shrink-0 text-white" />
          <span className="text-xs font-medium font-sans">{alert.text}</span>
        </div>
      )}

      {/* Primary Top Header Panel */}
      <header id="workspace-header" className="h-20 bg-[#0D0D0D] border-b border-[#2A2A2A]/80 px-8 flex items-center justify-between shrink-0 relative overflow-hidden shadow-md">
        {/* Massive subtle font background decoration */}
        <div className="absolute right-32 top-[-30px] text-[120px] font-serif italic text-white opacity-[0.02] pointer-events-none select-none">
          Draftly
        </div>

        <div className="flex items-center gap-3.5 z-10">
          <div className="h-10 w-10 rounded-none bg-gradient-to-tr from-indigo-500 via-purple-500 to-rose-400 text-white font-serif italic font-bold flex items-center justify-center text-xl tracking-tighter shadow-md shadow-indigo-500/20">
            Dr
          </div>
          <div>
            <p className="text-[8px] uppercase tracking-[0.25em] text-indigo-400 font-mono leading-none mb-1 font-bold">Draftly Intelligence</p>
            <h1 className="text-sm font-serif italic text-white font-medium flex items-center gap-1.5">
              Executive Inbox Deck
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
            </h1>
          </div>
        </div>

        {/* User profile & Action tools */}
        <div className="flex items-center gap-4 z-10">
          {/* Sensitive / Local Mode Toggle Widget */}
          <div className="flex items-center gap-2 border-r border-[#2A2A2A]/80 pr-4">
            <button
              onClick={handleToggleLocalOnlyMode}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 transition-all text-[9px] font-mono uppercase tracking-widest font-bold cursor-pointer border ${
                isLocalOnlyMode
                  ? 'bg-emerald-950/25 text-emerald-400 border-emerald-500/30 hover:bg-emerald-950/45 glow-emerald'
                  : 'bg-[#151515] text-slate-400 border-[#2A2A2A] hover:text-white hover:border-slate-500/30'
              }`}
              title={
                isLocalOnlyMode
                  ? "Local Only Mode Active: All requests kept client-side. Click to disable."
                  : "Click to activate Sensitive Local-Only Mode (Locks down outbound connections)"
              }
            >
              {isLocalOnlyMode ? (
                <>
                  <Lock className="h-3 w-3 text-emerald-400 animate-pulse" />
                  <span>Sensitive: Local ON</span>
                </>
              ) : (
                <>
                  <Shield className="h-3 w-3 text-slate-500" />
                  <span>Sensitive Mode</span>
                </>
              )}
            </button>
          </div>

          {user && (
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#555]" title={user.email || ''}>
                Secure Link: <span className="text-indigo-300 font-bold">{user.email}</span>
              </span>
            </div>
          )}

          <div className="flex items-center gap-2.5">
            <select
              value={maxResults}
              onChange={(e) => setMaxResults(Number(e.target.value))}
              className="bg-[#151515] border border-[#2A2A2A] rounded-none px-2.5 py-1.5 text-[11px] text-slate-300 focus:outline-none focus:border-white font-mono cursor-pointer transition-colors hover:border-white/20"
              title="Number of emails to analyze"
            >
              <option value={10}>Analyze 10</option>
              <option value={15}>Analyze 15</option>
              <option value={25}>Analyze 25</option>
              <option value={50}>Analyze 50</option>
              <option value={100}>Analyze 100</option>
            </select>

            <button
              onClick={fetchEmails}
              disabled={isLoading}
              className="p-2 bg-[#151515] hover:bg-white hover:text-black text-slate-200 border border-[#2A2A2A] rounded-none transition-all flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold disabled:opacity-40 cursor-pointer shadow-sm hover:border-white/30"
              title="Re-analyze and categorize inbox"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin text-indigo-400' : 'text-indigo-400'}`} />
              <span className="hidden md:inline">Analyze</span>
            </button>

            <button
              onClick={() => setIsRulesModalOpen(true)}
              className="p-2 bg-[#151515] hover:bg-white hover:text-black text-slate-200 border border-[#2A2A2A] rounded-none transition-all flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold cursor-pointer"
              title="Manage custom rules"
            >
              <Sliders className="h-3 w-3" />
              <span className="hidden md:inline">Rules</span>
            </button>

            <button
              onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
              className="p-2 bg-[#151515] hover:bg-white hover:text-black text-slate-200 border border-[#2A2A2A] rounded-none transition-all flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5 text-indigo-400" />}
              <span className="hidden lg:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>

            <button
              onClick={() => setIsGuideOpen(true)}
              className="p-2 bg-[#151515] hover:bg-white hover:text-black text-slate-200 border border-[#2A2A2A] rounded-none transition-all flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold cursor-pointer"
              title="Show User Guide Onboarding"
            >
              <HelpCircle className="h-3.5 w-3.5 text-sky-400" />
              <span className="hidden lg:inline">Guide</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 bg-red-950/10 hover:bg-red-900/20 text-red-400 border border-red-950/30 rounded-none transition-all flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold cursor-pointer"
              title="Disconnect Gmail Account"
            >
              <LogOut className="h-3 w-3" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Panel Content Area */}
      <div id="workspace-main" className="flex-1 flex overflow-hidden">
        
        {/* Left Drawer / Folder Navigator Sidebar */}
        <aside id="sidebar" className="w-60 bg-[#0D0D0D] border-r border-[#2A2A2A] flex flex-col shrink-0 overflow-y-auto">
          
          {/* Main folders navigation */}
          <div className="p-5 space-y-6">
            <div>
              <h3 className="text-[9px] font-bold text-[#555] uppercase tracking-[0.25em] px-2 mb-3 font-mono">Inbox Categories</h3>
              <nav className="space-y-1">
                {standardCategories.map((cat) => {
                  const isActive = activeCategory === cat;
                  const count = getCategoryCount(cat);
                  const unread = getUnreadCount(cat);

                  // Category-specific high fidelity icons & active styles
                  let icon = <Inbox className="h-3.5 w-3.5 shrink-0 text-slate-400" />;
                  let activeClass = 'bg-white/5 text-white border-l-2 border-white pl-2';
                  let hoverClass = 'text-[#888] hover:text-white hover:bg-white/5 border-l-2 border-transparent';

                  if (cat === 'Primary') {
                    icon = <Inbox className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />;
                    activeClass = 'bg-white/5 text-white border-l-2 border-white pl-2';
                  } else if (cat === 'Social') {
                    icon = <Users className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />;
                    activeClass = 'bg-indigo-950/10 text-indigo-300 border-l-2 border-indigo-500 pl-2';
                    hoverClass = 'text-[#888] hover:text-indigo-300 hover:bg-indigo-950/5 border-l-2 border-transparent';
                  } else if (cat === 'Promotions') {
                    icon = <Tag className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />;
                    activeClass = 'bg-amber-950/10 text-amber-300 border-l-2 border-amber-500 pl-2';
                    hoverClass = 'text-[#888] hover:text-amber-300 hover:bg-amber-950/5 border-l-2 border-transparent';
                  } else if (cat === 'Updates') {
                    icon = <RefreshCw className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />;
                    activeClass = 'bg-sky-950/10 text-sky-300 border-l-2 border-sky-400 pl-2';
                    hoverClass = 'text-[#888] hover:text-sky-300 hover:bg-sky-950/5 border-l-2 border-transparent';
                  } else if (cat === 'Spam') {
                    icon = <AlertTriangle className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-red-400' : 'text-slate-500'}`} />;
                    activeClass = 'bg-red-950/10 text-red-300 border-l-2 border-red-500 pl-2';
                    hoverClass = 'text-[#888] hover:text-red-400 hover:bg-red-950/5 border-l-2 border-transparent';
                  }

                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        setIsUnsubscribeCenterActive(false);
                        setIsThreatScannerActive(false);
                        setActiveCategory(cat);
                        // Auto select first message of new folder if available
                        const matching = emails.filter((e) => e.category === cat);
                        if (matching.length > 0) {
                          setSelectedEmailId(matching[0].id);
                        } else {
                          setSelectedEmailId(null);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-none text-xs font-medium transition-all ${
                        isActive ? activeClass : hoverClass
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        {icon}
                        {cat}
                      </span>
                      
                      <div className="flex items-center gap-1.5">
                        {unread > 0 && (
                          <span className="h-1.5 w-1.5 rounded-full bg-white shrink-0 animate-pulse"></span>
                        )}
                        <span className={`text-[9px] font-mono px-1.5 py-0.25 rounded bg-[#151515] text-[#555] font-semibold border border-[#2A2A2A] ${isActive ? 'text-white border-white/20 bg-white/10' : ''}`}>
                          {count}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Custom Folders Section */}
            <div className="border-t border-[#2A2A2A] pt-5">
              <div className="flex items-center justify-between px-2 mb-3">
                <h3 className="text-[9px] font-bold text-[#555] uppercase tracking-[0.25em] font-mono">Custom Folders</h3>
              </div>

              <nav className="space-y-1">
                {customCategories.map((cat) => {
                  const isActive = activeCategory === cat;
                  const count = getCategoryCount(cat);

                  return (
                    <div
                      key={cat}
                      className={`group w-full flex items-center justify-between px-3 py-2.5 rounded-none text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-neutral-800/40 text-white border-l-2 border-slate-300 pl-2'
                          : 'text-[#888] hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                      }`}
                    >
                      <button
                        onClick={() => {
                          setIsUnsubscribeCenterActive(false);
                          setIsThreatScannerActive(false);
                          setActiveCategory(cat);
                          const matching = emails.filter((e) => e.category === cat);
                          if (matching.length > 0) {
                            setSelectedEmailId(matching[0].id);
                          } else {
                            setSelectedEmailId(null);
                          }
                        }}
                        className="flex items-center gap-2.5 text-left truncate flex-1 cursor-pointer"
                      >
                        <Folder className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                        <span className="truncate">{cat}</span>
                      </button>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`text-[9px] font-mono px-1.5 py-0.25 rounded bg-[#151515] text-[#555] group-hover:hidden border border-[#2A2A2A] ${isActive ? 'text-white border-white/20 bg-white/10' : ''}`}>
                          {count}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCategory(cat);
                          }}
                          className="p-1 rounded-none text-[#555] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title={`Delete "${cat}" category`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </nav>

              {/* Add Custom Category Form */}
              <form onSubmit={handleAddCategory} className="mt-4 px-2">
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="New folder..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full bg-[#151515] border border-[#2A2A2A] rounded-none px-2 py-1.5 text-[11px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-white"
                  />
                  <button
                    type="submit"
                    disabled={!newCategoryName.trim()}
                    className="p-1.5 bg-white text-black hover:bg-neutral-200 rounded-none disabled:opacity-40 shrink-0 flex items-center justify-center cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </form>
            </div>

            {/* Inbox Intelligence Section */}
            <div className="border-t border-[#2A2A2A]/40 pt-5 space-y-6">
              <div>
                <h3 className="text-[9px] font-bold text-[#555] uppercase tracking-[0.25em] px-2 mb-3 font-mono">Inbox Intelligence</h3>
                <nav className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUnsubscribeCenterActive(true);
                      setIsThreatScannerActive(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-none text-xs font-medium transition-all cursor-pointer ${
                      isUnsubscribeCenterActive
                        ? 'bg-red-950/20 text-red-300 border-l-2 border-red-500 pl-2'
                        : 'text-[#888] hover:text-red-300 hover:bg-red-950/5 border-l-2 border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <MailMinus className={`h-3.5 w-3.5 shrink-0 ${isUnsubscribeCenterActive ? 'text-red-400' : 'text-slate-500'}`} />
                      Unsubscribe Center
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {unopenedSubscriptionCount > 0 && (
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0 animate-pulse"></span>
                      )}
                      <span className={`text-[9px] font-mono px-1.5 py-0.25 rounded bg-red-950/20 text-red-400 border border-red-900/30 ${isUnsubscribeCenterActive ? 'text-white border-white/20 bg-white/15' : ''}`}>
                        {unopenedSubscriptionCount}
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsUnsubscribeCenterActive(false);
                      setIsThreatScannerActive(true);
                      setSelectedEmailId(null); // Clear selected email to avoid reading panel clash
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-none text-xs font-medium transition-all cursor-pointer ${
                      isThreatScannerActive
                        ? 'bg-indigo-950/20 text-indigo-300 border-l-2 border-indigo-500 pl-2'
                        : 'text-[#888] hover:text-indigo-300 hover:bg-indigo-950/5 border-l-2 border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <ShieldAlert className={`h-3.5 w-3.5 shrink-0 ${isThreatScannerActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                      Threat & Sandbox Scanner
                    </span>
                  </button>
                </nav>
              </div>

              {/* High-Fidelity Focus Analytics Widget */}
              <div className="px-2 pt-2 border-t border-[#2A2A2A]/20">
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-none space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-[#555] uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <TrendingUp className="h-3 w-3 text-emerald-400" />
                      Executive Focus
                    </span>
                    <span className="text-[8px] uppercase tracking-widest font-mono text-emerald-400 font-bold bg-emerald-950/15 border border-emerald-500/20 px-1.5 py-0.25">
                      {emails.length > 0 ? Math.round((emails.filter(e => e.category === 'Primary' || e.category === 'Work' || e.category === 'Urgent Bills').length / emails.length) * 100) : 100}% Focus
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="h-1.5 w-full bg-[#151515] rounded-none overflow-hidden border border-[#2A2A2A]">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-sky-400 transition-all duration-500"
                        style={{ 
                          width: `${emails.length > 0 ? Math.min(100, Math.max(10, Math.round((emails.filter(e => e.category === 'Primary' || e.category === 'Work' || e.category === 'Urgent Bills').length / emails.length) * 100))) : 100}%` 
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[8px] font-mono text-[#555]">
                      <span>Clean Ratio</span>
                      <span>Target: 85%+</span>
                    </div>
                  </div>

                  {/* Micro stats table */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5 text-[9px] font-mono">
                    <div className="space-y-0.5">
                      <span className="text-[#555] block">Automation Rate</span>
                      <span className="text-slate-300 font-semibold flex items-center gap-1">
                        <Zap className="h-2.5 w-2.5 text-amber-400 shrink-0" />
                        {emails.length > 0 ? '98.4%' : '--'}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[#555] block">Security Engine</span>
                      <span className="text-slate-300 font-semibold flex items-center gap-1">
                        <ShieldCheck className="h-2.5 w-2.5 text-sky-400 shrink-0" />
                        AES-256
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </aside>

        {isUnsubscribeCenterActive ? (
          <UnsubscribeCenter
            emails={emails}
            unsubscribedSenders={unsubscribedSenders}
            onUnsubscribe={handleUnsubscribeSender}
            onClose={() => setIsUnsubscribeCenterActive(false)}
            accessToken={accessToken}
            setAlert={setAlert}
          />
        ) : isThreatScannerActive ? (
          <ThreatScanner
            emails={emails}
            onClose={() => setIsThreatScannerActive(false)}
          />
        ) : (
          <>
            {/* Center Panel: Scrollable Email List */}
            <section id="middle-email-list" className="w-80 sm:w-96 border-r border-[#2A2A2A] bg-[#0D0D0D] flex flex-col shrink-0">
              <div className="p-6 border-b border-[#2A2A2A] bg-[#151515]/10 flex items-center justify-between shrink-0">
                <div>
                  <p className="text-[8px] uppercase tracking-[0.25em] text-[#888] font-mono mb-1 leading-none">Transmission folder</p>
                  <h2 className="text-lg font-serif italic text-white font-medium">{activeCategory}</h2>
                </div>
                <span className="text-[10px] font-mono text-[#555] bg-[#151515] px-2 py-1 border border-[#2A2A2A]">
                  {filteredEmails.length} ITEMS
                </span>
              </div>

              {/* Gmail Search Input Bar */}
              <div className="px-6 py-3 border-b border-[#2A2A2A]/60 bg-[#0D0D0D] flex flex-col gap-2 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSearchQuery(searchInput);
                  }}
                  className="flex gap-1.5"
                >
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Search inbox (including old)..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="w-full bg-[#151515] border border-[#2A2A2A] rounded-none pl-3 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-white"
                    />
                    {searchInput && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchInput('');
                          setSearchQuery('');
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 hover:text-white"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-white text-black hover:bg-neutral-200 text-xs font-mono font-bold uppercase cursor-pointer shrink-0 transition-colors"
                  >
                    Search
                  </button>
                </form>
                {searchQuery && (
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono bg-white/5 border border-white/10 px-2 py-1">
                    <span className="truncate">Search: "{searchQuery}"</span>
                    <button
                      onClick={() => {
                        setSearchInput('');
                        setSearchQuery('');
                      }}
                      className="text-red-400 hover:text-red-300 font-semibold uppercase tracking-wider ml-2"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {/* Follow-up Reminders Deck */}
              {(() => {
                const activeFollowUps = followUps.filter(f => !dismissedReminders.includes(f.id));
                if (activeFollowUps.length === 0) return null;
                return (
                  <div className="px-6 py-4 bg-[#141212]/60 border-b border-[#2A1E1E]/50 flex flex-col gap-3 shrink-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[9px] font-bold text-[#888] uppercase tracking-[0.2em] font-mono flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0 animate-pulse"></span>
                        Follow-up Reminders ({activeFollowUps.length})
                      </h3>
                    </div>
                    
                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                      {activeFollowUps.map((reminder) => (
                        <div 
                          key={reminder.id}
                          className="p-3 bg-[#080808] border border-red-950/40 hover:border-red-900/40 transition-colors flex flex-col gap-2 group relative"
                        >
                          <button
                            onClick={() => handleDismissReminder(reminder.id)}
                            className="absolute top-2.5 right-2.5 text-[#555] hover:text-white transition-colors cursor-pointer text-xs"
                            title="Dismiss reminder"
                          >
                            ✕
                          </button>
                          
                          <div className="flex items-center gap-2 text-[9px] font-mono text-[#888]">
                            <span className="text-red-400 font-semibold">PENDING RESPONSE</span>
                            <span>•</span>
                            <span>{reminder.daysAgo} days ago</span>
                          </div>
                          
                          <p className="text-xs text-white font-medium pr-4 leading-normal">
                            No reply from <span className="text-red-400 font-semibold">{reminder.recipientName}</span> yet — want to follow up?
                          </p>
                          
                          <p className="text-[10px] text-[#555] truncate font-mono">
                            Subject: {reminder.subject}
                          </p>
                          
                          <div className="flex gap-2 mt-1">
                            <button
                              onClick={() => handleDraftFollowUp(reminder)}
                              disabled={draftingFollowUpId !== null}
                              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white hover:bg-neutral-200 text-black text-[10px] font-mono font-bold uppercase cursor-pointer disabled:opacity-50 transition-all"
                            >
                              {draftingFollowUpId === reminder.id ? (
                                <>
                                  <RefreshCw className="h-3 w-3 animate-spin" />
                                  Drafting...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="h-3 w-3" />
                                  Draft Follow-up
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              <EmailList
                emails={filteredEmails}
                selectedEmailId={selectedEmailId}
                onSelectEmail={(email) => setSelectedEmailId(email.id)}
                isLoading={isLoading}
                categoryColors={categoryColors}
              />
            </section>

            {/* Right Panel: Detail Reading View & Responder */}
            <section id="right-reading-panel" className="flex-1 bg-[#0D0D0D] flex flex-col min-w-0">
              <EmailDetail
                email={activeEmail}
                onGenerateReply={handleGenerateReply}
                onSendEmail={handleSendEmail}
                isGeneratingReply={isGeneratingReply}
                isSendingEmail={isSendingEmail}
                onTriggerSendConfirm={handleTriggerSendConfirm}
                initialDraftText={initialDraftText}
                initialDraftEmailId={initialDraftEmailId}
                accessToken={accessToken}
                emails={emails}
                onSelectEmailId={setSelectedEmailId}
              />
            </section>
          </>
        )}
      </div>

      {/* Dynamic Status Ribbon Marquee */}
      <div id="status-ticker" className="h-8 bg-[#151515] border-t border-[#2A2A2A] flex items-center overflow-hidden shrink-0 select-none text-[10px] font-mono text-[#555] uppercase tracking-wider relative">
        <div className="absolute left-0 top-0 bottom-0 px-4 bg-white text-black font-bold flex items-center z-10 text-[9px] uppercase tracking-widest font-serif italic">
          Draftly Status
        </div>
        <div className="animate-marquee whitespace-nowrap flex gap-12 pl-36">
          <span>● System active</span>
          <span>● Gemini cognitive model connected</span>
          <span>● Real-time inbox routing synchronized</span>
          <span>● Safe drafts mode fully enabled</span>
          <span>● System active</span>
          <span>● Gemini cognitive model connected</span>
          <span>● Real-time inbox routing synchronized</span>
          <span>● Safe drafts mode fully enabled</span>
        </div>
      </div>

      {/* --- Overlay Modals --- */}
      
      {/* 1. Custom Rules Configuration Modal */}
      <RulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
        rules={customRules}
        onAddRule={handleAddRule}
        onDeleteRule={handleDeleteRule}
        categories={[...standardCategories, ...customCategories]}
      />

      {/* 2. Safe Reply / Email Send Confirmation Modal */}
      <ReplyConfirmationModal
        isOpen={isSendConfirmOpen}
        onClose={() => setIsSendConfirmOpen(false)}
        onConfirm={handleSendEmail}
        to={sendConfirmData.to}
        subject={sendConfirmData.subject}
        body={sendConfirmData.body}
        isSending={isSendingEmail}
      />

      {/* 3. Onboarding User Guide Modal */}
      <UserGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

    </div>
  );
}
