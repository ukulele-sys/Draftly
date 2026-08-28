import React from 'react';
import { Mail, CheckSquare, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { EmailMessage } from '../types';

interface EmailListProps {
  emails: EmailMessage[];
  selectedEmailId: string | null;
  onSelectEmail: (email: EmailMessage) => void;
  isLoading: boolean;
  categoryColors: Record<string, string>;
}

export default function EmailList({
  emails,
  selectedEmailId,
  onSelectEmail,
  isLoading,
  categoryColors,
}: EmailListProps) {
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col divide-y divide-[#2A2A2A]/40 overflow-y-auto bg-[#0D0D0D]">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-5 space-y-3 animate-pulse border-b border-[#2A2A2A]/30">
            <div className="flex justify-between items-center">
              <div className="h-3 bg-[#1c1c1c] w-1/3"></div>
              <div className="h-3 bg-[#1c1c1c] w-12"></div>
            </div>
            <div className="h-4 bg-[#1c1c1c] w-3/4"></div>
            <div className="h-3 bg-[#1c1c1c] w-full"></div>
            <div className="flex gap-2">
              <div className="h-4 bg-[#1c1c1c] w-16"></div>
              <div className="h-4 bg-[#1c1c1c] w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#555] bg-[#0D0D0D]">
        <Mail className="h-8 w-8 text-[#222] mb-3 stroke-[1.2]" />
        <p className="text-xs uppercase tracking-widest text-white/50 font-medium">No transmissions found</p>
        <p className="text-[10px] text-[#555] max-w-[200px] mt-1.5 leading-relaxed">Incoming matching emails will populate this queue.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto divide-y divide-[#2A2A2A]/40 bg-[#0D0D0D]">
      {emails.map((email, idx) => {
        const isSelected = selectedEmailId === email.id;
        const colorClass = categoryColors[email.category] || 'bg-[#151515] text-[#AAA] border-[#2A2A2A]';
        const isMeeting = !!email.isMeetingRequest;

        // Format short date
        let displayDate = '';
        try {
          const dateObj = new Date(email.date);
          if (!isNaN(dateObj.getTime())) {
            dateObj.toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            });
            displayDate = dateObj.toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            });
          } else {
            displayDate = email.date.slice(0, 10);
          }
        } catch {
          displayDate = email.date;
        }

        return (
          <motion.div
            key={email.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: Math.min(idx * 0.03, 0.35), ease: "easeOut" }}
            whileHover={{ scale: 1.002, x: 1 }}
            onClick={() => onSelectEmail(email)}
            className={`p-5 cursor-pointer transition-all duration-300 border-l-2 flex flex-col gap-2.5 relative ${
              isSelected
                ? email.category === 'Urgent Bills'
                  ? 'bg-rose-950/10 border-rose-500 glow-rose'
                  : email.category === 'Work'
                  ? 'bg-blue-950/15 border-blue-400 glow-indigo'
                  : email.category === 'Newsletters'
                  ? 'bg-emerald-950/10 border-emerald-400 glow-emerald'
                  : email.category === 'Promotions'
                  ? 'bg-amber-950/10 border-amber-400 glow-amber'
                  : 'bg-[#151515] border-white glow-white'
                : isMeeting
                ? 'border-rose-900/40 bg-rose-950/5 hover:bg-rose-950/10'
                : 'border-transparent bg-[#0D0D0D] hover:bg-white/[0.02]'
            } ${!email.isRead ? 'bg-white/[0.01]' : ''}`}
          >
            {/* Top row: Sender Name and Date */}
            <div className="flex justify-between items-center gap-2">
              <div className="flex items-center gap-2">
                {!email.isRead && (
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0 animate-pulse" title="Unread transmission"></span>
                )}
                <span className={`text-[10px] uppercase tracking-[0.08em] truncate font-mono ${!email.isRead ? 'font-bold text-white' : 'text-[#888]'}`}>
                  {email.senderName || email.sender}
                </span>
              </div>
              <span className="text-[9px] text-[#555] font-mono shrink-0">{displayDate}</span>
            </div>

            {/* Subject */}
            <h4 className={`text-xs truncate font-sans tracking-tight leading-snug ${!email.isRead ? 'font-semibold text-white' : 'text-[#BBB]'}`}>
              {email.subject}
            </h4>

            {/* AI Summary (Executive brief snippet) */}
            <p className="text-[11px] text-[#888] line-clamp-2 leading-relaxed italic font-sans pl-2 border-l border-white/5">
              "{email.summary || email.snippet}"
            </p>

            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-none border ${colorClass}`}>
                {email.category}
              </span>

              {isMeeting && (
                <span className="inline-flex items-center gap-1 text-[8px] font-semibold text-rose-400 bg-rose-950/30 border border-rose-500/20 px-2 py-0.5 rounded-none uppercase tracking-wider">
                  <Calendar className="h-2.5 w-2.5 text-rose-400" />
                  Meeting
                </span>
              )}

              {email.actionItems && email.actionItems.length > 0 && (
                <span className="inline-flex items-center gap-1 text-[8px] font-semibold text-amber-400 bg-amber-950/20 border border-amber-500/20 px-2 py-0.5 rounded-none uppercase tracking-wider animate-pulse-subtle">
                  <CheckSquare className="h-2.5 w-2.5 text-amber-400" />
                  {email.actionItems.length} Task{email.actionItems.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
