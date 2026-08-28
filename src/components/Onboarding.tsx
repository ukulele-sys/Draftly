import React from 'react';
import { Shield, Zap, Sparkles, Filter, Lock } from 'lucide-react';

interface OnboardingProps {
  onLogin: () => void;
  isLoggingIn: boolean;
  onAppleLogin: () => void;
  isAppleLoggingIn: boolean;
  onEnterLocalOnlyMode: () => void;
  error?: string | null;
}

export default function Onboarding({
  onLogin,
  isLoggingIn,
  onAppleLogin,
  isAppleLoggingIn,
  onEnterLocalOnlyMode,
  error,
}: OnboardingProps) {
  return (
    <div id="onboarding-container" className="min-h-screen bg-[#0D0D0D] text-[#E0E0E0] flex flex-col items-center justify-center px-4 relative overflow-hidden font-sans">
      
      {/* Massive Background Typography */}
      <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 text-[180px] sm:text-[280px] font-serif italic text-white opacity-[0.02] pointer-events-none select-none">
        Draftly
      </div>

      <div id="onboarding-card" className="max-w-md w-full bg-[#151515] border border-[#2A2A2A] rounded-none p-8 relative z-10 flex flex-col items-center text-center">
        {/* App Icon */}
        <div id="app-logo-badge" className="h-14 w-14 bg-white text-black flex items-center justify-center mb-6">
          <Sparkles className="h-6 w-6" />
        </div>

        <h1 id="onboarding-title" className="text-3xl font-serif font-light text-white tracking-tight">
          Draftly <span className="italic">Email</span>
        </h1>
        <p id="onboarding-subtitle" className="mt-3 text-xs uppercase tracking-widest text-[#888] font-mono">
          Executive Intelligence Agent
        </p>

        {error && (
          <div id="auth-error-alert" className="mt-4 p-3 bg-red-950/20 border border-red-900/30 rounded-none text-red-400 text-xs w-full font-mono">
            {error}
          </div>
        )}

        {/* Features list */}
        <div id="features-list" className="mt-8 space-y-4 w-full text-left">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-black border border-[#2A2A2A] text-white shrink-0">
              <Filter className="h-4 w-4 stroke-[1.5]" />
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-wider font-semibold text-white">Semantic Routing</h3>
              <p className="text-[11px] text-[#888] mt-0.5 leading-relaxed">Sorts inbox emails into Primary, Social, Updates, or custom folders instantly using Gemini.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-2 bg-black border border-[#2A2A2A] text-white shrink-0">
              <Zap className="h-4 w-4 stroke-[1.5]" />
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-wider font-semibold text-white">Executive Briefing</h3>
              <p className="text-[11px] text-[#888] mt-0.5 leading-relaxed">Extracts concise structural summaries and actionable checklist items from long messages.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-2 bg-black border border-[#2A2A2A] text-white shrink-0">
              <Sparkles className="h-4 w-4 stroke-[1.5]" />
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-wider font-semibold text-white">Tone-Matched Replies</h3>
              <p className="text-[11px] text-[#888] mt-0.5 leading-relaxed">Generate customized context-aware smart drafts directly reflecting your selected workflow tone.</p>
            </div>
          </div>
        </div>

        {/* Sign in buttons wrapper */}
        <div id="signin-button-wrapper" className="mt-10 w-full flex flex-col gap-3">
          {/* Google Sign-In */}
          <button
            id="google-signin-btn"
            onClick={onLogin}
            disabled={isLoggingIn || isAppleLoggingIn}
            className={`w-full flex items-center justify-center cursor-pointer transition-all ${
              isLoggingIn || isAppleLoggingIn ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.01]'
            }`}
          >
            <div className="w-full flex items-center justify-center gap-3 bg-white hover:bg-neutral-200 text-black font-bold uppercase tracking-widest text-[10px] py-3.5 rounded-none border border-white">
              {isLoggingIn ? (
                <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <div className="flex items-center gap-2">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block', width: '14px', height: '14px' }}>
                    <path fill="#000" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#000" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#000" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#000" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                </div>
              )}
              <span>{isLoggingIn ? 'Connecting...' : 'Sign in with Google'}</span>
            </div>
          </button>

          {/* Apple Sign-In */}
          <button
            id="apple-signin-btn"
            onClick={onAppleLogin}
            disabled={isLoggingIn || isAppleLoggingIn}
            className={`w-full flex items-center justify-center cursor-pointer transition-all ${
              isLoggingIn || isAppleLoggingIn ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.01]'
            }`}
          >
            <div className="w-full flex items-center justify-center gap-3 bg-black hover:bg-neutral-900 text-white font-bold uppercase tracking-widest text-[10px] py-3.5 rounded-none border border-[#2A2A2A]">
              {isAppleLoggingIn ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <div className="flex items-center gap-2">
                  <svg viewBox="0 0 170 170" style={{ width: '13px', height: '13px' }} className="fill-current text-white">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.13-1.92-14.37-6.15-2.88-2.38-6.66-6.83-11.34-13.38-5.06-7.07-9.35-15.02-12.87-23.85C8.82 108.61 7 94.67 7 81.38c0-14.28 3.73-25.9 11.19-34.88 7.46-8.97 16.71-13.5 27.75-13.6 5.59.1 11.35 1.83 17.29 5.18 5.93 3.35 10.15 5.03 12.67 5.03 2.01 0 6.09-1.57 12.23-4.72 6.14-3.15 11.62-4.66 16.42-4.52 15.75.56 27.35 6.31 34.8 17.25-13.63 8.27-20.3 19.34-20 33.22.34 10.73 4.3 19.52 11.89 26.39 7.58 6.87 16.48 10.45 26.7 10.73-2.01 6.14-4.5 12.18-7.47 18.11zm-24.81-111.4c0 7.82-2.85 14.93-8.56 21.32-5.71 6.39-12.79 10.11-21.23 11.17.11-7.15 2.96-14.2 8.56-20.94 5.6-6.74 12.84-10.95 21.23-11.55z" />
                  </svg>
                </div>
              )}
              <span>{isAppleLoggingIn ? 'Connecting...' : 'Sign in with Apple'}</span>
            </div>
          </button>

          {/* Local-Only Sandbox Separator */}
          <div className="flex items-center gap-3 my-1">
            <div className="h-[1px] bg-[#2A2A2A] flex-1"></div>
            <span className="text-[9px] font-mono uppercase text-slate-600 tracking-widest font-semibold">or</span>
            <div className="h-[1px] bg-[#2A2A2A] flex-1"></div>
          </div>

          {/* Enter Private Sandbox (Local-Only) */}
          <button
            id="local-sandbox-btn"
            onClick={onEnterLocalOnlyMode}
            className="w-full flex items-center justify-center cursor-pointer transition-all hover:scale-[1.01]"
          >
            <div className="w-full flex items-center justify-center gap-2.5 bg-indigo-950/20 hover:bg-indigo-950/40 text-indigo-300 font-bold uppercase tracking-widest text-[10px] py-3.5 rounded-none border border-indigo-500/20 glow-indigo">
              <Lock className="h-3.5 w-3.5 text-indigo-400" />
              <span>Enter Local-Only Sandbox</span>
            </div>
          </button>
        </div>

        <div className="mt-6 flex items-center gap-2 text-[#555] text-[10px] font-mono uppercase tracking-wider">
          <Shield className="h-3 w-3" />
          <span>In-Memory Auth Cache</span>
        </div>
      </div>
    </div>
  );
}
