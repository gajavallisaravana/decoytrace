import React, { useState } from 'react';
import { Shield, Server, Terminal, Lock, AlertTriangle, CheckCircle2, Info, Eye } from 'lucide-react';

interface NetworkVisualizationProps {
  activeStep?: {
    phase: string;
    source: string;
    description: string;
  } | null;
  isSimulating?: boolean;
  highlightAssetId?: string;
}

export const NetworkVisualization: React.FC<NetworkVisualizationProps> = ({
  activeStep,
  isSimulating = false,
  highlightAssetId,
}) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  return (
    <div className="relative w-full rounded-2xl glass-panel p-6 overflow-hidden border-[rgba(255,170,100,0.25)]">
      {/* Background ambient warm orange lighting */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF873D]/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#2B1B13]/40 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[rgba(255,170,100,0.20)] gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-[#FF873D] font-bold">Network Topology</span>
            <span className="text-xs text-[#CDD2D8]/40">·</span>
            <span className="text-xs text-[#D0BFB0]">Active Cyber Deception Mesh</span>
          </div>
          <h3 className="text-base font-bold text-white mt-0.5">Decoy Tripwires & Integrity Ledger Topology</h3>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E] shadow-[0_0_8px_#F43F5E]" />
            <span className="text-[#D0BFB0]">Simulated Adversary</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF873D] shadow-[0_0_8px_#FF873D]" />
            <span className="text-[#D0BFB0]">Decoy Tripwire</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFB45E] shadow-[0_0_8px_#FFB45E]" />
            <span className="text-[#D0BFB0]">SHA-256 Ledger</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas for Topology */}
      <div className="relative w-full aspect-[21/9] min-h-[260px] max-h-[360px] rounded-xl bg-[#15120F]/90 border border-[rgba(255,170,100,0.25)] flex items-center justify-center overflow-hidden">
        <svg
          viewBox="0 0 900 320"
          className="w-full h-full select-none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Interactive cyber topology diagram representing adversary, perimeter routing, decoy assets, and the ledger node"
        >
          <defs>
            <linearGradient id="cyberAttackGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#FF873D" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="cyberLedgerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF873D" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#FFB45E" stopOpacity="0.9" />
            </linearGradient>

            <filter id="neonOrangeGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="neonRedGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background grid lines in SVG */}
          <pattern id="svgGrid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255, 135, 61, 0.05)" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#svgGrid)" />

          {/* Connection Lines */}
          {/* Adversary to Gateway */}
          <line
            x1="120"
            y1="160"
            x2="320"
            y2="160"
            stroke="#FF873D"
            strokeOpacity="0.35"
            strokeWidth="2"
            strokeDasharray={isSimulating ? "6 6" : "none"}
            className={isSimulating ? "animate-[dash_1.5s_linear_infinite]" : ""}
          />

          {/* Gateway to Decoy 1 (Admin Portal) */}
          <path
            d="M 320 160 Q 420 90 520 80"
            fill="none"
            stroke="url(#cyberAttackGrad)"
            strokeOpacity={isSimulating ? "0.95" : "0.35"}
            strokeWidth={isSimulating ? "3" : "2"}
          />

          {/* Gateway to Decoy 2 (SSO Login Trap) */}
          <line
            x1="320"
            y1="160"
            x2="520"
            y2="160"
            stroke="#FF873D"
            strokeOpacity={isSimulating ? "0.95" : "0.4"}
            strokeWidth="2"
          />

          {/* Gateway to Decoy 3 (Canary Credentials) */}
          <path
            d="M 320 160 Q 420 230 520 240"
            fill="none"
            stroke="url(#cyberAttackGrad)"
            strokeOpacity={isSimulating ? "0.95" : "0.35"}
            strokeWidth={isSimulating ? "3" : "2"}
          />

          {/* Decoys to Ledger Anchor */}
          <path
            d="M 520 80 Q 640 100 760 160"
            fill="none"
            stroke="url(#cyberLedgerGrad)"
            strokeOpacity="0.8"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          <line
            x1="520"
            y1="160"
            x2="760"
            y2="160"
            stroke="#FFB45E"
            strokeOpacity="0.85"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          <path
            d="M 520 240 Q 640 220 760 160"
            fill="none"
            stroke="url(#cyberLedgerGrad)"
            strokeOpacity="0.8"
            strokeWidth="2"
            strokeDasharray="4 4"
          />

          {/* Moving packet dots during simulation */}
          {isSimulating && (
            <>
              <circle r="6" fill="#F43F5E" filter="url(#neonRedGlow)">
                <animateMotion
                  path="M 120 160 L 320 160"
                  dur="1.2s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle r="5.5" fill="#FF873D" filter="url(#neonOrangeGlow)">
                <animateMotion
                  path="M 320 160 L 520 160"
                  dur="1.4s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle r="6" fill="#FFB45E" filter="url(#neonOrangeGlow)">
                <animateMotion
                  path="M 520 160 L 760 160"
                  dur="1.1s"
                  repeatCount="indefinite"
                />
              </circle>
            </>
          )}

          {/* NODE 1: Adversary Origin */}
          <g
            className="cursor-pointer transition-transform hover:scale-105"
            onClick={() => setSelectedNode('adversary')}
          >
            <circle
              cx="120"
              y="160"
              r="34"
              fill="#15120F"
              stroke="#F43F5E"
              strokeWidth="2.5"
              filter="url(#neonRedGlow)"
            />
            {isSimulating && (
              <circle
                cx="120"
                y="160"
                r="42"
                fill="none"
                stroke="#F43F5E"
                strokeOpacity="0.5"
                strokeWidth="1.5"
              >
                <animate attributeName="r" values="34;48;34" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
              </circle>
            )}
            <foreignObject x="98" y="138" width="44" height="44">
              <div className="w-full h-full flex items-center justify-center text-[#F43F5E]">
                <Terminal className="w-6 h-6" />
              </div>
            </foreignObject>
            <text x="120" y="212" textAnchor="middle" className="text-xs font-bold fill-white">
              Simulated Attacker
            </text>
            <text x="120" y="228" textAnchor="middle" className="text-[11px] fill-[#F43F5E] font-mono">
              198.51.100.x
            </text>
          </g>

          {/* NODE 2: Edge Perimeter Filter */}
          <g
            className="cursor-pointer transition-transform hover:scale-105"
            onClick={() => setSelectedNode('gateway')}
          >
            <circle
              cx="320"
              y="160"
              r="32"
              fill="#2B1B13"
              stroke="#CDD2D8"
              strokeWidth="2"
            />
            <foreignObject x="300" y="140" width="40" height="40">
              <div className="w-full h-full flex items-center justify-center text-[#CDD2D8]">
                <Server className="w-5 h-5" />
              </div>
            </foreignObject>
            <text x="320" y="210" textAnchor="middle" className="text-xs font-bold fill-white">
              Perimeter Routing
            </text>
            <text x="320" y="226" textAnchor="middle" className="text-[11px] fill-[#D0BFB0]">
              Honey-Trap Router
            </text>
          </g>

          {/* NODE 3A: Decoy Admin Portal */}
          <g
            className="cursor-pointer transition-transform hover:scale-105"
            onClick={() => setSelectedNode('decoy_admin')}
          >
            <circle
              cx="520"
              y="80"
              r="28"
              fill={highlightAssetId === 'ast_admin_portal' ? '#FF873D' : '#2B1B13'}
              stroke="#FF873D"
              strokeWidth="2"
              filter={highlightAssetId === 'ast_admin_portal' ? "url(#neonOrangeGlow)" : "none"}
            />
            <foreignObject x="502" y="62" width="36" height="36">
              <div className="w-full h-full flex items-center justify-center text-[#FF873D]">
                <Shield className="w-5 h-5" />
              </div>
            </foreignObject>
            <text x="520" y="124" textAnchor="middle" className="text-[11px] font-bold fill-white">
              HoneySQL Admin
            </text>
          </g>

          {/* NODE 3B: Decoy SSO Login */}
          <g
            className="cursor-pointer transition-transform hover:scale-105"
            onClick={() => setSelectedNode('decoy_login')}
          >
            <circle
              cx="520"
              y="160"
              r="30"
              fill={highlightAssetId === 'ast_login_decoy' ? '#FF873D' : '#2B1B13'}
              stroke="#FF873D"
              strokeWidth="2.5"
              filter={highlightAssetId === 'ast_login_decoy' ? "url(#neonOrangeGlow)" : "none"}
            />
            <foreignObject x="502" y="142" width="36" height="36">
              <div className="w-full h-full flex items-center justify-center text-[#FF873D]">
                <Lock className="w-5 h-5" />
              </div>
            </foreignObject>
            <text x="520" y="206" textAnchor="middle" className="text-[11px] font-bold fill-white">
              SSO Login Trap
            </text>
          </g>

          {/* NODE 3C: Decoy Canary File */}
          <g
            className="cursor-pointer transition-transform hover:scale-105"
            onClick={() => setSelectedNode('decoy_canary')}
          >
            <circle
              cx="520"
              y="240"
              r="28"
              fill={highlightAssetId === 'ast_aws_canary' ? '#FF873D' : '#2B1B13'}
              stroke="#FF873D"
              strokeWidth="2"
              filter={highlightAssetId === 'ast_aws_canary' ? "url(#neonOrangeGlow)" : "none"}
            />
            <foreignObject x="502" y="222" width="36" height="36">
              <div className="w-full h-full flex items-center justify-center text-[#FF873D]">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </foreignObject>
            <text x="520" y="284" textAnchor="middle" className="text-[11px] font-bold fill-white">
              AWS Canary File
            </text>
          </g>

          {/* NODE 4: SHA-256 Ledger Node */}
          <g
            className="cursor-pointer transition-transform hover:scale-105"
            onClick={() => setSelectedNode('ledger')}
          >
            <circle
              cx="760"
              y="160"
              r="36"
              fill="#2B1B13"
              stroke="#FFB45E"
              strokeWidth="2.5"
              filter="url(#neonOrangeGlow)"
            />
            <foreignObject x="736" y="136" width="48" height="48">
              <div className="w-full h-full flex items-center justify-center text-[#FFB45E]">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </foreignObject>
            <text x="760" y="214" textAnchor="middle" className="text-xs font-bold fill-white">
              Forensic Ledger
            </text>
            <text x="760" y="230" textAnchor="middle" className="text-[11px] fill-[#FFB45E] font-mono font-bold">
              SHA-256 Verified
            </text>
          </g>
        </svg>
      </div>

      {/* Dynamic Inspector banner if simulation step is active */}
      {activeStep && (
        <div className="mt-4 p-3.5 rounded-xl bg-[#2B1B13]/90 border border-[rgba(255,170,100,0.35)] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-[0_0_20px_rgba(255,135,61,0.2)]">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#FFB45E] uppercase tracking-wide">Simulation Event</span>
              <span className="text-[#CDD2D8]/40">·</span>
              <span className="font-medium text-white">{activeStep.phase}</span>
            </div>
            <p className="text-[#D0BFB0] mt-0.5">{activeStep.description}</p>
          </div>
          <div className="font-mono text-[11px] text-[#FF873D] bg-[#15120F] px-2.5 py-1 rounded-lg border border-[rgba(255,170,100,0.25)] shrink-0">
            Source: {activeStep.source}
          </div>
        </div>
      )}

      {selectedNode && (
        <div className="mt-3 p-3 rounded-xl bg-[#2B1B13]/95 border border-[rgba(255,170,100,0.35)] text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">Node Inspector:</span>
            <span className="text-[#D0BFB0] font-mono">
              {selectedNode === 'adversary' && 'Simulated Adversary Prober (Simulated External ASN)'}
              {selectedNode === 'gateway' && 'Perimeter Honey-Router (Simulated Deception Trapping)'}
              {selectedNode === 'decoy_admin' && 'Decoy Asset: HoneySQL Admin Portal (Risk: Critical)'}
              {selectedNode === 'decoy_login' && 'Decoy Asset: SSO Login Trap (Risk: High)'}
              {selectedNode === 'decoy_canary' && 'Decoy Asset: AWS S3 Access Key Lure (Risk: Critical)'}
              {selectedNode === 'ledger' && 'Tamper-Evident SHA-256 Append-Only Blockchain-Inspired Ledger'}
            </span>
          </div>
          <button
            onClick={() => setSelectedNode(null)}
            className="text-[11px] font-bold text-[#FF873D] hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};
