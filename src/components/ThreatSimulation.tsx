import React, { useEffect, useState, useRef } from 'react';
import { 
  Zap, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Terminal, 
  ShieldAlert, 
  Link as LinkIcon, 
  ArrowRight
} from 'lucide-react';
import { DecoyAsset, SimulationScenario } from '../types';
import { fetchAssets, fetchScenarios, recordSimulationStep } from '../lib/api';
import { NetworkVisualization } from './NetworkVisualization';
import { NavTab } from './Navigation';

interface ThreatSimulationProps {
  onNavigate: (tab: NavTab) => void;
  onSelectEvent: (eventId: string) => void;
}

export const ThreatSimulation: React.FC<ThreatSimulationProps> = ({
  onNavigate,
  onSelectEvent,
}) => {
  const [assets, setAssets] = useState<DecoyAsset[]>([]);
  const [scenarios, setScenarios] = useState<SimulationScenario[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('credential_stuffing');

  // Execution State
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [generatedEvents, setGeneratedEvents] = useState<any[]>([]);
  const [activeStepInfo, setActiveStepInfo] = useState<any | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const [assetList, scenarioList] = await Promise.all([
          fetchAssets(),
          fetchScenarios(),
        ]);
        setAssets(assetList);
        if (assetList.length > 0) {
          setSelectedAssetId(assetList[0].id);
        }
        setScenarios(scenarioList);
      } catch (err) {
        console.error('Failed to init simulation', err);
      }
    }
    init();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const activeScenario = scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];
  const activeAsset = assets.find((a) => a.id === selectedAssetId) || assets[0];

  const executeStep = async (stepIdx: number) => {
    if (!activeScenario || !activeAsset) return;

    try {
      const result = await recordSimulationStep(activeAsset.id, activeScenario.id, stepIdx);
      setActiveStepInfo(result.step_info);
      setGeneratedEvents((prev) => [result, ...prev]);

      const nextIdx = stepIdx + 1;
      if (nextIdx < activeScenario.steps.length) {
        setCurrentStepIndex(nextIdx);
        const delay = activeScenario.steps[nextIdx].delay_ms || 1000;
        timerRef.current = setTimeout(() => {
          executeStep(nextIdx);
        }, delay);
      } else {
        setIsRunning(false);
        setIsFinished(true);
      }
    } catch (err: any) {
      console.error('Step execution error:', err);
      setIsRunning(false);
    }
  };

  const handleStartSimulation = () => {
    if (isRunning) return;
    setIsFinished(false);
    setGeneratedEvents([]);
    setCurrentStepIndex(0);
    setIsRunning(true);
    setIsPaused(false);
    executeStep(0);
  };

  const handlePauseResume = () => {
    if (isPaused) {
      setIsPaused(false);
      setIsRunning(true);
      executeStep(currentStepIndex);
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
      setIsPaused(true);
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsRunning(false);
    setIsPaused(false);
    setCurrentStepIndex(0);
    setActiveStepInfo(null);
    setIsFinished(false);
  };

  const progressPercent = activeScenario
    ? Math.min(100, Math.round(((currentStepIndex + (isFinished ? 1 : 0)) / activeScenario.steps.length) * 100))
    : 0;

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF873D]">Adversary Testing Lab</span>
          <span className="text-xs text-[#CDD2D8]/40">·</span>
          <span className="text-xs text-[#D0BFB0]">Safe Cyber Deception Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#FFF8F1] tracking-tight mt-1">Interactive Threat Simulation</h1>
        <p className="text-xs sm:text-sm text-[#D0BFB0] mt-1">
          Trigger controlled cyber reconnaissance scenarios against simulated decoy assets and watch the tamper-evident ledger anchor each evidence block in real-time.
        </p>
      </div>

      {/* Control Configuration Panel */}
      <div className="p-6 rounded-2xl glass-panel grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
        {/* Scenario Selection */}
        <div className="md:col-span-5 space-y-1.5">
          <label className="block text-xs font-semibold text-[#FFF8F1]">Simulation Scenario</label>
          <select
            disabled={isRunning}
            value={selectedScenarioId}
            onChange={(e) => {
              setSelectedScenarioId(e.target.value);
              handleReset();
            }}
            className="w-full px-3 py-2 text-xs bg-[#2B1B13]/60 border border-[rgba(255,170,100,0.25)] rounded-xl text-[#FFF8F1] focus:outline-none focus:ring-1 focus:ring-[#FF873D]"
          >
            {scenarios.map((s) => (
              <option key={s.id} value={s.id} className="bg-[#15120F] text-[#FFF8F1]">
                {s.name} ({s.steps.length} steps · Expected: {s.expected_severity})
              </option>
            ))}
          </select>
          {activeScenario && (
            <p className="text-[11px] text-[#D0BFB0] mt-1">{activeScenario.description}</p>
          )}
        </div>

        {/* Target Decoy Asset */}
        <div className="md:col-span-4 space-y-1.5">
          <label className="block text-xs font-semibold text-[#FFF8F1]">Target Decoy Tripwire</label>
          <select
            disabled={isRunning}
            value={selectedAssetId}
            onChange={(e) => {
              setSelectedAssetId(e.target.value);
              handleReset();
            }}
            className="w-full px-3 py-2 text-xs bg-[#2B1B13]/60 border border-[rgba(255,170,100,0.25)] rounded-xl text-[#FFF8F1] focus:outline-none focus:ring-1 focus:ring-[#FF873D]"
          >
            {assets.map((a) => (
              <option key={a.id} value={a.id} className="bg-[#15120F] text-[#FFF8F1]">
                {a.name} ({a.type})
              </option>
            ))}
          </select>
          {activeAsset && (
            <p className="text-[11px] font-mono text-[#FFB45E] mt-1 truncate">{activeAsset.endpoint_path}</p>
          )}
        </div>

        {/* Buttons Controls */}
        <div className="md:col-span-3 flex items-center gap-2">
          {!isRunning && !isPaused && !isFinished ? (
            <button
              onClick={handleStartSimulation}
              disabled={assets.length === 0}
              className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl glass-button-primary disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <Play className="w-4 h-4 fill-[#15120F] text-[#15120F]" />
              <span>Start Simulation</span>
            </button>
          ) : (
            <>
              <button
                onClick={handlePauseResume}
                disabled={isFinished}
                className="flex-1 py-2.5 px-3 text-xs font-semibold rounded-xl glass-button-secondary flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isPaused ? <Play className="w-3.5 h-3.5 text-[#FF873D]" /> : <Pause className="w-3.5 h-3.5 text-[#FF873D]" />}
                <span>{isPaused ? 'Resume' : 'Pause'}</span>
              </button>

              <button
                onClick={handleReset}
                className="py-2.5 px-3 text-xs font-semibold text-[#D0BFB0] hover:text-white rounded-xl glass-button-secondary flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {(isRunning || isPaused || isFinished) && (
        <div className="p-4 rounded-xl glass-panel space-y-2 border border-[rgba(255,170,100,0.3)]">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#FFF8F1]">
              Phase {Math.min(currentStepIndex + 1, activeScenario?.steps.length || 1)} of {activeScenario?.steps.length}: {activeStepInfo?.phase || 'Initializing'}
            </span>
            <span className="font-mono text-[#FF873D] font-bold tabular-nums">
              {progressPercent}% Complete
            </span>
          </div>
          <div className="w-full h-2.5 bg-[#15120F] rounded-full overflow-hidden border border-[rgba(255,170,100,0.2)]">
            <div
              style={{ width: `${progressPercent}%` }}
              className="h-full bg-gradient-to-r from-[#FF873D] to-[#FFB45E] shadow-[0_0_12px_#FF873D] transition-all duration-300"
            />
          </div>
        </div>
      )}

      {/* Interactive Topology Graph with active pulses */}
      <NetworkVisualization
        activeStep={activeStepInfo}
        isSimulating={isRunning}
        highlightAssetId={selectedAssetId}
      />

      {/* Simulation Finished Summary Card */}
      {isFinished && (
        <div className="p-6 rounded-2xl glass-panel bg-[#2B1B13]/90 border border-[#FF873D]/40 space-y-4 shadow-[0_0_35px_rgba(255,135,61,0.2)]">
          <div className="flex items-center gap-3 text-[#FF873D]">
            <CheckCircle2 className="w-6 h-6 shrink-0" />
            <div>
              <h3 className="text-base font-bold text-[#FFF8F1]">Threat Simulation Completed Successfully</h3>
              <p className="text-xs text-[#D0BFB0] mt-0.5">
                All attack phases executed safely against the decoy tripwire. Each forensic evidence block has been hashed with SHA-256 and committed to the ledger.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-3 rounded-xl bg-[#15120F]/80 border border-[rgba(255,170,100,0.2)]">
              <span className="text-[11px] text-[#D0BFB0]">Events Generated</span>
              <div className="text-xl font-bold font-mono text-[#FFF8F1]">{generatedEvents.length}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#15120F]/80 border border-[rgba(255,170,100,0.2)]">
              <span className="text-[11px] text-[#D0BFB0]">Severity Evaluated</span>
              <div className="text-xl font-bold capitalize text-[#F59E0B]">{activeScenario?.expected_severity}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#15120F]/80 border border-[rgba(255,170,100,0.2)]">
              <span className="text-[11px] text-[#D0BFB0]">Ledger Blocks Anchored</span>
              <div className="text-xl font-bold font-mono text-[#FF873D]">{generatedEvents.length} blocks</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('ledger')}
              className="px-4 py-2 text-xs font-semibold rounded-xl glass-button-primary flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <LinkIcon className="w-3.5 h-3.5 text-[#15120F]" />
              <span>Inspect in Integrity Ledger</span>
            </button>
            <button
              onClick={() => onNavigate('events')}
              className="px-4 py-2 text-xs font-semibold rounded-xl glass-button-secondary flex items-center gap-1.5 cursor-pointer"
            >
              <span>Triage Security Events</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Live Stream of Events from current simulation run */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#FF873D]" />
            <h3 className="text-base font-semibold text-[#FFF8F1]">Simulation Event Stream</h3>
          </div>
          <span className="text-xs text-[#FF873D] font-mono px-2 py-0.5 rounded-full bg-[#FF873D]/10 border border-[#FF873D]/25">
            {generatedEvents.length} Captured
          </span>
        </div>

        {generatedEvents.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#D0BFB0]">
            No active threat events streaming. Click <strong className="text-[#FFF8F1]">"Start Simulation"</strong> above to launch safe simulated adversary traffic.
          </div>
        ) : (
          <div className="space-y-3">
            {generatedEvents.map((item, idx) => {
              const ev = item.event;
              const blk = item.ledger_block;
              return (
                <div
                  key={ev.id || idx}
                  className="p-4 rounded-xl bg-[#15120F]/80 border border-[rgba(255,170,100,0.2)] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-sm hover:border-[#FF873D]/40 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#FF873D]">{ev.id}</span>
                      <span className="text-[#CDD2D8]/40">·</span>
                      <span className="font-semibold text-[#FFF8F1]">{item.step_info?.phase}</span>
                      <span
                        className={`font-semibold capitalize text-[11px] px-1.5 py-0.5 rounded border ${
                          ev.severity === 'critical'
                            ? 'text-[#F43F5E] bg-[#F43F5E]/10 border-[#F43F5E]/30'
                            : 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30'
                        }`}
                      >
                        [{ev.severity}]
                      </span>
                    </div>
                    <p className="font-mono text-[11px] text-[#FFB45E] bg-[#2B1B13] px-2.5 py-1 rounded-md inline-block border border-[rgba(255,170,100,0.2)]">
                      {ev.payload_preview}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0 text-right">
                    <div className="font-mono text-[11px] text-[#D0BFB0]">
                      <div className="text-[#FFF8F1] font-medium">Block #{blk.block_index}</div>
                      <div className="text-[10px] text-[#FF873D] font-mono">SHA-256: {blk.block_hash.slice(0, 14)}...</div>
                    </div>
                    <button
                      onClick={() => onSelectEvent(ev.id)}
                      className="text-xs font-semibold text-[#FF873D] hover:text-[#FFB45E] cursor-pointer"
                    >
                      Inspect
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
