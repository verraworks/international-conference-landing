import { useEffect, useState, type FormEvent } from "react";
import { Link } from "wouter";

const input = "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-600";
const label = "text-sm font-semibold";

export const FEE_TABLE = [
  { category: "Early Bird — Oral Presenter", idr: 650000, usd: "36.63 USD" },
  { category: "Internal Oral Presenter (Students & Staff)", idr: 500000, usd: "28.18 USD" },
  { category: "External Participant Only", idr: 300000, usd: "16.92 USD" },
  { category: "Internal Participant Only", idr: 150000, usd: "8.46 USD" },
  { category: "Oral Presenter — Online", idr: 850000, usd: "47.94 USD" },
  { category: "Oral Presenter — Offline", idr: 1000000, usd: "56.41 USD" },
  { category: "Proceedings Publication (SINTA 4)", idr: 1850000, usd: "104.36 USD" },
];

export function calculateFee(origin: string, regType: string, attendance: string): { idr: number; usd: string } {
  if (regType === "Proceedings Publication") return { idr: 1850000, usd: "104.36 USD" };
  if (regType === "Oral Presenter") {
    if (attendance === "OFFLINE") return { idr: 1000000, usd: "56.41 USD" };
    if (attendance === "ONLINE") return { idr: 850000, usd: "47.94 USD" };
    if (origin.includes("Internal")) return { idr: 500000, usd: "28.18 USD" };
    return { idr: 650000, usd: "36.63 USD" };
  }
  if (origin.includes("Internal")) return { idr: 150000, usd: "8.46 USD" };
  return { idr: 300000, usd: "16.92 USD" };
}

export function formatIDR(n: number) {
  return "IDR " + n.toLocaleString("id-ID");
}

const initial = {
  fullName: "", npmNidn: "", studyProgram: "", institution: "Batam University",
  phone: "", country: "Indonesia", participantOrigin: "",
  userStatus: "", attendanceStatus: "", registrationType: "",
  consent: false,
};

