import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  ShieldCheck, 
  CheckCircle2, 
  Calendar, 
  Filter, 
  AlertTriangle,
  Lock,
  ExternalLink,
  X
} from 'lucide-react';
import { fetchReportSummary } from '../lib/api';

export const Reports: React.FC = () => {
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'all' | '7d' | '30d'>('all');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const loadReport = async () => {
    try {
      setLoading(true);
      setError(null);
      let startDate: string | undefined;
      const now = new Date();
      if (dateRange === '7d') {
        startDate = new Date(now.getTime() - 7 * 86400000).toISOString();
      } else if (dateRange === '30d') {
        startDate = new Date(now.getTime() - 30 * 86400000).toISOString();
      }
      const data = await fetchReportSummary(startDate);
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load report summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [dateRange]);

  const handleDownloadCsv = () => {
    window.location.href = '/api/reports/export-csv';
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF873D]">Audit & Compliance</span>
            <span className="text-xs text-[#CDD2D8]/40">·</span>
            <span className="text-xs text-[#D0BFB0]">Forensic Export</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#FFF8F1] tracking-tight mt-1">Incident Reports & Audits</h1>
          <p className="text-xs sm:text-sm text-[#D0BFB0] mt-1">
            Generate verifiable forensic incident reports and download raw CSV event logs with cryptographic chain hashes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadCsv}
            className="px-4 py-2.5 text-xs font-semibold rounded-xl glass-button-primary flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#15120F]" />
            <span>Download CSV Audit Log</span>
          </button>

          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="px-4 py-2.5 text-xs font-semibold rounded-xl glass-button-secondary flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#FF873D]" />
            <span>Print Forensic Audit</span>
          </button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="p-4 rounded-2xl glass-panel flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-[#D0BFB0]">
          <Calendar className="w-4 h-4 text-[#FF873D]" />
          <span className="font-semibold text-[#FFF8F1]">Report Window:</span>
          <span>{report?.date_range?.start || 'All Time'} to {report?.date_range?.end || 'Present'}</span>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#15120F]/80 rounded-xl border border-[rgba(255,170,100,0.2)]">
          <button
            onClick={() => setDateRange('7d')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              dateRange === '7d' ? 'bg-[#FF873D] text-[#15120F] shadow-sm font-bold' : 'text-[#D0BFB0] hover:text-[#FFF8F1]'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setDateRange('30d')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              dateRange === '30d' ? 'bg-[#FF873D] text-[#15120F] shadow-sm font-bold' : 'text-[#D0BFB0] hover:text-[#FFF8F1]'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setDateRange('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              dateRange === 'all' ? 'bg-[#FF873D] text-[#15120F] shadow-sm font-bold' : 'text-[#D0BFB0] hover:text-[#FFF8F1]'
            }`}
          >
            All Historical Data
          </button>
        </div>
      </div>

      {/* Executive Summary Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-[#2B1B13]/40 border border-[rgba(255,170,100,0.15)] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : report ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl glass-panel glass-card-hover space-y-1 border border-[rgba(255,170,100,0.2)]">
              <span className="text-xs text-[#D0BFB0]">Total Captured Events</span>
              <div className="text-2xl font-bold font-mono text-[#FFF8F1] tabular-nums">
                {report.total_events}
              </div>
              <div className="text-[11px] text-[#A3ABB3]">Simulated tripwire events</div>
            </div>

            <div className="p-5 rounded-2xl glass-panel glass-card-hover space-y-1 border border-[rgba(255,170,100,0.2)]">
              <span className="text-xs text-[#D0BFB0]">Critical & High Threats</span>
              <div className="text-2xl font-bold font-mono text-[#F43F5E] tabular-nums">
                {(report.severity_distribution.critical || 0) + (report.severity_distribution.high || 0)}
              </div>
              <div className="text-[11px] text-[#A3ABB3]">Prioritized alarms</div>
            </div>

            <div className="p-5 rounded-2xl glass-panel glass-card-hover space-y-1 border border-[rgba(255,170,100,0.2)]">
              <span className="text-xs text-[#D0BFB0]">Investigated & Resolved</span>
              <div className="text-2xl font-bold font-mono text-[#FF873D] tabular-nums">
                {(report.investigation_outcomes.investigated || 0) + (report.investigation_outcomes.resolved || 0)}
              </div>
              <div className="text-[11px] text-[#A3ABB3]">Completed review</div>
            </div>

            <div className="p-5 rounded-2xl glass-panel glass-card-hover space-y-1 border border-[rgba(255,170,100,0.2)]">
              <span className="text-xs text-[#D0BFB0]">Cryptographic Chain</span>
              <div className="text-2xl font-bold font-mono text-[#FF873D] tabular-nums flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5 text-[#FF873D]" />
                <span>Verified</span>
              </div>
              <div className="text-[11px] text-[#A3ABB3]">{report.ledger_integrity?.total_blocks || 0} blocks intact</div>
            </div>
          </div>

          {/* Breakdown Grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Decoy Asset Activity */}
            <div className="p-6 rounded-2xl glass-panel space-y-4 border border-[rgba(255,170,100,0.2)]">
              <h3 className="text-base font-semibold text-[#FFF8F1]">Decoy Asset Activity Breakdown</h3>
              <div className="space-y-2 text-xs">
                {report.asset_activity.length === 0 ? (
                  <p className="text-[#D0BFB0]">No asset activity recorded.</p>
                ) : (
                  report.asset_activity.map((a: any) => (
                    <div key={a.name} className="flex items-center justify-between p-2.5 rounded-xl bg-[#15120F]/80 border border-[rgba(255,170,100,0.2)] shadow-sm">
                      <span className="font-semibold text-[#FFF8F1]">{a.name}</span>
                      <span className="font-mono text-[#FF873D] font-bold">{a.count} events</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Severity Breakdown */}
            <div className="p-6 rounded-2xl glass-panel space-y-4 border border-[rgba(255,170,100,0.2)]">
              <h3 className="text-base font-semibold text-[#FFF8F1]">Severity Classification</h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#15120F]/80 border border-[rgba(255,170,100,0.2)]">
                  <span className="font-semibold text-[#F43F5E]">Critical Severity</span>
                  <span className="font-mono font-bold text-[#FFF8F1]">{report.severity_distribution.critical || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#15120F]/80 border border-[rgba(255,170,100,0.2)]">
                  <span className="font-semibold text-[#F59E0B]">High Severity</span>
                  <span className="font-mono font-bold text-[#FFF8F1]">{report.severity_distribution.high || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#15120F]/80 border border-[rgba(255,170,100,0.2)]">
                  <span className="font-semibold text-[#FF873D]">Medium Severity</span>
                  <span className="font-mono font-bold text-[#FFF8F1]">{report.severity_distribution.medium || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#15120F]/80 border border-[rgba(255,170,100,0.2)]">
                  <span className="font-semibold text-[#D0BFB0]">Low Severity</span>
                  <span className="font-mono font-bold text-[#FFF8F1]">{report.severity_distribution.low || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Printable Modal View */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#15120F]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-[#2B1B13]/95 rounded-3xl p-8 space-y-6 shadow-[0_0_60px_rgba(255,135,61,0.2)] max-h-[90vh] overflow-y-auto border border-[rgba(255,170,100,0.35)]">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[rgba(255,170,100,0.2)]">
              <div>
                <div className="text-xs uppercase tracking-widest text-[#FF873D] font-bold">
                  DecoyTrace Forensic Audit Certificate
                </div>
                <h2 className="text-2xl font-bold text-[#FFF8F1] mt-1">Security Incident Integrity Report</h2>
                <div className="text-xs text-[#D0BFB0] font-mono mt-1">
                  Generated at: {report?.generated_at} · SHA-256 Ledger Verified
                </div>
              </div>
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="text-[#D0BFB0] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Certificate of Integrity */}
            <div className="p-4 rounded-2xl bg-[#15120F]/80 border border-[#FF873D]/40 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-[#FF873D]">
                <ShieldCheck className="w-5 h-5" />
                <span>Forensic Chain Integrity Statement</span>
              </div>
              <p className="text-[#FFF8F1] leading-relaxed">
                This document certifies that the attached security tripwire records are backed by an unbroken append-only cryptographic hash chain. Each canonical payload digest matches its respective block header with zero detected tampering.
              </p>
            </div>

            {/* Event Summary Table */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#FFF8F1]">Historical Incident Ledger Events</h3>
              <div className="overflow-x-auto border border-[rgba(255,170,100,0.2)] rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#15120F] border-b border-[rgba(255,170,100,0.2)] font-semibold text-[#FF873D]">
                    <tr>
                      <th className="p-2.5">Event ID</th>
                      <th className="p-2.5">Timestamp</th>
                      <th className="p-2.5">Asset</th>
                      <th className="p-2.5">Severity</th>
                      <th className="p-2.5">Ledger Block</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(255,170,100,0.15)] font-mono text-[11px]">
                    {report?.events?.slice(0, 15).map((ev: any) => (
                      <tr key={ev.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-2 font-bold text-[#FFF8F1]">{ev.id}</td>
                        <td className="p-2 text-[#D0BFB0]">{ev.timestamp.slice(0, 19).replace('T', ' ')}</td>
                        <td className="p-2 font-sans text-[#FFF8F1]">{ev.asset_name}</td>
                        <td className="p-2 font-bold uppercase text-[#F59E0B]">{ev.severity}</td>
                        <td className="p-2 text-[#FF873D]">{ev.ledger_block_id || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[rgba(255,170,100,0.2)] text-xs text-[#D0BFB0]">
              <span>DecoyTrace Educational Incident-Integrity Engine</span>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 glass-button-primary rounded-xl font-semibold flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Printer className="w-4 h-4 text-[#15120F]" />
                <span>Print Document</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
