# DecoyTrace

> **Deceive. Detect. Defend.**
> A Futuristic 3D Cyber Deception and Blockchain-Inspired Incident Integrity Ledger Platform.

---

## 1. Executive Overview

**DecoyTrace** is an incident-integrity and cyber deception platform built for students, security analysts, educational labs, and defense teams.

It demonstrates how suspicious interactions with safe, simulated decoy assets (honey-portals, mock APIs, canary secrets, and trap endpoints) can be recorded, triaged, and verified using a **SHA-256 hash-linked, append-only incident ledger**.

### Key Architectural Tenets
- **Interactive 3D Glass Hero:** A procedural Three.js translucent frosted glass shield with an inner cyber crest, orbital glass cubes with glowing cyan cores, connecting lines, and mouse-parallax damping.
- **Ice-Blue & Silver Glassmorphism:** A light-mode design system utilizing `#F7FAFD` canvas, `#DFF4FC` ice-blue, `rgba(223, 244, 252, 0.48)` pale blue glass, `#E4EAF0` silver mist, `#24384C` primary text, and `#62C8E8` cyan accents.
- **Smooth Entrance Animation Sequence:** Coordinated entrance via Motion (logo fade, headline slide, description fade, CTA stagger, hero blur-to-sharp transition, and scroll-triggered card reveals).
- **Safe Cyber Deception:** Decoy assets mimic realistic internal services (e.g., HoneySQL admin consoles, AWS STS canary keys, mock wire transfer endpoints) without exposing live systems or real credentials.
- **Append-Only Hash-Linked Ledger:** Every captured incident is canonicalized with deterministic sorted JSON serialization and committed to an append-only SHA-256 chain linked back to the Genesis Root.
- **Tamper Detection Demonstration Lab:** An isolated sandbox engine that lets analysts simulate payload tampering or severed hash links to prove DecoyTrace's mathematical validation halts and pinpoints the corrupted block.

---

## 2. Core Modules

| Module | Purpose |
| :--- | :--- |
| **Landing Page** | Futuristic introduction with 3D glass shield, coordinated entrance sequence, interactive topology preview, and architectural overview. |
| **Dashboard Overview** | Real-time security metrics derived from backend SQLite database, severity distribution, recent alerts, and live network graph. |
| **Decoy Asset Manager** | Full CRUD configuration of simulated honeypots with risk classifications (`low`, `medium`, `high`, `critical`) and endpoint toggling. |
| **Threat Simulation Engine** | Interactive multi-phase simulation of Credential Stuffing, Canary Secret Extraction, and API Fuzzing with live SVG packet animations. |
| **Security Event Triage** | Comprehensive alert management with search, severity filtering, status workflows (`unreviewed`, `investigating`, `investigated`, `resolved`), and forensic notes. |
| **Incident Timeline** | Chronological audit trail correlating detection triggers, analyst notes, integrity blocks, and containment actions. |
| **Integrity Ledger** | Visual chain explorer, Genesis anchor verification, individual block auditing, and full-chain verification. |
| **Tamper Detection Sandbox** | Disposable testbed to inject payload modifications or severed block hashes without impacting the genuine database. |
| **Reports & Export** | Structured CSV audit log export and printable formal forensic audit certificate. |

---

## 3. Technology Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Motion (Framer Motion), Three.js, Lucide React.
- **Backend:** Node.js 22, Express, TypeScript (`tsx`).
- **Persistence:** SQLite (`node:sqlite` DatabaseSync) in WAL mode for persistent, ACID-compliant local transactions.
- **Cryptography:** Node.js `node:crypto` SHA-256 hashing with deterministic canonical JSON serialization.

---

## 4. Getting Started & Development

### Installation
```bash
npm install
```

### Starting the Server
Start the unified full-stack dev server (Express backend + Vite frontend middleware on port 3000):
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Persistent Database
The database is automatically provisioned and seeded on first run in `./data/decoytrace.db`.
If you wish to reset to the factory demo seed, delete `./data/decoytrace.db` and restart the server.
