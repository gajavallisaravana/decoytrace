import React, { useState } from 'react';
import { 
  Cpu, 
  Database, 
  ShieldCheck, 
  RotateCcw, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Lock,
  Layers
} from 'lucide-react';
import { initSandbox, resetSandbox, tamperSandboxBlock } from '../lib/api';

interface SettingsProps {
  onNavigateToLedger: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onNavigateToLedger }) => {
  const [sandboxStatus, setSandboxStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleStartSandbox = async () => {
    try {
      setLoading(true);
      await initSandbox();
      setSandboxStatus('Sandbox cloned successfully from live ledger. You can now simulate malicious alterations safely.');
    } catch (err: any) {
      setSandboxStatus('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTamperPayload = async () => {
    try {
      setLoading(true);
      await tamperSandboxBlock(1, 'alter_payload');
      setSandboxStatus('Applied malicious payload tampering to Sandbox Block #1. Navigate to Integrity Ledger to run verification audit!');
    } catch (err: any) {
      setSandboxStatus('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTamperHashLink = async () => {
    try {
      setLoading(true);
      await tamperSandboxBlock(1, 'sever_previous_hash');
      setSandboxStatus('Severed previous-hash pointer on Sandbox Block #1. Cryptographic chain continuity is now broken in sandbox.');
    } catch (err: any) {
      setSandboxStatus('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      setLoading(true);
      await resetSandbox();
      setSandboxStatus('Sandbox reset. All records reverted to the authentic live ledger.');
    } catch (err: any) {
      setSandboxStatus('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF873D]">System Configuration</span>
          <span className="text-xs text-[#CDD2D8]/40">·</span>
          <span className="text-xs text-[#D0BFB0]">Forensic Integrity Controls</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#FFF8F1] tracking-tight mt-1">Platform Settings & Sandbox Lab</h1>
        <p className="text-xs sm:text-sm text-[#D0BFB0] mt-1">
          Manage system parameters, inspect local SQLite persistent storage, and access the isolated cryptographic tampering lab.
        </p>
      </div>

      {sandboxStatus && (
        <div className="p-4 rounded-xl bg-[#15120F]/90 border border-[rgba(255,170,100,0.4)] text-xs text-[#FFF8F1] flex items-center justify-between shadow-[0_0_20px_rgba(255,135,61,0.2)]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#FF873D] shrink-0" />
            <span className="font-medium text-[#FFF8F1]">{sandboxStatus}</span>
          </div>
          <button
            onClick={() => setSandboxStatus(null)}
            className="text-[11px] font-semibold text-[#FF873D] hover:text-[#FFB45E] shrink-0 ml-4 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* System & Persistence Status */}
        <div className="p-6 rounded-2xl glass-panel space-y-4 border border-[rgba(255,170,100,0.2)]">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#FF873D]" />
            <h3 className="text-base font-semibold text-[#FFF8F1]">Storage & Database Health</h3>
          </div>

          <div className="space-y-3 text-xs text-[#FFF8F1]">
            <div className="p-3 rounded-xl bg-[#15120F]/80 border border-[rgba(255,170,100,0.2)] flex items-center justify-between shadow-sm">
              <span className="text-[#D0BFB0]">Database Engine</span>
              <strong className="font-mono text-[#FFF8F1]">SQLite (WAL Mode)</strong>
            </div>

            <div className="p-3 rounded-xl bg-[#15120F]/80 border border-[rgba(255,170,100,0.2)] flex items-center justify-between shadow-sm">
              <span className="text-[#D0BFB0]">Data File Location</span>
              <code className="font-mono text-[#FFB45E]">./data/decoytrace.db</code>
            </div>

            <div className="p-3 rounded-xl bg-[#15120F]/80 border border-[rgba(255,170,100,0.2)] flex items-center justify-between shadow-sm">
              <span className="text-[#D0BFB0]">Ledger Hash Algorithm</span>
              <strong className="font-mono text-[#FF873D]">SHA-256 (Node Crypto)</strong>
            </div>

            <div className="p-3 rounded-xl bg-[#15120F]/80 border border-[rgba(255,170,100,0.2)] flex items-center justify-between shadow-sm">
              <span className="text-[#D0BFB0]">Serialization Standard</span>
              <strong className="font-mono text-[#FFF8F1]">Deterministic Canonical JSON (Sorted)</strong>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#15120F]/80 border border-[rgba(255,170,100,0.2)] text-[11px] text-[#D0BFB0] flex items-start gap-2">
            <Lock className="w-4 h-4 text-[#FF873D] shrink-0 mt-0.5" />
            <span>
              All decoy assets, threat events, investigation notes, and cryptographic blocks remain persistent across server restarts and browser reloads.
            </span>
          </div>
        </div>

        {/* Cryptographic Tamper Sandbox Controls */}
        <div className="p-6 rounded-2xl glass-panel space-y-4 border border-[rgba(255,170,100,0.2)]">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#FF873D]" />
            <h3 className="text-base font-semibold text-[#FFF8F1]">Isolated Tamper Sandbox Lab</h3>
          </div>

          <p className="text-xs text-[#D0BFB0] leading-relaxed">
            Verify DecoyTrace's mathematical integrity detection by injecting controlled anomalies into an isolated clone. Genuine forensic history is strictly protected.
          </p>

          <div className="space-y-2.5 pt-1">
            <button
              onClick={handleStartSandbox}
              disabled={loading}
              className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl glass-button-secondary flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#FF873D]" />
              <span>Clone Live Ledger into Sandbox</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleTamperPayload}
                disabled={loading}
                className="py-2.5 px-3 text-xs font-semibold text-[#F43F5E] bg-[#F43F5E]/10 hover:bg-[#F43F5E]/20 border border-[#F43F5E]/30 rounded-xl transition-all cursor-pointer"
              >
                Inject Payload Tamper
              </button>
              <button
                onClick={handleTamperHashLink}
                disabled={loading}
                className="py-2.5 px-3 text-xs font-semibold text-[#F59E0B] bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 border border-[#F59E0B]/30 rounded-xl transition-all cursor-pointer"
              >
                Sever Block Link
              </button>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleReset}
                disabled={loading}
                className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl glass-button-secondary flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Sandbox</span>
              </button>

              <button
                onClick={onNavigateToLedger}
                className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl glass-button-primary flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <span>Audit Ledger</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
