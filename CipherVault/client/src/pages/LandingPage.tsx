/**
 * CipherVault — Landing Page (Aligned with Actual Project)
 * ══════════════════════════════════════════════════════════
 * Content updated to reflect what's actually built:
 *  - AES-256-GCM / CBC / ChaCha20-Poly1305 encryption
 *  - PBKDF2 key derivation (600k iterations)
 *  - SHA-256 integrity hashing
 *  - File versioning & snapshotting
 *  - Intrusion Detection System (IDS)
 *  - File locking / concurrency (mutual exclusion)
 *  - Secure sharing with TTL & passphrase
 *  - Ransomware resilience via versioning
 *  - Flask + SQLAlchemy backend
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  motion, AnimatePresence, useScroll, useTransform,
  useMotionValue, useSpring, animate,
} from 'framer-motion';
import toast from 'react-hot-toast';
import {
  HiOutlineShieldCheck, HiOutlineLockClosed, HiOutlineUser,
  HiOutlineCpuChip, HiOutlineBugAnt, HiOutlineArrowDownCircle,
  HiOutlineArrowRight, HiOutlineArrowPath, HiOutlineKey,
  HiOutlineDocumentText, HiOutlineEye, HiOutlineEyeSlash,
  HiOutlineChevronRight, HiOutlineChevronLeft, HiOutlineFingerPrint,
  HiOutlineCommandLine, HiOutlineSignal, HiOutlineFolder,
  HiOutlineShare, HiOutlineBeaker,
  HiOutlineCheckCircle, HiOutlineClock, HiOutlineTrash,
  HiOutlineLink, HiOutlineServer, HiOutlineArchiveBox,
  HiOutlineNoSymbol, HiOutlineCircleStack,
  HiOutlineSpeakerWave, HiOutlineSpeakerXMark,
} from 'react-icons/hi2';

/* ─── CONSTANTS ─────────────────────────────────────────────────────────── */

const OS_STEPS = [
  { id: 1, title: 'User Application', desc: 'React frontend initiates an encryption request. User selects cipher algorithm and provides passphrase.', sub: 'Interface: React/Axios', icon: HiOutlineUser, color: '#00ff88', ring: 'RING 3' },
  { id: 2, title: 'System Call', desc: 'Request transitions from User Mode to Kernel Mode. JWT token is verified before privilege escalation.', sub: 'Vector: syscall/0x80', icon: HiOutlineCpuChip, color: '#00b8ff', ring: 'RING 2', isTransition: true },
  { id: 3, title: 'Flask Kernel', desc: 'Flask backend manages key derivation via PBKDF2 (600k iterations), applies chosen cipher, and computes SHA-256 integrity hash.', sub: 'Control: Python/Flask', icon: HiOutlineShieldCheck, color: '#7000ff', ring: 'RING 1' },
  { id: 4, title: 'SQLite Storage', desc: 'Encrypted ciphertext + metadata written to SQLAlchemy-managed SQLite. File lock released after atomic write.', sub: 'Physical: SQLAlchemy/SQLite', icon: HiOutlineLockClosed, color: '#ff3366', ring: 'RING 0' },
];

const INITIAL_FILES = [
  { name: 'config.sys', encrypted: false, content: 'SYSTEM_SETTINGS: ENABLE_CRYPT=1', size: '4.2 KB', type: 'SYS' },
  { name: 'user_vault.db', encrypted: false, content: 'SQLITE_HEADER: KEY_INDEX_043', size: '128 KB', type: 'DB' },
  { name: 'secrets.txt', encrypted: false, content: 'PASS: hunter2', size: '1.1 KB', type: 'TXT' },
];

const BOOT_LINES = [
  'BIOS v2.4.1 — CipherVault Systems',
  'Verifying secure boot chain... OK',
  'Initializing PBKDF2 key derivation (600k iterations)...',
  'Loading cipher modules: [AES-256-GCM] [AES-256-CBC] [ChaCha20-Poly1305]',
  'Mounting SQLAlchemy encrypted filesystem... OK',
  'SHA-256 integrity ledger: VERIFIED',
  'Starting Flask IDS engine + background scheduler...',
  '> CIPHERVAULT OS DEFENDER — READY',
];

// Aligned with what's actually implemented per the README
const FEATURES = [
  {
    id: 'crypto',
    icon: HiOutlineBeaker,
    label: 'Multi-Algorithm Encryption',
    color: '#00ff88',
    tagline: 'Three Ciphers. One Vault.',
    desc: 'Choose from AES-256-GCM (authenticated), AES-256-CBC (classic block), or ChaCha20-Poly1305 (high-performance stream). All keys derived via PBKDF2 with 600,000 iterations to resist brute-force.',
    specs: ['AES-256-GCM', 'AES-256-CBC', 'ChaCha20-Poly1305', 'PBKDF2 / 600k iters'],
    visual: 'cipher',
  },
  {
    id: 'integrity',
    icon: HiOutlineCircleStack,
    label: 'SHA-256 Integrity',
    color: '#00b8ff',
    tagline: 'Tamper-Evident. Always.',
    desc: 'Every stored file is hashed with SHA-256. On retrieval the hash is recomputed and compared. Any tampering — even a single flipped bit — is detected and flagged immediately.',
    specs: ['SHA-256 Hashing', 'On-Read Verification', 'Tamper Detection', 'Integrity Audit Log'],
    visual: 'integrity',
  },
  {
    id: 'versioning',
    icon: HiOutlineArchiveBox,
    label: 'File Versioning & Snapshots',
    color: '#a855f7',
    tagline: 'Undo Anything. Survive Everything.',
    desc: 'Automatic snapshot before every write. Browse full version history, diff across snapshots, and restore any prior state in one click — the primary defence against ransomware and accidental corruption.',
    specs: ['Auto-Snapshot on Write', 'Full Version History', 'One-Click Restore', 'Ransomware Recovery'],
    visual: 'versioning',
  },
  {
    id: 'ids',
    icon: HiOutlineEye,
    label: 'Intrusion Detection System',
    color: '#f59e0b',
    tagline: 'Live Threat Intelligence.',
    desc: 'Real-time audit trail with terminal-style feed. Failed logins, suspicious access patterns, and policy violations are logged, timestamped, and surfaced on the Security Timeline.',
    specs: ['Failed Login Tracking', 'Security Timeline', 'Anomaly Alerts', 'Centralized Audit Log'],
    visual: 'ids',
  },
  {
    id: 'locking',
    icon: HiOutlineNoSymbol,
    label: 'File Locking & Concurrency',
    color: '#ff3366',
    tagline: 'Mutual Exclusion. No Race Conditions.',
    desc: 'OS-level mutual exclusion on every file operation. Concurrent access attempts are queued and serialised — demonstrating real process scheduling and resource synchronisation principles.',
    specs: ['Mutual Exclusion', 'Race Condition Prevention', 'Queue-Based Scheduling', 'Deadlock Detection'],
    visual: 'locking',
  },
  {
    id: 'share',
    icon: HiOutlineShare,
    label: 'Secure Governed Sharing',
    color: '#06b6d4',
    tagline: 'TTL Tokens. Dual-Lock Protocol.',
    desc: 'Generate time-limited share links with optional second passphrase. Background scheduler auto-expires stale tokens. Every share and access event is captured in the end-to-end audit log.',
    specs: ['Custom TTL Expiry', 'Passphrase Lock', 'Background Cleanup', 'Download Audit'],
    visual: 'share',
  },
];

const loginSchema = z.object({
  username: z.string().min(1, 'Identity required'),
  password: z.string().min(1, 'Passcode required'),
});
type LoginFormData = z.infer<typeof loginSchema>;

/* ─── HOOKS ─────────────────────────────────────────────────────────────── */

function useMouseParallax(strength = 20) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const smoothX = useSpring(x, { stiffness: 60, damping: 20 });
  const smoothY = useSpring(y, { stiffness: 60, damping: 20 });
  useEffect(() => {
    const h = (e: MouseEvent) => {
      x.set((e.clientX / window.innerWidth - 0.5) * strength);
      y.set((e.clientY / window.innerHeight - 0.5) * strength);
    };
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, [strength, x, y]);
  return { x: smoothX, y: smoothY };
}

function useTypewriter(lines: string[], speed = 28, startDelay = 0) {
  const [displayed, setDisplayed] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      await new Promise(r => setTimeout(r, startDelay));
      for (const line of lines) {
        if (cancelled) return;
        let current = '';
        setDisplayed(prev => [...prev, '']);
        for (const ch of line) {
          if (cancelled) return;
          current += ch;
          setDisplayed(prev => [...prev.slice(0, -1), current]);
          await new Promise(r => setTimeout(r, speed));
        }
        await new Promise(r => setTimeout(r, 100));
      }
      setDone(true);
    };
    run();
    return () => { cancelled = true; };
  }, []);
  return { displayed, done };
}

function usePulse(ms = 4000) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const id = setInterval(() => { setOn(true); setTimeout(() => setOn(false), 600); }, ms);
    return () => clearInterval(id);
  }, [ms]);
  return on;
}

