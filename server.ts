import express, { Request, Response, NextFunction } from 'express';
import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'decoytrace.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode & foreign keys for robust local SQLite performance
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS decoy_assets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    risk_level TEXT NOT NULL DEFAULT 'medium',
    endpoint_path TEXT NOT NULL,
    created_at TEXT NOT NULL,
    last_activity_at TEXT,
    event_count INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS security_events (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    asset_id TEXT NOT NULL,
    asset_name TEXT NOT NULL,
    asset_type TEXT NOT NULL,
    event_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    severity_rationale TEXT NOT NULL,
    source_label TEXT NOT NULL,
    payload_preview TEXT NOT NULL,
    investigation_status TEXT NOT NULL DEFAULT 'unreviewed',
    is_simulated INTEGER NOT NULL DEFAULT 1,
    simulation_run_id TEXT,
    ledger_block_id TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(asset_id) REFERENCES decoy_assets(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS ledger_blocks (
    block_index INTEGER PRIMARY KEY,
    block_id TEXT UNIQUE NOT NULL,
    timestamp TEXT NOT NULL,
    event_id TEXT NOT NULL,
    canonical_data TEXT NOT NULL,
    data_hash TEXT NOT NULL,
    prev_hash TEXT NOT NULL,
    block_hash TEXT NOT NULL,
    is_tampered_flag INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS investigation_notes (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    author TEXT NOT NULL,
    note TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    FOREIGN KEY(event_id) REFERENCES security_events(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    timestamp TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS simulation_runs (
    id TEXT PRIMARY KEY,
    scenario_id TEXT NOT NULL,
    scenario_name TEXT NOT NULL,
    asset_id TEXT NOT NULL,
    asset_name TEXT NOT NULL,
    status TEXT NOT NULL,
    total_steps INTEGER NOT NULL,
    current_step INTEGER NOT NULL,
    events_generated INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    completed_at TEXT
  );
`);

// --- Cryptographic Utilities ---

export function canonicalJsonStringify(obj: any): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalJsonStringify).join(',') + ']';
  }
  const keys = Object.keys(obj).sort();
  return '{' + keys.map(k => `${JSON.stringify(k)}:${canonicalJsonStringify(obj[k])}`).join(',') + '}';
}

export function sha256Hex(data: string): string {
  return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
}

// Genesis Block Initializer
function ensureGenesisBlock() {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM ledger_blocks').get() as { count: number };
  if (countRow.count === 0) {
    const timestamp = '2026-01-01T00:00:00.000Z';
    const canonical_data = canonicalJsonStringify({
      anchor: 'DecoyTrace Genesis Root Anchor',
      description: 'Tamper-Evident Hash-Linked Cybersecurity Incident Ledger',
      framework: 'SHA-256 Verifiable Chain',
      version: '1.0',
    });
    const data_hash = sha256Hex(canonical_data);
    const prev_hash = '0'.repeat(64);
    const block_hash = sha256Hex(`0:${timestamp}:${prev_hash}:${data_hash}`);

    const stmt = db.prepare(`
      INSERT INTO ledger_blocks (block_index, block_id, timestamp, event_id, canonical_data, data_hash, prev_hash, block_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(0, 'blk_000000_genesis', timestamp, 'GENESIS_ANCHOR', canonical_data, data_hash, prev_hash, block_hash);

    db.prepare('INSERT INTO audit_logs (id, action, details, timestamp) VALUES (?, ?, ?, ?)').run(
      `log_${Date.now()}`,
      'LEDGER_GENESIS_INITIALIZED',
      `Genesis block anchored with hash ${block_hash.slice(0, 16)}...`,
      new Date().toISOString()
    );
  }
}

// Append Block to Ledger
function appendLedgerBlock(eventId: string, eventPayload: any): { block_id: string; block_index: number; block_hash: string } {
  const lastBlock = db.prepare('SELECT block_index, block_hash FROM ledger_blocks ORDER BY block_index DESC LIMIT 1').get() as {
    block_index: number;
    block_hash: string;
  };

  const nextIndex = (lastBlock ? lastBlock.block_index : 0) + 1;
  const blockId = `blk_${String(nextIndex).padStart(6, '0')}_${crypto.randomBytes(3).toString('hex')}`;
  const timestamp = new Date().toISOString();

  // Canonicalize the payload
  const canonical_data = canonicalJsonStringify({
    event_id: eventId,
    timestamp: eventPayload.timestamp || timestamp,
    asset_id: eventPayload.asset_id,
    event_type: eventPayload.event_type,
    severity: eventPayload.severity,
    source_label: eventPayload.source_label,
    is_simulated: 1,
  });

  const data_hash = sha256Hex(canonical_data);
  const prev_hash = lastBlock.block_hash;
  const block_hash = sha256Hex(`${nextIndex}:${timestamp}:${prev_hash}:${data_hash}`);

  const stmt = db.prepare(`
    INSERT INTO ledger_blocks (block_index, block_id, timestamp, event_id, canonical_data, data_hash, prev_hash, block_hash)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(nextIndex, blockId, timestamp, eventId, canonical_data, data_hash, prev_hash, block_hash);

  return { block_id: blockId, block_index: nextIndex, block_hash };
}

// Seed Initial Demo Assets if empty
function seedDemoDataIfEmpty() {
  ensureGenesisBlock();
  const assetCount = (db.prepare('SELECT COUNT(*) as count FROM decoy_assets').get() as { count: number }).count;
  if (assetCount > 0) return;

  const now = new Date();
  const seedAssets = [
    {
      id: 'ast_admin_portal',
      name: 'HoneySQL Admin Gateway',
      type: 'admin_portal',
      description: 'Simulated internal administrative control panel disguised as staging database dashboard.',
      status: 'active',
      risk_level: 'critical',
      endpoint_path: '/admin/internal/db-console',
    },
    {
      id: 'ast_aws_canary',
      name: 'AWS S3 Access Key Lure',
      type: 'config_secret',
      description: 'Safe canary token configuration file planted in staging environment repository.',
      status: 'active',
      risk_level: 'high',
      endpoint_path: '/.env.staging.credentials',
    },
    {
      id: 'ast_login_decoy',
      name: 'Executive SSO Trap Endpoint',
      type: 'login_endpoint',
      description: 'Mock OAuth single sign-on redirect endpoint capturing credential stuffing attempts.',
      status: 'active',
      risk_level: 'high',
      endpoint_path: '/auth/sso/exec-login',
    },
    {
      id: 'ast_api_mock',
      name: 'Simulated Wire Transfer API',
      type: 'api_mock',
      description: 'Mock financial transfer REST endpoint with simulated rate limiting and injection traps.',
      status: 'active',
      risk_level: 'critical',
      endpoint_path: '/api/v2/wire/transfer-preview',
    },
    {
      id: 'ast_doc_lure',
      name: 'Q3 Financial M&A Strategy Doc',
      type: 'file_lure',
      description: 'Simulated confidential PDF lure embedded with web-beacon forensic tracking token.',
      status: 'paused',
      risk_level: 'medium',
      endpoint_path: '/share/q3-merger-draft-confidential.pdf',
    },
  ];

  const insertAsset = db.prepare(`
    INSERT INTO decoy_assets (id, name, type, description, status, risk_level, endpoint_path, created_at, last_activity_at, event_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const a of seedAssets) {
    const createdAt = new Date(now.getTime() - 86400000 * 3).toISOString();
    insertAsset.run(a.id, a.name, a.type, a.description, a.status, a.risk_level, a.endpoint_path, createdAt, null, 0);
  }

  // Seed sample simulated events
  const sampleEvents = [
    {
      id: 'evt_sim_89211',
      asset_id: 'ast_login_decoy',
      asset_name: 'Executive SSO Trap Endpoint',
      asset_type: 'login_endpoint',
      event_type: 'CREDENTIAL_STUFFING_BURST',
      severity: 'high',
      severity_rationale: '15 authentication failures in 12 seconds targeting high-privilege usernames (admin, cfo, root).',
      source_label: '198.51.100.84 (Simulated Tor Relay / ASN 64496)',
      payload_preview: 'POST /auth/sso/exec-login user="cfo@decoy.corp" attempts=15 user_agent="Hydra/9.2-dev"',
      investigation_status: 'investigating',
      hoursAgo: 14,
    },
    {
      id: 'evt_sim_89212',
      asset_id: 'ast_aws_canary',
      asset_name: 'AWS S3 Access Key Lure',
      asset_type: 'config_secret',
      event_type: 'CANARY_FILE_EXTRACTION',
      severity: 'critical',
      severity_rationale: 'Static decoy canary token AKIA... accessed and queried against mock AWS STS service.',
      source_label: '203.0.113.19 (Simulated Residential Proxy)',
      payload_preview: 'GET /.env.staging.credentials referer="https://git.internal-search" token_id="canary_s3_read_99"',
      investigation_status: 'investigated',
      hoursAgo: 8,
    },
    {
      id: 'evt_sim_89213',
      asset_id: 'ast_api_mock',
      asset_name: 'Simulated Wire Transfer API',
      asset_type: 'api_mock',
      event_type: 'API_INJECTION_PROBE',
      severity: 'high',
      severity_rationale: 'Fuzzing SQL syntax detected in JSON parameter "recipient_routing_number".',
      source_label: '192.0.2.77 (Simulated Cloud VPS Scanner)',
      payload_preview: 'POST /api/v2/wire/transfer-preview routing="021000021\' OR \'1\'=\'1"',
      investigation_status: 'unreviewed',
      hoursAgo: 3,
    },
  ];

  for (const ev of sampleEvents) {
    const timestamp = new Date(now.getTime() - ev.hoursAgo * 3600000).toISOString();
    const { block_id } = appendLedgerBlock(ev.id, {
      timestamp,
      asset_id: ev.asset_id,
      event_type: ev.event_type,
      severity: ev.severity,
      source_label: ev.source_label,
    });

    db.prepare(`
      INSERT INTO security_events (
        id, timestamp, asset_id, asset_name, asset_type, event_type, severity, 
        severity_rationale, source_label, payload_preview, investigation_status, 
        is_simulated, simulation_run_id, ledger_block_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NULL, ?, ?)
    `).run(
      ev.id,
      timestamp,
      ev.asset_id,
      ev.asset_name,
      ev.asset_type,
      ev.event_type,
      ev.severity,
      ev.severity_rationale,
      ev.source_label,
      ev.payload_preview,
      ev.investigation_status,
      block_id,
      timestamp
    );

    db.prepare('UPDATE decoy_assets SET event_count = event_count + 1, last_activity_at = ? WHERE id = ?').run(
      timestamp,
      ev.asset_id
    );

    db.prepare('INSERT INTO audit_logs (id, action, details, timestamp) VALUES (?, ?, ?, ?)').run(
      `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      'EVENT_RECORDED',
      `Simulated event ${ev.id} committed to ledger block ${block_id}`,
      timestamp
    );
  }

  // Seed sample note
  db.prepare(`
    INSERT INTO investigation_notes (id, event_id, author, note, timestamp)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    'note_init_1',
    'evt_sim_89212',
    'Senior Incident Analyst',
    'Canary token triggered AWS STS mock alert. Verified that decoy file was isolated to simulated staging repo. Asset remains active for ongoing telemetry capture.',
    new Date(now.getTime() - 7 * 3600000).toISOString()
  );
}

// Initial database bootstrap
seedDemoDataIfEmpty();

// --- Simulation Scenarios Catalog ---

const SCENARIOS = [
  {
    id: 'credential_stuffing',
    name: 'Credential Stuffing Burst Attack',
    description: 'Simulates high-velocity automated login attempts with common password dictionaries against authentication tripwires.',
    target_asset_types: ['login_endpoint', 'admin_portal'],
    expected_severity: 'high',
    steps: [
      {
        phase: 'Reconnaissance & Pre-flight Probe',
        description: 'Attacker probe queries login form structure, anti-CSRF token parameters, and server response timing.',
        source: '198.51.100.44 (Simulated ASN-64496 Tor Relay)',
        payload: 'GET /login HTTP/1.1 User-Agent: python-requests/2.31.0',
        delay_ms: 600,
      },
      {
        phase: 'Dictionary Credential Burst',
        description: 'Rapid sequential attempts using leaked credential pairs (root:toor, admin:admin123, operator:password).',
        source: '198.51.100.44 (Simulated ASN-64496 Tor Relay)',
        payload: 'POST /auth/login payload={"user":"admin","pw_hash":"8c6976e5b541...","attempt":1}',
        delay_ms: 800,
      },
      {
        phase: 'MFA Bypass / Session Forgery Attempt',
        description: 'Simulated brute-force of 6-digit TOTP verification token and session cookie manipulation.',
        source: '198.51.100.44 (Simulated ASN-64496 Tor Relay)',
        payload: 'POST /auth/mfa-verify code="739102" Cookie="session_id=forged_admin_token"',
        delay_ms: 900,
      },
      {
        phase: 'Tripped Decoy & Forensic Lock',
        description: 'Decoy asset flags threshold violation, captures source fingerprint, and anchors cryptographic evidence to ledger.',
        source: '198.51.100.44 (Simulated ASN-64496 Tor Relay)',
        payload: 'TRIPWIRE_TRIGGER: Credential Stuffing rate-limit breached (35 attempts/min)',
        delay_ms: 700,
      },
    ],
  },
  {
    id: 'canary_leak',
    name: 'Canary Secret Extraction & STS Query',
    description: 'Simulates discovery and unauthorized retrieval of embedded credential files or canary lures by an adversary.',
    target_asset_types: ['config_secret', 'file_lure'],
    expected_severity: 'critical',
    steps: [
      {
        phase: 'Directory Traversal Exploration',
        description: 'Adversary uses path traversal probes to locate hidden configuration files.',
        source: '203.0.113.88 (Simulated VPN Exit Node)',
        payload: 'GET /../../.env.staging.credentials HTTP/1.1',
        delay_ms: 600,
      },
      {
        phase: 'Canary Token Exfiltration',
        description: 'Honey credentials read into memory and exfiltrated across external DNS/HTTPS channels.',
        source: '203.0.113.88 (Simulated VPN Exit Node)',
        payload: 'EXFIL_DETECT: Canary Token AKIA_DECOY_7820 read from file system',
        delay_ms: 850,
      },
      {
        phase: 'Mock AWS STS API Identity Probe',
        description: 'Adversary attempts to invoke sts:GetCallerIdentity with canary access key.',
        source: '203.0.113.88 (Simulated VPN Exit Node)',
        payload: 'POST https://sts.amazonaws.com Action=GetCallerIdentity AWSAccessKeyId=AKIA_DECOY_7820',
        delay_ms: 900,
      },
      {
        phase: 'Ledger Evidence Anchoring',
        description: 'High-fidelity canary tripwire records cryptographic chain block with payload digest.',
        source: '203.0.113.88 (Simulated VPN Exit Node)',
        payload: 'FORENSIC_ANCHOR: Canary event verified with SHA-256 integrity block',
        delay_ms: 600,
      },
    ],
  },
  {
    id: 'api_fuzzing',
    name: 'Mock API Fuzzing & Parameter Injection',
    description: 'Simulates automated vulnerability fuzzing, injection sequences, and parameter tampering on mock APIs.',
    target_asset_types: ['api_mock', 'admin_portal'],
    expected_severity: 'high',
    steps: [
      {
        phase: 'Endpoint Schema Discovery',
        description: 'Probing for undocumented routes, swagger JSON docs, and GraphQL introspection.',
        source: '192.0.2.115 (Simulated Automated Scanner)',
        payload: 'GET /api/v2/swagger.json /api/graphql?query={__schema{types{name}}}',
        delay_ms: 600,
      },
      {
        phase: 'SQL / Command Injection Payloads',
        description: 'Fuzzing input fields with classic SQL injection strings and syntax probes.',
        source: '192.0.2.115 (Simulated Automated Scanner)',
        payload: 'POST /api/v2/wire/transfer-preview body={"account_id":"1\' UNION SELECT null, password FROM users--" }',
        delay_ms: 800,
      },
      {
        phase: 'Rate Limit Threshold Violation',
        description: 'Fuzzer exceeds request threshold; decoy API serves simulated errors while recording origin fingerprint.',
        source: '192.0.2.115 (Simulated Automated Scanner)',
        payload: 'HTTP 429 Too Many Requests (Decoy Honey-trap active)',
        delay_ms: 700,
      },
    ],
  },
];

// --- Express App Setup ---

const app = express();
app.use(express.json());

// In-memory Sandbox for Tamper Demonstration (Never corrupts real database)
interface SandboxState {
  is_active: boolean;
  blocks: any[];
  tampered_block_index: number | null;
  tamper_type: string | null;
}

let sandboxState: SandboxState = {
  is_active: false,
  blocks: [],
  tampered_block_index: null,
  tamper_type: null,
};

function getLiveBlocks() {
  return db.prepare('SELECT * FROM ledger_blocks ORDER BY block_index ASC').all();
}

function verifyChain(blocks: any[]) {
  const steps: any[] = [];
  let isValid = true;
  let brokenIndex: number | undefined;
  let brokenId: string | undefined;
  let errorType: string | undefined;
  let errorMessage: string | undefined;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const computedDataHash = sha256Hex(block.canonical_data);
    const dataHashValid = computedDataHash === block.data_hash;

    let prevHashValid = true;
    if (i === 0) {
      // Genesis check
      prevHashValid = block.prev_hash === '0'.repeat(64) && block.block_index === 0;
    } else {
      const prevBlock = blocks[i - 1];
      prevHashValid = block.prev_hash === prevBlock.block_hash;
    }

    const computedBlockHash = sha256Hex(
      `${block.block_index}:${block.timestamp}:${block.prev_hash}:${computedDataHash}`
    );
    const blockHashValid = computedBlockHash === block.block_hash;

    const blockStatus = dataHashValid && prevHashValid && blockHashValid ? 'valid' : 'corrupted';

    if (blockStatus === 'corrupted' && isValid) {
      isValid = false;
      brokenIndex = block.block_index;
      brokenId = block.block_id;

      if (!prevHashValid) {
        errorType = 'HASH_LINK_BROKEN';
        errorMessage = `Block #${block.block_index} previous hash (${block.prev_hash.slice(0, 16)}...) does not match prior block hash (${blocks[i - 1]?.block_hash?.slice(0, 16) || 'none'}...). The chain link is severed.`;
      } else if (!dataHashValid) {
        errorType = 'DATA_TAMPERED';
        errorMessage = `Block #${block.block_index} canonical event data was altered. Computed hash (${computedDataHash.slice(0, 16)}...) does not match stored data digest (${block.data_hash.slice(0, 16)}...).`;
      } else {
        errorType = 'INVALID_BLOCK_HASH';
        errorMessage = `Block #${block.block_index} overall header hash is invalid. Computed (${computedBlockHash.slice(0, 16)}...) vs recorded (${block.block_hash.slice(0, 16)}...).`;
      }
    }

    steps.push({
      block_index: block.block_index,
      block_id: block.block_id,
      prev_hash_valid: prevHashValid,
      data_hash_valid: dataHashValid,
      block_hash_valid: blockHashValid,
      status: blockStatus,
      message: blockStatus === 'corrupted' ? errorMessage : 'Cryptographically verified with SHA-256',
    });
  }

  return {
    is_valid: isValid,
    total_blocks: blocks.length,
    verified_at: new Date().toISOString(),
    broken_block_index: brokenIndex,
    broken_block_id: brokenId,
    error_type: errorType,
    error_message: errorMessage,
    verification_steps: steps,
  };
}

// --- API Endpoints ---

// 1. Dashboard Metrics
app.get('/api/dashboard', (req: Request, res: Response) => {
  try {
    const totalEvents = (db.prepare('SELECT COUNT(*) as count FROM security_events').get() as any).count;
    const criticalHigh = (db.prepare("SELECT COUNT(*) as count FROM security_events WHERE severity IN ('critical', 'high')").get() as any).count;
    const activeAssets = (db.prepare("SELECT COUNT(*) as count FROM decoy_assets WHERE status = 'active'").get() as any).count;
    const investigatedResolved = (db.prepare("SELECT COUNT(*) as count FROM security_events WHERE investigation_status IN ('investigated', 'resolved')").get() as any).count;
    const totalBlocks = (db.prepare('SELECT COUNT(*) as count FROM ledger_blocks').get() as any).count;

    const severityRows = db.prepare('SELECT severity, COUNT(*) as count FROM security_events GROUP BY severity').all() as any[];
    const severityMap: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
    for (const r of severityRows) {
      severityMap[r.severity] = r.count;
    }

    const typeRows = db.prepare('SELECT type, COUNT(*) as count FROM decoy_assets GROUP BY type').all() as any[];
    const assetTypeBreakdown: Record<string, number> = {};
    for (const r of typeRows) {
      assetTypeBreakdown[r.type] = r.count;
    }

    const recentEvents = db.prepare('SELECT * FROM security_events ORDER BY timestamp DESC LIMIT 6').all();
    const recentBlocks = db.prepare('SELECT * FROM ledger_blocks ORDER BY block_index DESC LIMIT 5').all();

    // Verify ledger integrity
    const allBlocks = getLiveBlocks();
    const verification = verifyChain(allBlocks);

    res.json({
      total_events: totalEvents,
      critical_high_count: criticalHigh,
      active_assets_count: activeAssets,
      investigated_resolved_count: investigatedResolved,
      total_blocks: totalBlocks,
      ledger_integrity_status: verification.is_valid ? 'valid' : 'compromised',
      severity_breakdown: severityMap,
      asset_type_breakdown: assetTypeBreakdown,
      recent_events: recentEvents,
      recent_blocks: recentBlocks,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Decoy Assets API
app.get('/api/assets', (req: Request, res: Response) => {
  try {
    const assets = db.prepare('SELECT * FROM decoy_assets ORDER BY created_at DESC').all();
    res.json(assets);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/assets', (req: Request, res: Response) => {
  try {
    const { name, type, description, status = 'active', risk_level = 'medium', endpoint_path } = req.body;
    if (!name || !type || !description || !endpoint_path) {
      return res.status(400).json({ error: 'Missing required asset fields (name, type, description, endpoint_path).' });
    }

    const id = `ast_${type}_${Date.now().toString(36)}`;
    const createdAt = new Date().toISOString();

    db.prepare(`
      INSERT INTO decoy_assets (id, name, type, description, status, risk_level, endpoint_path, created_at, last_activity_at, event_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, 0)
    `).run(id, name, type, description, status, risk_level, endpoint_path, createdAt);

    db.prepare('INSERT INTO audit_logs (id, action, details, timestamp) VALUES (?, ?, ?, ?)').run(
      `log_${Date.now()}`,
      'DECOY_ASSET_CREATED',
      `Created decoy asset "${name}" (${type}) at path ${endpoint_path}`,
      createdAt
    );

    const created = db.prepare('SELECT * FROM decoy_assets WHERE id = ?').get(id);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/assets/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, status, risk_level, endpoint_path } = req.body;

    const existing = db.prepare('SELECT * FROM decoy_assets WHERE id = ?').get(id) as any;
    if (!existing) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    db.prepare(`
      UPDATE decoy_assets 
      SET name = COALESCE(?, name),
          description = COALESCE(?, description),
          status = COALESCE(?, status),
          risk_level = COALESCE(?, risk_level),
          endpoint_path = COALESCE(?, endpoint_path)
      WHERE id = ?
    `).run(name, description, status, risk_level, endpoint_path, id);

    db.prepare('INSERT INTO audit_logs (id, action, details, timestamp) VALUES (?, ?, ?, ?)').run(
      `log_${Date.now()}`,
      'DECOY_ASSET_UPDATED',
      `Updated decoy asset ${id}`,
      new Date().toISOString()
    );

    const updated = db.prepare('SELECT * FROM decoy_assets WHERE id = ?').get(id);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/assets/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM decoy_assets WHERE id = ?').get(id) as any;
    if (!existing) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    // Cascade delete events and asset
    db.prepare('DELETE FROM decoy_assets WHERE id = ?').run(id);

    db.prepare('INSERT INTO audit_logs (id, action, details, timestamp) VALUES (?, ?, ?, ?)').run(
      `log_${Date.now()}`,
      'DECOY_ASSET_DELETED',
      `Deleted decoy asset "${existing.name}" (${id})`,
      new Date().toISOString()
    );

    res.json({ success: true, deleted_id: id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Security Events API
app.get('/api/events', (req: Request, res: Response) => {
  try {
    const { severity, status, asset_id, search, limit = '100' } = req.query;
    let query = 'SELECT * FROM security_events WHERE 1=1';
    const params: any[] = [];

    if (severity && severity !== 'all') {
      query += ' AND severity = ?';
      params.push(severity);
    }
    if (status && status !== 'all') {
      query += ' AND investigation_status = ?';
      params.push(status);
    }
    if (asset_id && asset_id !== 'all') {
      query += ' AND asset_id = ?';
      params.push(asset_id);
    }
    if (search) {
      query += ' AND (event_type LIKE ? OR asset_name LIKE ? OR payload_preview LIKE ? OR source_label LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    query += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(parseInt(limit as string, 10) || 100);

    const events = db.prepare(query).all(...params);
    res.json(events);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/events/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = db.prepare('SELECT * FROM security_events WHERE id = ?').get(id) as any;
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const notes = db.prepare('SELECT * FROM investigation_notes WHERE event_id = ? ORDER BY timestamp DESC').all(id);
    const linkedBlock = event.ledger_block_id
      ? db.prepare('SELECT * FROM ledger_blocks WHERE block_id = ?').get(event.ledger_block_id)
      : null;

    res.json({
      ...event,
      notes,
      linked_block: linkedBlock,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/events/:id/status', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    const allowed = ['unreviewed', 'investigating', 'investigated', 'resolved'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${allowed.join(', ')}` });
    }

    const event = db.prepare('SELECT * FROM security_events WHERE id = ?').get(id) as any;
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const previousStatus = event.investigation_status;
    db.prepare('UPDATE security_events SET investigation_status = ? WHERE id = ?').run(status, id);

    const now = new Date().toISOString();

    if (note && note.trim()) {
      db.prepare(`
        INSERT INTO investigation_notes (id, event_id, author, note, timestamp)
        VALUES (?, ?, ?, ?, ?)
      `).run(`note_${Date.now()}`, id, 'Security Analyst', note.trim(), now);
    }

    db.prepare('INSERT INTO audit_logs (id, action, details, timestamp) VALUES (?, ?, ?, ?)').run(
      `log_${Date.now()}`,
      'INCIDENT_STATUS_CHANGED',
      `Event ${id} transitioned from "${previousStatus}" to "${status}"`,
      now
    );

    const updated = db.prepare('SELECT * FROM security_events WHERE id = ?').get(id);
    const notes = db.prepare('SELECT * FROM investigation_notes WHERE event_id = ? ORDER BY timestamp DESC').all(id);

    res.json({ event: updated, notes });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/events/:id/notes', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { author = 'Security Analyst', note } = req.body;
    if (!note || !note.trim()) {
      return res.status(400).json({ error: 'Note text is required.' });
    }

    const event = db.prepare('SELECT * FROM security_events WHERE id = ?').get(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const noteId = `note_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO investigation_notes (id, event_id, author, note, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `).run(noteId, id, author, note.trim(), now);

    db.prepare('INSERT INTO audit_logs (id, action, details, timestamp) VALUES (?, ?, ?, ?)').run(
      `log_${Date.now()}`,
      'NOTE_ADDED',
      `Added investigation note to event ${id} by ${author}`,
      now
    );

    const notes = db.prepare('SELECT * FROM investigation_notes WHERE event_id = ? ORDER BY timestamp DESC').all(id);
    res.status(201).json(notes);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Threat Simulation Scenarios & Execution
app.get('/api/simulations/scenarios', (req: Request, res: Response) => {
  res.json(SCENARIOS);
});

// Record a simulated step
app.post('/api/simulations/record-step', (req: Request, res: Response) => {
  try {
    const { asset_id, scenario_id, step_index } = req.body;
    const asset = db.prepare('SELECT * FROM decoy_assets WHERE id = ?').get(asset_id) as any;
    if (!asset) {
      return res.status(404).json({ error: 'Target decoy asset not found' });
    }

    const scenario = SCENARIOS.find(s => s.id === scenario_id);
    if (!scenario) {
      return res.status(404).json({ error: 'Scenario not found' });
    }

    const step = scenario.steps[step_index] || scenario.steps[0];
    const eventId = `evt_sim_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`;
    const timestamp = new Date().toISOString();

    // Map severity based on step phase and asset risk
    let severity = 'medium';
    if (step_index >= scenario.steps.length - 2) {
      severity = scenario.expected_severity;
    } else if (step_index === 0) {
      severity = 'low';
    }

    const severityRationale = `Simulated ${scenario.name}: ${step.phase}. Evaluated under deception tripwire rules for ${asset.name}.`;

    // Append to Ledger
    const { block_id, block_index, block_hash } = appendLedgerBlock(eventId, {
      timestamp,
      asset_id: asset.id,
      event_type: `${scenario.id.toUpperCase()}_STEP_${step_index + 1}`,
      severity,
      source_label: step.source,
    });

    // Record Event
    db.prepare(`
      INSERT INTO security_events (
        id, timestamp, asset_id, asset_name, asset_type, event_type, severity, 
        severity_rationale, source_label, payload_preview, investigation_status, 
        is_simulated, simulation_run_id, ledger_block_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
    `).run(
      eventId,
      timestamp,
      asset.id,
      asset.name,
      asset.type,
      `${scenario.id.toUpperCase()}_STEP_${step_index + 1}`,
      severity,
      severityRationale,
      step.source,
      step.payload,
      'unreviewed',
      `sim_run_${scenario_id}`,
      block_id,
      timestamp
    );

    // Update Asset
    db.prepare('UPDATE decoy_assets SET event_count = event_count + 1, last_activity_at = ? WHERE id = ?').run(
      timestamp,
      asset.id
    );

    // Audit log
    db.prepare('INSERT INTO audit_logs (id, action, details, timestamp) VALUES (?, ?, ?, ?)').run(
      `log_${Date.now()}`,
      'SIMULATION_STEP_COMMITTED',
      `Simulated step ${step_index + 1}/${scenario.steps.length} for ${asset.name} committed to block #${block_index}`,
      timestamp
    );

    const createdEvent = db.prepare('SELECT * FROM security_events WHERE id = ?').get(eventId);
    const createdBlock = db.prepare('SELECT * FROM ledger_blocks WHERE block_id = ?').get(block_id);

    res.json({
      success: true,
      event: createdEvent,
      ledger_block: createdBlock,
      step_info: step,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Blockchain-Inspired Hash Ledger API
app.get('/api/ledger/blocks', (req: Request, res: Response) => {
  try {
    const useSandbox = req.query.sandbox === 'true';
    if (useSandbox && sandboxState.is_active) {
      return res.json({
        blocks: sandboxState.blocks,
        is_sandbox: true,
        tampered_block_index: sandboxState.tampered_block_index,
        tamper_type: sandboxState.tamper_type,
      });
    }

    const blocks = getLiveBlocks();
    res.json({
      blocks,
      is_sandbox: false,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Verify Chain
app.get('/api/ledger/verify', (req: Request, res: Response) => {
  try {
    const useSandbox = req.query.sandbox === 'true';
    const blocks = (useSandbox && sandboxState.is_active) ? sandboxState.blocks : getLiveBlocks();
    const result = verifyChain(blocks);

    if (!useSandbox) {
      db.prepare('INSERT INTO audit_logs (id, action, details, timestamp) VALUES (?, ?, ?, ?)').run(
        `log_${Date.now()}`,
        'LEDGER_VERIFIED',
        `Cryptographic audit completed. Status: ${result.is_valid ? 'VALID' : 'COMPROMISED'}. Total blocks: ${result.total_blocks}`,
        new Date().toISOString()
      );
    }

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Verify Single Block
app.get('/api/ledger/blocks/:id/verify', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const block = db.prepare('SELECT * FROM ledger_blocks WHERE block_id = ?').get(id) as any;
    if (!block) {
      return res.status(404).json({ error: 'Block not found' });
    }

    const computedDataHash = sha256Hex(block.canonical_data);
    const dataHashValid = computedDataHash === block.data_hash;

    let prevHashValid = true;
    if (block.block_index > 0) {
      const prevBlock = db.prepare('SELECT block_hash FROM ledger_blocks WHERE block_index = ?').get(block.block_index - 1) as any;
      prevHashValid = prevBlock && block.prev_hash === prevBlock.block_hash;
    } else {
      prevHashValid = block.prev_hash === '0'.repeat(64);
    }

    const computedBlockHash = sha256Hex(
      `${block.block_index}:${block.timestamp}:${block.prev_hash}:${computedDataHash}`
    );
    const blockHashValid = computedBlockHash === block.block_hash;

    const isValid = dataHashValid && prevHashValid && blockHashValid;

    res.json({
      block_id: block.block_id,
      block_index: block.block_index,
      is_valid: isValid,
      data_hash_valid: dataHashValid,
      prev_hash_valid: prevHashValid,
      block_hash_valid: blockHashValid,
      computed_data_hash: computedDataHash,
      recorded_data_hash: block.data_hash,
      computed_block_hash: computedBlockHash,
      recorded_block_hash: block.block_hash,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Isolated Tamper Sandbox Endpoints (Requirement #9) ---
// Initialize / Clone sandbox from live ledger
app.post('/api/sandbox/init', (req: Request, res: Response) => {
  try {
    const liveBlocks = getLiveBlocks();
    sandboxState = {
      is_active: true,
      blocks: JSON.parse(JSON.stringify(liveBlocks)),
      tampered_block_index: null,
      tamper_type: null,
    };
    res.json({
      success: true,
      message: 'Sandbox cloned successfully from live ledger',
      total_blocks: sandboxState.blocks.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Tamper with Sandbox Block (Payload modification or broken hash link)
app.post('/api/sandbox/tamper', (req: Request, res: Response) => {
  try {
    if (!sandboxState.is_active || sandboxState.blocks.length < 2) {
      const liveBlocks = getLiveBlocks();
      sandboxState = {
        is_active: true,
        blocks: JSON.parse(JSON.stringify(liveBlocks)),
        tampered_block_index: null,
        tamper_type: null,
      };
    }

    const { block_index, tamper_type } = req.body;
    // Default to block 1 or specified block
    const targetIdx = block_index !== undefined ? Number(block_index) : 1;
    const targetBlock = sandboxState.blocks.find(b => b.block_index === targetIdx);

    if (!targetBlock) {
      return res.status(404).json({ error: `Block with index ${targetIdx} not found in sandbox.` });
    }

    if (tamper_type === 'sever_previous_hash') {
      // Invalidate previous hash pointer
      targetBlock.prev_hash = 'deadbeef' + targetBlock.prev_hash.slice(8);
      targetBlock.is_tampered_flag = 1;
      sandboxState.tampered_block_index = targetIdx;
      sandboxState.tamper_type = 'sever_previous_hash';
    } else if (tamper_type === 'forge_block_hash') {
      // Direct forgery of block hash
      targetBlock.block_hash = 'badc0de' + targetBlock.block_hash.slice(7);
      targetBlock.is_tampered_flag = 1;
      sandboxState.tampered_block_index = targetIdx;
      sandboxState.tamper_type = 'forge_block_hash';
    } else {
      // Alter canonical payload (e.g. changing IP or severity)
      try {
        const parsed = JSON.parse(targetBlock.canonical_data);
        parsed.source_label = 'FORGED_ATTACKER_IP_127.0.0.1 (Tampered Record)';
        parsed.severity = 'low'; // Attacker downgraded severity
        targetBlock.canonical_data = canonicalJsonStringify(parsed);
      } catch {
        targetBlock.canonical_data = targetBlock.canonical_data + '_TAMPERED';
      }
      targetBlock.is_tampered_flag = 1;
      sandboxState.tampered_block_index = targetIdx;
      sandboxState.tamper_type = 'alter_payload';
    }

    res.json({
      success: true,
      message: `Simulated tamper applied to Sandbox Block #${targetIdx} (${sandboxState.tamper_type}). Live database remains 100% pristine.`,
      tampered_block: targetBlock,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Reset Sandbox
app.post('/api/sandbox/reset', (req: Request, res: Response) => {
  try {
    const liveBlocks = getLiveBlocks();
    sandboxState = {
      is_active: false,
      blocks: JSON.parse(JSON.stringify(liveBlocks)),
      tampered_block_index: null,
      tamper_type: null,
    };
    res.json({ success: true, message: 'Sandbox reset to live untampered ledger.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Reports & Timeline API
app.get('/api/reports/summary', (req: Request, res: Response) => {
  try {
    const { start_date, end_date } = req.query;
    let query = 'SELECT * FROM security_events WHERE 1=1';
    const params: any[] = [];

    if (start_date) {
      query += ' AND timestamp >= ?';
      params.push(start_date);
    }
    if (end_date) {
      query += ' AND timestamp <= ?';
      params.push(end_date);
    }

    query += ' ORDER BY timestamp ASC';
    const events = db.prepare(query).all(...params) as any[];

    const totalEvents = events.length;
    const severityCount: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
    const assetActivity: Record<string, { name: string; count: number }> = {};
    const outcomeCount: Record<string, number> = { unreviewed: 0, investigating: 0, investigated: 0, resolved: 0 };

    for (const ev of events) {
      severityCount[ev.severity] = (severityCount[ev.severity] || 0) + 1;
      outcomeCount[ev.investigation_status] = (outcomeCount[ev.investigation_status] || 0) + 1;
      if (!assetActivity[ev.asset_id]) {
        assetActivity[ev.asset_id] = { name: ev.asset_name, count: 0 };
      }
      assetActivity[ev.asset_id].count++;
    }

    const ledgerVerify = verifyChain(getLiveBlocks());

    res.json({
      generated_at: new Date().toISOString(),
      date_range: { start: start_date || 'All Time', end: end_date || 'Present' },
      total_events: totalEvents,
      severity_distribution: severityCount,
      asset_activity: Object.values(assetActivity),
      investigation_outcomes: outcomeCount,
      ledger_integrity: {
        is_valid: ledgerVerify.is_valid,
        total_blocks: ledgerVerify.total_blocks,
        status: ledgerVerify.is_valid ? 'Cryptographically Verified (Untampered)' : 'Discrepancy Detected',
      },
      events,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// CSV Export Endpoint
app.get('/api/reports/export-csv', (req: Request, res: Response) => {
  try {
    const events = db.prepare('SELECT * FROM security_events ORDER BY timestamp DESC').all() as any[];

    const headers = [
      'Event ID',
      'Timestamp (ISO)',
      'Asset Name',
      'Asset Type',
      'Event Type',
      'Severity',
      'Investigation Status',
      'Source Label',
      'Payload Preview',
      'Ledger Block ID',
      'Is Simulated',
    ];

    const rows = events.map(e => [
      e.id,
      e.timestamp,
      `"${(e.asset_name || '').replace(/"/g, '""')}"`,
      e.asset_type,
      e.event_type,
      e.severity,
      e.investigation_status,
      `"${(e.source_label || '').replace(/"/g, '""')}"`,
      `"${(e.payload_preview || '').replace(/"/g, '""')}"`,
      e.ledger_block_id || 'None',
      e.is_simulated ? 'SIMULATED' : 'REAL',
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="decoytrace-audit-export-${Date.now()}.csv"`);
    res.send(csvContent);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Incident Timeline API
app.get('/api/timeline', (req: Request, res: Response) => {
  try {
    const events = db.prepare('SELECT * FROM security_events ORDER BY timestamp DESC LIMIT 50').all() as any[];
    const notes = db.prepare('SELECT * FROM investigation_notes ORDER BY timestamp DESC LIMIT 50').all() as any[];
    const logs = db.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 50').all() as any[];

    const timelineItems: any[] = [];

    for (const e of events) {
      timelineItems.push({
        id: `tl_evt_${e.id}`,
        type: 'event_detected',
        title: `Decoy Tripwire Tripped: ${e.event_type}`,
        timestamp: e.timestamp,
        severity: e.severity,
        reference_id: e.id,
        summary: `${e.asset_name} recorded suspicious interaction from ${e.source_label}.`,
        ledger_block_id: e.ledger_block_id,
      });

      if (e.investigation_status === 'resolved') {
        timelineItems.push({
          id: `tl_res_${e.id}`,
          type: 'incident_resolved',
          title: `Incident Resolved: ${e.id}`,
          timestamp: e.timestamp, // or status change timestamp
          severity: 'low',
          reference_id: e.id,
          summary: `Remediation verified and incident closed for ${e.asset_name}.`,
          ledger_block_id: e.ledger_block_id,
        });
      }
    }

    for (const n of notes) {
      timelineItems.push({
        id: `tl_note_${n.id}`,
        type: 'note_added',
        title: `Forensic Note by ${n.author}`,
        timestamp: n.timestamp,
        severity: 'medium',
        reference_id: n.event_id,
        summary: n.note,
      });
    }

    for (const l of logs) {
      if (l.action === 'LEDGER_VERIFIED' || l.action === 'LEDGER_GENESIS_INITIALIZED') {
        timelineItems.push({
          id: `tl_log_${l.id}`,
          type: 'ledger_audit',
          title: `Integrity Audit: ${l.action}`,
          timestamp: l.timestamp,
          severity: 'low',
          summary: l.details,
        });
      }
    }

    // Sort descending by timestamp
    timelineItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.json(timelineItems);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Server Lifecycle & Vite Mounting ---

const PORT = parseInt(process.env.PORT || '3000', 10);

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DecoyTrace] Server running on port ${PORT} (NODE_ENV=${process.env.NODE_ENV || 'development'})`);
  });
}

startServer().catch(err => {
  console.error('[DecoyTrace] Server initialization error:', err);
  process.exit(1);
});
