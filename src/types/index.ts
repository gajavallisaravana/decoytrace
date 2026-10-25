export type AssetType = 
  | 'login_endpoint' 
  | 'file_lure' 
  | 'admin_portal' 
  | 'api_mock' 
  | 'config_secret';

export type AssetStatus = 'active' | 'paused' | 'disabled';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
export type InvestigationStatus = 'unreviewed' | 'investigating' | 'investigated' | 'resolved';

export interface DecoyAsset {
  id: string;
  name: string;
  type: AssetType;
  description: string;
  status: AssetStatus;
  risk_level: RiskLevel;
  endpoint_path: string;
  created_at: string;
  last_activity_at: string | null;
  event_count: number;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  asset_id: string;
  asset_name: string;
  asset_type: AssetType;
  event_type: string;
  severity: SeverityLevel;
  severity_rationale: string;
  source_label: string;
  payload_preview: string;
  investigation_status: InvestigationStatus;
  is_simulated: number;
  simulation_run_id: string | null;
  ledger_block_id: string | null;
  created_at: string;
}

export interface LedgerBlock {
  block_index: number;
  block_id: string;
  timestamp: string;
  event_id: string;
  canonical_data: string;
  data_hash: string;
  prev_hash: string;
  block_hash: string;
  is_tampered_flag?: number;
}

export interface InvestigationNote {
  id: string;
  event_id: string;
  author: string;
  note: string;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  target_asset_types: AssetType[];
  steps_count: number;
  expected_severity: SeverityLevel;
  steps: {
    phase: string;
    description: string;
    source: string;
    payload: string;
    delay_ms: number;
  }[];
}

export interface SimulationRun {
  id: string;
  scenario_id: string;
  scenario_name: string;
  asset_id: string;
  asset_name: string;
  status: 'running' | 'completed' | 'paused' | 'stopped';
  total_steps: number;
  current_step: number;
  events_generated: number;
  created_at: string;
  completed_at: string | null;
}

export interface VerificationResult {
  is_valid: boolean;
  total_blocks: number;
  verified_at: string;
  broken_block_index?: number;
  broken_block_id?: string;
  error_type?: 'GENESIS_MISMATCH' | 'HASH_LINK_BROKEN' | 'DATA_TAMPERED' | 'INVALID_BLOCK_HASH';
  error_message?: string;
  verification_steps: {
    block_index: number;
    block_id: string;
    prev_hash_valid: boolean;
    data_hash_valid: boolean;
    block_hash_valid: boolean;
    status: 'valid' | 'corrupted';
    message?: string;
  }[];
}

export interface DashboardMetrics {
  total_events: number;
  critical_high_count: number;
  active_assets_count: number;
  investigated_resolved_count: number;
  total_blocks: number;
  ledger_integrity_status: 'valid' | 'compromised' | 'unverified';
  severity_breakdown: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  asset_type_breakdown: Record<string, number>;
  recent_events: SecurityEvent[];
  recent_blocks: LedgerBlock[];
}