export default function RegistrationPage() {
  const [token] = useState(() => localStorage.getItem("buich_token") || "");
  const [email, setEmail] = useState("");
  const [form, setForm] = useState(initial);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(async r => {
        if (!r.ok) throw new Error();
        const contentType = r.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) throw new Error();
        const body = await r.json();
        setForm(v => ({ ...v, fullName: body.user.fullName }));
        setEmail(body.user.email);
        setReady(true);
      })
      .catch(() => localStorage.removeItem("buich_token"));
  }, [token]);

  const fee = calculateFee(form.participantOrigin, form.registrationType, form.attendanceStatus);

  const set = (k: string, v: string | boolean) => setForm(prev => ({ ...prev, [k]: v }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true); setError("");
    try {
      const payload = {
        fullName: form.fullName, email,
        phone: form.phone, institution: form.institution, country: form.country,
        participantOrigin: form.participantOrigin, npmNidn: form.npmNidn,
        studyProgram: form.studyProgram, userStatus: form.userStatus,
        attendanceStatus: form.attendanceStatus, registrationType: form.registrationType,
        participationType: form.attendanceStatus === "ONLINE" ? "online" : "onsite",
        feeAmount: fee.idr, currency: "IDR", consent: true,
      };
      const r = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const body = await r.json();
      if (!r.ok) throw new Error(body.error);
      setCode(body.registration.registrationCode);
      setMessage(`Pendaftaran berhasil. Total bayar: ${formatIDR(fee.idr)} (${fee.usd}).`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Pendaftaran gagal.");
    } finally { setBusy(false); }
  };

  if (!token || !ready) return <main className="min-h-screen bg-slate-50 px-5 py-20"><div className="mx-auto max-w-lg rounded-3xl bg-white p-8 shadow-sm"><Link href="/" className="text-sm font-bold text-teal-700">← Kembali ke BUICH</Link><h1 className="mt-6 text-4xl font-black">Pendaftaran BUICH</h1><p className="mt-3 leading-7 text-slate-600">Silakan masuk atau buat akun terlebih dahulu. Ini menjaga data dan bukti pembayaran Anda tetap aman.</p><div className="mt-7 flex gap-3"><Link href="/portal" className="rounded-xl border border-teal-700 px-5 py-3 font-bold text-teal-700">Login</Link><Link href="/portal?mode=register" className="rounded-xl bg-teal-700 px-5 py-3 font-bold text-white">Register akun</Link></div></div></main>;

  if (code) return <main className="min-h-screen bg-slate-50 px-5 py-12"><div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-sm text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">✓</div><h1 className="mt-5 text-3xl font-black">Berhasil terdaftar!</h1><p className="mt-3 text-slate-600">{message}</p><div className="mt-6 rounded-2xl bg-slate-900 p-6 text-white"><p className="text-xs uppercase tracking-widest text-teal-300">Kode verifikasi Anda</p><p className="mt-2 text-3xl font-black tracking-widest">{code}</p><p className="mt-2 text-xs text-slate-400">Simpan kode ini untuk verifikasi saat masuk acara.</p></div><Link href="/portal" className="mt-7 inline-block rounded-xl bg-teal-700 px-6 py-3 font-bold text-white">Lanjut upload bukti bayar →</Link></div></main>;

  return <main className="min-h-screen bg-slate-50 px-5 py-12"><div className="mx-auto max-w-3xl"><Link href="/" className="text-sm font-bold text-teal-700">← Kembali ke BUICH</Link>
    <div className="mt-6 rounded-3xl bg-white p-7 shadow-sm sm:p-10">
      <p className="text-xs font-bold uppercase tracking-widest text-teal-700">BUICH 2026 · Form pendaftaran</p>
      <h1 className="mt-3 text-4xl font-black">Form pendaftaran peserta</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">Lengkapi data berikut. Harga otomatis mengikuti pilihan Anda.</p>
      <form className="mt-7 grid gap-4 sm:grid-cols-2" onSubmit={submit}>
        <label className={`${label} sm:col-span-2`}>Apakah Anda Internal atau External Participant? *<select required className={input} value={form.participantOrigin} onChange={e => set({ ...form, participantOrigin: e.target.value } as never) || setForm(v => ({ ...v, participantOrigin: e.target.value }))}><option value="">— Pilih —</option><option>Internal Participant (Students and Staff of Batam University)</option><option>External Participant</option></select></label>
        <label className={label}>NAME *<input required className={input} value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} /></label>
        <label className={label}>NPM/NIDN *<input required className={input} value={form.npmNidn} onChange={e => setForm({ ...form, npmNidn: e.target.value })} /></label>
        <label className={label}>EMAIL *<input disabled className={`${input} bg-slate-100`} value={email} /></label>
        <label className={label}>PHONE NUMBER (WA) *<input required className={input} placeholder="+62..." value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></label>
        <label className={label}>STUDY PROGRAM *<input required className={input} placeholder="e.g. Medicine / Nursing" value={form.studyProgram} onChange={e => setForm({ ...form, studyProgram: e.target.value })} /></label>
        <label className={label}>UNIVERSITY/INSTITUTION *<input required className={input} value={form.institution} onChange={e => setForm({ ...form, institution: e.target.value })} /></label>
        <label className={label}>STATUS *<select required className={input} value={form.userStatus} onChange={e => setForm({ ...form, userStatus: e.target.value })}><option value="">— Pilih —</option><option>STUDENT</option><option>LECTURER/STAFF</option></select></label>
        <label className={label}>REGISTRATION TYPE *<select required className={input} value={form.registrationType} onChange={e => setForm({ ...form, registrationType: e.target.value })}><option value="">— Pilih —</option><option>Participant Only</option><option>Oral Presenter</option><option>Proceedings Publication</option></select></label>
        <label className={label}>ATTENDANCE STATUS *<select required className={input} value={form.attendanceStatus} onChange={e => setForm({ ...form, attendanceStatus: e.target.value })}><option value="">— Pilih —</option><option>ONLINE</option><option>OFFLINE</option></select></label>
        <div className="sm:col-span-2 rounded-2xl bg-teal-50 p-5"><p className="text-xs font-bold uppercase tracking-widest text-teal-700">Total pembayaran</p><p className="mt-2 text-3xl font-black text-teal-900">{formatIDR(fee.idr)}</p><p className="text-sm text-teal-700">≈ {fee.usd} · Note: USD rate is subject to exchange rate adjustment.</p></div>
        {error && <p className="sm:col-span-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <button disabled={busy} className="sm:col-span-2 rounded-xl bg-teal-700 px-4 py-3 font-bold text-white disabled:opacity-60">{busy ? "Menyimpan..." : "Simpan pendaftaran"}</button>
      </form>
    </div></div></main>;
}
