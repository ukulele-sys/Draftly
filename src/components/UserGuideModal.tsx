import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Filter, 
  Zap, 
  CheckSquare, 
  Sliders, 
  MailMinus,
  ChevronRight,
  ChevronLeft,
  BookOpen
} from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserGuideModal({ isOpen, onClose }: UserGuideModalProps) {
  const [activeStep, setActiveStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: 'Draftly Executive Intelligence',
      subtitle: 'Introduction to Draftly',
      icon: <Sparkles className="h-6 w-6 text-white" />,
      content: (
        <div className="space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Welcome to <strong className="text-white">Draftly</strong>, your premium high-throughput executive inbox agent. 
            Draftly integrates directly with your Google Workspace to classify, summarize, draft, and streamline your digital correspondence.
          </p>
          <div className="p-4 bg-white/5 border border-white/10 rounded-none text-[11px] text-slate-400 font-mono leading-relaxed">
            <span className="text-white font-semibold">Active Engine:</span> Gemini 3.5 Flash / 3.1 Flash-Lite hybrid classification & drafting network.
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Designed to clear inbox fatigue, Draftly acts as a secure buffer that processes incoming mail in-memory to help you focus on what actually matters.
          </p>
        </div>
      ),
    },
    {
      title: 'Semantic Routing',
      subtitle: 'Inbox Categories & Folders',
      icon: <Filter className="h-6 w-6 text-white" />,
      content: (
        <div className="space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Say goodbye to single-stream inbox noise. Draftly automatically scans incoming mail headers and body copy to distribute them into targeted category folders:
          </p>
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
            <div className="p-2 border border-white/5 bg-white/5">
              <span className="text-white font-bold">● Primary</span>
              <p className="text-[#888] mt-0.5">Critical, direct correspondence</p>
            </div>
            <div className="p-2 border border-white/5 bg-white/5">
              <span className="text-amber-400 font-bold">● Urgent Bills</span>
              <p className="text-[#888] mt-0.5">Invoices & accounts due</p>
            </div>
            <div className="p-2 border border-white/5 bg-white/5">
              <span className="text-indigo-400 font-bold">● Work</span>
              <p className="text-[#888] mt-0.5">Corporate / business updates</p>
            </div>
            <div className="p-2 border border-white/5 bg-white/5">
              <span className="text-emerald-400 font-bold">● Newsletters</span>
              <p className="text-[#888] mt-0.5">Subscriptions & digests</p>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            You can dynamically add custom categories and let the AI models auto-classify incoming correspondence into them!
          </p>
        </div>
      ),
    },
    {
      title: 'Executive Briefings',
      subtitle: 'Summaries & Actionable Checklists',
      icon: <Zap className="h-6 w-6 text-white" />,
      content: (
        <div className="space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Instead of parsing long, winding email threads, click on any message to view its <strong className="text-white">AI Briefing Panel</strong>:
          </p>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li className="flex items-start gap-2">
              <span className="text-white font-bold font-mono mt-0.5">✓</span>
              <span><strong className="text-white">Bulleted Summaries:</strong> Distills complex interactions down to 3 quick bullet points.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-white font-bold font-mono mt-0.5">✓</span>
              <span><strong className="text-white">Actionable Tasks:</strong> Pulls out commitments, deadlines, and action items as interactive checkboxes.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-white font-bold font-mono mt-0.5">✓</span>
              <span><strong className="text-white">Local Completion:</strong> Toggle tasks directly to track your progress throughout the day.</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Tone-Matched Smart Drafts',
      subtitle: 'Dictation & Prompt-guided Replies',
      icon: <Sparkles className="h-6 w-6 text-white" />,
      content: (
        <div className="space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Draftly lets you reply to emails in seconds while perfectly matching your desired communication tone:
          </p>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>
              <strong className="text-white">1. Select a Workflow Tone:</strong> Pick from Professional, Concise, Friendly, Direct, or Apologetic.
            </li>
            <li>
              <strong className="text-white">2. Prompt or Dictate:</strong> Type brief guiding instructions, or click the <strong className="text-white">Microphone Icon</strong> to transcribe your voice notes in real-time.
            </li>
            <li>
              <strong className="text-white">3. Verify and Execute:</strong> Gemini builds a complete tone-accurate draft. Edit it to perfection, click Send, and the email fires off securely via the official Gmail API.
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: 'One-Click Subscription Center',
      subtitle: 'Reclaiming Your Focus',
      icon: <MailMinus className="h-6 w-6 text-white" />,
      content: (
        <div className="space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            No more hunting for tiny unsubscribe links at the bottom of promotional emails.
          </p>
          <p className="text-xs text-slate-300 leading-relaxed">
            Click the <strong className="text-white">Unsubscribe Center</strong> in the sidebar to review all newsletter senders in your inbox.
            Draftly parses official RFC headers and unsubscribe endpoints to let you unsubscribe in one-click directly from the deck.
          </p>
          <div className="p-3 border border-red-500/10 bg-red-950/5 text-[11px] text-red-400 font-mono">
            Unsubscribing triggers secure backend requests or sends standardized mailto signals automatically.
          </div>
        </div>
      ),
    },
    {
      title: 'Determinstic Routing Engine',
      subtitle: 'Surgical Control over Folders',
      icon: <Sliders className="h-6 w-6 text-white" />,
      content: (
        <div className="space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Want 100% predictable sorting? You can craft standard logical routing rules:
          </p>
          <div className="p-3.5 bg-black/40 border border-white/10 rounded-none text-[10px] font-mono text-slate-300 space-y-1">
            <div><span className="text-[#888]">IF</span> sender <span className="text-white font-bold">contains</span> <span className="text-amber-400">"@google.com"</span></div>
            <div><span className="text-[#888]">THEN ROUTE TO</span> <span className="text-indigo-400">"Work"</span></div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Deterministic rules take absolute precedence over generative classification, giving you bulletproof custom category routing.
          </p>
        </div>
      ),
    }
  ];

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const currentStepData = steps[activeStep];

  return (
    <div id="user-guide-overlay" className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4 font-sans text-[#E0E0E0]">
      <div id="user-guide-content" className="bg-[#0D0D0D] border border-[#2A2A2A] rounded-none w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-[#2A2A2A] flex items-center justify-between bg-[#151515]/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/5 border border-white/10 shrink-0">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-light text-white flex items-center gap-2 italic">
                Draftly Onboarding Manual
              </h2>
              <p className="text-[10px] text-[#888] uppercase tracking-wider font-mono">
                Step {activeStep + 1} of {steps.length} — {currentStepData.subtitle}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-none text-[#555] hover:text-white transition-colors cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Dynamic Content Frame */}
        <div className="flex-1 p-8 overflow-y-auto space-y-6">
          <div className="flex items-center gap-4 border-b border-[#2A2A2A]/40 pb-4">
            <div className="h-12 w-12 bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              {currentStepData.icon}
            </div>
            <div>
              <h3 className="text-md font-serif italic text-white font-medium">{currentStepData.title}</h3>
              <p className="text-[9px] uppercase tracking-wider text-[#888] font-mono">{currentStepData.subtitle}</p>
            </div>
          </div>

          <div id="step-content-box" className="min-h-[180px]">
            {currentStepData.content}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-6 border-t border-[#2A2A2A] bg-[#151515]/20 flex items-center justify-between">
          {/* Step indicators */}
          <div className="flex gap-1.5">
            {steps.map((_, idx) => (
              <span 
                key={idx} 
                className={`h-1.5 transition-all rounded-none ${
                  idx === activeStep 
                    ? 'w-6 bg-white' 
                    : 'w-1.5 bg-white/15'
                }`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3">
            {activeStep > 0 && (
              <button
                onClick={handleBack}
                className="px-4 py-2 bg-transparent hover:bg-white/5 border border-transparent text-[#888] hover:text-white text-[10px] uppercase tracking-widest font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="h-3 w-3" />
                <span>Back</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-5 py-2 bg-white hover:bg-neutral-200 text-black text-[10px] uppercase tracking-widest font-bold transition-all flex items-center gap-1 cursor-pointer border border-white"
            >
              <span>{activeStep === steps.length - 1 ? 'Get Started' : 'Next'}</span>
              {activeStep < steps.length - 1 && <ChevronRight className="h-3 w-3" />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
