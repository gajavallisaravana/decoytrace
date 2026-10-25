import React from 'react';
import { motion } from 'motion/react';
import { 
  Shield, 
  Target, 
  Zap, 
  Link as LinkIcon, 
  AlertCircle,
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  Cpu, 
  Activity,
  Layers,
  Sparkles,
  Search
} from 'lucide-react';
import { NavTab } from './Navigation';
import { Hero3DShield } from './Hero3DShield';

interface LandingPageProps {
  onLaunchConsole: (tab?: NavTab) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchConsole }) => {
  return (
    <div className="relative min-h-screen text-[#FFF8F1] overflow-hidden">
      
      {/* Hero Section */}
      <section className="relative pt-10 pb-16 md:pt-16 md:pb-24 px-6 sm:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Headline and Call to Actions */}
          <div className="lg:col-span-7 space-y-6 z-10">
            
            {/* Step 1: Logo & Tagline Pill */}
            <motion.div 
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#2B1B13]/70 border border-[rgba(255,170,100,0.32)] backdrop-blur-md text-xs font-semibold uppercase tracking-widest text-[#FF873D] shadow-[0_0_20px_rgba(255,135,61,0.25)]"
            >
              <div className="w-5 h-5 rounded-full bg-[#FF873D] flex items-center justify-center text-[#15120F] shadow-sm">
                <Shield className="w-3 h-3 fill-current" />
              </div>
              <span className="font-bold tracking-wider text-[#FFF8F1]">DecoyTrace</span>
              <span className="text-[#FFB45E]/60">·</span>
              <span className="text-[#D0BFB0]">Deceive · Detect · Defend</span>
            </motion.div>

            {/* Step 2: Headline Animation */}
            <motion.h1 
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12] text-balance"
            >
              See threats before they become{' '}
              <span className="text-orange-gradient drop-shadow-[0_0_30px_rgba(255,135,61,0.45)]">
                risks.
              </span>
            </motion.h1>

            {/* Step 3: Supporting Description Animation */}
            <motion.p 
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="text-base sm:text-lg text-[#D0BFB0] max-w-2xl leading-relaxed"
            >
              DecoyTrace deploys simulated cyber deception tripwires across your infrastructure, intercepts unauthorized reconnaissance safely, and anchors forensic records into an immutable, SHA-256 hash-linked blockchain ledger.
            </motion.p>

            {/* Step 4: CTA Buttons Stagger */}
            <motion.div 
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <button
                onClick={() => onLaunchConsole('overview')}
                className="px-6 py-3.5 text-sm font-bold rounded-xl glass-button-primary flex items-center gap-2 group cursor-pointer shadow-lg"
              >
                <span>Launch Security Console</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => onLaunchConsole('simulation')}
                className="px-6 py-3.5 text-sm font-semibold rounded-xl glass-button-secondary flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#FF873D]" />
                <span>Explore Features</span>
              </button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.6 }}
              className="pt-3 flex flex-wrap items-center gap-6 text-xs text-[#D0BFB0]"
            >
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#FF873D]" />
                <span>Deterministic SHA-256 Chaining</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#FF873D]" />
                <span>Isolated Cyber Threat Lab</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#FF873D]" />
                <span>Tamper-Detection Sandbox</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Cinematic 3D Cyber Shield */}
          <motion.div 
            initial={{ opacity: 0, filter: 'blur(10px)', scale: 0.94 }}
            animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
            transition={{ delay: 0.25, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative flex items-center justify-center"
          >
            <div className="relative w-full aspect-[4/3] rounded-3xl p-2.5 glass-panel-glow shadow-[0_0_60px_rgba(255,135,61,0.25)] overflow-hidden">
              {/* Interactive 3D Canvas */}
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gradient-to-b from-[#2B1B13]/75 via-[#15120F]/90 to-[#15120F] flex items-center justify-center">
                <Hero3DShield />

                {/* Floating telemetry chips */}
                <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-[#15120F]/85 backdrop-blur-md border border-[rgba(255,170,100,0.35)] text-[#FF873D] text-xs font-mono flex items-center gap-2 shadow-[0_0_20px_rgba(255,135,61,0.25)]">
                  <span className="w-2 h-2 rounded-full bg-[#FF873D] animate-pulse" />
                  <span>DECOY_GRID: ARMED</span>
                </div>

                <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-[#15120F]/85 backdrop-blur-md border border-[#CDD2D8]/30 text-[#CDD2D8] text-xs font-mono shadow-sm">
                  LEDGER: SHA-256 SEALED
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Lower Section: 4 Compact Frosted-Glass Feature Cards */}
        <div className="mt-16 pt-12 border-t border-[rgba(255,170,100,0.22)]">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs uppercase tracking-widest text-[#FF873D] font-bold">
              Integrated Cyber Modules
            </span>
            <span className="text-xs text-[#D0BFB0]">
              Click any module to inspect in Console
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Decoy Assets */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              onClick={() => onLaunchConsole('assets')}
              className="p-5 rounded-2xl glass-panel glass-card-hover cursor-pointer space-y-2.5 border-[rgba(255,170,100,0.28)] group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#FF873D]/15 border border-[#FF873D]/35 flex items-center justify-center text-[#FF873D] group-hover:scale-110 transition-transform shadow-[0_0_12px_rgba(255,135,61,0.25)]">
                <Target className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-[#FFB45E] transition-colors">
                Decoy Assets
              </h3>
              <p className="text-xs text-[#D0BFB0] leading-relaxed">
                Deploy simulated honey-traps, mock API routes, and AWS canary secrets to steer adversary reconnaissance away from production.
              </p>
            </motion.div>

            {/* Card 2: Threat Simulation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              onClick={() => onLaunchConsole('simulation')}
              className="p-5 rounded-2xl glass-panel glass-card-hover cursor-pointer space-y-2.5 border-[rgba(255,170,100,0.28)] group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#FFB45E]/15 border border-[#FFB45E]/35 flex items-center justify-center text-[#FFB45E] group-hover:scale-110 transition-transform shadow-[0_0_12px_rgba(255,180,94,0.25)]">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-[#FFB45E] transition-colors">
                Threat Simulation
              </h3>
              <p className="text-xs text-[#D0BFB0] leading-relaxed">
                Execute controlled multi-phase adversary attack scenarios (credential stuffing, canary leaks, API fuzzing) safely.
              </p>
            </motion.div>

            {/* Card 3: Security Events */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              onClick={() => onLaunchConsole('events')}
              className="p-5 rounded-2xl glass-panel glass-card-hover cursor-pointer space-y-2.5 border-[rgba(255,170,100,0.28)] group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#F43F5E]/15 border border-[#F43F5E]/35 flex items-center justify-center text-[#F43F5E] group-hover:scale-110 transition-transform shadow-[0_0_12px_rgba(244,63,94,0.25)]">
                <AlertCircle className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-[#F43F5E] transition-colors">
                Security Events
              </h3>
              <p className="text-xs text-[#D0BFB0] leading-relaxed">
                Triage captured tripwire alarms with severity rationale, payload inspect slide-out drawer, and analyst notes.
              </p>
            </motion.div>

            {/* Card 4: Integrity Ledger */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
              onClick={() => onLaunchConsole('ledger')}
              className="p-5 rounded-2xl glass-panel glass-card-hover cursor-pointer space-y-2.5 border-[rgba(255,170,100,0.28)] group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#FF873D]/15 border border-[#FF873D]/35 flex items-center justify-center text-[#FF873D] group-hover:scale-110 transition-transform shadow-[0_0_12px_rgba(255,135,61,0.25)]">
                <LinkIcon className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-[#FF873D] transition-colors">
                Integrity Ledger
              </h3>
              <p className="text-xs text-[#D0BFB0] leading-relaxed">
                Audit cryptographic SHA-256 chain continuity and test tamper detection in an isolated disposable sandbox.
              </p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20 px-6 sm:px-12 max-w-7xl mx-auto border-t border-[rgba(255,170,100,0.22)]">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest text-[#FF873D] font-bold">Forensic Pipeline</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2 tracking-tight">
            How DecoyTrace operates in depth.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl glass-panel space-y-3">
            <div className="text-2xl font-bold font-mono text-[#FF873D]">01</div>
            <h4 className="font-semibold text-base text-white">Deploy Traps</h4>
            <p className="text-xs text-[#D0BFB0] leading-relaxed">
              Place simulated lures such as <code className="bg-[#2B1B13] text-[#FFB45E] px-1 py-0.5 rounded font-mono border border-[rgba(255,170,100,0.22)]">/.env.staging</code> in strategic locations.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel space-y-3">
            <div className="text-2xl font-bold font-mono text-[#FFB45E]">02</div>
            <h4 className="font-semibold text-base text-white">Capture Incursions</h4>
            <p className="text-xs text-[#D0BFB0] leading-relaxed">
              Adversary probes trigger immediate alarms without risking genuine databases or real production accounts.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel space-y-3">
            <div className="text-2xl font-bold font-mono text-[#CDD2D8]">03</div>
            <h4 className="font-semibold text-base text-white">Cryptographic Seal</h4>
            <p className="text-xs text-[#D0BFB0] leading-relaxed">
              Every event is serialized deterministically and anchored to a SHA-256 block linked directly to Genesis.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel space-y-3">
            <div className="text-2xl font-bold font-mono text-[#FF873D]">04</div>
            <h4 className="font-semibold text-base text-white">Verifiable Proof</h4>
            <p className="text-xs text-[#D0BFB0] leading-relaxed">
              Audit the chain with 1-click verification. Any retroactive alteration is mathematically detected.
            </p>
          </div>
        </div>
      </section>

      {/* Cryptographic Architecture Callout */}
      <section className="py-16 px-6 sm:px-12 max-w-5xl mx-auto text-center">
        <div className="p-10 rounded-3xl glass-panel-glow border border-[rgba(255,170,100,0.35)] space-y-6">
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Experience Cyber Deception & Cryptographic Proof
          </h2>
          <p className="text-sm text-[#D0BFB0] max-w-xl mx-auto leading-relaxed">
            Jump into the security console to inspect pre-seeded decoy assets, trigger automated threat scenarios, and experiment with the tamper sandbox.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => onLaunchConsole('overview')}
              className="px-6 py-3.5 text-sm font-bold rounded-xl glass-button-primary flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <span>Launch Security Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onLaunchConsole('settings')}
              className="px-6 py-3.5 text-sm font-semibold rounded-xl glass-button-secondary cursor-pointer"
            >
              <span>Test Tamper Sandbox</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 sm:px-12 border-t border-[rgba(255,170,100,0.22)] text-xs text-[#A3ABB3] max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#2B1B13] border border-[#FF873D]/40 flex items-center justify-center text-[#FF873D]">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-white">DecoyTrace</span>
          <span>·</span>
          <span>Cyber Deception & Incident Integrity Ledger</span>
        </div>
        <div className="flex items-center gap-6">
          <span>Local SQLite Storage</span>
          <span>·</span>
          <span>SHA-256 Verifiable Chain</span>
          <span>·</span>
          <span>Educational & Lab Edition</span>
        </div>
      </footer>
    </div>
  );
};
