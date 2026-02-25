import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { roomsAPI } from '../api';
import toast from 'react-hot-toast';
import {
  HiOutlineUserPlus,
  HiOutlineUserMinus,
  HiOutlineDocumentText,
  HiOutlineArrowDownTray,
  HiOutlineTrash,
  HiOutlineLockClosed,
  HiOutlineLockOpen,
  HiOutlineCloudArrowUp,
  HiOutlineUserGroup,
} from 'react-icons/hi2';

interface Member {
  id: number;
  user_id: number;
  username: string;
  role: string;
  joined_at: string;
}

interface RoomFile {
  id: number;
  filename: string;
  algorithm: string;
  file_size: number;
  upload_time: string;
  owner_id: number;
}

interface ChatMsg {
  id: number;
  sender_username: string;
  encrypted_message: string;
  timestamp: string;
}

export default function RoomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const roomId = Number(id);
  const [room, setRoom] = useState<any>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [files, setFiles] = useState<RoomFile[]>([]);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [activeTab, setActiveTab] = useState<'files' | 'members' | 'chat'>('files');
  const [showAddMember, setShowAddMember] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newRole, setNewRole] = useState('member');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [passphrase, setPassphrase] = useState('');
  const [algorithm, setAlgorithm] = useState('AES-GCM');
  const [showUpload, setShowUpload] = useState(false);
  const [decryptPass, setDecryptPass] = useState('');
  const [decryptingId, setDecryptingId] = useState<number | null>(null);

  const fetchRoom = async () => {
    try {
      const res = await roomsAPI.get(roomId);
      setRoom(res.data.room);
      setMembers(res.data.room.members || []);
    } catch {
      toast.error('Failed to load room');
    }
  };

  const fetchFiles = async () => {
    try {
      const res = await roomsAPI.getFiles(roomId);
      setFiles(res.data.files || []);
    } catch {
      toast.error('Failed to load files');
    }
  };

  const fetchChat = async () => {
    try {
      const res = await roomsAPI.getChat(roomId);
      setMessages(res.data.messages || []);
    } catch { }
  };

  useEffect(() => {
    fetchRoom();
    fetchFiles();
    fetchChat();
  }, [roomId]);

  const addMember = async () => {
    if (!newUsername.trim()) return;
    try {
      await roomsAPI.addMember(roomId, { username: newUsername.trim(), role: newRole });
      toast.success(`${newUsername} added as ${newRole}`);
      setShowAddMember(false);
      setNewUsername('');
      fetchRoom();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  const removeMember = async (userId: number) => {
    try {
      await roomsAPI.removeMember(roomId, userId);
      toast.success('Member removed');
      fetchRoom();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;
    const fd = new FormData();
    fd.append('file', uploadFile);
    fd.append('algorithm', algorithm);
    fd.append('passphrase', passphrase);
    try {
      await roomsAPI.uploadFile(roomId, fd);
      toast.success('File encrypted & uploaded');
      setShowUpload(false);
      setUploadFile(null);
      setPassphrase('');
      fetchFiles();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Upload failed');
    }
  };

  const handleDecrypt = async (fileId: number) => {
    try {
      const res = await roomsAPI.decryptFile(roomId, fileId, decryptPass);
      const file = files.find(f => f.id === fileId);
      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file?.filename || 'download';
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('File decrypted');
      setDecryptingId(null);
      setDecryptPass('');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Decryption failed');
    }
  };

  const deleteFile = async (fileId: number) => {
    try {
      await roomsAPI.deleteFile(roomId, fileId);
      toast.success('File securely deleted');
      fetchFiles();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  };

  const roleBadge = (role: string) => {
    const c: Record<string, string> = {
      owner: 'text-vault-accent border-vault-accent/30 bg-vault-accent/10',
      admin: 'text-cyber-400 border-cyber-400/30 bg-cyber-400/10',
      member: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
      viewer: 'text-gray-400 border-gray-500/30 bg-gray-500/10',
    };
    return <span className={`text-xs px-2 py-0.5 rounded-lg border ${c[role] || c.viewer}`}>{role}</span>;
  };

  if (!room) return <div className="text-center py-12 text-gray-500">Loading…</div>;

  const tabs = [
    { key: 'files', label: 'Files', icon: HiOutlineDocumentText },
    { key: 'members', label: 'Members', icon: HiOutlineUserGroup },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <HiOutlineLockClosed className="w-7 h-7 text-vault-accent" />
            {room.name}
          </h1>
          {room.description && <p className="text-gray-400 mt-1">{room.description}</p>}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <HiOutlineUserGroup className="w-4 h-4" />
          {members.length} members
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-vault-bg/50 p-1 rounded-xl border border-vault-border w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t.key ? 'bg-vault-accent/10 text-vault-accent border border-vault-accent/20' : 'text-gray-400 hover:text-white'}`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* FILES TAB */}
      {activeTab === 'files' && (
        <div className="space-y-4">
          <button onClick={() => setShowUpload(!showUpload)} className="cyber-btn-primary flex items-center gap-2">
            <HiOutlineCloudArrowUp className="w-5 h-5" />
            Upload to Room
          </button>

          <AnimatePresence>
            {showUpload && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass-card p-6 space-y-4 border-vault-accent/20 bg-vault-accent/5"
              >
                {/* Custom File Selection Area */}
                <div
                  onClick={() => document.getElementById('room-file-input')?.click()}
                  className={`relative group cursor-pointer border-2 border-dashed rounded-xl p-8 transition-all duration-300 text-center ${uploadFile ? 'border-vault-accent/50 bg-vault-accent/10' : 'border-vault-border hover:border-vault-accent/30 hover:bg-white/[0.02]'}`}
                >
                  <input
                    id="room-file-input"
                    type="file"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />

                  {uploadFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-vault-accent/20 flex items-center justify-center">
                        <HiOutlineDocumentText className="w-6 h-6 text-vault-accent" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-white truncate max-w-[200px]">{uploadFile.name}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">{(uploadFile.size / 1024).toFixed(1)} KB · Ready to encrypt</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white/[0.03] flex items-center justify-center group-hover:bg-vault-accent/10 transition-colors">
                        <HiOutlineCloudArrowUp className="w-6 h-6 text-gray-600 group-hover:text-vault-accent" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-400">Click to select file</p>
                        <p className="text-[10px] text-gray-600 uppercase tracking-widest">No file chosen</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Algorithm</label>
                    <select
                      value={algorithm}
                      onChange={(e) => setAlgorithm(e.target.value)}
                      className="cyber-input bg-vault-bg/50"
                    >
                      <option value="AES-GCM">AES-256-GCM</option>
                      <option value="AES-CBC">AES-256-CBC</option>
                      <option value="ChaCha20">ChaCha20-Poly1305</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Encryption Passphrase</label>
                    <input
                      value={passphrase}
                      onChange={(e) => setPassphrase(e.target.value)}
                      className="cyber-input bg-vault-bg/50"
                      placeholder="Optional second layer"
                      type="password"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleUpload}
                    className="cyber-btn-primary flex-1 py-3"
                    disabled={!uploadFile}
                  >
                    Encrypt & Upload to Room
                  </button>
                  <button
                    onClick={() => { setShowUpload(false); setUploadFile(null); }}
                    className="px-4 rounded-xl border border-vault-border hover:bg-white/[0.05] transition-colors text-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {files.length === 0 ? (
            <div className="glass-card p-8 text-center text-gray-500">No files in this room yet</div>
          ) : (
            <div className="space-y-2">
              {files.map((f, i) => (
                <motion.div key={f.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  className="glass-card p-4 flex items-center gap-4"
                >
                  <div className="w-9 h-9 rounded-lg bg-vault-accent/10 flex items-center justify-center shrink-0">
                    <HiOutlineDocumentText className="w-5 h-5 text-vault-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{f.filename}</p>
                    <p className="text-xs text-gray-500">{f.algorithm} · {(f.file_size / 1024).toFixed(1)} KB</p>
                  </div>

                  {decryptingId === f.id ? (
                    <div className="flex items-center gap-2">
                      <input value={decryptPass} onChange={(e) => setDecryptPass(e.target.value)} className="cyber-input text-xs w-40" placeholder="Passphrase" type="password" />
                      <button onClick={() => handleDecrypt(f.id)} className="cyber-btn-primary text-xs">Decrypt</button>
                      <button onClick={() => { setDecryptingId(null); setDecryptPass(''); }} className="cyber-btn text-xs">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => setDecryptingId(f.id)} className="p-2 rounded-lg hover:bg-vault-accent/10 text-gray-400 hover:text-vault-accent transition-colors" title="Decrypt">
                        <HiOutlineArrowDownTray className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteFile(f.id)} className="p-2 rounded-lg hover:bg-vault-danger/10 text-gray-400 hover:text-vault-danger transition-colors" title="Delete">
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MEMBERS TAB */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <button onClick={() => setShowAddMember(!showAddMember)} className="cyber-btn-primary flex items-center gap-2">
            <HiOutlineUserPlus className="w-5 h-5" />
            Add Member
          </button>

          <AnimatePresence>
            {showAddMember && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="glass-card p-5 space-y-3">
                <input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className="cyber-input" placeholder="Username" />
                <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="cyber-input">
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                  <option value="viewer">Viewer</option>
                </select>
                <button onClick={addMember} className="cyber-btn-primary">Add</button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            {members.map((m, i) => (
              <motion.div key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                className="glass-card p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-vault-accent/10 flex items-center justify-center text-vault-accent text-sm font-bold">
                    {m.username?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{m.username}</p>
                    <p className="text-xs text-gray-500">Joined {new Date(m.joined_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {roleBadge(m.role)}
                  {m.role !== 'owner' && (
                    <button onClick={() => removeMember(m.user_id)} className="p-1.5 rounded-lg hover:bg-vault-danger/10 text-gray-500 hover:text-vault-danger transition-colors">
                      <HiOutlineUserMinus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
