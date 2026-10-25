import React, { useEffect, useState } from 'react';
import { 
  Link as LinkIcon, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  RefreshCw, 
  Search, 
  FileText, 
  Lock, 
  Code2, 
  ArrowRight,
  X,
  RotateCcw,
  Sparkles,
  Cpu
} from 'lucide-react';
import { LedgerBlock, VerificationResult } from '../types';
import { 
  fetchLedgerBlocks, 
  verifyLedgerChain, 
  verifySingleBlock, 
  initSandbox, 
  tamperSandboxBlock, 
  resetSandbox 
} from '../lib/api';

export const BlockchainLedger: React.FC = () => {
  const [blocks, setBlocks] = useState<LedgerBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sandbox Mode State
  const [isSandboxMode, setIsSandboxMode] = useState(false);
  const [tamperedIndex, setTamperedIndex] = useState<number | null>(null);
  const [tamperType, setTamperType] = useState<string | null>(null);
  const [sandboxActionLoading, setSandboxActionLoading] = useState(false);

  // Verification State
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [verifying, setVerifying] = useState(false);

  // Selected Block Modal
  const [selectedBlock, setSelectedBlock] = useState<LedgerBlock | null>(null);
  const [blockVerification, setBlockVerification] = useState<any | null>(null);
  const [verifyingSingle, setVerifyingSingle] = useState(false);

  // Search filter
  const [search, setSearch] = useState('');

  const loadBlocks = async (sandbox = isSandboxMode) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchLedgerBlocks(sandbox);
      setBlocks(data.blocks);
      setIsSandboxMode(data.is_sandbox);
      setTamperedIndex(data.tampered_block_index ?? null);
      setTamperType(data.tamper_type ?? null);
    } catch (err: any) {
      setError(err.message || 'Failed to load ledger blocks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlocks();
  }, []);

  const handleVerifyChain = async () => {
    try {
      setVerifying(true);
      const res = await verifyLedgerChain(isSandboxMode);
      setVerificationResult(res);
    } catch (err: any) {
      alert('Verification error: ' + err.message);
    } finally {
      setVerifying(false);
    }
  };

  const handleOpenSandbox = async () => {
    try {
      setSandboxActionLoading(true);
      await initSandbox();
      setIsSandboxMode(true);
      setVerificationResult(null);
      await loadBlocks(true);
    } catch (err: any) {
      alert(err.message || 'Failed to initialize sandbox');
    } finally {
      setSandboxActionLoading(false);
    }
  };

  const handleApplyTamper = async (type: 'alter_payload' | 'sever_previous_hash' | 'forge_block_hash') => {
    try {
      setSandboxActionLoading(true);
      const targetIndex = blocks.length > 1 ? 1 : 0;
      await tamperSandboxBlock(targetIndex, type);
      setVerificationResult(null);
      await loadBlocks(true);
    } catch (err: any) {
      alert(err.message || 'Failed to apply tamper');
    } finally {
      setSandboxActionLoading(false);
    }
  };

  const handleResetSandbox = async () => {
    try {
      setSandboxActionLoading(true);
      await resetSandbox();
      setIsSandboxMode(false);
      setTamperedIndex(null);
      setTamperType(null);
      setVerificationResult(null);
      await loadBlocks(false);
    } catch (err: any) {
      alert(err.message || 'Failed to reset sandbox');
    } finally {
      setSandboxActionLoading(false);
    }
  };

  const handleSelectBlock = async (block: LedgerBlock) => {
    setSelectedBlock(block);
    setBlockVerification(null);
    try {
      setVerifyingSingle(true);
      const res = await verifySingleBlock(block.block_id);
      setBlockVerification(res);
    } catch (err) {
      console.error('Failed to verify single block', err);
    } finally {
      setVerifyingSingle(false);
    }
  };

  const filteredBlocks = blocks.filter((b) => {
    const s = search.toLowerCase();
    return (
      b.block_id.toLowerCase().includes(s) ||
      b.event_id.toLowerCase().includes(s) ||
      b.block_hash.toLowerCase().includes(s) ||
      String(b.block_index).includes(s)
    );
  });

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF873D]">Incident Integrity</span>
            <span className="text-xs text-[#CDD2D8]/40">·</span>
            <span className="text-xs text-[#D0BFB0]">Cryptographic Hash Chain</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#FFF8F1] tracking-tight mt-1">Hash-Linked Integrity Ledger</h1>
          <p className="text-xs sm:text-sm text-[#D0BFB0] mt-1">
            An append-only, SHA-256 hash-linked event ledger guaranteeing non-repudiation and immediate tamper detection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleVerifyChain}
            disabled={verifying}
            className="px-4 py-2.5 text-xs font-semibold rounded-xl glass-button-primary disabled:opacity-50 transition-all shadow-lg flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#15120F] ${verifying ? 'animate-spin' : ''}`} />
            <span>{verifying ? 'Auditing Ledger...' : 'Audit Entire Chain'}</span>
          </button>
        </div>
      </div>

      {/* Tamper Detection Sandbox Banner */}
      <div className={`p-5 rounded-2xl border transition-all ${
        isSandboxMode 
          ? 'bg-[#F59E0B]/10 border-[#F59E0B]/40 text-[#FFF8F1]' 
          : 'glass-panel text-[#FFF8F1]'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#FF873D]" />
              <span className="font-bold text-sm text-[#FFF8F1]">
                {isSandboxMode ? 'Isolated Tamper Demonstration Sandbox Active' : 'Tamper Detection Demonstration Lab'}
              </span>
              {isSandboxMode && (
                <span className="text-[10px] font-mono font-bold bg-[#F59E0B] text-[#15120F] px-2 py-0.5 rounded shadow-sm">
                  SANDBOX
                </span>
              )}
            </div>
            <p className="text-xs text-[#D0BFB0] max-w-2xl leading-relaxed">
              Experiment with deliberate malicious modifications in a disposable sandbox clone. The genuine SQLite database remains 100% untampered.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {!isSandboxMode ? (
              <button
                onClick={handleOpenSandbox}
                disabled={sandboxActionLoading}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl glass-button-secondary flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FF873D]" />
                <span>Enter Sandbox Lab</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleApplyTamper('alter_payload')}
                  disabled={sandboxActionLoading}
                  className="px-3 py-1.5 text-xs font-semibold text-[#FFF8F1] bg-[#15120F]/80 border border-[#F59E0B]/50 rounded-lg hover:bg-[#F59E0B]/20 transition-colors cursor-pointer"
                  title="Simulate modifying event payload data"
                >
                  Tamper: Modify Event Payload
                </button>
                <button
                  onClick={() => handleApplyTamper('sever_previous_hash')}
                  disabled={sandboxActionLoading}
                  className="px-3 py-1.5 text-xs font-semibold text-[#FFF8F1] bg-[#15120F]/80 border border-[#F43F5E]/50 rounded-lg hover:bg-[#F43F5E]/20 transition-colors cursor-pointer"
                  title="Simulate breaking previous block hash link"
                >
                  Tamper: Sever Prev Hash
                </button>
                <button
                  onClick={handleResetSandbox}
                  disabled={sandboxActionLoading}
                  className="px-3 py-1.5 text-xs font-semibold text-[#15120F] bg-[#FF873D] hover:bg-[#FFB45E] rounded-lg flex items-center gap-1 shadow-sm font-bold cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3 text-[#15120F]" />
                  <span>Restore Live Ledger</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Notice of applied tamper */}
        {tamperedIndex !== null && (
          <div className="mt-3 p-3 rounded-xl bg-[#F43F5E]/15 border border-[#F43F5E]/40 text-xs text-[#F43F5E] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                <strong className="text-white">Simulated Attack Injected:</strong> Block #{tamperedIndex} was altered ({tamperType}). Click <strong className="text-[#FF873D]">"Audit Entire Chain"</strong> above to observe cryptographic detection!
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Chain Verification Result Modal / Banner */}
      {verificationResult && (
        <div className={`p-6 rounded-2xl border space-y-4 shadow-xl ${
          verificationResult.is_valid
            ? 'bg-[#FF873D]/15 border-[#FF873D]/40 text-[#FF873D]'
            : 'bg-[#F43F5E]/15 border-[#F43F5E]/40 text-[#F43F5E]'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {verificationResult.is_valid ? (
                <CheckCircle2 className="w-7 h-7 text-[#FF873D] shrink-0" />
              ) : (
                <AlertTriangle className="w-7 h-7 text-[#F43F5E] shrink-0" />
              )}
              <div>
                <h3 className="text-base font-bold text-white">
                  {verificationResult.is_valid
                    ? 'Cryptographic Ledger Verification Passed (100% Untampered)'
                    : `INTEGRITY COMPROMISE DETECTED: Tampering at Block #${verificationResult.broken_block_index}`}
                </h3>
                <p className="text-xs text-[#D0BFB0] mt-0.5">
                  {verificationResult.is_valid
                    ? `All ${verificationResult.total_blocks} blocks verified sequentially. Every SHA-256 payload digest and previous-block pointer is mathematically sound.`
                    : verificationResult.error_message}
                </p>
              </div>
            </div>

            <button
              onClick={() => setVerificationResult(null)}
              className="text-xs text-[#D0BFB0] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Step-by-Step Breakdown */}
          <div className="pt-2 border-t border-white/10">
            <div className="text-xs font-semibold text-[#FFF8F1] mb-2">Block-by-Block Audit Trace:</div>
            <div className="max-h-48 overflow-y-auto space-y-1.5 text-xs font-mono">
              {verificationResult.verification_steps.map((st) => (
                <div
                  key={st.block_id}
                  className={`p-2 rounded-lg flex items-center justify-between border ${
                    st.status === 'valid'
                      ? 'bg-[#15120F]/80 border-[#FF873D]/30 text-[#FF873D]'
                      : 'bg-[#15120F]/80 border-[#F43F5E]/50 text-[#F43F5E] font-bold'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[#FFF8F1]">Block #{st.block_index} ({st.block_id})</span>
                    <span className="text-[#CDD2D8]/40">·</span>
                    <span className="text-[11px] text-[#D0BFB0] font-sans">{st.message}</span>
                  </div>
                  <span className="uppercase text-[11px] font-bold">
                    {st.status === 'valid' ? 'OK' : 'CORRUPTED'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search and Chain Statistics */}
      <div className="p-4 rounded-2xl glass-panel flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#D0BFB0] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search block ID, index, hash..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#2B1B13]/60 border border-[rgba(255,170,100,0.25)] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF873D] text-[#FFF8F1] placeholder-[#A3ABB3]"
          />
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-[#D0BFB0]">
          <div>
            Total Blocks: <strong className="text-[#FFF8F1] font-bold">{blocks.length}</strong>
          </div>
          <div>·</div>
          <div>
            Genesis Hash: <span className="text-[#FF873D] font-bold">{blocks[0]?.block_hash?.slice(0, 10)}...</span>
          </div>
        </div>
      </div>

      {/* Visual Block Chain Sequence */}
      <div className="space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-[#FF873D]">
          Verifiable Chain Sequence
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-[#2B1B13]/40 border border-[rgba(255,170,100,0.15)] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredBlocks.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#D0BFB0] glass-panel rounded-2xl">
            No ledger blocks found.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBlocks.map((block, idx) => {
              const isTampered = block.is_tampered_flag === 1;
              return (
                <div key={block.block_id} className="relative">
                  {/* Vertical linking connector line to next block */}
                  {idx < filteredBlocks.length - 1 && (
                    <div className="absolute left-8 top-full h-4 w-0.5 bg-[#FF873D]/50 -z-10 shadow-[0_0_8px_#FF873D]" />
                  )}

                  <div
                    onClick={() => handleSelectBlock(block)}
                    className={`p-5 rounded-2xl glass-panel glass-card-hover cursor-pointer border transition-all ${
                      isTampered
                        ? 'border-[#F43F5E] bg-[#F43F5E]/10 shadow-[0_0_20px_rgba(244,63,94,0.2)]'
                        : 'border-[rgba(255,170,100,0.2)] hover:border-[#FF873D]/50'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      {/* Left: Index and Block ID */}
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm shadow-md ${
                          block.block_index === 0
                            ? 'bg-[#FF873D] text-[#15120F] shadow-[0_0_15px_rgba(255,135,61,0.4)]'
                            : isTampered
                            ? 'bg-[#F43F5E] text-white'
                            : 'bg-[#15120F] text-[#FF873D] border border-[rgba(255,170,100,0.3)]'
                        }`}>
                          #{block.block_index}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-[#FFF8F1]">{block.block_id}</span>
                            {block.block_index === 0 && (
                              <span className="text-[10px] font-semibold text-[#FF873D] uppercase tracking-wider bg-[#FF873D]/15 border border-[#FF873D]/30 px-2 py-0.5 rounded">
                                Genesis Root
                              </span>
                            )}
                            {isTampered && (
                              <span className="text-[10px] font-bold text-[#F43F5E] uppercase bg-[#F43F5E]/20 border border-[#F43F5E]/40 px-2 py-0.5 rounded">
                                Tampered
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-[#D0BFB0] mt-0.5 font-mono">
                            Event Reference: <strong className="text-[#FFF8F1]">{block.event_id}</strong> · {new Date(block.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Right: Hashes Preview */}
                      <div className="space-y-1 font-mono text-[11px] text-[#D0BFB0] md:text-right">
                        <div>
                          Block Hash: <span className="font-semibold text-[#FF873D]">{block.block_hash.slice(0, 24)}...</span>
                        </div>
                        <div className="text-[10px] text-[#A3ABB3]">
                          Prev Hash: <span>{block.prev_hash.slice(0, 24)}...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Block Detail Modal */}
      {selectedBlock && (
        <div className="fixed inset-0 z-50 bg-[#15120F]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#2B1B13]/95 rounded-2xl glass-panel p-6 sm:p-8 space-y-5 shadow-[0_0_60px_rgba(255,135,61,0.2)] border border-[rgba(255,170,100,0.35)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-[rgba(255,170,100,0.2)]">
              <div>
                <span className="text-xs font-mono text-[#FF873D] font-bold">Block #{selectedBlock.block_index}</span>
                <h3 className="text-lg font-bold text-[#FFF8F1] mt-0.5">{selectedBlock.block_id}</h3>
              </div>
              <button
                onClick={() => setSelectedBlock(null)}
                className="text-[#D0BFB0] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Block Cryptographic Verification Status */}
            {verifyingSingle ? (
              <div className="p-3 text-xs text-[#D0BFB0]">Recomputing SHA-256 hashes...</div>
            ) : blockVerification ? (
              <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                blockVerification.is_valid
                  ? 'bg-[#FF873D]/15 border-[#FF873D]/40 text-[#FF873D]'
                  : 'bg-[#F43F5E]/15 border-[#F43F5E]/40 text-[#F43F5E]'
              }`}>
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  {blockVerification.is_valid
                    ? 'Individual Block SHA-256 proof verified. Header and canonical data hashes are valid.'
                    : 'Cryptographic Integrity Failure: Hash mismatch detected on this block!'}
                </span>
              </div>
            ) : null}

            {/* Cryptographic Hashes Detail */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#FFF8F1]">Current Block Hash (SHA-256)</label>
                <div className="mt-1 p-2.5 rounded-lg bg-[#15120F] font-mono text-[11px] text-[#FF873D] break-all select-all border border-[rgba(255,170,100,0.25)]">
                  {selectedBlock.block_hash}
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#FFF8F1]">Previous Block Hash Pointer</label>
                <div className="mt-1 p-2.5 rounded-lg bg-[#15120F] font-mono text-[11px] text-[#D0BFB0] break-all select-all border border-[rgba(255,170,100,0.25)]">
                  {selectedBlock.prev_hash}
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#FFF8F1]">Canonical Payload Digest (Data Hash)</label>
                <div className="mt-1 p-2.5 rounded-lg bg-[#15120F] font-mono text-[11px] text-[#FFB45E] break-all select-all border border-[rgba(255,170,100,0.25)]">
                  {selectedBlock.data_hash}
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#FFF8F1]">Deterministic Canonical Event JSON (Sorted Keys)</label>
                <pre className="mt-1 p-3 rounded-lg bg-[#15120F] text-[#FFB45E] border border-[rgba(255,170,100,0.25)] font-mono text-[11px] overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                  {selectedBlock.canonical_data}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[rgba(255,170,100,0.2)]">
              <button
                onClick={() => setSelectedBlock(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg glass-button-secondary cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