/* ─── AMBIENT / STRUCTURAL COMPONENTS ───────────────────────────────────── */

const ease = [0.16, 1, 0.3, 1] as const;

const GlowOrb = ({ color, size, x, y, blur = 140 }: { color: string; size: number; x: string; y: string; blur?: number }) => (
  <div className="absolute rounded-full pointer-events-none" style={{
    width: size, height: size, left: x, top: y,
    background: color, filter: `blur(${blur}px)`, opacity: 0.12,
    transform: 'translate(-50%,-50%)',
  }} />
);

const ScanLine = () => (
  <motion.div
    className="fixed inset-x-0 h-[1.5px] pointer-events-none z-50"
    style={{ background: 'linear-gradient(90deg,transparent,rgba(0,255,136,0.25),transparent)' }}
    animate={{ y: ['0vh', '100vh'] }}
    transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
  />
);

const GridBg = () => (
  <div className="fixed inset-0 pointer-events-none z-0">
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="opacity-[0.035]">
      <defs>
        <pattern id="cgrid" width="56" height="56" patternUnits="userSpaceOnUse">
          <path d="M56 0L0 0 0 56" fill="none" stroke="#00ff88" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#cgrid)" />
    </svg>
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#050810_100%)]" />
  </div>
);

const KernelPulse = () => {
  const pulse = usePulse(2800);
  return (
    <motion.div
      className="fixed bottom-8 right-8 pointer-events-none z-40 flex items-center gap-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 3.5 }}
    >
      {[0, 0.25, 0.5].map((d, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-[#00ff88]"
          animate={{ height: [3, 14, 3], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: d, ease: 'easeInOut' }}
        />
      ))}
      <motion.span
        className="text-[8px] text-[#00ff88]/40 font-mono tracking-[0.3em] uppercase ml-1"
        animate={{ opacity: pulse ? 0.8 : 0.3 }}
      >FLASK_CORE ACTIVE</motion.span>
    </motion.div>
  );
};

const FloatingParticle = ({ delay, depth, startX, startY }: { delay: number; depth: number; startX: number; startY: number }) => {
  const size = depth === 1 ? 1 : depth === 2 ? 1.5 : 2.5;
  const op = depth * 0.08;
  return (
    <motion.div
      className="absolute rounded-full bg-[#00ff88]"
      style={{ width: size, height: size, left: `${startX}%`, top: `${startY}%`, opacity: op }}
      animate={{ y: [0, -50 * depth], opacity: [0, op, 0] }}
      transition={{ duration: 7 + delay, delay, repeat: Infinity, ease: 'linear' }}
    />
  );
};

const DataFlowLine = ({ active, color }: { active: boolean; color: string }) => (
  <div className="hidden md:block absolute top-1/2 left-full w-full h-px z-20 -translate-y-1/2 overflow-hidden" style={{ width: '100%' }}>
    <AnimatePresence>
      {active && (
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </AnimatePresence>
  </div>
);

/* ─── BOOT SEQUENCE ─────────────────────────────────────────────────────── */

const BootSequence = ({ onComplete }: { onComplete: () => void }) => {
  const { displayed, done } = useTypewriter(BOOT_LINES, 22);
  useEffect(() => { if (done) setTimeout(onComplete, 700); }, [done, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[200] bg-[#050810] flex items-center justify-center"
      exit={{ opacity: 0, scale: 1.04, filter: 'blur(8px)' }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,136,0.015) 2px,rgba(0,255,136,0.015) 4px)' }}
      />
      <div className="max-w-lg w-full px-10 font-mono">
        <div className="flex items-center gap-3 mb-8">
          <motion.div
            className="w-8 h-8 rounded-lg bg-[#00ff88] flex items-center justify-center"
            animate={{ boxShadow: ['0 0 0px #00ff8800', '0 0 24px #00ff8880', '0 0 0px #00ff8800'] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <HiOutlineShieldCheck className="w-5 h-5 text-black" />
          </motion.div>
          <div>
            <div className="text-[10px] text-[#00ff88] font-black tracking-[0.3em] uppercase">CIPHERVAULT SYSTEMS</div>
            <div className="text-[8px] text-gray-700 tracking-[0.25em] uppercase">Secure Boot Sequence v4.2.1</div>
          </div>
        </div>

        <div className="space-y-2 mb-8">
          {displayed.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className={`text-[12px] flex items-start gap-3 ${i === displayed.length - 1 && done ? 'text-[#00ff88]' : 'text-gray-400'}`}
            >
              <span className="text-[#00ff88]/25 flex-shrink-0 mt-0.5">{'›'}</span>
              <span className="flex-1">{line}</span>
              {i === displayed.length - 1 && !done && (
                <motion.span className="inline-block w-2 h-[14px] bg-[#00ff88] ml-1"
                  animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }} />
              )}
            </motion.div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-[8px] text-gray-700 font-bold tracking-widest uppercase">
            <span>SYSTEM INTEGRITY</span>
            <span className="text-[#00ff88]">{Math.round((displayed.length / BOOT_LINES.length) * 100)}%</span>
          </div>
          <div className="h-[2px] bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg,#00ff88,#00b8ff)' }}
              animate={{ width: `${(displayed.length / BOOT_LINES.length) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ─── OS RING CARD ──────────────────────────────────────────────────────── */

const OSRingCard = ({ step, isActive, onClick }: { step: typeof OS_STEPS[0]; isActive: boolean; onClick: () => void }) => {
  const Icon = step.icon;
  return (
    <motion.div
      className="relative z-10 cursor-pointer"
      onClick={onClick}
      whileHover={{ scale: 1.03, y: -5 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
    >
      <AnimatePresence>
        {isActive && (
          <motion.div
            className="absolute -inset-3 rounded-[1.75rem] blur-2xl pointer-events-none"
            style={{ background: `${step.color}18` }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      <div
        className="relative border rounded-[1.5rem] p-7 overflow-hidden transition-all duration-500"
        style={{
          background: isActive ? `linear-gradient(135deg,${step.color}06,transparent)` : 'rgba(255,255,255,0.015)',
          borderColor: isActive ? `${step.color}60` : 'rgba(255,255,255,0.05)',
          boxShadow: isActive ? `0 0 40px ${step.color}12,inset 0 1px 0 ${step.color}15` : undefined,
          opacity: isActive ? 1 : 0.45,
        }}
      >
        <div className="absolute top-4 right-4 text-[8px] font-black tracking-[0.25em] px-2 py-1 rounded-full"
          style={{ background: `${step.color}12`, color: step.color, border: `1px solid ${step.color}25` }}>
          {step.ring}
        </div>

        <motion.div
          className="w-12 h-12 rounded-xl mb-6 flex items-center justify-center"
          style={{ background: `${step.color}12`, border: `1px solid ${step.color}25` }}
          animate={isActive ? { boxShadow: [`0 0 0px ${step.color}00`, `0 0 18px ${step.color}50`, `0 0 0px ${step.color}00`] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Icon className="w-6 h-6" style={{ color: step.color }} />
        </motion.div>

        <span className="block text-[8px] font-bold tracking-[0.25em] mb-2 uppercase" style={{ color: `${step.color}70` }}>{step.sub}</span>
        <h3 className="text-lg font-black mb-2 tracking-tight uppercase leading-none text-white">{step.title}</h3>
        <p className="text-[12px] text-gray-500 leading-relaxed">{step.desc}</p>

        {isActive && (
          <motion.div className="absolute bottom-0 left-0 h-0.5 rounded-full"
            style={{ background: `linear-gradient(90deg,transparent,${step.color},transparent)` }}
            initial={{ width: 0, left: '50%' }}
            animate={{ width: '100%', left: 0 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </div>
    </motion.div>
  );
};

/* ─── MATRIX RAIN ───────────────────────────────────────────────────────── */

const MatrixRain = () => {
  const chars = '01アイウエオカキクケコ$#@&'.split('');
  return (
    <div className="absolute inset-0 overflow-hidden opacity-[0.035] pointer-events-none select-none">
      {[...Array(14)].map((_, col) => (
        <motion.div
          key={col}
          className="absolute top-0 text-[9px] font-mono text-[#00ff88] flex flex-col gap-1"
          style={{ left: `${col * 7.5}%` }}
          animate={{ y: ['-100%', '110%'] }}
          transition={{ duration: 9 + col * 0.6, repeat: Infinity, ease: 'linear', delay: col * 0.4 }}
        >
          {[...Array(20)].map((_, r) => <span key={r}>{chars[Math.floor(Math.random() * chars.length)]}</span>)}
        </motion.div>
      ))}
    </div>
  );
};

/* ─── FILE ENTRY ────────────────────────────────────────────────────────── */

const FileEntry = ({ file, idx, isEncrypting, encryptProgress }: {
  file: typeof INITIAL_FILES[0]; idx: number; isEncrypting: boolean; encryptProgress: number;
}) => {
  const locking = isEncrypting && encryptProgress === idx;
  return (
    <motion.div
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] font-mono border transition-all ${file.encrypted ? 'bg-red-500/5 border-red-500/20' : locking ? 'bg-yellow-500/8 border-yellow-500/25' : 'bg-white/[0.02] border-white/[0.04]'}`}
      animate={locking ? { x: [0, -2, 2, 0] } : {}}
      transition={{ duration: 0.1, repeat: locking ? Infinity : 0 }}
    >
      <HiOutlineDocumentText className={`w-3.5 h-3.5 flex-shrink-0 ${file.encrypted ? 'text-red-400' : locking ? 'text-yellow-400' : 'text-gray-600'}`} />
      <span className={file.encrypted ? 'text-red-400/60 line-through' : locking ? 'text-yellow-400' : 'text-gray-500'}>{file.name}</span>
      <span className="ml-auto text-gray-700 text-[9px]">{file.size}</span>
      <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${file.encrypted ? 'bg-red-500/15 text-red-400' : locking ? 'bg-yellow-500/15 text-yellow-400 animate-pulse' : 'bg-white/5 text-gray-700'}`}>
        {file.encrypted ? 'LOCKED' : locking ? 'LOCKING...' : file.type}
      </span>
    </motion.div>
  );
};

/* ─── BIOMETRIC SCAN ─────────────────────────────────────────────────────── */

const BiometricScan = ({ scanning, success }: { scanning: boolean; success: boolean }) => (
  <div className="relative w-14 h-14 mx-auto mb-6">
    <div className={`w-full h-full rounded-2xl flex items-center justify-center transition-all duration-500 ${success ? 'bg-[#00ff88]/10 border border-[#00ff88]/40' : 'bg-white/[0.04] border border-white/10'}`}>
      <HiOutlineFingerPrint className={`w-7 h-7 transition-all duration-500 ${success ? 'text-[#00ff88]' : 'text-gray-600'}`} />
    </div>
    {scanning && !success && (
      <motion.div
        className="absolute inset-0 rounded-2xl border-2 border-[#00ff88]/50"
        animate={{ scale: [1, 1.35, 1], opacity: [0.8, 0, 0.8] }}
        transition={{ duration: 1.4, repeat: Infinity }}
      />
    )}
    {success && [0, 1, 2].map(i => (
      <motion.div key={i} className="absolute inset-0 rounded-2xl border border-[#00ff88]/25"
        initial={{ scale: 1, opacity: 0.5 }} animate={{ scale: 2.2 + i * 0.5, opacity: 0 }}
        transition={{ duration: 0.9, delay: i * 0.12 }}
      />
    ))}
  </div>
);

/* ─── FEATURE VISUALS — updated to match actual features ─────────────────── */

const CipherVisual = ({ id, color }: { id: string; color: string }) => {
  if (id === 'cipher') return (
    <div className="relative h-36 flex items-center justify-center">
      {[80, 112, 144].map((r, i) => (
        <motion.div key={i} className="absolute rounded-full border"
          style={{ width: r, height: r, borderColor: `${color}${i === 0 ? '60' : i === 1 ? '30' : '15'}` }}
          animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
          transition={{ duration: 8 + i * 4, repeat: Infinity, ease: 'linear' }}
        />
      ))}
      <div className="relative w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ background: `${color}15`, border: `1px solid ${color}40` }}>
        <HiOutlineKey className="w-6 h-6" style={{ color }} />
      </div>
      {/* Cipher algorithm labels */}
      {['AES-GCM', 'CBC', 'ChaCha20'].map((algo, i) => (
        <motion.div key={i} className="absolute text-[8px] font-mono font-bold"
          style={{ color: `${color}70`, left: `${8 + i * 32}%`, top: i % 2 === 0 ? '8%' : '78%' }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, delay: i * 0.5, repeat: Infinity }}
        >{algo}</motion.div>
      ))}
      {/* PBKDF2 label */}
      <motion.div className="absolute bottom-0 text-[8px] font-mono text-center w-full"
        style={{ color: `${color}50` }}
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}>
        PBKDF2 · 600,000 iterations
      </motion.div>
    </div>
  );

  if (id === 'integrity') return (
    <div className="relative h-36 flex flex-col gap-2 pt-2 justify-center">
      {[
        { name: 'report.pdf', hash: 'a4f8b2c1d9e0...', status: 'VALID' },
        { name: 'keys.txt', hash: '9e3d71a0f2c4...', status: 'VALID' },
        { name: 'tampered.db', hash: 'MISMATCH ✗', status: 'FAIL' },
      ].map((f, i) => (
        <motion.div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.04]"
          initial={{ x: -16, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
          transition={{ delay: i * 0.12, duration: 0.5, ease }}>
          <HiOutlineDocumentText className="w-3.5 h-3.5 flex-shrink-0" style={{ color: f.status === 'FAIL' ? '#ff3366' : color }} />
          <div className="flex-1 min-w-0">
            <div className="text-[9px] font-bold text-gray-400 truncate">{f.name}</div>
            <div className="text-[8px] font-mono text-gray-700 truncate">SHA-256: {f.hash}</div>
          </div>
          <div className="text-[8px] font-bold px-1.5 py-0.5 rounded"
            style={{ background: f.status === 'FAIL' ? '#ff336615' : `${color}15`, color: f.status === 'FAIL' ? '#ff3366' : color }}>
            {f.status}
          </div>
        </motion.div>
      ))}
    </div>
  );

  if (id === 'versioning') return (
    <div className="relative h-36 overflow-hidden">
      <div className="space-y-1.5">
        {[
          { ver: 'v3', msg: 'Current — saved 2m ago', active: true },
          { ver: 'v2', msg: 'Before edit — 1h ago', active: false },
          { ver: 'v1', msg: 'Original snapshot', active: false },
        ].map((v, i) => (
          <motion.div key={i} className="flex items-center gap-3 px-3 py-1.5 rounded-lg border transition-all"
            style={{
              background: v.active ? `${color}08` : 'rgba(255,255,255,0.02)',
              borderColor: v.active ? `${color}30` : 'rgba(255,255,255,0.04)',
            }}
            initial={{ x: -8, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.12, duration: 0.4 }}>
            <div className="text-[8px] font-black px-1.5 py-0.5 rounded" style={{ background: `${color}20`, color }}>{v.ver}</div>
            <span className="text-[9px] text-gray-500 flex-1">{v.msg}</span>
            {!v.active && (
              <span className="text-[8px] font-bold" style={{ color: `${color}70` }}>RESTORE</span>
            )}
            {v.active && <div className="w-1.5 h-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 4px ${color}` }} />}
          </motion.div>
        ))}
      </div>
      <div className="absolute bottom-0 text-[8px] font-mono text-center w-full text-gray-700 pt-1">
        Snapshot auto-triggered on every write
      </div>
    </div>
  );

  if (id === 'ids') return (
    <div className="relative h-36 overflow-hidden">
      <div className="space-y-1.5">
        {[
          { msg: 'UPLOAD: vault.db encrypted [AES-256-GCM]', t: 'success', ts: '14:32:01' },
          { msg: 'FAILED LOGIN from 192.168.1.104 (attempt 3)', t: 'danger', ts: '14:31:44' },
          { msg: 'INTEGRITY OK: report.pdf SHA-256 verified', t: 'success', ts: '14:31:02' },
          { msg: 'WARN: Repeated failed access — account flagged', t: 'danger', ts: '14:30:58' },
        ].map((l, i) => (
          <motion.div key={i} className="flex items-center gap-2 text-[9px] font-mono"
            initial={{ x: 8, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}>
            <div className={`w-1 h-1 rounded-full flex-shrink-0 ${l.t === 'success' ? 'bg-[#00ff88]' : l.t === 'danger' ? 'bg-red-400' : 'bg-[#00b8ff]'}`} />
            <span className="text-gray-600 flex-shrink-0">{l.ts}</span>
            <span className={`truncate ${l.t === 'danger' ? 'text-red-400/80' : 'text-gray-500'}`}>{l.msg}</span>
          </motion.div>
        ))}
      </div>
      <motion.div className="absolute inset-x-0 h-6 pointer-events-none"
        style={{ background: `linear-gradient(180deg,transparent,${color}08,transparent)` }}
        animate={{ y: [-24, 144] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
      />
    </div>
  );

  if (id === 'locking') return (
    <div className="relative h-36 flex flex-col gap-2 pt-1">
      {[
        { pid: 'PID_1042', file: 'vault.db', state: 'LOCKED', color: '#ff3366' },
        { pid: 'PID_1043', file: 'vault.db', state: 'QUEUED', color: '#f59e0b' },
        { pid: 'PID_1044', file: 'keys.txt', state: 'LOCKED', color: '#ff3366' },
      ].map((r, i) => (
        <motion.div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl border"
          style={{ background: `${r.color}06`, borderColor: `${r.color}20` }}
          initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          transition={{ delay: i * 0.12, duration: 0.5, ease }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${r.color}15` }}>
            <HiOutlineNoSymbol className="w-3.5 h-3.5" style={{ color: r.color }} />
          </div>
          <div className="flex-1">
            <div className="text-[9px] font-bold text-gray-400">{r.pid}</div>
            <div className="text-[8px] text-gray-600">accessing {r.file}</div>
          </div>
          <div className="text-[8px] font-bold px-2 py-0.5 rounded"
            style={{ background: `${r.color}15`, color: r.color }}>{r.state}</div>
        </motion.div>
      ))}
    </div>
  );

  if (id === 'share') return (
    <div className="relative h-36 flex flex-col gap-2 pt-1">
      <motion.div className="px-3 py-2 rounded-xl border border-white/[0.06] bg-white/[0.02]"
        initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-2 mb-1.5">
          <HiOutlineLink className="w-3.5 h-3.5" style={{ color }} />
          <span className="text-[9px] font-bold text-gray-400">Secure Token</span>
          <span className="ml-auto text-[8px] text-[#00ff88] font-bold">ACTIVE</span>
        </div>
        <div className="text-[8px] font-mono text-gray-700 truncate">cv://tk_9a2f3d8e1b5c...?ttl=3600</div>
        <div className="mt-1.5 flex items-center gap-1.5">
          <HiOutlineClock className="w-3 h-3 text-gray-700" />
          <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full" style={{ background: color }}
              initial={{ width: '100%' }}
              animate={{ width: '35%' }}
              transition={{ duration: 4, ease: 'linear' }} />
          </div>
          <span className="text-[8px] text-gray-700 font-mono">58m</span>
        </div>
      </motion.div>
      <motion.div className="px-3 py-2 rounded-xl border flex items-center gap-2"
        style={{ borderColor: `${color}20`, background: `${color}05` }}
        initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15, duration: 0.5 }}>
        <HiOutlineLockClosed className="w-3.5 h-3.5" style={{ color }} />
        <span className="text-[9px] font-bold text-gray-500">Passphrase lock + background auto-expire</span>
        <HiOutlineCheckCircle className="w-3.5 h-3.5 ml-auto text-[#00ff88]" />
      </motion.div>
    </div>
  );

  return null;
};

/* ─── FEATURE CARD ──────────────────────────────────────────────────────── */

const FeatureCard = ({ feature, index }: { feature: typeof FEATURES[0]; index: number }) => {
  const [hovered, setHovered] = useState(false);
  const Icon = feature.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: index * 0.08, duration: 0.65, ease }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -6 }}
      className="relative rounded-2xl border overflow-hidden cursor-default group"
      style={{
        background: hovered ? `linear-gradient(135deg,${feature.color}05,transparent)` : 'rgba(255,255,255,0.015)',
        borderColor: hovered ? `${feature.color}35` : 'rgba(255,255,255,0.05)',
        transition: 'border-color 0.3s, background 0.3s',
      }}
    >
      <motion.div className="absolute top-0 inset-x-0 h-px pointer-events-none"
        style={{ background: `linear-gradient(90deg,transparent,${feature.color}60,transparent)` }}
        animate={{ x: hovered ? ['0%', '100%'] : '0%' }}
        transition={{ duration: 1.5, repeat: hovered ? Infinity : 0, ease: 'linear' }}
      />

      <AnimatePresence>
        {hovered && (
          <motion.div className="absolute -inset-4 rounded-3xl blur-3xl pointer-events-none"
            style={{ background: `${feature.color}10` }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300"
            style={{
              background: `${feature.color}12`,
              border: `1px solid ${feature.color}${hovered ? '50' : '25'}`,
              boxShadow: hovered ? `0 0 16px ${feature.color}30` : 'none',
            }}>
            <Icon className="w-5 h-5 transition-all duration-300" style={{ color: feature.color }} />
          </div>
          <span className="text-[8px] font-black tracking-[0.25em] uppercase px-2 py-1 rounded-full"
            style={{ background: `${feature.color}10`, color: `${feature.color}90`, border: `1px solid ${feature.color}20` }}>
            {feature.id.toUpperCase()}
          </span>
        </div>

        <div className="text-[8px] font-bold tracking-[0.2em] uppercase mb-1" style={{ color: `${feature.color}70` }}>
          {feature.tagline}
        </div>
        <h3 className="text-base font-black tracking-tight text-white mb-2 uppercase leading-tight">{feature.label}</h3>
        <p className="text-[11px] text-gray-500 leading-relaxed mb-4">{feature.desc}</p>

        <div className="border-t border-white/[0.05] pt-4 mb-4">
          <CipherVisual id={feature.id} color={feature.color} />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {feature.specs.map(s => (
            <span key={s} className="text-[8px] font-bold px-2 py-1 rounded-lg tracking-wider"
              style={{ background: `${feature.color}08`, color: `${feature.color}70`, border: `1px solid ${feature.color}15` }}>
              {s}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

/* ─── OS CONCEPTS TABLE ──────────────────────────────────────────────────── */

const OS_CONCEPTS = [
  { concept: 'File Systems', impl: 'Encrypted persistence via SQLAlchemy/SQLite with metadata management', icon: HiOutlineServer, color: '#00ff88' },
  { concept: 'Process Scheduling', impl: 'Background cleanup threads for expired share tokens (APScheduler)', icon: HiOutlineClock, color: '#00b8ff' },
  { concept: 'Concurrency', impl: 'File locking for shared resource access — prevents race conditions', icon: HiOutlineNoSymbol, color: '#a855f7' },
  { concept: 'Observability', impl: 'Centralised audit logging + IDS security timeline', icon: HiOutlineEye, color: '#f59e0b' },
  { concept: 'Integrity', impl: 'SHA-256 hashing to detect file tampering on every read', icon: HiOutlineCheckCircle, color: '#ff3366' },
];

/* ─── MAIN COMPONENT ─────────────────────────────────────────────────────── */

export default function LandingPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [booted, setBooted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [loginShake, setLoginShake] = useState(false);
  const [biometricScan, setBiometricScan] = useState(false);

  // Audio system
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('/agerabeatz-security-225719.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.45;

    // Attempt autoplay
    const playAudio = () => {
      audioRef.current?.play().then(() => {
        setIsMusicPlaying(true);
      }).catch(() => {
        console.log('Autoplay blocked, waiting for interaction.');
      });
    };

    // Try immediately
    playAudio();

    // Interaction fallback to bypass browser blocks
    const handleFirstInteraction = () => {
      if (!isMusicPlaying) {
        playAudio();
      }
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isMusicPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {
        toast.error('System connection required.', {
          style: { background: '#080d14', color: '#00ff88', border: '1px solid #00ff8820', fontSize: '10px', fontWeight: 'bold' },
        });
      });
    }
    setIsMusicPlaying(!isMusicPlaying);
  };

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 90]);

  const { x: mouseX, y: mouseY } = useMouseParallax(18);
  const titleX = useTransform(mouseX, v => v * 0.35);
  const titleY = useTransform(mouseY, v => v * 0.35);
  const bgX = useTransform(mouseX, v => v * -0.55);
  const bgY = useTransform(mouseY, v => v * -0.55);

  const [activeStep, setActiveStep] = useState(1);
  const [autoPlay, setAutoPlay] = useState(true);
  useEffect(() => {
    if (!autoPlay) return;
    const t = setInterval(() => setActiveStep(p => p >= OS_STEPS.length ? 1 : p + 1), 3000);
    return () => clearInterval(t);
  }, [autoPlay]);

  // Ransomware sim
  type RsPhase = 'idle' | 'breach' | 'encrypting' | 'ransom' | 'recovered';
  const [rsPhase, setRsPhase] = useState<RsPhase>('idle');
  const [rsFiles, setRsFiles] = useState(INITIAL_FILES);
  const [encryptProgress, setEncryptProgress] = useState(-1);
  const [encryptPct, setEncryptPct] = useState(0);
  const [terminalLogs, setTerminalLogs] = useState<{ text: string; type: string }[]>([{ text: 'root@ciphervault:~# _', type: 'prompt' }]);
  const [commandInput, setCommandInput] = useState('');
  const [showGlitch, setShowGlitch] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  const addLog = useCallback((text: string, type = 'default') => {
    setTerminalLogs(prev => [...prev, { text, type }]);
    setTimeout(() => terminalRef.current?.scrollTo(0, terminalRef.current.scrollHeight), 50);
  }, []);

  const startAttack = async () => {
    setRsPhase('breach'); setShowGlitch(true); setEncryptPct(0);
    addLog('CRITICAL: Unauthorized access detected from 192.168.1.104', 'danger');
    addLog('IDS ALERT: 7 failed logins — threshold exceeded', 'danger');
    addLog('INTRUSION_VECTOR: Zero-day exploit CVE-2024-9821', 'danger');
    await new Promise(r => setTimeout(r, 1200));
    setShowGlitch(false); setRsPhase('encrypting');
    addLog('Bypassing file lock... MUTEX acquired by attacker', 'warn');
    addLog('Starting AES-256-XTS encryption sweep...', 'warn');
    for (let i = 0; i < INITIAL_FILES.length; i++) {
      setEncryptProgress(i);
      await animate((i / INITIAL_FILES.length) * 100, ((i + 1) / INITIAL_FILES.length) * 100, {
        duration: 0.8, onUpdate: v => setEncryptPct(v),
      });
      addLog(`LOCKED: ${INITIAL_FILES[i].name} → KEY-${Math.random().toString(16).slice(2, 10).toUpperCase()}`, 'danger');
      setRsFiles(prev => prev.map((f, idx) => idx === i ? { ...f, encrypted: true } : f));
    }
    setEncryptProgress(-1); setRsPhase('ransom');
    setShowGlitch(true); setTimeout(() => setShowGlitch(false), 800);
    addLog('!!! ALL DATA ENCRYPTED — SYSTEM LOCKDOWN !!!', 'danger');
    addLog('CipherVault snapshot v3 detected — recovery possible', 'accent');
  };

  const recoverSystem = () => {
    if (commandInput.toUpperCase() === 'CIPHERVAULT_RECOVER') {
      setRsPhase('recovered'); setShowGlitch(true);
      setTimeout(() => setShowGlitch(false), 400);
      addLog('Loading snapshot v2 from version history...', 'accent');
      addLog('Restoring files from pre-attack snapshot...', 'accent');
      addLog('SHA-256 integrity re-verified on all restored files.', 'success');
      addLog('SUCCESS: Sovereignty maintained via versioning system.', 'success');
      setRsFiles(INITIAL_FILES); setEncryptPct(0);
    } else {
      addLog(`Error: '${commandInput}' is not valid.`, 'danger');
    }
    setCommandInput('');
  };

  const resetDemo = () => {
    setRsPhase('idle'); setRsFiles(INITIAL_FILES); setEncryptProgress(-1); setEncryptPct(0);
    setTerminalLogs([{ text: 'root@ciphervault:~# _', type: 'prompt' }]);
    setCommandInput(''); setShowGlitch(false);
  };

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true); setBiometricScan(true);
    try {
      await login(data.username, data.password);
      setLoginSuccess(true);
      toast.success('Access Granted. Welcome Operative.');
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch {
      setBiometricScan(false); setLoginShake(true);
      toast.error('ACCESS DENIED: Credentials Invalid');
      setTimeout(() => setLoginShake(false), 600);
    } finally { setIsLoading(false); }
  };

  const logColor = (type: string) => ({
    danger: 'text-red-400', warn: 'text-yellow-400',
    accent: 'text-[#00b8ff]', success: 'text-[#00ff88]', prompt: 'text-gray-500',
  }[type] ?? 'text-gray-400');

  const particles = useRef(
    [...Array(28)].map(() => ({
      startX: Math.random() * 100,
      startY: Math.random() * 100,
      delay: Math.random() * 12,
      depth: (Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3,
    }))
  );

  return (
    <>
      <AnimatePresence>
        {!booted && <BootSequence onComplete={() => setBooted(true)} />}
      </AnimatePresence>

      <div className="min-h-screen bg-[#050810] text-gray-100 overflow-x-hidden" style={{ fontFamily: "'JetBrains Mono','Space Mono',monospace" }}>
        <ScanLine />
        <GridBg />
        <KernelPulse />

        <GlowOrb color="#00ff88" size={700} x="12%" y="18%" blur={160} />
        <GlowOrb color="#7000ff" size={500} x="88%" y="55%" blur={170} />
        <GlowOrb color="#00b8ff" size={400} x="50%" y="85%" blur={140} />

        <div className="fixed inset-0 pointer-events-none z-0">
          {particles.current.map((p, i) => (
            <FloatingParticle key={i} delay={p.delay} depth={p.depth} startX={p.startX} startY={p.startY} />
          ))}
        </div>

        {/* ── NAV ──────────────────────────────────────────────────────── */}
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={booted ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6, ease }}
          className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-8 py-4 backdrop-blur-xl"
          style={{ borderBottom: '1px solid rgba(0,255,136,0.06)', background: 'rgba(5,8,16,0.7)' }}
        >
          <motion.div className="flex items-center gap-2.5 cursor-default" whileHover={{ scale: 1.02 }}>
            <motion.div
              className="w-9 h-9 rounded-xl bg-[#00ff88] flex items-center justify-center"
              animate={{ boxShadow: ['0 0 0px #00ff8800', '0 0 20px #00ff8880', '0 0 0px #00ff8800'] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <HiOutlineShieldCheck className="w-5 h-5 text-black" />
            </motion.div>
            <div>
              <span className="font-black tracking-tighter text-[15px] text-white">CIPHER<span className="text-[#00ff88]">VAULT</span></span>
              <div className="text-[7px] text-gray-700 tracking-[0.3em] uppercase font-bold">OS DEFENDER</div>
            </div>
          </motion.div>

          <div className="hidden md:flex gap-8 items-center text-[9px] font-bold tracking-[0.25em] text-gray-600">
            {[['FEATURES', 'features'], ['ARCHITECTURE', 'arch'], ['OS CONCEPTS', 'concepts'], ['SIMULATOR', 'demo'], ['AUTH', 'login']].map(([label, id]) => (
              <motion.a key={id} href={`#${id}`} whileHover={{ y: -1 }}
                className="hover:text-[#00ff88] transition-colors relative group">
                {label}
                <div className="absolute -bottom-1 left-0 h-px bg-[#00ff88] w-0 group-hover:w-full transition-all duration-300" />
              </motion.a>
            ))}
          </div>
        </motion.nav>

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <motion.section ref={heroRef} style={{ opacity: heroOpacity, y: heroY }}
          className="relative h-screen flex flex-col items-center justify-center p-6 text-center z-10 overflow-hidden">

          <motion.div style={{ x: bgX, y: bgY }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[880, 680, 500].map((sz, i) => (
              <motion.div key={i} className="absolute rounded-full border"
                style={{ width: sz, height: sz, borderColor: `rgba(0,255,136,${0.04 - i * 0.01})` }}
                animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                transition={{ duration: 35 + i * 10, repeat: Infinity, ease: 'linear' }}
              />
            ))}
            {[45, 135, 225, 315].map((deg, i) => (
              <motion.div key={i} className="absolute w-1.5 h-1.5 rounded-full bg-[#00ff88]"
                style={{
                  left: `calc(50% + ${Math.cos((deg * Math.PI) / 180) * 340}px)`,
                  top: `calc(50% + ${Math.sin((deg * Math.PI) / 180) * 340}px)`,
                  boxShadow: '0 0 8px #00ff88',
                }}
                animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 2, delay: i * 0.5, repeat: Infinity }}
              />
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={booted ? { opacity: 1 } : {}}
            transition={{ duration: 1.4, delay: 0.2 }} className="relative z-10">

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={booted ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.8, ease }}
              className="mb-10 inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border text-[8px] font-black tracking-[0.25em] uppercase"
              style={{ background: 'rgba(0,255,136,0.06)', borderColor: 'rgba(0,255,136,0.2)', color: '#00ff88' }}
            >
              <motion.div className="w-1.5 h-1.5 rounded-full bg-[#00ff88]"
                animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
              OS SECURITY PROJECT · CIA TRIAD · FLASK + REACT
              <HiOutlineSignal className="w-3 h-3" />
            </motion.div>

            <motion.div style={{ x: titleX, y: titleY }} className="mb-8">
              <motion.h1
                initial={{ opacity: 0, y: 44 }}
                animate={booted ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.7, duration: 1, ease }}
                className="text-[clamp(4rem,11vw,10rem)] font-black tracking-[-0.04em] leading-[0.88] mb-0"
              >
                <span className="block text-white" style={{ textShadow: '0 0 100px rgba(0,255,136,0.08)' }}>CIPHER</span>
                <span className="block" style={{
                  background: 'linear-gradient(135deg,#00ff88 0%,#00b8ff 35%,#7000ff 65%,#00ff88 100%)',
                  backgroundSize: '300% auto',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  animation: 'gradientShift 5s linear infinite',
                  filter: 'drop-shadow(0 0 40px rgba(0,255,136,0.25))',
                }}>VAULT</span>
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={booted ? { opacity: 1, scaleX: 1 } : {}}
                transition={{ delay: 1.1, duration: 0.9, ease }}
                className="text-[clamp(0.55rem,1.2vw,0.75rem)] tracking-[0.55em] text-gray-600 uppercase mt-3 origin-left"
              >
                OS SECURITY PROJECT // CONFIDENTIALITY · INTEGRITY · AVAILABILITY
              </motion.div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={booted ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="max-w-lg mx-auto text-[13px] text-gray-500 mb-14 leading-relaxed tracking-wide"
            >
              A security-centric file management system demonstrating core OS principles — AES-256 encryption with PBKDF2 key derivation, SHA-256 integrity, file versioning for ransomware resilience, IDS audit logging, and mutual-exclusion file locking. Built on Flask + SQLAlchemy + React.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={booted ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1.4, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <motion.button
                onClick={() => document.getElementById('login')?.scrollIntoView({ behavior: 'smooth' })}
                className="group relative px-10 py-4 rounded-2xl font-black text-[11px] tracking-[0.3em] uppercase text-black overflow-hidden"
                style={{ background: 'linear-gradient(135deg,#00ff88,#00b8ff)', boxShadow: '0 0 0px rgba(0,255,136,0.2)' }}
                whileHover={{ scale: 1.04, boxShadow: '0 0 50px rgba(0,255,136,0.4)' }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="relative z-10 flex items-center gap-3">ACCESS VAULT <HiOutlineArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
                <motion.div className="absolute inset-0 bg-white/25" initial={{ x: '-100%', skewX: '-15deg' }} whileHover={{ x: '150%' }} transition={{ duration: 0.5 }} />
              </motion.button>
              <motion.button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-10 py-4 rounded-2xl font-black text-[11px] tracking-[0.3em] uppercase border text-gray-400 hover:text-[#00ff88] transition-all"
                style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                whileHover={{ scale: 1.04, borderColor: 'rgba(0,255,136,0.35)' }}
                whileTap={{ scale: 0.97 }}
              >FEATURE BRIEFING</motion.button>
            </motion.div>

            {/* Stat row — actual project facts */}
            <motion.div
              initial={{ opacity: 0 }} animate={booted ? { opacity: 1 } : {}}
              transition={{ delay: 1.8, duration: 0.8 }}
              className="mt-16 flex justify-center gap-10 flex-wrap"
            >
              {[['AES-256 / CBC / ChaCha20', 'Cipher Algorithms'], ['PBKDF2 · 600k iters', 'Key Derivation'], ['SHA-256 on Every Read', 'Integrity Checks'], ['Auto-Snapshot', 'Ransomware Recovery']].map(([val, lbl]) => (
                <div key={lbl} className="text-center">
                  <div className="text-[11px] font-black text-[#00ff88] tracking-tight">{val}</div>
                  <div className="text-[8px] text-gray-700 font-bold tracking-widest uppercase mt-0.5">{lbl}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div className="absolute bottom-10 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 9, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
            <HiOutlineArrowDownCircle className="w-8 h-8 text-white/10" />
          </motion.div>
        </motion.section>

        {/* ── FEATURES ─────────────────────────────────────────────────── */}
        <section id="features" className="relative py-36 px-6 overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#00ff88]/15 to-transparent" />

          <div className="max-w-7xl mx-auto">
            <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
              <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.7, ease }}>
                <div className="text-[8px] font-black tracking-[0.35em] text-[#00ff88]/50 uppercase mb-4">IMPLEMENTED FEATURES</div>
                <h2 className="text-5xl font-black tracking-[-0.03em] uppercase leading-none text-white mb-4">
                  Six Pillars<br />of the CIA Triad
                </h2>
                <div className="h-0.5 w-20 bg-gradient-to-r from-[#00ff88] to-transparent" />
              </motion.div>
              <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                className="max-w-sm text-[12px] text-gray-600 leading-relaxed">
                Every layer demonstrating a real OS security principle — from kernel-level cryptography to ransomware recovery via automatic snapshotting.
              </motion.p>
            </div>

            {/* 3-2-1 feature grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {FEATURES.slice(0, 3).map((f, i) => <FeatureCard key={f.id} feature={f} index={i} />)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {FEATURES.slice(3).map((f, i) => <FeatureCard key={f.id} feature={f} index={i + 3} />)}
            </div>
          </div>
        </section>

        {/* ── OS ARCHITECTURE ──────────────────────────────────────────── */}
        <section id="arch" className="relative py-36 px-6 overflow-hidden border-t border-white/[0.04]">
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
              <motion.div initial={{ opacity: 0, x: -28 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.7, ease }}>
                <div className="text-[8px] font-black tracking-[0.35em] text-[#00b8ff]/50 uppercase mb-4">REQUEST LIFECYCLE</div>
                <h2 className="text-5xl font-black tracking-[-0.03em] uppercase leading-none text-white mb-4">
                  How a File<br />Gets Encrypted
                </h2>
                <div className="h-0.5 w-20 bg-gradient-to-r from-[#00b8ff] to-transparent" />
              </motion.div>
              <div className="flex items-center gap-3">
                {[
                  { onClick: () => { setAutoPlay(false); setActiveStep(p => Math.max(1, p - 1)); }, icon: HiOutlineChevronLeft },
                  { onClick: () => { setAutoPlay(false); setActiveStep(p => Math.min(OS_STEPS.length, p + 1)); }, icon: HiOutlineChevronRight },
                ].map(({ onClick, icon: Ic }, i) => (
                  <button key={i} onClick={onClick}
                    className="w-11 h-11 rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center hover:border-[#00ff88]/30 hover:text-[#00ff88] transition-all text-gray-600">
                    <Ic className="w-5 h-5" />
                  </button>
                ))}
                <span className="text-[9px] text-gray-700 tracking-widest font-bold uppercase px-2">{activeStep}/{OS_STEPS.length}</span>
                <button onClick={() => setAutoPlay(p => !p)}
                  className="text-[8px] font-bold tracking-widest uppercase px-3 py-2 rounded-lg border border-white/[0.06] hover:border-[#00ff88]/30 hover:text-[#00ff88] text-gray-600 transition-all">
                  {autoPlay ? 'PAUSE' : 'AUTO'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              {OS_STEPS.slice(0, -1).map((step, i) => (
                <div key={i} className="absolute hidden md:block" style={{ left: `${(i + 1) * 25 - 4}%`, top: '50%', width: '8%', zIndex: 20 }}>
                  <DataFlowLine active={activeStep === step.id} color={step.color} />
                </div>
              ))}
              {OS_STEPS.map((step, i) => (
                <motion.div key={step.id}
                  initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.65, ease }}>
                  <OSRingCard step={step} isActive={activeStep === step.id} onClick={() => { setAutoPlay(false); setActiveStep(step.id); }} />
                </motion.div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={activeStep}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                className="mt-8 px-8 py-5 rounded-2xl border border-white/[0.05] bg-white/[0.015] flex items-center justify-between flex-wrap gap-4">
                <div className="text-[8px] text-gray-700 tracking-[0.3em] uppercase font-bold">ACTIVE LAYER — {OS_STEPS[activeStep - 1].ring}</div>
                <div className="flex gap-2">
                  {OS_STEPS.map(s => (
                    <motion.div key={s.id} className="h-1 rounded-full cursor-pointer"
                      onClick={() => { setAutoPlay(false); setActiveStep(s.id); }}
                      animate={{ width: activeStep === s.id ? 28 : 8, background: activeStep === s.id ? s.color : 'rgba(255,255,255,0.08)' }}
                      transition={{ duration: 0.4 }}
                    />
                  ))}
                </div>
                <div className="text-[8px] text-gray-700 tracking-[0.2em] uppercase font-mono">{OS_STEPS[activeStep - 1].sub}</div>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* ── OS CONCEPTS TABLE ──────────────────────────────────────────── */}
        <section id="concepts" className="relative py-24 px-6 border-t border-white/[0.04]">
          <div className="max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="mb-14 text-center">
              <div className="text-[8px] font-black tracking-[0.35em] text-[#a855f7]/50 uppercase mb-4">CURRICULUM ALIGNMENT</div>
              <h2 className="text-4xl font-black tracking-[-0.03em] uppercase leading-none text-white mb-2">
                OS Concepts Demonstrated
              </h2>
              <p className="text-[11px] text-gray-600 mt-2">Every feature maps directly to a core Operating Systems principle.</p>
              <div className="h-0.5 w-16 bg-gradient-to-r from-[#a855f7] to-transparent mx-auto mt-4" />
            </motion.div>

            <div className="space-y-3">
              {OS_CONCEPTS.map((item, i) => (
                <motion.div key={item.concept}
                  initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.55, ease }}
                  className="flex items-center gap-5 px-6 py-4 rounded-2xl border border-white/[0.05] bg-white/[0.015] group hover:border-white/10 transition-all"
                  whileHover={{ x: 4 }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${item.color}12`, border: `1px solid ${item.color}25` }}>
                    <item.icon className="w-5 h-5" style={{ color: item.color }} />
                  </div>
                  <div className="w-44 flex-shrink-0">
                    <div className="text-[10px] font-black uppercase tracking-widest text-white">{item.concept}</div>
                  </div>
                  <div className="flex-1 h-px bg-white/[0.04]" />
                  <div className="text-[10px] text-gray-500 leading-relaxed max-w-xs text-right">{item.impl}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── RANSOMWARE SIMULATOR ─────────────────────────────────────── */}
        <section id="demo" className="py-36 px-6 relative border-t border-white/[0.04]">
          <AnimatePresence>
            {showGlitch && (
              <motion.div className="fixed inset-0 z-[100] pointer-events-none"
                initial={{ opacity: 0 }} animate={{ opacity: [0, 0.5, 0, 0.35, 0] }} exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                style={{ background: 'repeating-linear-gradient(0deg,rgba(255,0,0,0.03) 0px,rgba(255,0,0,0.03) 2px,transparent 2px,transparent 4px)' }}
              />
            )}
          </AnimatePresence>

          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-20 items-start">
            {/* Left */}
            <div className="lg:w-2/5 space-y-8 lg:sticky lg:top-28">
              <motion.div initial={{ opacity: 0, x: -28 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.7, ease }}>
                <div className="text-[8px] font-black tracking-[0.35em] text-red-400/50 uppercase mb-4">RANSOMWARE RESILIENCE DEMO</div>
                <h2 className="text-4xl font-black tracking-[-0.03em] uppercase leading-tight text-white mb-4">
                  Survive<br />The Attack
                </h2>
                <div className="h-0.5 w-16 bg-gradient-to-r from-red-500 to-transparent mb-6" />
                <p className="text-[12px] text-gray-500 leading-relaxed">
                  Simulates a real ransomware attack detected by the IDS. Files are encrypted by the attacker — then <span className="text-[#00ff88]">fully restored using CipherVault's automatic versioning system</span>. Type <span className="font-mono text-[#00b8ff]">CIPHERVAULT_RECOVER</span> to trigger snapshot restoration.
                </p>
              </motion.div>

              {/* What the IDS catches */}
              <div className="space-y-2.5">
                {[
                  { label: 'IDS: Failed login threshold exceeded', icon: HiOutlineEye, color: '#00ff88' },
                  { label: 'File lock bypassed by attacker', icon: HiOutlineNoSymbol, color: '#00b8ff' },
                  { label: 'SHA-256 hash mismatch detected', icon: HiOutlineCircleStack, color: '#7000ff' },
                  { label: 'Snapshot v2 available for recovery', icon: HiOutlineArchiveBox, color: '#ff3366' },
                ].map((f, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-3.5 group" whileHover={{ x: 4 }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: `${f.color}10`, border: `1px solid ${f.color}22` }}>
                      <f.icon className="w-4 h-4" style={{ color: f.color }} />
                    </div>
                    <span className="text-[9px] font-bold tracking-[0.2em] text-gray-600 uppercase group-hover:text-gray-300 transition-colors">{f.label}</span>
                  </motion.div>
                ))}
              </div>

              <div>
                <div className="text-[8px] text-gray-700 tracking-[0.25em] uppercase font-bold mb-2.5">FILESYSTEM://VAULT</div>
                <div className="space-y-1.5">
                  {rsFiles.map((f, i) => (
                    <FileEntry key={f.name} file={f} idx={i} isEncrypting={rsPhase === 'encrypting'} encryptProgress={encryptProgress} />
                  ))}
                </div>
              </div>

              {rsPhase === 'encrypting' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="flex justify-between text-[8px] font-bold tracking-widest text-gray-700 uppercase mb-1.5">
                    <span>ENCRYPTION PROGRESS</span>
                    <span className="text-red-400">{Math.round(encryptPct)}%</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full"
                      style={{ width: `${encryptPct}%`, background: 'linear-gradient(90deg,#ff3366,#7000ff)' }} />
                  </div>
                </motion.div>
              )}

              <div>
                {rsPhase === 'idle' ? (
                  <motion.button onClick={startAttack}
                    className="relative px-8 py-4 rounded-2xl font-black text-[11px] tracking-[0.3em] uppercase text-white overflow-hidden w-full"
                    style={{ background: 'linear-gradient(135deg,#ff3366,#7000ff)', boxShadow: '0 0 30px rgba(255,51,102,0.15)' }}
                    whileHover={{ scale: 1.03, boxShadow: '0 0 50px rgba(255,51,102,0.35)' }}
                    whileTap={{ scale: 0.97 }}>
                    SIMULATE RANSOMWARE ATTACK
                    <motion.div className="absolute inset-0 bg-white/10" initial={{ x: '-100%' }} whileHover={{ x: '150%' }} transition={{ duration: 0.5 }} />
                  </motion.button>
                ) : (
                  <motion.button onClick={resetDemo}
                    className="px-8 py-4 rounded-2xl font-black text-[11px] tracking-[0.3em] uppercase border text-gray-500 hover:text-[#00ff88] hover:border-[#00ff88]/30 transition-all w-full"
                    style={{ borderColor: 'rgba(255,255,255,0.07)' }}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                    RESET PROTOCOL
                  </motion.button>
                )}
              </div>
            </div>

            {/* Right: Terminal */}
            <div className="lg:w-3/5 w-full">
              <motion.div className="relative group"
                initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.7, ease }}>
                <motion.div className="absolute -inset-6 rounded-[2rem] blur-3xl opacity-30 pointer-events-none"
                  animate={{
                    background: rsPhase === 'ransom'
                      ? ['radial-gradient(circle,rgba(255,51,102,0.15),transparent)', 'radial-gradient(circle,rgba(255,51,102,0.25),transparent)']
                      : ['radial-gradient(circle,rgba(0,255,136,0.06),transparent)']
                  }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                />
                <div className={`relative rounded-[1.5rem] overflow-hidden border transition-all duration-700 ${rsPhase === 'ransom' ? 'border-red-500/25' : 'border-white/[0.05]'}`}
                  style={{ background: '#070a10' }}>
                  <MatrixRain />
                  <div className="relative z-10 flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.04] bg-black/30">
                    {['bg-red-500/60', 'bg-yellow-500/60', 'bg-green-500/60'].map((c, i) => (
                      <div key={i} className={`w-3 h-3 rounded-full ${c}`} />
                    ))}
                    <span className="ml-3 text-[8px] text-gray-700 font-bold tracking-[0.25em] uppercase">CIPHERVAULT_SHELL v4.2.1</span>
                    <div className="ml-auto flex items-center gap-2">
                      <motion.div className={`w-1.5 h-1.5 rounded-full ${rsPhase === 'ransom' ? 'bg-red-400' : 'bg-[#00ff88]'}`}
                        animate={{ opacity: rsPhase !== 'idle' ? [1, 0.3, 1] : 1 }}
                        transition={{ duration: 0.9, repeat: Infinity }} />
                      <span className="text-[8px] text-gray-700 font-bold tracking-[0.2em] uppercase">{rsPhase.toUpperCase()}</span>
                    </div>
                  </div>

                  <div ref={terminalRef} className="relative z-10 h-80 overflow-y-auto p-6 space-y-1.5 text-[11px] font-mono" style={{ scrollbarWidth: 'none' }}>
                    {terminalLogs.map((log, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }} className={`leading-relaxed ${logColor(log.type)}`}>
                        {log.text && <span className="text-gray-700 mr-2 select-none">›</span>}
                        {log.text}
                      </motion.div>
                    ))}

                    <AnimatePresence>
                      {rsPhase === 'ransom' && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                          className="mt-6 p-5 rounded-xl border border-red-500/20 bg-red-500/[0.04]">
                          <div className="flex items-center gap-2 mb-3">
                            <motion.div className="w-1.5 h-1.5 rounded-full bg-red-400"
                              animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.6, repeat: Infinity }} />
                            <span className="text-red-400 font-black text-[11px] tracking-widest uppercase">SYSTEM LOCKDOWN</span>
                          </div>
                          <p className="text-red-400/60 text-[10px] leading-relaxed mb-3">All files encrypted. IDS has flagged attack vector and created forensic log entry.</p>
                          <div className="text-[8px] font-bold text-[#00b8ff]/70 tracking-[0.2em] uppercase bg-[#00b8ff]/8 px-3 py-2 rounded-lg">
                            SNAPSHOT RECOVERY: type CIPHERVAULT_RECOVER
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <AnimatePresence>
                      {rsPhase === 'recovered' && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                          className="mt-4 p-4 rounded-xl border border-[#00ff88]/15 bg-[#00ff88]/[0.04]">
                          <span className="text-[#00ff88] font-black text-[11px] tracking-widest">✓ FILES RESTORED FROM SNAPSHOT — SOVEREIGNTY MAINTAINED</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex items-center gap-2 mt-4">
                      <span className="text-[#00ff88] font-bold">root@ciphervault:~#</span>
                      <input type="text" value={commandInput} onChange={e => setCommandInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && rsPhase === 'ransom' && recoverSystem()}
                        disabled={rsPhase !== 'ransom'}
                        className="flex-1 bg-transparent border-none outline-none text-white text-[11px] font-mono p-0 caret-[#00ff88]"
                        placeholder={rsPhase === 'ransom' ? 'Enter recovery vector...' : ''} />
                      {rsPhase !== 'idle' && commandInput === '' && (
                        <motion.div animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }}
                          className="w-2 h-[13px] bg-[#00ff88]" />
                      )}
                    </div>
                  </div>

                  {rsPhase === 'encrypting' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="relative z-10 px-6 pb-4">
                      <div className="text-[8px] text-gray-700 font-bold tracking-[0.2em] uppercase mb-1.5">AES KEY STREAM</div>
                      <motion.div className="text-[9px] font-mono text-red-400/40 tracking-wider break-all leading-relaxed"
                        animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.3, repeat: Infinity }}>
                        {Array.from({ length: 4 }, () => Math.random().toString(16).slice(2, 18).toUpperCase()).join(' ')}
                      </motion.div>
                    </motion.div>
                  )}

                  <div className="relative z-10 px-5 py-3 border-t border-white/[0.04] flex justify-between items-center text-[8px] font-bold text-gray-700 tracking-[0.2em] uppercase bg-black/20">
                    <span>SECURE_SHELL // ACTIVE</span>
                    <span className={rsPhase === 'ransom' ? 'text-red-500/80' : rsPhase === 'recovered' ? 'text-[#00ff88]/80' : ''}>
                      MODE: {rsPhase === 'ransom' ? 'RESTRICTED' : 'ELEVATED'}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── AUTH PORTAL ───────────────────────────────────────────────── */}
        <section id="login" className="py-36 flex flex-col items-center justify-center px-6 relative overflow-hidden border-t border-white/[0.04]">
          <GlowOrb color="#00ff88" size={600} x="50%" y="50%" blur={220} />

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16">
            <div className="text-[8px] font-black tracking-[0.35em] text-[#00ff88]/40 uppercase mb-4">AUTHENTICATION PORTAL</div>
            <h2 className="text-5xl font-black tracking-[-0.03em] uppercase text-white leading-none">
              Establish<br /><span style={{ WebkitTextFillColor: 'transparent', background: 'linear-gradient(135deg,#00ff88,#00b8ff)', WebkitBackgroundClip: 'text' }}>Link</span>
            </h2>
            <p className="text-[10px] text-gray-700 mt-3 tracking-widest">JWT-secured session · Bcrypt password hashing · Flask-JWT-Extended</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease }}
            className="w-full max-w-md relative z-10"
          >
            <motion.div
              animate={loginShake ? { x: [0, -10, 10, -8, 8, -4, 4, 0], rotateZ: [0, -1, 1, -1, 1, 0] } : {}}
              transition={{ duration: 0.5 }}
            >
              <div className="absolute -inset-1 rounded-[2rem] blur-2xl opacity-25"
                style={{ background: loginSuccess ? 'linear-gradient(135deg,#00ff88,#00b8ff)' : 'linear-gradient(135deg,#00ff88,#7000ff)' }} />

              <div className="relative rounded-[1.75rem] border border-white/[0.07] overflow-hidden"
                style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))', backdropFilter: 'blur(40px)' }}>
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                <motion.div className="absolute left-0 top-8 bottom-8 w-0.5 rounded-r-full"
                  style={{ background: 'linear-gradient(180deg,#00ff88,#00b8ff)' }}
                  initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 0.3, duration: 0.7, ease }} />

                <div className="p-10">
                  <BiometricScan scanning={biometricScan && !loginSuccess} success={loginSuccess} />

                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-black tracking-tighter uppercase text-white mb-1">Authenticate</h3>
                    <p className="text-[8px] text-gray-700 font-bold tracking-[0.3em] uppercase">Flask-JWT-Extended · Bcrypt · Zero-Knowledge Session</p>
                  </div>

                  <AnimatePresence mode="wait">
                    {loginSuccess ? (
                      <motion.div key="success" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-8">
                        <div className="text-[#00ff88] font-black text-[11px] tracking-widest uppercase mb-2">ACCESS GRANTED</div>
                        <div className="text-gray-700 text-[8px] tracking-widest">LOADING DASHBOARD...</div>
                        <motion.div className="mt-6 h-px bg-gradient-to-r from-transparent via-[#00ff88] to-transparent"
                          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1 }} />
                      </motion.div>
                    ) : (
                      <motion.form key="form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                          <label className="block text-[8px] font-bold text-gray-700 uppercase tracking-[0.25em] mb-2">USERNAME</label>
                          <div className="relative group">
                            <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-[#00ff88] transition-colors" />
                            <input {...register('username')}
                              className="w-full bg-white/[0.025] border border-white/[0.07] rounded-xl pl-11 pr-4 py-3.5 text-[12px] font-mono text-white placeholder-gray-700 outline-none focus:border-[#00ff88]/35 focus:bg-[#00ff88]/[0.025] transition-all"
                              placeholder="Enter username..." />
                          </div>
                          {errors.username && <p className="text-[8px] text-red-400 font-bold uppercase tracking-widest mt-1.5">{errors.username.message}</p>}
                        </div>

                        <div>
                          <label className="block text-[8px] font-bold text-gray-700 uppercase tracking-[0.25em] mb-2">PASSWORD</label>
                          <div className="relative group">
                            <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-[#00ff88] transition-colors" />
                            <input {...register('password')} type={showPassword ? 'text' : 'password'}
                              className="w-full bg-white/[0.025] border border-white/[0.07] rounded-xl pl-11 pr-12 py-3.5 text-[12px] font-mono text-white placeholder-gray-700 outline-none focus:border-[#00ff88]/35 focus:bg-[#00ff88]/[0.025] transition-all"
                              placeholder="••••••••" />
                            <button type="button" onClick={() => setShowPassword(p => !p)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors">
                              {showPassword ? <HiOutlineEyeSlash className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                            </button>
                          </div>
                          {errors.password && <p className="text-[8px] text-red-400 font-bold uppercase tracking-widest mt-1.5">{errors.password.message}</p>}
                        </div>

                        <motion.button type="submit" disabled={isLoading}
                          className="relative w-full py-4 rounded-xl font-black text-[11px] tracking-[0.3em] uppercase text-black overflow-hidden mt-2"
                          style={{ background: 'linear-gradient(135deg,#00ff88,#00b8ff)' }}
                          whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(0,255,136,0.3)' }}
                          whileTap={{ scale: 0.98 }}>
                          {isLoading ? <HiOutlineArrowPath className="w-5 h-5 animate-spin mx-auto" /> : 'ESTABLISH_LINK'}
                          <motion.div className="absolute inset-0 bg-white/20" initial={{ x: '-100%' }} whileHover={{ x: '150%' }} transition={{ duration: 0.6 }} />
                        </motion.button>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  <div className="mt-7 pt-6 border-t border-white/[0.04] flex items-center justify-between text-[8px] font-bold">
                    <span className="text-gray-700 uppercase tracking-widest">New user?</span>
                    <Link to="/register" className="text-[#00ff88]/70 hover:text-[#00ff88] transition-colors uppercase tracking-widest flex items-center gap-1.5">
                      REGISTER <HiOutlineChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────────────── */}
        <footer className="border-t border-white/[0.04] bg-[#030508]">
          <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#00ff88] flex items-center justify-center">
                <HiOutlineShieldCheck className="w-4 h-4 text-black" />
              </div>
              <div>
                <div className="text-[13px] font-black text-white tracking-tight">CIPHER<span className="text-[#00ff88]">VAULT</span></div>
                <div className="text-[7px] text-gray-700 tracking-[0.3em] uppercase font-bold">Python · Flask · SQLAlchemy · React</div>
              </div>
            </div>

            <p className="text-[8px] font-bold uppercase tracking-[0.35em] text-gray-700">
              © 2025 CIPHERVAULT — OS SECURITY MINI PROJECT
            </p>

            <div className="flex gap-8 text-gray-700 text-[8px] font-bold tracking-[0.25em] uppercase">
              {[['README.md', '/'], ['ARCHITECTURE', '#arch'], ['GITHUB', 'https://github.com']].map(([label, href]) => (
                <a key={label} href={href} className="hover:text-[#00ff88] transition-colors">{label}</a>
              ))}
            </div>
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes gradientShift {
          0%   { background-position: 0% center; }
          100% { background-position: 300% center; }
        }
        ::-webkit-scrollbar { display: none; }
        * { -ms-overflow-style: none; scrollbar-width: none; cursor: default; }
        a, button, input, label, select { cursor: pointer; }
        input { cursor: text; }
      `}</style>
      {/* Small Floating Music Toggle */}
      <motion.div
        className="fixed bottom-6 left-6 z-[100]"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
      >
        <button
          onClick={toggleMusic}
          className={`group flex items-center justify-center w-10 h-10 rounded-full border backdrop-blur-md transition-all duration-500 ${isMusicPlaying
              ? 'bg-vault-accent/20 border-vault-accent/50 text-vault-accent shadow-[0_0_15px_rgba(0,255,136,0.3)]'
              : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/30 hover:text-white'
            }`}
          title={isMusicPlaying ? 'Stop Music' : 'Start Music'}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isMusicPlaying ? 'playing' : 'paused'}
              initial={{ opacity: 0, rotate: -20 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 20 }}
              transition={{ duration: 0.2 }}
            >
              {isMusicPlaying ? (
                <div className="relative flex items-center justify-center">
                  <HiOutlineSpeakerWave className="w-4 h-4" />
                  <div className="absolute -top-1 -right-1 flex gap-[1px]">
                    {[0, 1].map(i => (
                      <motion.div
                        key={i}
                        className="w-[1.5px] bg-vault-accent rounded-full"
                        animate={{ height: ['2px', '6px', '2px'] }}
                        transition={{ duration: 0.4 + i * 0.1, repeat: Infinity }}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <HiOutlineSpeakerXMark className="w-4 h-4" />
              )}
            </motion.div>
          </AnimatePresence>
        </button>
      </motion.div>
    </>
  );
}