import React, { useEffect, useState } from 'react';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Link as LinkIcon, 
  ShieldAlert, 
  Search, 
  Filter, 
  ArrowRight 
} from 'lucide-react';
import { fetchTimeline } from '../lib/api';

interface IncidentTimelineProps {
  onSelectEvent: (eventId: string) => void;
  onNavigateToLedger: () => void;
}

export const IncidentTimeline: React.FC<IncidentTimelineProps> = ({
  onSelectEvent,
  onNavigateToLedger,
}) => {
  const [timelineItems, setTimelineItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  const loadTimeline = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTimeline();
      setTimelineItems(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load timeline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimeline();
  }, []);

  const filteredItems = timelineItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.summary.toLowerCase().includes(search.toLowerCase()) ||
      (item.reference_id && item.reference_id.toLowerCase().includes(search.toLowerCase()));
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF873D]">Forensic History</span>
          <span className="text-xs text-[#CDD2D8]/40">·</span>
          <span className="text-xs text-[#D0BFB0]">Incident Chronology</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#FFF8F1] tracking-tight mt-1">Incident Timeline</h1>
        <p className="text-xs sm:text-sm text-[#D0BFB0] mt-1">
          A unified chronological record connecting tripwire alerts, analyst containment notes, ledger block anchoring, and incident resolutions.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl glass-panel flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#D0BFB0] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search timeline events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#2B1B13]/60 border border-[rgba(255,170,100,0.25)] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF873D] text-[#FFF8F1] placeholder-[#A3ABB3]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-[#D0BFB0]">
          <Filter className="w-3.5 h-3.5 text-[#FF873D]" />
          <span>Category:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-[#2B1B13]/60 border border-[rgba(255,170,100,0.25)] rounded-lg focus:outline-none text-[#FFF8F1] focus:ring-1 focus:ring-[#FF873D]"
          >
            <option value="all" className="bg-[#15120F] text-[#FFF8F1]">All Timeline Entries</option>
            <option value="event_detected" className="bg-[#15120F] text-[#FFF8F1]">Tripwire Triggers</option>
            <option value="note_added" className="bg-[#15120F] text-[#FFF8F1]">Forensic Notes</option>
            <option value="incident_resolved" className="bg-[#15120F] text-[#FFF8F1]">Resolutions</option>
            <option value="ledger_audit" className="bg-[#15120F] text-[#FFF8F1]">Ledger Audits</option>
          </select>
        </div>
      </div>

      {/* Timeline Stream */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-[#2B1B13]/40 border border-[rgba(255,170,100,0.15)] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center text-xs text-[#D0BFB0] glass-panel rounded-2xl">
          No timeline entries found.
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#FF873D]/40 before:shadow-[0_0_8px_rgba(255,135,61,0.4)]">
          {filteredItems.map((item) => {
            const isResolved = item.type === 'incident_resolved';
            const isNote = item.type === 'note_added';
            const isAudit = item.type === 'ledger_audit';

            return (
              <div key={item.id} className="relative group">
                {/* Node icon dot */}
                <div className={`absolute -left-[27px] top-4 w-7 h-7 rounded-full flex items-center justify-center shadow-lg border border-white/20 ${
                  isResolved
                    ? 'bg-[#FF873D] text-[#15120F] shadow-[0_0_12px_rgba(255,135,61,0.5)] font-bold'
                    : isNote
                    ? 'bg-[#FFB45E] text-[#15120F] shadow-[0_0_12px_rgba(255,180,94,0.5)]'
                    : isAudit
                    ? 'bg-[#2B1B13] text-[#FF873D] border-[#FF873D]/50 shadow-[0_0_10px_rgba(255,135,61,0.3)]'
                    : 'bg-[#F43F5E] text-white shadow-[0_0_12px_rgba(244,63,94,0.5)]'
                }`}>
                  {isResolved ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : isNote ? (
                    <FileText className="w-3.5 h-3.5" />
                  ) : isAudit ? (
                    <LinkIcon className="w-3.5 h-3.5" />
                  ) : (
                    <ShieldAlert className="w-3.5 h-3.5" />
                  )}
                </div>

                {/* Timeline Card */}
                <div className="p-4 sm:p-5 rounded-2xl glass-panel glass-card-hover space-y-2 border border-[rgba(255,170,100,0.2)]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <span className="font-bold text-[#FFF8F1] text-sm">
                      {item.title}
                    </span>
                    <span className="font-mono text-[11px] text-[#D0BFB0] tabular-nums">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-[#D0BFB0] leading-relaxed">
                    {item.summary}
                  </p>

                  <div className="pt-2 border-t border-[rgba(255,170,100,0.15)] flex flex-wrap items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-3 font-mono text-[11px] text-[#D0BFB0]">
                      {item.reference_id && (
                        <span>Ref: <strong className="text-[#FFF8F1]">{item.reference_id}</strong></span>
                      )}
                      {item.ledger_block_id && (
                        <span className="text-[#FF873D] font-bold">Block: {item.ledger_block_id}</span>
                      )}
                    </div>

                    {item.reference_id && (
                      <button
                        onClick={() => onSelectEvent(item.reference_id)}
                        className="text-xs font-semibold text-[#FF873D] hover:text-[#FFB45E] flex items-center gap-1 cursor-pointer"
                      >
                        <span>Inspect Incident</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
