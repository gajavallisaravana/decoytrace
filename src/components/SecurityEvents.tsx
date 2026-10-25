import React, { useEffect, useState } from 'react';
import { 
  AlertCircle, 
  Search, 
  Filter, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Link as LinkIcon, 
  X, 
  Send,
  ExternalLink,
  ChevronRight,
  Shield
} from 'lucide-react';
import { SecurityEvent, InvestigationNote, LedgerBlock, InvestigationStatus } from '../types';
import { fetchEvents, fetchEventDetails, updateEventStatus, addInvestigationNote, verifySingleBlock } from '../lib/api';

interface SecurityEventsProps {
  initialSelectedEventId?: string | null;
  onClearSelectedEvent?: () => void;
  onNavigateToLedger?: () => void;
}

export const SecurityEvents: React.FC<SecurityEventsProps> = ({
  initialSelectedEventId,
  onClearSelectedEvent,
  onNavigateToLedger,
}) => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected Detail
  const [selectedEventId, setSelectedEventId] = useState<string | null>(initialSelectedEventId || null);
  const [selectedEventDetail, setSelectedEventDetail] = useState<(SecurityEvent & { notes: InvestigationNote[]; linked_block: LedgerBlock | null }) | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Note Form
  const [noteText, setNoteText] = useState('');
  const [noteAuthor, setNoteAuthor] = useState('Incident Lead');
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Block verification
  const [blockVerificationResult, setBlockVerificationResult] = useState<any | null>(null);
  const [verifyingBlock, setVerifyingBlock] = useState(false);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchEvents({
        severity: severityFilter,
        status: statusFilter,
        search,
      });
      setEvents(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load security events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [severityFilter, statusFilter, search]);

  useEffect(() => {
    if (initialSelectedEventId) {
      setSelectedEventId(initialSelectedEventId);
    }
  }, [initialSelectedEventId]);

  useEffect(() => {
    if (!selectedEventId) {
      setSelectedEventDetail(null);
      return;
    }
    async function loadDetails() {
      try {
        setDetailLoading(true);
        setBlockVerificationResult(null);
        const data = await fetchEventDetails(selectedEventId!);
        setSelectedEventDetail(data);
      } catch (err: any) {
        console.error('Failed to load event details:', err);
      } finally {
        setDetailLoading(false);
      }
    }
    loadDetails();
  }, [selectedEventId]);

  const handleStatusChange = async (nextStatus: InvestigationStatus) => {
    if (!selectedEventDetail) return;
    try {
      const res = await updateEventStatus(selectedEventDetail.id, nextStatus, `Status updated to ${nextStatus} via analyst triage.`);
      setSelectedEventDetail(prev => prev ? { ...prev, investigation_status: nextStatus, notes: res.notes } : null);
      await loadEvents();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim() || !selectedEventDetail) return;
    try {
      setIsAddingNote(true);
      const updatedNotes = await addInvestigationNote(selectedEventDetail.id, noteAuthor, noteText.trim());
      setSelectedEventDetail(prev => prev ? { ...prev, notes: updatedNotes } : null);
      setNoteText('');
    } catch (err: any) {
      alert(err.message || 'Failed to add note');
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleVerifyBlock = async (blockId: string) => {
    try {
      setVerifyingBlock(true);
      const res = await verifySingleBlock(blockId);
      setBlockVerificationResult(res);
    } catch (err: any) {
      setBlockVerificationResult({ is_valid: false, error: err.message });
    } finally {
      setVerifyingBlock(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF873D]">Incident Management</span>
          <span className="text-xs text-[#CDD2D8]/40">·</span>
          <span className="text-xs text-[#D0BFB0]">Forensic Triage</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#FFF8F1] tracking-tight mt-1">Security Events & Alerts</h1>
        <p className="text-xs sm:text-sm text-[#D0BFB0] mt-1">
          Review tripwire alarms, inspect raw simulated payloads, transition investigation states, and audit tamper-evident ledger proofs.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl glass-panel flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#D0BFB0] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search event type, asset, IP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#2B1B13]/60 border border-[rgba(255,170,100,0.25)] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF873D] text-[#FFF8F1] placeholder-[#A3ABB3]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-[#D0BFB0]">
            <Filter className="w-3.5 h-3.5 text-[#FF873D]" />
            <span>Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-[#2B1B13]/60 border border-[rgba(255,170,100,0.25)] rounded-lg focus:outline-none text-[#FFF8F1] focus:ring-1 focus:ring-[#FF873D]"
            >
              <option value="all" className="bg-[#15120F] text-[#FFF8F1]">All Severities</option>
              <option value="critical" className="bg-[#15120F] text-[#FFF8F1]">Critical</option>
              <option value="high" className="bg-[#15120F] text-[#FFF8F1]">High</option>
              <option value="medium" className="bg-[#15120F] text-[#FFF8F1]">Medium</option>
              <option value="low" className="bg-[#15120F] text-[#FFF8F1]">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#D0BFB0]">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-[#2B1B13]/60 border border-[rgba(255,170,100,0.25)] rounded-lg focus:outline-none text-[#FFF8F1] focus:ring-1 focus:ring-[#FF873D]"
            >
              <option value="all" className="bg-[#15120F] text-[#FFF8F1]">All Statuses</option>
              <option value="unreviewed" className="bg-[#15120F] text-[#FFF8F1]">Unreviewed</option>
              <option value="investigating" className="bg-[#15120F] text-[#FFF8F1]">Investigating</option>
              <option value="investigated" className="bg-[#15120F] text-[#FFF8F1]">Investigated</option>
              <option value="resolved" className="bg-[#15120F] text-[#FFF8F1]">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-[#2B1B13]/40 border border-[rgba(255,170,100,0.15)] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#D0BFB0] space-y-2">
            <AlertCircle className="w-8 h-8 text-[#FF873D]/40 mx-auto" />
            <p className="font-semibold text-[#FFF8F1]">No events match the current criteria</p>
            <p>Try resetting filters or launch a threat simulation to generate new activity.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[rgba(255,170,100,0.2)] text-[#FF873D] font-semibold">
                  <th className="py-2.5 px-3">Event ID</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Target Asset</th>
                  <th className="py-2.5 px-3">Event Type</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Source Label</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Ledger Block</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,170,100,0.15)]">
                {events.map((ev) => (
                  <tr
                    key={ev.id}
                    className={`hover:bg-[rgba(255,135,61,0.08)] transition-colors cursor-pointer ${
                      selectedEventId === ev.id ? 'bg-[rgba(255,135,61,0.14)]' : ''
                    }`}
                    onClick={() => setSelectedEventId(ev.id)}
                  >
                    <td className="py-3 px-3 font-mono font-medium text-[#FFF8F1]">{ev.id}</td>
                    <td className="py-3 px-3 font-mono text-[#D0BFB0] tabular-nums">
                      {new Date(ev.timestamp).toLocaleDateString()} {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-3 font-medium text-[#FFF8F1]">{ev.asset_name}</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-[#D0BFB0]">{ev.event_type}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`font-semibold capitalize text-[11px] px-2 py-0.5 rounded-full border ${
                          ev.severity === 'critical'
                            ? 'text-[#F43F5E] bg-[#F43F5E]/10 border-[#F43F5E]/30'
                            : ev.severity === 'high'
                            ? 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30'
                            : ev.severity === 'medium'
                            ? 'text-[#FF873D] bg-[#FF873D]/10 border-[#FF873D]/30'
                            : 'text-[#CDD2D8] bg-[#CDD2D8]/10 border-[#CDD2D8]/20'
                        }`}
                      >
                        {ev.severity}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-[#D0BFB0] truncate max-w-[160px]">
                      {ev.source_label}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-medium text-[#D0BFB0] capitalize">
                        {ev.investigation_status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-[#FF873D] font-bold">
                      {ev.ledger_block_id || 'Pending'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEventId(ev.id);
                        }}
                        className="text-xs font-semibold text-[#FF873D] hover:text-[#FFB45E] cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Event Detail Drawer / Slide-Over Modal */}
      {selectedEventId && (
        <div className="fixed inset-0 z-50 bg-[#15120F]/80 backdrop-blur-md flex justify-end">
          <div className="w-full max-w-2xl bg-[#2B1B13]/95 h-full shadow-2xl p-6 sm:p-8 overflow-y-auto space-y-6 border-l border-[rgba(255,170,100,0.35)]">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[rgba(255,170,100,0.2)]">
              <div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono text-[#FF873D] font-bold">{selectedEventId}</span>
                  <span className="text-[#CDD2D8]/40">·</span>
                  <span className="text-[#D0BFB0]">Simulated Tripwire Event</span>
                </div>
                <h2 className="text-xl font-bold text-[#FFF8F1] mt-1">
                  {selectedEventDetail?.event_type || 'Loading details...'}
                </h2>
              </div>
              <button
                onClick={() => {
                  setSelectedEventId(null);
                  if (onClearSelectedEvent) onClearSelectedEvent();
                }}
                className="p-1 text-[#D0BFB0] hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {detailLoading || !selectedEventDetail ? (
              <div className="space-y-4">
                <div className="h-24 bg-[#15120F]/60 border border-[rgba(255,170,100,0.15)] rounded-xl animate-pulse" />
                <div className="h-32 bg-[#15120F]/60 border border-[rgba(255,170,100,0.15)] rounded-xl animate-pulse" />
              </div>
            ) : (
              <>
                {/* Status Transition Bar */}
                <div className="p-4 rounded-xl glass-panel space-y-3 shadow-sm border border-[rgba(255,170,100,0.25)]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#FFF8F1]">Investigation Status</span>
                    <span className="font-bold capitalize text-[#FF873D]">
                      Current: {selectedEventDetail.investigation_status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleStatusChange('investigating')}
                      disabled={selectedEventDetail.investigation_status === 'investigating'}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[rgba(255,170,100,0.3)] hover:bg-[#FF873D]/15 text-[#D0BFB0] hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      Mark as Investigating
                    </button>
                    <button
                      onClick={() => handleStatusChange('investigated')}
                      disabled={selectedEventDetail.investigation_status === 'investigated'}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[rgba(255,170,100,0.3)] hover:bg-[#FF873D]/15 text-[#D0BFB0] hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      Mark as Investigated
                    </button>
                    <button
                      onClick={() => handleStatusChange('resolved')}
                      disabled={selectedEventDetail.investigation_status === 'resolved'}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#FF873D] text-[#15120F] hover:bg-[#FFB45E] disabled:opacity-40 shadow-[0_0_15px_rgba(255,135,61,0.3)] transition-colors cursor-pointer font-bold"
                    >
                      Resolve Incident
                    </button>
                    <button
                      onClick={() => handleStatusChange('unreviewed')}
                      disabled={selectedEventDetail.investigation_status === 'unreviewed'}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[rgba(255,170,100,0.3)] hover:bg-[#FF873D]/15 text-[#D0BFB0] hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      Reopen
                    </button>
                  </div>
                </div>

                {/* Metadata & Rationale */}
                <div className="p-4 rounded-xl glass-panel space-y-3 text-xs shadow-sm border border-[rgba(255,170,100,0.25)]">
                  <h3 className="font-semibold text-[#FFF8F1]">Threat Context & Rationale</h3>
                  <div className="space-y-1.5 text-[#D0BFB0]">
                    <div>
                      <strong className="text-[#FFF8F1]">Target Decoy:</strong> {selectedEventDetail.asset_name} ({selectedEventDetail.asset_type})
                    </div>
                    <div>
                      <strong className="text-[#FFF8F1]">Source Identity:</strong> <code className="font-mono bg-[#15120F] px-1.5 py-0.5 rounded text-[#FFB45E] border border-[rgba(255,170,100,0.25)]">{selectedEventDetail.source_label}</code>
                    </div>
                    <div>
                      <strong className="text-[#FFF8F1]">Severity Rationale:</strong> {selectedEventDetail.severity_rationale}
                    </div>
                    <div>
                      <strong className="text-[#FFF8F1]">Timestamp:</strong> {selectedEventDetail.timestamp}
                    </div>
                  </div>
                </div>

                {/* Raw Payload Preview */}
                <div className="p-4 rounded-xl glass-panel space-y-2 text-xs shadow-sm border border-[rgba(255,170,100,0.25)]">
                  <h3 className="font-semibold text-[#FFF8F1]">Captured Simulated Payload</h3>
                  <pre className="p-3 bg-[#15120F] text-[#FFB45E] border border-[rgba(255,170,100,0.25)] rounded-lg font-mono text-[11px] overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                    {selectedEventDetail.payload_preview}
                  </pre>
                </div>

                {/* Linked Ledger Block */}
                <div className="p-4 rounded-xl glass-panel space-y-3 text-xs shadow-sm border border-[rgba(255,170,100,0.25)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-semibold text-[#FFF8F1]">
                      <LinkIcon className="w-4 h-4 text-[#FF873D]" />
                      <span>Linked Cryptographic Ledger Block</span>
                    </div>
                    {selectedEventDetail.linked_block && (
                      <button
                        onClick={() => handleVerifyBlock(selectedEventDetail.linked_block!.block_id)}
                        disabled={verifyingBlock}
                        className="text-xs font-semibold text-[#FF873D] hover:text-[#FFB45E] cursor-pointer"
                      >
                        {verifyingBlock ? 'Auditing...' : 'Audit Block Proof'}
                      </button>
                    )}
                  </div>

                  {selectedEventDetail.linked_block ? (
                    <div className="p-3 bg-[#15120F]/80 border border-[rgba(255,170,100,0.2)] rounded-lg space-y-1.5 font-mono text-[11px] text-[#D0BFB0]">
                      <div>Block ID: <strong className="text-[#FFF8F1]">{selectedEventDetail.linked_block.block_id}</strong> (Index #{selectedEventDetail.linked_block.block_index})</div>
                      <div className="truncate">Block Hash: <span className="text-[#FF873D]">{selectedEventDetail.linked_block.block_hash}</span></div>
                      <div className="truncate">Data Hash: <span className="text-[#FFB45E]">{selectedEventDetail.linked_block.data_hash}</span></div>
                      <div className="truncate text-[#A3ABB3]">Prev Hash: <span>{selectedEventDetail.linked_block.prev_hash}</span></div>
                    </div>
                  ) : (
                    <p className="text-[#D0BFB0]">No ledger block anchor found.</p>
                  )}

                  {blockVerificationResult && (
                    <div className={`p-2.5 rounded-lg border text-[11px] flex items-center gap-2 ${
                      blockVerificationResult.is_valid
                        ? 'bg-[#FF873D]/15 border-[#FF873D]/40 text-[#FF873D]'
                        : 'bg-[#F43F5E]/15 border-[#F43F5E]/40 text-[#F43F5E]'
                    }`}>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {blockVerificationResult.is_valid
                          ? 'Cryptographic integrity verified. Canonical event data matches ledger hash.'
                          : 'Block verification failed: Discrepancy detected!'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Investigation Notes */}
                <div className="p-4 rounded-xl glass-panel space-y-3 text-xs shadow-sm border border-[rgba(255,170,100,0.25)]">
                  <h3 className="font-semibold text-[#FFF8F1]">Forensic Investigation Notes</h3>

                  {selectedEventDetail.notes.length === 0 ? (
                    <p className="text-[#D0BFB0]">No analyst notes recorded yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedEventDetail.notes.map((n) => (
                        <div key={n.id} className="p-2.5 rounded-lg bg-[#15120F]/80 border border-[rgba(255,170,100,0.2)] space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-[#D0BFB0]">
                            <span className="font-semibold text-[#FFF8F1]">{n.author}</span>
                            <span>{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-[#FFF8F1] leading-relaxed">{n.note}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Note Form */}
                  <form onSubmit={handleAddNote} className="pt-2 space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Author name..."
                        value={noteAuthor}
                        onChange={(e) => setNoteAuthor(e.target.value)}
                        className="w-1/3 px-2.5 py-1.5 bg-[#15120F]/80 border border-[rgba(255,170,100,0.25)] rounded-lg text-xs text-[#FFF8F1] placeholder-[#A3ABB3] focus:outline-none focus:ring-1 focus:ring-[#FF873D]"
                      />
                      <input
                        type="text"
                        placeholder="Add investigation findings..."
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 bg-[#15120F]/80 border border-[rgba(255,170,100,0.25)] rounded-lg text-xs text-[#FFF8F1] placeholder-[#A3ABB3] focus:outline-none focus:ring-1 focus:ring-[#FF873D]"
                      />
                      <button
                        type="submit"
                        disabled={isAddingNote || !noteText.trim()}
                        className="px-3 py-1.5 glass-button-primary rounded-lg font-semibold disabled:opacity-40 shrink-0 flex items-center gap-1 shadow-sm cursor-pointer"
                      >
                        <Send className="w-3 h-3 text-[#15120F]" />
                        <span>Save</span>
                      </button>
                    </div>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
