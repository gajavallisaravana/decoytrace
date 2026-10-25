import { 
  DecoyAsset, 
  SecurityEvent, 
  LedgerBlock, 
  InvestigationNote, 
  SimulationScenario, 
  VerificationResult, 
  DashboardMetrics 
} from '../types';

const API_BASE = '/api';

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const res = await fetch(`${API_BASE}/dashboard`);
  if (!res.ok) throw new Error('Failed to load dashboard metrics');
  return res.json();
}

export async function fetchAssets(): Promise<DecoyAsset[]> {
  const res = await fetch(`${API_BASE}/assets`);
  if (!res.ok) throw new Error('Failed to load decoy assets');
  return res.json();
}

export async function createAsset(data: Partial<DecoyAsset>): Promise<DecoyAsset> {
  const res = await fetch(`${API_BASE}/assets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create asset');
  }
  return res.json();
}

export async function updateAsset(id: string, data: Partial<DecoyAsset>): Promise<DecoyAsset> {
  const res = await fetch(`${API_BASE}/assets/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update asset');
  return res.json();
}

export async function deleteAsset(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/assets/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete asset');
  return res.json();
}

export async function fetchEvents(filters?: {
  severity?: string;
  status?: string;
  asset_id?: string;
  search?: string;
}): Promise<SecurityEvent[]> {
  const params = new URLSearchParams();
  if (filters?.severity) params.set('severity', filters.severity);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.asset_id) params.set('asset_id', filters.asset_id);
  if (filters?.search) params.set('search', filters.search);

  const res = await fetch(`${API_BASE}/events?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to load security events');
  return res.json();
}

export async function fetchEventDetails(id: string): Promise<SecurityEvent & { notes: InvestigationNote[]; linked_block: LedgerBlock | null }> {
  const res = await fetch(`${API_BASE}/events/${id}`);
  if (!res.ok) throw new Error('Failed to load event details');
  return res.json();
}

export async function updateEventStatus(id: string, status: string, note?: string): Promise<{ event: SecurityEvent; notes: InvestigationNote[] }> {
  const res = await fetch(`${API_BASE}/events/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, note }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update status');
  }
  return res.json();
}

export async function addInvestigationNote(id: string, author: string, note: string): Promise<InvestigationNote[]> {
  const res = await fetch(`${API_BASE}/events/${id}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ author, note }),
  });
  if (!res.ok) throw new Error('Failed to add note');
  return res.json();
}

export async function fetchScenarios(): Promise<SimulationScenario[]> {
  const res = await fetch(`${API_BASE}/simulations/scenarios`);
  if (!res.ok) throw new Error('Failed to load scenarios');
  return res.json();
}

export async function recordSimulationStep(asset_id: string, scenario_id: string, step_index: number) {
  const res = await fetch(`${API_BASE}/simulations/record-step`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ asset_id, scenario_id, step_index }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to record simulation step');
  }
  return res.json();
}

export async function fetchLedgerBlocks(sandbox = false): Promise<{ blocks: LedgerBlock[]; is_sandbox: boolean; tampered_block_index?: number; tamper_type?: string }> {
  const res = await fetch(`${API_BASE}/ledger/blocks?sandbox=${sandbox}`);
  if (!res.ok) throw new Error('Failed to load ledger blocks');
  return res.json();
}

export async function verifyLedgerChain(sandbox = false): Promise<VerificationResult> {
  const res = await fetch(`${API_BASE}/ledger/verify?sandbox=${sandbox}`);
  if (!res.ok) throw new Error('Failed to verify ledger chain');
  return res.json();
}

export async function verifySingleBlock(id: string): Promise<{
  block_id: string;
  block_index: number;
  is_valid: boolean;
  data_hash_valid: boolean;
  prev_hash_valid: boolean;
  block_hash_valid: boolean;
  computed_data_hash: string;
  recorded_data_hash: string;
  computed_block_hash: string;
  recorded_block_hash: string;
}> {
  const res = await fetch(`${API_BASE}/ledger/blocks/${id}/verify`);
  if (!res.ok) throw new Error('Failed to verify block');
  return res.json();
}

export async function initSandbox(): Promise<any> {
  const res = await fetch(`${API_BASE}/sandbox/init`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to initialize sandbox');
  return res.json();
}

export async function tamperSandboxBlock(block_index: number, tamper_type: 'alter_payload' | 'sever_previous_hash' | 'forge_block_hash'): Promise<any> {
  const res = await fetch(`${API_BASE}/sandbox/tamper`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ block_index, tamper_type }),
  });
  if (!res.ok) throw new Error('Failed to apply tamper in sandbox');
  return res.json();
}

export async function resetSandbox(): Promise<any> {
  const res = await fetch(`${API_BASE}/sandbox/reset`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset sandbox');
  return res.json();
}

export async function fetchReportSummary(startDate?: string, endDate?: string) {
  const params = new URLSearchParams();
  if (startDate) params.set('start_date', startDate);
  if (endDate) params.set('end_date', endDate);
  const res = await fetch(`${API_BASE}/reports/summary?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to load report summary');
  return res.json();
}

export async function fetchTimeline() {
  const res = await fetch(`${API_BASE}/timeline`);
  if (!res.ok) throw new Error('Failed to load incident timeline');
  return res.json();
}
