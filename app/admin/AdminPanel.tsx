'use client';

import { useState, useEffect, useCallback } from 'react';
import { Lock, Plus, Trash2, Eye, EyeOff, LogOut, Settings, Image, Code } from 'lucide-react';

interface Ad {
  id: string;
  type: 'banner' | 'script';
  position: 'top' | 'bottom' | 'sidebar';
  title: string;
  imageUrl?: string;
  linkUrl?: string;
  scriptCode?: string;
  active: boolean;
  createdAt: string;
}

const ADMIN_PASSWORD = 'cipung';

export default function AdminPanel() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'banner' | 'script'>('banner');
  const [form, setForm] = useState({
    title: '',
    position: 'top' as 'top' | 'bottom' | 'sidebar',
    imageUrl: '',
    linkUrl: '',
    scriptCode: '',
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const fetchAds = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/ads');
    const data = await res.json();
    setAds(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem('xici_admin');
    if (saved === ADMIN_PASSWORD) setAuthed(true);
  }, []);

  useEffect(() => {
    if (authed) fetchAds();
  }, [authed, fetchAds]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem('xici_admin', pw);
      setAuthed(true);
      setPwError('');
    } else {
      setPwError('Password salah!');
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('xici_admin');
    setAuthed(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    await fetch('/api/ads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, type: tab }),
    });
    setForm({ title: '', position: 'top', imageUrl: '', linkUrl: '', scriptCode: '' });
    await fetchAds();
    setSaving(false);
    showToast('Iklan berhasil ditambahkan!');
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus iklan ini?')) return;
    await fetch('/api/ads', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    await fetchAds();
    showToast('Iklan dihapus.');
  }

  async function handleToggle(id: string, active: boolean) {
    await fetch('/api/ads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, active: !active }),
    });
    await fetchAds();
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0d0d14] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="bg-[#13131f] border border-indigo-900/40 rounded-2xl p-8">
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 rounded-full bg-indigo-600/20 flex items-center justify-center mb-4">
                <Lock className="w-7 h-7 text-indigo-400" />
              </div>
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
              <p className="text-sm text-gray-500 mt-1">xicinime — Manajemen Iklan</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Password Admin</label>
                <input
                  type="password"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full bg-[#1a1a2e] border border-indigo-900/40 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
                {pwError && <p className="text-red-400 text-xs mt-1">{pwError}</p>}
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
              >
                Masuk
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d14] text-white">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg shadow-lg animate-pulse">
          {toast}
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-indigo-400" />
            <div>
              <h1 className="text-xl font-bold">Admin Panel</h1>
              <p className="text-xs text-gray-500">Manajemen Iklan xicinime</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#13131f] border border-indigo-900/40 rounded-2xl p-6">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" />
              Tambah Iklan
            </h2>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setTab('banner')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  tab === 'banner' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                <Image className="w-4 h-4" />
                Banner
              </button>
              <button
                onClick={() => setTab('script')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  tab === 'script' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                <Code className="w-4 h-4" />
                Script / HTML
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Nama Iklan *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Contoh: Google Ads Header"
                  className="w-full bg-[#1a1a2e] border border-indigo-900/40 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Posisi</label>
                <select
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value as 'top' | 'bottom' | 'sidebar' })}
                  className="w-full bg-[#1a1a2e] border border-indigo-900/40 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="top">Atas (Top Banner)</option>
                  <option value="bottom">Bawah (Bottom Banner)</option>
                  <option value="sidebar">Samping (Sidebar)</option>
                </select>
              </div>

              {tab === 'banner' ? (
                <>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">URL Gambar</label>
                    <input
                      value={form.imageUrl}
                      onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                      placeholder="https://example.com/banner.jpg"
                      className="w-full bg-[#1a1a2e] border border-indigo-900/40 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">URL Tujuan (klik)</label>
                    <input
                      value={form.linkUrl}
                      onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                      placeholder="https://example.com"
                      className="w-full bg-[#1a1a2e] border border-indigo-900/40 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Kode Script / HTML</label>
                  <textarea
                    value={form.scriptCode}
                    onChange={(e) => setForm({ ...form, scriptCode: e.target.value })}
                    placeholder={'<script async src="..."></script>\n<!-- atau kode HTML iklan -->'}
                    rows={5}
                    className="w-full bg-[#1a1a2e] border border-indigo-900/40 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
              >
                {saving ? 'Menyimpan...' : 'Tambah Iklan'}
              </button>
            </form>
          </div>

          <div className="bg-[#13131f] border border-indigo-900/40 rounded-2xl p-6">
            <h2 className="font-semibold text-white mb-4">
              Daftar Iklan
              <span className="ml-2 text-xs text-gray-500 font-normal">({ads.length} iklan)</span>
            </h2>
            {loading ? (
              <div className="text-center text-gray-500 py-8 text-sm">Memuat...</div>
            ) : ads.length === 0 ? (
              <div className="text-center text-gray-600 py-8 text-sm">Belum ada iklan</div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {ads.map((ad) => (
                  <div
                    key={ad.id}
                    className={`border rounded-xl p-3 transition-colors ${
                      ad.active
                        ? 'border-indigo-900/40 bg-white/[0.02]'
                        : 'border-gray-800 bg-black/20 opacity-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{ad.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                            ad.type === 'banner'
                              ? 'bg-blue-900/40 text-blue-400'
                              : 'bg-purple-900/40 text-purple-400'
                          }`}>
                            {ad.type === 'banner' ? 'Banner' : 'Script'}
                          </span>
                          <span className="text-xs text-gray-500 capitalize">{ad.position}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleToggle(ad.id, ad.active)}
                          title={ad.active ? 'Nonaktifkan' : 'Aktifkan'}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        >
                          {ad.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(ad.id)}
                          className="p-1.5 rounded-lg hover:bg-red-900/30 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
