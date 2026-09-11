// data.js — Pindahkan seluruh variabel default ke sini
// Panggil di index.html: <script src="./data.js"></script> SEBELUM blok Babel

const DEF_WALLETS = [
  { id: 'w1', name: 'Dompet Utama', balance: 0, icon: 'wallet', color: '#3b82f6' },
  { id: 'w2', name: 'Tabungan',     balance: 0, icon: 'wallet', color: '#10b981' },
  { id: 'w3', name: 'E-Wallet',     balance: 0, icon: 'wallet', color: '#8b5cf6' },
];

const DEF_EXP_CAT = [
  { id: 'e1', name: 'Makan & Minum',  icon: '🍔', color: '#ef4444' },
  { id: 'e2', name: 'Transportasi',   icon: '🚗', color: '#f97316' },
  { id: 'e3', name: 'Belanja',        icon: '🛒', color: '#eab308' },
  { id: 'e4', name: 'Tagihan',        icon: '📄', color: '#6366f1' },
  { id: 'e5', name: 'Hiburan',        icon: '🎮', color: '#ec4899' },
  { id: 'e6', name: 'Kesehatan',      icon: '💊', color: '#14b8a6' },
  { id: 'e7', name: 'Pendidikan',     icon: '📚', color: '#3b82f6' },
  { id: 'e8', name: 'Lainnya',        icon: '📦', color: '#6b7280' },
];

const DEF_INC_CAT = [
  { id: 'i1', name: 'Gaji',        icon: '💰', color: '#10b981' },
  { id: 'i2', name: 'Freelance',   icon: '💻', color: '#3b82f6' },
  { id: 'i3', name: 'Investasi',   icon: '📈', color: '#8b5cf6' },
  { id: 'i4', name: 'Hadiah',      icon: '🎁', color: '#ec4899' },
  { id: 'i5', name: 'Lainnya',     icon: '💵', color: '#6b7280' },
];

const DEF_BUDGETS = [
  { id: 'b1', catId: 'e1', limit: 1500000, period: 'monthly' },
  { id: 'b2', catId: 'e2', limit: 500000,  period: 'monthly' },
  { id: 'b3', catId: 'e3', limit: 800000,  period: 'monthly' },
];