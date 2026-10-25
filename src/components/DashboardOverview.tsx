import React, { useEffect, useState } from 'react';
import { 
  ShieldAlert, 
  Target, 
  CheckCircle2, 
  Link as LinkIcon, 
  Zap, 
  Plus, 
  FileText, 
  AlertTriangle, 
  ArrowRight, 
  RefreshCw, 
  ExternalLink, 
  Lock, 
  Activity 
} from 'lucide-react';
import { DashboardMetrics } from '../types';
import { fetchDashboardMetrics, verifyLedgerChain } from '../lib/api';
import { NetworkVisualization } from './NetworkVisualization';
import { NavTab } from './Navigation';

interface DashboardOverviewProps {
  onNavigate: (tab: NavTab) => void;
  onOpenCreateAssetModal: () => void;
  onSelectEvent: (eventId: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onNavigate,
  onOpenCreateAssetModal,
  onSelectEvent,
}) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyNotice, setVerifyNotice] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchDashboardMetrics();
      setMetrics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleQuickVerify = async () => {
    try {
      setVerifying(true);
      setVerifyNotice(null);
      const res = await verifyLedgerChain(false);
      if (res.is_valid) {
        setVerifyNotice(`Verified ${res.total_blocks} blocks. SHA-256 chain is 100% untampered.`);
      } else {
        setVerifyNotice(`INTEGRITY ALERT: Discrepancy detected at block #${res.broken_block_index}!`);
      }
      await loadData();
    } catch (err: any) {
      setVerifyNotice('Verification error: ' + err.message);
    } finally {
      setVerifying(false);
    }
  };

  if (loading && !metrics) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-8 w-48 bg-[#2B1B13]/50 animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 bg-[#2B1B13]/40 animate-pulse rounded-2xl" />
          ))}
        </div>
        <div className="h-72 bg-[#2B1B13]/40 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="p-8">
        <div className="p-6 rounded-2xl glass-panel text-center space-y-3 border-[#F43F5E]/40">
          <AlertTriangle className="w-8 h-8 text-[#F43F5E] mx-auto" />
          <h3 className="text-base font-semibold text-white">Failed to connect to backend engine</h3>
          <p className="text-xs text-[#D0BFB0]">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 text-xs font-bold glass-button-primary rounded-lg"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const totalSev = Math.max(
    1,
    metrics.severity_breakdown.critical +
      metrics.severity_breakdown.high +
      metrics.severity_breakdown.medium +
      metrics.severity_breakdown.low
  );

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Header Bar & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF873D]">Operational Overview</span>
            <span className="text-xs text-[#CDD2D8]/40">·</span>
            <span className="text-xs text-[#D0BFB0]">Telemetry & Ledger Integrity</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">Security Console</h1>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenCreateAssetModal}
            className="px-3.5 py-2 text-xs font-bold rounded-xl glass-button-primary flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#15120F]" />
            <span>Create Decoy</span>
          </button>

          <button
            onClick={() => onNavigate('simulation')}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl glass-button-secondary flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Zap className="w-4 h-4 text-[#FF873D]" />
            <span>Launch Simulation</span>
          </button>

          <button
            onClick={handleQuickVerify}
            disabled={verifying}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl glass-button-secondary flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#FFB45E] ${verifying ? 'animate-spin' : ''}`} />
            <span>{verifying ? 'Verifying Chain...' : 'Verify Ledger'}</span>
          </button>

          <button
            onClick={() => onNavigate('reports')}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl glass-button-secondary flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-[#CDD2D8]" />
            <span>Incident Report</span>
          </button>
        </div>
      </div>

      {/* Verification Notice Banner if triggered */}
      {verifyNotice && (
        <div className="p-3.5 rounded-xl bg-[#2B1B13]/90 border border-[#FF873D]/50 flex items-center justify-between text-xs text-white shadow-[0_0_20px_rgba(255,135,61,0.2)]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#FF873D] shrink-0" />
            <span className="font-medium text-[#FFF8F1]">{verifyNotice}</span>
          </div>
          <button
            onClick={() => setVerifyNotice(null)}
            className="text-[11px] font-bold text-[#FFB45E] hover:underline cursor-pointer ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Metrics Row: 5 Frosted Glass Cards with real data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-2xl glass-panel space-y-2 border-[rgba(255,170,100,0.25)]">
          <div className="flex items-center justify-between text-xs text-[#D0BFB0]">
            <span>Total Recorded Events</span>
            <Activity className="w-4 h-4 text-[#FF873D]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white tabular-nums">
            {metrics.total_events}
          </div>
          <div className="text-[11px] text-[#A3ABB3]">
            Captured across decoy assets
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-2xl glass-panel space-y-2 border-[rgba(255,170,100,0.25)]">
          <div className="flex items-center justify-between text-xs text-[#D0BFB0]">
            <span>Critical & High Alerts</span>
            <ShieldAlert className="w-4 h-4 text-[#F43F5E]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#F43F5E] tabular-nums">
            {metrics.critical_high_count}
          </div>
          <div className="text-[11px] text-[#A3ABB3]">
            Active containment needed
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-2xl glass-panel space-y-2 border-[rgba(255,170,100,0.25)]">
          <div className="flex items-center justify-between text-xs text-[#D0BFB0]">
            <span>Active Decoy Assets</span>
            <Target className="w-4 h-4 text-[#FFB45E]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white tabular-nums">
            {metrics.active_assets_count}
          </div>
          <div className="text-[11px] text-[#A3ABB3]">
            Simulated traps deployed
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-2xl glass-panel space-y-2 border-[rgba(255,170,100,0.25)]">
          <div className="flex items-center justify-between text-xs text-[#D0BFB0]">
            <span>Investigated & Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-[#FF873D]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#FF873D] tabular-nums">
            {metrics.investigated_resolved_count}
          </div>
          <div className="text-[11px] text-[#A3ABB3]">
            Triage notes completed
          </div>
        </div>

        {/* Metric 5 */}
        <div className="p-4 rounded-2xl glass-panel space-y-2 border-[rgba(255,170,100,0.25)]">
          <div className="flex items-center justify-between text-xs text-[#D0BFB0]">
            <span>Ledger Integrity</span>
            <LinkIcon className="w-4 h-4 text-[#CDD2D8]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tabular-nums">
              {metrics.total_blocks}
            </span>
            <span className="text-xs text-[#D0BFB0]">blocks</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#FF873D]">
            <span className="w-2 h-2 rounded-full bg-[#FF873D] shadow-[0_0_8px_#FF873D] animate-pulse" />
            <span>SHA-256 Validated</span>
          </div>
        </div>
      </div>

      {/* Network Overview Topology Section */}
      <NetworkVisualization />

      {/* Two Column Grid: Severity Distribution & Recent Ledger Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Severity Distribution */}
        <div className="lg:col-span-5 p-6 rounded-2xl glass-panel space-y-4 border-[rgba(255,170,100,0.25)]">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Severity Distribution</h3>
            <span className="text-xs text-[#A3ABB3]">Rules-Based Engine</span>
          </div>

          {/* Visual Stacked Bar */}
          <div className="h-3 w-full rounded-full overflow-hidden bg-[#15120F] border border-[rgba(255,170,100,0.2)] flex">
            <div
              style={{ width: `${(metrics.severity_breakdown.critical / totalSev) * 100}%` }}
              className="bg-[#F43F5E] h-full transition-all duration-500 shadow-[0_0_8px_#F43F5E]"
              title={`Critical: ${metrics.severity_breakdown.critical}`}
            />
            <div
              style={{ width: `${(metrics.severity_breakdown.high / totalSev) * 100}%` }}
              className="bg-[#F59E0B] h-full transition-all duration-500 shadow-[0_0_8px_#F59E0B]"
              title={`High: ${metrics.severity_breakdown.high}`}
            />
            <div
              style={{ width: `${(metrics.severity_breakdown.medium / totalSev) * 100}%` }}
              className="bg-[#FF873D] h-full transition-all duration-500 shadow-[0_0_8px_#FF873D]"
              title={`Medium: ${metrics.severity_breakdown.medium}`}
            />
            <div
              style={{ width: `${(metrics.severity_breakdown.low / totalSev) * 100}%` }}
              className="bg-[#FFD5A3] h-full transition-all duration-500"
              title={`Low: ${metrics.severity_breakdown.low}`}
            />
          </div>

          {/* Breakdown Rows */}
          <div className="space-y-2.5 pt-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E] shadow-[0_0_6px_#F43F5E]" />
                <span className="font-medium text-white">Critical Severity</span>
              </div>
              <span className="font-mono tabular-nums font-bold text-[#F43F5E]">
                {metrics.severity_breakdown.critical}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shadow-[0_0_6px_#F59E0B]" />
                <span className="font-medium text-white">High Severity</span>
              </div>
              <span className="font-mono tabular-nums font-bold text-[#F59E0B]">
                {metrics.severity_breakdown.high}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF873D] shadow-[0_0_6px_#FF873D]" />
                <span className="font-medium text-white">Medium Severity</span>
              </div>
              <span className="font-mono tabular-nums font-bold text-[#FF873D]">
                {metrics.severity_breakdown.medium}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFD5A3]" />
                <span className="font-medium text-white">Low Severity</span>
              </div>
              <span className="font-mono tabular-nums font-bold text-[#FFD5A3]">
                {metrics.severity_breakdown.low}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-[rgba(255,170,100,0.15)] text-[11px] text-[#A3ABB3] leading-relaxed">
            Incident severity is calculated automatically on the server based on asset risk tier, access frequency, and payload sensitivity.
          </div>
        </div>

        {/* Right Column: Recent Ledger Blocks */}
        <div className="lg:col-span-7 p-6 rounded-2xl glass-panel space-y-4 border-[rgba(255,170,100,0.25)]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Recent Ledger Blocks</h3>
              <p className="text-xs text-[#A3ABB3]">Verifiable SHA-256 chain links</p>
            </div>
            <button
              onClick={() => onNavigate('ledger')}
              className="text-xs font-bold text-[#FF873D] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {metrics.recent_blocks.map((block) => (
              <div
                key={block.block_id}
                onClick={() => onNavigate('ledger')}
                className="p-3 rounded-xl bg-[#15120F]/75 hover:bg-[#2B1B13]/80 border border-[rgba(255,170,100,0.2)] transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shadow-sm hover:border-[#FF873D]/50"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-[#FF873D] px-2 py-0.5 rounded-lg bg-[#FF873D]/15 border border-[#FF873D]/30 text-[11px]">
                    #{block.block_index}
                  </span>
                  <div>
                    <div className="font-bold text-white">{block.block_id}</div>
                    <div className="font-mono text-[11px] text-[#D0BFB0]">
                      Hash: {block.block_hash.slice(0, 20)}...
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 font-mono text-[11px] text-[#A3ABB3] sm:text-right">
                  <span>{new Date(block.timestamp).toLocaleTimeString()}</span>
                  <span className="text-[#FF873D] font-bold">VALID</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recent Alerts Table */}
      <div className="p-6 rounded-2xl glass-panel space-y-4 border-[rgba(255,170,100,0.25)]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Recent Security Tripwire Events</h3>
            <p className="text-xs text-[#A3ABB3]">Safe simulated activity captured by deployed decoys</p>
          </div>
          <button
            onClick={() => onNavigate('events')}
            className="text-xs font-bold text-[#FF873D] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Open Events Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[rgba(255,170,100,0.20)] text-[#A3ABB3] font-bold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3">Event ID</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Target Asset</th>
                <th className="py-2.5 px-3">Event Type</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,170,100,0.12)]">
              {metrics.recent_events.map((ev) => (
                <tr key={ev.id} className="hover:bg-[#FF873D]/5 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-white">{ev.id}</td>
                  <td className="py-3 px-3 font-mono text-[#D0BFB0] tabular-nums">
                    {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-3 px-3 font-semibold text-white">{ev.asset_name}</td>
                  <td className="py-3 px-3 font-mono text-[11px] text-[#FFB45E]">{ev.event_type}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`font-bold capitalize ${
                        ev.severity === 'critical'
                          ? 'text-[#F43F5E]'
                          : ev.severity === 'high'
                          ? 'text-[#F59E0B]'
                          : ev.severity === 'medium'
                          ? 'text-[#FF873D]'
                          : 'text-[#FFD5A3]'
                      }`}
                    >
                      {ev.severity}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-medium text-[#D0BFB0] capitalize">
                      {ev.investigation_status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onSelectEvent(ev.id)}
                      className="text-xs font-bold text-[#FF873D] hover:underline cursor-pointer"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
