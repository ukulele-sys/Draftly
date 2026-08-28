import React from 'react';
import { X, Send, AlertTriangle } from 'lucide-react';

interface ReplyConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  to: string;
  subject: string;
  body: string;
  isSending: boolean;
}

export default function ReplyConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  to,
  subject,
  body,
  isSending,
}: ReplyConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div id="confirm-modal-overlay" className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in font-sans text-[#E0E0E0]">
      <div id="confirm-modal-content" className="bg-[#0D0D0D] border border-[#2A2A2A] rounded-none w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#2A2A2A] flex items-center justify-between bg-[#151515]/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-black border border-[#2A2A2A] text-white rounded-none">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-light text-white italic">Confirm Outgoing Transmission</h3>
              <p className="text-[10px] text-[#555] font-mono uppercase tracking-wider mt-0.5">Please review before executing send.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-none text-[#555] hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Envelope Content */}
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          {/* Metadata */}
          <div className="space-y-2.5 p-4 bg-[#151515] rounded-none border border-[#2A2A2A] text-xs">
            <div className="flex">
              <span className="w-16 font-mono text-[9px] uppercase tracking-widest text-[#555]">Recipient:</span>
              <span className="text-white font-semibold font-sans">{to}</span>
            </div>
            <div className="flex border-t border-[#2A2A2A]/40 pt-2.5">
              <span className="w-16 font-mono text-[9px] uppercase tracking-widest text-[#555]">Subject:</span>
              <span className="text-white font-semibold font-sans">{subject}</span>
            </div>
          </div>

          {/* Draft Preview */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-[#555] uppercase tracking-widest font-mono">Transmission Content Preview</label>
            <div className="bg-[#0D0D0D] border border-[#2A2A2A] rounded-none p-4 text-xs font-mono text-white max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {body}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-[#2A2A2A] flex items-center justify-end gap-3 bg-[#151515]/20">
          <button
            onClick={onClose}
            disabled={isSending}
            className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#888] hover:text-white bg-[#151515] border border-[#2A2A2A] rounded-none transition-all cursor-pointer"
          >
            Cancel
          </button>
          
          <button
            onClick={onConfirm}
            disabled={isSending}
            className="px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest bg-white hover:bg-neutral-200 text-black rounded-none flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {isSending ? (
              <>
                <div className="h-3 w-3 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                Send Email
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
