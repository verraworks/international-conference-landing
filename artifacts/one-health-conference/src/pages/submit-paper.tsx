import { useEffect, useState, type FormEvent } from "react";
import { Link } from "wouter";

const input = "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-600";
const label = "text-sm font-semibold";

const SCOPES = ["Occupational Health", "Medical Science Education", "Public Health Sciences", "Biomedical Sciences", "Clinical Medicine", "Nutrition"];
const STEPS = ["Info Artikel", "Co-Author", "Upload Dokumen", "Pernyataan", "Review & Submit"];

type CoAuthor = { fullName: string; email: string; affiliation: string; country: string };

export default function SubmitPaperPage() {
  const [token] = useState(() => localStorage.getItem("buich_token") || "");
  const [user, setUser] = useState<{ fullName: string; email: string } | null>(null);
  const [regCode, setRegCode] = useState("");
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [abstractText, setAbstractText] = useState("");
  const [keywords, setKeywords] = useState("");
  const [scope, setScope] = useState("");
  const [subType, setSubType] = useState("abstract");
  const [coAuthors, setCoAuthors] = useState<CoAuthor[]>([]);
  const [draftCo, setDraftCo] = useState<CoAuthor>({ fullName: "", email: "", affiliation: "", country: "Indonesia" });
  const [file, setFile] = useState<File | null>(null);
  const [filePath, setFilePath] = useState("");
  const [copyright, setCopyright] = useState(false);
  const [ethics, setEthics] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(async r => {
        if (!r.ok) throw new Error();
        const body = await r.json();
        setUser({ fullName: body.user.fullName, email: body.user.email });
        const reg = await fetch("/api/registrations/me", { headers: { Authorization: `Bearer ${token}` } }).then(x => x.json());
        if (reg.registration) setRegCode(reg.registration.registrationCode);
      })
      .catch(() => { localStorage.removeItem("buich_token"); window.location.href = "/portal"; });
  }, [token]);

  const canNext1 = title.trim().length >= 5 && abstractText.trim().length >= 80 && scope;
  const canNext3 = copyright && ethics;
  const canNext4 = file || filePath;

  const addCo = () => {
    if (!draftCo.fullName || !draftCo.email || !draftCo.affiliation) { setError("Lengkapi nama, email, dan afiliasi co-author."); return; }
    setCoAuthors([...coAuthors, draftCo]);
    setDraftCo({ fullName: "", email: "", affiliation: "", country: "Indonesia" });
    setError("");
  };

  const uploadFile = async () => {
    if (!file) { setError("Pilih file terlebih dahulu."); return; }
    setBusy(true); setError("");
    try {
      const contentType = file.type || (file.name.endsWith(".pdf") ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      const meta = await fetch("/api/storage/uploads/request-url", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: file.name, size: file.size, contentType, registrationCode: regCode }) }).then(r => r.json());
      if (!meta.uploadURL) throw new Error(meta.error || "Gagal siapkan upload.");
      const put = await fetch(meta.uploadURL, { method: "PUT", headers: { "Content-Type": contentType }, body: file });
      if (!put.ok) throw new Error("Upload file gagal.");
      setFilePath(meta.objectPath);
    } catch (e) { setError(e instanceof Error ? e.message : "Upload gagal."); } finally { setBusy(false); }
  };

  const submit = async () => {
    setBusy(true); setError("");
    try {
      const r = await fetch("/api/submissions", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationCode: regCode, fullName: user?.fullName, email: user?.email, title, submissionType: subType, scope, abstractText, keywords, fileName: file?.name, filePath, coAuthors, copyrightAgreed: copyright, ethicsAgreed: ethics }),
      });
      const body = await r.json();
      if (!r.ok) throw new Error(body.error);
      setDone(true);
    } catch (e) { setError(e instanceof Error ? e.message : "Submit gagal."); } finally { setBusy(false); }
  };

  const downloadTemplate = () => {
    const t = '<html><body><h1>BUICH 2026 Article Template</h1><p>Title:</p><p>Author(s):</p><p>Abstract (150–250 words):</p><p>Keywords:</p><p>1. Introduction</p><p>2. Methods</p><p>3. Results</p><p>4. Discussion</p><p>5. Conclusion</p><p>References</p></body></html>';
    const url = URL.createObjectURL(new Blob([t], { type: "application/msword" }));
    const a = document.createElement("a"); a.href = url; a.download = "BUICH-2026-Article-Template.doc"; a.click(); URL.revokeObjectURL(url);
  };

  if (!user) return <main className="min-h-screen bg-slate-50 px-5 py-20 text-center"><p>Loading...</p></main>;
  if (!regCode) return <main className="min-h-screen bg-slate-50 px-5 py-20"><div className="mx-auto max-w-lg rounded-3xl bg-white p-8 text-center"><h1 className="text-2xl font-black">Daftar Conference Dulu</h1><p className="mt-3 text-slate-600">Anda harus terdaftar di conference sebelum submit paper.</p><Link href="/registration" className="mt-6 inline-block rounded-xl bg-teal-700 px-6 py-3 font-bold text-white">Daftar Sekarang</Link></div></main>;
  if (done) return <main className="min-h-screen bg-slate-50 px-5 py-20"><div className="mx-auto max-w-lg rounded-3xl bg-white p-8 text-center"><div className="text-5xl">✓</div><h1 className="mt-4 text-3xl font-black">Paper Berhasil Diunggah!</h1><p className="mt-3 text-slate-600">Status: <strong>submitted</strong>. Paper akan direview oleh committee.</p><Link href="/my-papers" className="mt-6 inline-block rounded-xl bg-teal-700 px-6 py-3 font-bold text-white">Lihat Paper Saya</Link></div></main>;

  return <main className="min-h-screen bg-slate-50 px-5 py-10"><div className="mx-auto max-w-3xl">
    <Link href="/portal" className="text-sm font-bold text-teal-700">← Portal</Link>
    <h1 className="mt-4 text-4xl font-black">Submit Paper</h1>
    <div className="mt-6 flex gap-2 overflow-x-auto">{STEPS.map((s, i) => <button key={s} onClick={() => setStep(i)} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold ${i === step ? "bg-teal-700 text-white" : i < step ? "bg-teal-100 text-teal-800" : "bg-white text-slate-400"}`}>{i + 1}. {s}</button>)}</div>
    {error && <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}

    <div className="mt-6 rounded-3xl bg-white p-7 shadow-sm">
      {step === 0 && <div className="grid gap-4">
        <label className={label}>Judul Artikel *<input required className={input} value={title} onChange={e => setTitle(e.target.value)} placeholder="Judul paper (min 5 karakter)" /></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={label}>Tipe *<select className={input} value={subType} onChange={e => setSubType(e.target.value)}><option value="abstract">Abstract</option><option value="full-paper">Full Paper</option></select></label>
          <label className={label}>Scope / Bidang *<select className={input} value={scope} onChange={e => setScope(e.target.value)}><option value="">— Pilih —</option>{SCOPES.map(s => <option key={s}>{s}</option>)}</select></label>
        </div>
        <label className={label}>Abstrak * (min 80 karakter)<textarea required className={`${input} min-h-36`} value={abstractText} onChange={e => setAbstractText(e.target.value)} placeholder="Latar belakang, metode, hasil, kesimpulan..." /></label>
        <label className={label}>Kata Kunci<input className={input} value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="emergency care, occupational health" /></label>
        <button disabled={!canNext1} onClick={() => setStep(1)} className="rounded-xl bg-teal-700 px-4 py-3 font-bold text-white disabled:opacity-50">Lanjut: Co-Author →</button>
      </div>}

      {step === 1 && <div>
        <h2 className="text-xl font-black">Penulis</h2>
        <div className="mt-3 rounded-xl bg-slate-50 p-4 text-sm"><p className="font-bold">{user.fullName} (Penulis Utama)</p><p className="text-slate-500">{user.email}</p></div>
        <h3 className="mt-6 font-bold">Co-Author ({coAuthors.length})</h3>
        {coAuthors.map((c, i) => <div key={i} className="mt-3 flex items-center justify-between rounded-xl border p-3 text-sm"><div><p className="font-bold">{c.fullName}</p><p className="text-xs text-slate-500">{c.email} · {c.affiliation}</p></div><button onClick={() => setCoAuthors(coAuthors.filter((_, j) => j !== i))} className="text-red-600 font-bold">Hapus</button></div>)}
        <div className="mt-5 grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
          <input className={input} placeholder="Nama co-author" value={draftCo.fullName} onChange={e => setDraftCo({ ...draftCo, fullName: e.target.value })} />
          <input className={input} placeholder="Email" value={draftCo.email} onChange={e => setDraftCo({ ...draftCo, email: e.target.value })} />
          <input className={input} placeholder="Afiliasi / Institusi" value={draftCo.affiliation} onChange={e => setDraftCo({ ...draftCo, affiliation: e.target.value })} />
          <input className={input} placeholder="Negara" value={draftCo.country} onChange={e => setDraftCo({ ...draftCo, country: e.target.value })} />
          <button onClick={addCo} className="sm:col-span-2 rounded-xl border border-teal-700 px-4 py-2 font-bold text-teal-700">+ Tambah Co-Author</button>
        </div>
        <div className="mt-6 flex gap-3"><button onClick={() => setStep(0)} className="rounded-xl border px-4 py-3 font-bold">← Kembali</button><button onClick={() => setStep(2)} className="flex-1 rounded-xl bg-teal-700 px-4 py-3 font-bold text-white">Lanjut: Upload →</button></div>
      </div>}

      {step === 2 && <div>
        <h2 className="text-xl font-black">Upload Dokumen</h2>
        <button onClick={downloadTemplate} className="mt-3 rounded-full border border-teal-700 px-4 py-2 text-xs font-bold text-teal-700">⬇ Download Template Resmi BUICH</button>
        <input type="file" accept=".pdf,.doc,.docx" className="mt-5 w-full" onChange={e => setFile(e.target.files?.[0] || null)} />
        {file && !filePath && <button disabled={busy} onClick={uploadFile} className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-3 font-bold text-white">{busy ? "Uploading..." : "Upload File"}</button>}
        {filePath && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">✓ File terunggah: {file?.name}</p>}
        <div className="mt-6 flex gap-3"><button onClick={() => setStep(1)} className="rounded-xl border px-4 py-3 font-bold">← Kembali</button><button disabled={!canNext4} onClick={() => setStep(3)} className="flex-1 rounded-xl bg-teal-700 px-4 py-3 font-bold text-white disabled:opacity-50">Lanjut: Pernyataan →</button></div>
      </div>}

      {step === 3 && <div className="grid gap-4">
        <h2 className="text-xl font-black">Pernyataan Orisinalitas</h2>
        <label className="flex gap-3 rounded-xl border p-4 text-sm"><input type="checkbox" checked={copyright} onChange={e => setCopyright(e.target.checked)} className="mt-1" /><span><strong>Copyright Agreement.</strong> Saya menyetujui pengalihan hak publikasi ke BUICH 2026 dan menyatakan paper ini belum dipublikasikan di tempat lain.</span></label>
        <label className="flex gap-3 rounded-xl border p-4 text-sm"><input type="checkbox" checked={ethics} onChange={e => setEthics(e.target.checked)} className="mt-1" /><span><strong>Etika Publikasi.</strong> Saya menyatakan karya ini orisinal, bebas plagiarisme, dan semua penulis telah menyetujui submission ini.</span></label>
        <div className="mt-2 flex gap-3"><button onClick={() => setStep(2)} className="rounded-xl border px-4 py-3 font-bold">← Kembali</button><button disabled={!canNext3} onClick={() => setStep(4)} className="flex-1 rounded-xl bg-teal-700 px-4 py-3 font-bold text-white disabled:opacity-50">Lanjut: Review →</button></div>
      </div>}

      {step === 4 && <div>
        <h2 className="text-xl font-black">Review & Submit</h2>
        <div className="mt-4 grid gap-2 text-sm">
          <p><strong>Judul:</strong> {title}</p>
          <p><strong>Tipe:</strong> {subType} · <strong>Scope:</strong> {scope}</p>
          <p><strong>Penulis:</strong> {user.fullName} + {coAuthors.length} co-author</p>
          <p><strong>File:</strong> {file?.name}</p>
          <p><strong>Copyright:</strong> {copyright ? "✓" : "✗"} · <strong>Etika:</strong> {ethics ? "✓" : "✗"}</p>
        </div>
        <div className="mt-6 flex gap-3"><button onClick={() => setStep(3)} className="rounded-xl border px-4 py-3 font-bold">← Kembali</button><button disabled={busy} onClick={submit as unknown as (e: FormEvent) => void} className="flex-1 rounded-xl bg-teal-700 px-4 py-3 font-bold text-white disabled:opacity-50">{busy ? "Submitting..." : "Submit Paper"}</button></div>
      </div>}
    </div>
  </div></main>;
}
