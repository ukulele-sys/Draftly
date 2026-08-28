import React, { useState } from 'react';
import { X, Plus, Trash2, HelpCircle } from 'lucide-react';
import { CustomRule } from '../types';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: CustomRule[];
  onAddRule: (rule: Omit<CustomRule, 'id'>) => void;
  onDeleteRule: (id: string) => void;
  categories: string[];
}

export default function RulesModal({ isOpen, onClose, rules, onAddRule, onDeleteRule, categories }: RulesModalProps) {
  const [category, setCategory] = useState(categories[0] || 'Primary');
  const [field, setField] = useState<'sender' | 'subject' | 'body' | 'any'>('sender');
  const [operator, setOperator] = useState<'contains' | 'equals' | 'startsWith'>('contains');
  const [value, setValue] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;

    onAddRule({
      category,
      field,
      operator,
      value: value.trim(),
    });
    setValue('');
  };

  return (
    <div id="rules-modal-overlay" className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4 font-sans text-[#E0E0E0]">
      <div id="rules-modal-content" className="bg-[#0D0D0D] border border-[#2A2A2A] rounded-none w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-[#2A2A2A] flex items-center justify-between bg-[#151515]/30">
          <div>
            <h2 className="text-xl font-serif font-light text-white flex items-center gap-2 italic">
              Custom Routing Rules
            </h2>
            <p className="text-[11px] text-[#888] uppercase tracking-wider font-mono mt-1">
              Deterministic routing engines for email sorting
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-none text-[#555] hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form to Add New Rule */}
        <form onSubmit={handleSubmit} className="p-6 bg-[#151515] border-b border-[#2A2A2A]">
          <h3 className="text-[10px] font-bold text-[#888] uppercase tracking-[0.2em] mb-4 font-mono">Create Sorting Logic</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-[10px] font-bold text-[#555] uppercase tracking-widest font-mono mb-1.5">If field</label>
              <select
                value={field}
                onChange={(e) => setField(e.target.value as any)}
                className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-none px-3 py-2 text-xs text-white focus:outline-none focus:border-white font-mono"
              >
                <option value="sender">Sender</option>
                <option value="subject">Subject</option>
                <option value="body">Email Body</option>
                <option value="any">Any field</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#555] uppercase tracking-widest font-mono mb-1.5">Operator</label>
              <select
                value={operator}
                onChange={(e) => setOperator(e.target.value as any)}
                className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-none px-3 py-2 text-xs text-white focus:outline-none focus:border-white font-mono"
              >
                <option value="contains">contains</option>
                <option value="equals">equals</option>
                <option value="startsWith">starts with</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-[#555] uppercase tracking-widest font-mono mb-1.5">Value (case-insensitive)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. invoice, stripe, boss@co.com"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-none px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-white font-sans"
                />
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-[#2A2A2A]/40">
            <div>
              <label className="block text-[10px] font-bold text-[#555] uppercase tracking-widest font-mono mb-1.5">Route to category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-[#0D0D0D] border border-[#2A2A2A] rounded-none px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white font-mono"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={!value.trim()}
              className="w-full sm:w-auto bg-white hover:bg-neutral-200 disabled:opacity-50 text-black font-bold text-[10px] uppercase tracking-widest px-5 py-2 rounded-none flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="h-3 w-3" />
              Add Rule
            </button>
          </div>
        </form>

        {/* Rules List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] font-bold text-[#888] uppercase tracking-[0.2em] font-mono">Active Rules ({rules.length})</h3>
            <div className="flex items-center gap-1.5 text-[9px] text-[#555] font-mono uppercase tracking-wider">
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Evaluated sequentially</span>
            </div>
          </div>

          {rules.length === 0 ? (
            <div className="text-center py-10 bg-[#151515]/30 border border-dashed border-[#2A2A2A] rounded-none">
              <p className="text-xs text-[#555] uppercase tracking-wider">No active sorting rules defined.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between p-4 bg-[#151515] border border-[#2A2A2A] rounded-none transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs font-mono">
                    <div className="flex items-center gap-1">
                      <span className="text-[#555] uppercase tracking-wider">If</span>
                      <span className="font-semibold text-white bg-black border border-[#2A2A2A] px-2 py-0.5 rounded-none text-[9px]">
                        {rule.field}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[#555]">{rule.operator}</span>
                      <span className="font-medium text-white font-sans italic">"{rule.value}"</span>
                    </div>

                    <div className="flex items-center gap-1.5 sm:border-l sm:border-[#2A2A2A] sm:pl-4">
                      <span className="text-[#555] uppercase tracking-wider">route to</span>
                      <span className="font-semibold text-white bg-black border border-white/20 px-2 py-0.5 rounded-none text-[9px]">
                        {rule.category}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteRule(rule.id)}
                    className="p-1.5 text-[#555] hover:text-red-400 rounded-none transition-colors shrink-0"
                    title="Delete rule"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
