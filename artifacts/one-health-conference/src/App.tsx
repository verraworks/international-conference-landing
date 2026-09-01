import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ArrowDown,
  ArrowUpRight,
  BookOpen,
  BriefcaseMedical,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  FileText,
  Globe2,
  Mail,
  MapPin,
  Menu,
  Network,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();
type Language = 'EN' | 'ID';
type DialogKind = 'register' | 'abstract' | 'newsletter' | null;
type ScheduleDay = 'day1' | 'day2';

const navItems = [
  ['Context', '#context'],
  ['Program', '#program'],
  ['Speakers', '#speakers'],
  ['Papers', '#papers'],
  ['Contact', '#contact'],
];

const speakers = [
  {
    name: 'Prof. Asnawi Abdullah, Ph.D',
    role: 'Keynote speaker',
    affiliation: 'Head of the Health Development Policy Agency, Ministry of Health of the Republic of Indonesia',
    topic: 'Emergency Policy Transformation: Building Resilient Emergency and Critical Care Systems in the Industrial Era',
    code: '01',
    tone: 'amber',
  },
  {
    name: 'Prof. Idrus Patarusi, Sp.OT (K)',
    role: 'Plenary speaker 01',
    affiliation: 'Orthopaedic and trauma specialist',
    topic: 'Common Individual Accident and Mass Casualty Incident in Industrial Setting Management, Triage Systems and Transportation',
    code: '02',
    tone: 'teal',
  },
  {
    name: 'dr. Sutrisno Gunawan, SpAn-TI, FCICM',
    role: 'Plenary speaker 02',
    affiliation: 'Townsville University Hospital, Queensland, Australia',
    topic: 'Prehospital Critical Care: Stabilization and Safe Transport of Critically Ill Patients',
    code: '03',
    tone: 'blue',
  },
  {
    name: 'dr. Anita Johan, M.KK',
    role: 'Plenary speaker 03',
    affiliation: 'Secretary of the Association of Occupational Health Physicians Indonesia (IDKI)',
    topic: 'Integrating Emergency Referral Pathways Between Workplace Health Facilities and Hospitals',
    code: '04',
    tone: 'coral',
  },
  {
    name: 'Dr. dr. Hendra Zufry, Sp.PD, KEMD, FINASIM',
    role: 'Plenary speaker 04',
    affiliation: 'Faculty of Medicine, Universitas Syiah Kuala / Dr. Zainoel Abidin Hospital, Banda Aceh, Indonesia',
    topic: "What's new on Diabetic Ketoacidosis",
    code: '05',
    tone: 'teal',
  },
  {
    name: 'Dr med. Benny Santosa, SpPD, KEMD, FINASIM',
    role: 'Plenary speaker 05',
    affiliation: 'St Joseph Krankenhaus Balserische Stiftung Gießen',
    topic: 'Steroid Use, Abuse and Adrenal Crisis',
    code: '06',
    tone: 'amber',
  },
];

const scopeData = [
  {
    title: 'Occupational Health',
    index: '01',
    icon: ShieldCheck,
    description: 'From OSH management and risk assessment to emergency response, mental health, rehabilitation, and the community impact of industrial hazards.',
    topics: ['Occupational Safety and Health (OSH) Management', 'Workplace Hazard Identification and Risk Assessment', 'Industrial Hygiene and Environmental Monitoring', 'Workplace Emergency Preparedness and Response', 'Occupational Mental Health and Psychosocial Hazards', 'Heat Stress and Climate Change in Occupational Settings', 'Community Impact of Industrial and Workplace Hazards'],
  },
  {
    title: 'Medical Science Education',
    index: '02',
    icon: BookOpen,
    description: 'Evidence-led education for the next generation of health professionals, including simulation, digital learning, and interprofessional practice.',
    topics: ['Innovation in Medical and Health Professions Education', 'Competency-Based Medical Education', 'Simulation-Based Learning in Emergency and Critical Care', 'Interprofessional Education and Collaborative Practice', 'Digital Learning and Artificial Intelligence in Medical Education', 'Clinical Skills Training and Assessment', 'Continuing Professional Development for Healthcare Workers'],
  },
  {
    title: 'Public Health Sciences',
    index: '03',
    icon: Network,
    description: 'Global threats, surveillance, environmental health, systems strengthening, disaster risk reduction, and One Health approaches.',
    topics: ['Global Health and Emerging Health Threats', 'Epidemiology and Disease Surveillance', 'Occupational and Environmental Public Health', 'Public Health Emergency Preparedness and Response', 'Infectious Disease Prevention and Control', 'Disaster Risk Reduction and Community Resilience', 'One Health and Planetary Health Approaches'],
  },
  {
    title: 'Biomedical Sciences',
    index: '04',
    icon: Sparkles,
    description: 'Molecular insight and translational innovation for occupational, emergency, and critical illness.',
    topics: ['Molecular and Cellular Biology', 'Pathophysiology of Occupational and Critical Illnesses', 'Toxicology and Biomarker Research', 'Immunology and Infectious Diseases', 'Biomedical Engineering and Medical Technology', 'Artificial Intelligence in Biomedical Sciences', 'Biomedical Approaches in Emergency and Critical Care'],
  },
  {
    title: 'Clinical Medicine',
    index: '05',
    icon: BriefcaseMedical,
    description: 'Emergency and critical care, trauma, chronic disease management, patient safety, ethics, and functional recovery.',
    topics: ['Emergency and Critical Care Medicine', 'Occupational and Environmental Medicine', 'Trauma and Acute Care Management', 'Cardiovascular and Respiratory Emergencies', 'Disaster Medicine and Mass Casualty Management', 'Patient Safety and Quality Improvement', 'Rehabilitation Medicine and Functional Recovery'],
  },
  {
    title: 'Nutrition',
    index: '06',
    icon: Users,
    description: 'Clinical, occupational, community, and sustainable nutrition for resilience, performance, and disease prevention.',
    topics: ['Clinical Nutrition and Metabolic Disorders', 'Nutrition in Emergency and Critical Care', 'Occupational Nutrition and Worker Performance', 'Community and Public Health Nutrition', 'Nutrition and Non-Communicable Diseases', 'Nutritional Epidemiology', 'Sustainable Nutrition and Food Systems'],
  },
];

const schedule = {
  day1: [
    ['07.30–08.00', 'Registration', 'Arrival and attendance confirmation'],
    ['08.00–08.45', 'Opening session', 'Opening by MC, anthems, prayer, and welcome speeches from Batam University leadership'],
    ['08.50–09.30', 'Keynote / Prof. Asnawi Abdullah, Ph.D', 'Emergency Policy Transformation: Building Resilient Emergency and Critical Care Systems in the Industrial Era'],
    ['09.30–09.35', 'Introduction of speaker session 01', 'Prof. Idrus Patarusi, Sp.OT (K)'],
    ['09.35–10.10', 'Plenary session 01 / Prof. Idrus Patarusi, Sp.OT (K)', 'Common Individual Accident and Mass Casualty Incident in Industrial Setting Management, Triage Systems and Transportation'],
    ['10.10–10.25', 'Question and answer session 01', 'Discussion with Prof. Idrus Patarusi, moderated by dr. Mukharradhi Nanza, Sp.OT'],
    ['10.25–10.30', 'Introduction of speaker session 02', 'dr. Sutrisno Gunawan, SpAn-TI, FCICM, DipPOM DDU Critical Care, GradCert Aeromedicine'],
    ['10.30–11.05', 'Plenary session 02 / dr. Sutrisno Gunawan', 'Prehospital Critical Care: Stabilization and Safe Transport of Critically Ill Patients'],
    ['11.05–11.20', 'Question and answer session 02', 'Discussion with dr. Sutrisno Gunawan, moderated by dr. Indra Nurhidayat, SpAn-TI'],
    ['11.20–13.00', 'Break time', ''],
    ['13.30–13.35', 'Introduction of speaker session 03', 'dr. Anita Johan, M.KK'],
    ['13.35–14.05', 'Plenary session 03 / dr. Anita Johan, M.KK', 'Integrating Emergency Referral Pathways Between Workplace Health Facilities and Hospitals'],
    ['14.05–14.20', 'Question and answer session 03', 'Discussion with dr. Anita Johan, moderated by dr. Rusdani, M.KKK'],
    ['14.25–16.00', 'Paper presentation', 'Oral presentations and scientific exchange'],
    ['16.00–16.30', 'Closing by MC', ''],
  ],
  day2: [
    ['07.30–08.00', 'Registration', ''],
    ['08.00–08.30', 'Opening session by MC', ''],
    ['08.30–12.00', 'Paper presentation', 'Oral presentations and scientific exchange'],
    ['12.00–13.00', 'Break time', ''],
    ['13.00–13.05', 'Introduction of speaker session 04', 'Dr. dr. Hendra Zufry, Sp.PD, KEMD, FINASIM'],
    ['13.05–13.40', 'Plenary session 04 / Dr. dr. Hendra Zufry', "What's new on Diabetic Ketoacidosis"],
    ['13.40–13.55', 'Question and answer session 04', 'Discussion with Dr. dr. Hendra Zufry, moderated by dr. Muhammad Ali Sabisi, Sp.PD'],
    ['13.55–14.00', 'Introduction of speaker session 05', 'Dr med. Benny Santosa, SpPD, KEMD, FINASIM'],
    ['14.00–14.35', 'Plenary session 05 / Dr med. Benny Santosa', 'Steroid Use, Abuse and Adrenal Crisis'],
    ['14.35–14.50', 'Question and answer session 05', 'Discussion with Dr med. Benny Santosa, moderated by dr. Liya Anjelina, Sp.PD'],
    ['14.50–15.15', 'Closing by MC', ''],
  ],
};

const objectives = [
  'Enhance knowledge and awareness of emergency and critical care principles among workers, occupational health personnel, and community stakeholders.',
  'Improve the capacity of workplace first responders and relevant personnel to recognize and manage medical emergencies effectively and promptly.',
  'Strengthen coordination and integration between workplace health systems, community health services, and emergency referral networks.',
  'Promote standardized emergency preparedness and response protocols in workplace and community settings.',
  'Encourage multi-sectoral collaboration among stakeholders in addressing health risks and emergency situations.',
  'Support resilient systems that can respond to routine emergencies and large-scale public health crises.',
  'Foster knowledge exchange, best practices, and innovation in emergency and critical care within occupational and community contexts.',
];

function AppLink({ href, children, className = '', onClick, testId }: { href: string; children: ReactNode; className?: string; onClick?: () => void; testId?: string }) {
  return <a href={href} onClick={onClick} className={`focus-ring ${className}`} data-testid={testId ?? `link-${href.replace('#', '').replace('/', '') || 'home'}`}>{children}</a>;
}

function Countdown() {
  const target = useMemo(() => new Date('2026-12-04T08:00:00+07:00').getTime(), []);
  const [left, setLeft] = useState(() => Math.max(0, target - Date.now()));
  useEffect(() => {
    const timer = window.setInterval(() => setLeft(Math.max(0, target - Date.now())), 1000);
    return () => window.clearInterval(timer);
  }, [target]);
  const units = [
    ['days', Math.floor(left / 86400000)],
    ['hours', Math.floor((left / 3600000) % 24)],
    ['mins', Math.floor((left / 60000) % 60)],
    ['secs', Math.floor((left / 1000) % 60)],
  ];
  return <div className="grid grid-cols-4 gap-2 sm:gap-3" data-testid="countdown-event">
    {units.map(([label, value]) => <div key={label} className="glass-panel px-2 py-3 text-center sm:px-4"><div className="font-display text-3xl leading-none text-[hsl(var(--foreground))] sm:text-4xl">{String(value).padStart(2, '0')}</div><div className="mt-2 font-mono-label text-[9px] uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">{label}</div></div>)}
  </div>;
}

function Modal({ kind, onClose, language }: { kind: Exclude<DialogKind, null>; onClose: () => void; language: Language }) {
  const [sent, setSent] = useState(false);
  const abstract = kind === 'abstract';
  const newsletter = kind === 'newsletter';
  const title = newsletter ? 'Stay in the signal.' : abstract ? 'Bring the work forward.' : 'Secure your place.';
  if (sent) return <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true"><div className="glass-panel w-full max-w-lg p-7 text-center sm:p-12"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--primary-foreground))]"><Check size={26} /></div><p className="mt-6 font-mono-label text-[10px] uppercase tracking-[.22em] text-[hsl(var(--secondary))]">Received with thanks</p><h2 className="mt-3 font-display text-5xl text-[hsl(var(--foreground))]">You are on the list.</h2><p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-[hsl(var(--muted-foreground))]">{abstract ? 'Your interest in presenting at BUICH 2026 has been recorded. Submission details will be shared when available.' : 'The organizing committee will share the next steps and official links when they are available.'}</p><button onClick={onClose} className="magnetic mt-8 border border-[hsl(var(--primary))] px-6 py-3 font-mono-label text-[10px] uppercase tracking-[.16em] text-[hsl(var(--foreground))]" data-testid="button-finish-dialog">Close</button></div></div>;
  return <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4" role="dialog" aria-modal="true" aria-label={title}>
    <div className="glass-panel relative my-4 w-full max-w-xl p-6 sm:p-10">
      <button onClick={onClose} className="focus-ring absolute right-5 top-5 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--secondary))]" aria-label="Close dialog" data-testid="button-close-dialog"><X size={20} /></button>
      <p className="font-mono-label text-[10px] uppercase tracking-[.22em] text-[hsl(var(--secondary))]">{abstract ? 'Call for papers' : newsletter ? 'Conference updates' : language === 'ID' ? 'Pendaftaran peserta' : 'Participation'}</p>
      <h2 className="mt-3 max-w-md font-display text-5xl leading-[.95] text-[hsl(var(--foreground))]">{title}</h2>
      <p className="mt-4 max-w-lg text-sm leading-6 text-[hsl(var(--muted-foreground))]">{abstract ? 'The official submission link and important dates are to be announced. Register your interest and we will notify you when the portal opens.' : newsletter ? 'Leave your email for official updates from the BUICH 2026 organizing committee.' : 'Registration details, fees, and the official registration link are to be announced by the organizing committee.'}</p>
      <form className="mt-7 space-y-4" onSubmit={(event) => { event.preventDefault(); setSent(true); }}>
        {!newsletter && <label className="block"><span className="font-mono-label text-[10px] uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))]">Full name</span><input required className="mt-2 w-full border-b border-[hsl(var(--border))] bg-transparent px-0 py-3 text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--secondary))]" placeholder="Your name" data-testid="input-full-name" /></label>}
        <label className="block"><span className="font-mono-label text-[10px] uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))]">Email address</span><input required type="email" className="mt-2 w-full border-b border-[hsl(var(--border))] bg-transparent px-0 py-3 text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--secondary))]" placeholder="you@institution.org" data-testid="input-email" /></label>
        {!newsletter && <label className="block"><span className="font-mono-label text-[10px] uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))]">Participation format</span><select className="mt-2 w-full border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-0 py-3 text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--secondary))]" defaultValue="hybrid" data-testid="select-participation-format"><option value="hybrid">Hybrid / undecided</option><option value="onsite">On-site at Batam University</option><option value="online">Online via Zoom Meeting</option></select></label>}
        {abstract && <label className="block"><span className="font-mono-label text-[10px] uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))]">Contribution type</span><select className="mt-2 w-full border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-0 py-3 text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--secondary))]" defaultValue="oral" data-testid="select-contribution-type"><option value="oral">Oral presentation</option><option value="poster">Poster presentation</option></select></label>}
        <button className="magnetic mt-3 inline-flex w-full items-center justify-center gap-3 bg-[hsl(var(--secondary))] px-5 py-4 font-mono-label text-[10px] uppercase tracking-[.17em] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--foreground))]" data-testid="button-submit-dialog">{abstract ? 'Register interest' : newsletter ? 'Subscribe to updates' : 'Continue'} <ArrowUpRight size={15} /></button>
      </form>
    </div>
  </div>;
}

function Home() {
  const [language, setLanguage] = useState<Language>('EN');
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [scheduleDay, setScheduleDay] = useState<ScheduleDay>('day1');
  const [activeScope, setActiveScope] = useState(0);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') { setMenuOpen(false); setDialog(null); } };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>('main > section:not(:first-child)'));
    if (!('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  const id = language === 'ID';
  const closeMenu = () => setMenuOpen(false);

  return <div className="site-shell grain min-h-[100dvh] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-[hsl(var(--foreground)/.1)] bg-[hsl(var(--background)/.8)] backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <AppLink href="#" className="flex items-center gap-3" onClick={closeMenu} testId="link-home">
          <span className="flex h-9 w-9 items-center justify-center border border-[hsl(var(--secondary))] text-[hsl(var(--secondary))]"><Network size={18} /></span>
          <span className="font-mono-label text-[10px] uppercase leading-[1.2] tracking-[.14em]"><span className="text-[hsl(var(--secondary))]">BUICH</span><br />Batam University · 2026</span>
        </AppLink>
        <nav className="hidden items-center gap-7 lg:flex">{navItems.map(([label, href]) => <AppLink key={href} href={href} className="line-link font-mono-label text-[10px] uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">{label}</AppLink>)}</nav>
        <div className="hidden items-center gap-3 md:flex">
          <button onClick={() => setLanguage(id ? 'EN' : 'ID')} className="focus-ring flex items-center gap-2 border-l border-[hsl(var(--border))] pl-4 font-mono-label text-[10px] uppercase tracking-[.13em] text-[hsl(var(--secondary))]" data-testid="button-language-toggle"><Globe2 size={14} /> {language}</button>
          <button onClick={() => setDialog('register')} className="magnetic bg-[hsl(var(--secondary))] px-4 py-3 font-mono-label text-[10px] uppercase tracking-[.13em] text-[hsl(var(--primary-foreground))]" data-testid="button-header-register">{id ? 'Daftar' : 'Register now'}</button>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} className="focus-ring flex h-10 w-10 items-center justify-center border border-[hsl(var(--border))] text-[hsl(var(--foreground))] md:hidden" aria-label="Toggle navigation" data-testid="button-mobile-menu">{menuOpen ? <X size={18} /> : <Menu size={18} />}</button>
      </div>
      {menuOpen && <div className="border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 md:hidden"><div className="grid gap-5">{navItems.map(([label, href]) => <AppLink key={href} href={href} onClick={closeMenu} className="font-mono-label text-[11px] uppercase tracking-[.18em] text-[hsl(var(--foreground))]">{label}</AppLink>)}<button onClick={() => setLanguage(id ? 'EN' : 'ID')} className="flex items-center gap-2 text-left font-mono-label text-[11px] uppercase tracking-[.18em] text-[hsl(var(--secondary))]" data-testid="button-mobile-language"><Globe2 size={14} /> {id ? 'English' : 'Bahasa Indonesia'}</button><button onClick={() => { setDialog('register'); closeMenu(); }} className="bg-[hsl(var(--secondary))] px-4 py-3 text-left font-mono-label text-[10px] uppercase tracking-[.16em] text-[hsl(var(--primary-foreground))]" data-testid="button-mobile-register">Register now</button></div></div>}
    </header>

    <main>
      <section className="relative flex min-h-[790px] items-end overflow-hidden bg-[hsl(var(--background))] pt-28 sm:min-h-[860px]" aria-labelledby="hero-title">
        <div className="hero-grid absolute inset-0 opacity-80" /><div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_45%,hsl(193_64%_44%/.16),transparent_25%),radial-gradient(circle_at_82%_80%,hsl(35_96%_58%/.11),transparent_20%)]" />
        <div className="orbital orbit-a drift" /><div className="orbital orbit-b drift" /><div className="orbital orbit-c" />
        <div className="absolute right-[23%] top-[34%] hidden items-center gap-3 md:flex"><span className="signal-dot" /><span className="font-mono-label text-[9px] uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">worker / response</span></div>
        <div className="absolute bottom-[19%] right-[7%] hidden items-center gap-3 lg:flex"><span className="h-2 w-2 rounded-full bg-[hsl(var(--accent))] shadow-[0_0_0_8px_hsl(var(--accent)/.12)]" /><span className="font-mono-label text-[9px] uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">community / environment</span></div>
        <div className="relative mx-auto w-full max-w-[1440px] px-5 pb-14 sm:px-8 sm:pb-20 lg:px-12">
          <div className="max-w-3xl">
            <p className="accent-line reveal font-mono-label text-[10px] uppercase tracking-[.19em] text-[hsl(var(--secondary))]">{id ? 'Konferensi internasional · Batam 2026' : 'International conference · Batam 2026'}</p>
            <p className="reveal reveal-delay-1 mt-5 font-mono-label text-[10px] uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">The 1st Batam University International Conference on Health (BUICH) 2026</p>
            <h1 id="hero-title" className="reveal reveal-delay-1 mt-7 max-w-4xl font-display text-[clamp(4rem,10.5vw,9.6rem)] leading-[.84] tracking-[-.045em] text-[hsl(var(--foreground))]">Health at the<br /><em className="text-[hsl(var(--secondary))]">point of impact.</em></h1>
            <p className="reveal reveal-delay-2 mt-9 max-w-xl text-base leading-7 text-[hsl(var(--muted-foreground))] sm:text-lg">The 1st Batam University International Conference on Health (BUICH) 2026 brings occupational health, emergency care, and surrounding communities into the same room.</p>
            <p className="reveal reveal-delay-2 mt-5 max-w-2xl border-l border-[hsl(var(--secondary))] pl-4 text-sm leading-6 text-[hsl(var(--muted-foreground))]"><span className="font-mono-label text-[10px] uppercase tracking-[.14em] text-[hsl(var(--secondary))]">Theme</span><br />Occupational Health Amid Evolving Global Health Challenges: Strengthening Emergency and Critical Care in Workplace Settings to Protect Workers and Surrounding Communities</p>
            <div className="reveal reveal-delay-2 mt-8 flex flex-wrap gap-3"><button onClick={() => setDialog('register')} className="magnetic inline-flex items-center gap-3 bg-[hsl(var(--secondary))] px-5 py-4 font-mono-label text-[10px] uppercase tracking-[.15em] text-[hsl(var(--primary-foreground))]" data-testid="button-hero-register">{id ? 'Daftar sekarang' : 'Register now'} <ArrowUpRight size={16} /></button><button onClick={() => setDialog('abstract')} className="magnetic inline-flex items-center gap-3 border border-[hsl(var(--primary))] px-5 py-4 font-mono-label text-[10px] uppercase tracking-[.15em] text-[hsl(var(--foreground))] hover:border-[hsl(var(--secondary))]" data-testid="button-hero-abstract">{id ? 'Kirim abstrak' : 'Submit abstract'} <Send size={14} /></button></div>
          </div>
          <div className="reveal reveal-delay-3 mt-16 grid gap-6 border-t border-[hsl(var(--border))] pt-5 md:grid-cols-[1fr_1fr_1.15fr] md:items-end">
            <div><p className="font-mono-label text-[9px] uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))]">Date / time</p><p className="mt-2 text-sm text-[hsl(var(--foreground))]">04–05 December 2026<br />08.00–16.00 GMT+7</p></div>
            <div><p className="font-mono-label text-[9px] uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))]">Format / place</p><p className="mt-2 text-sm text-[hsl(var(--foreground))]">Hybrid · Graha Bintang + Rumengan Hall<br />Batam University · Zoom Meeting</p></div>
            <div><p className="mb-3 font-mono-label text-[9px] uppercase tracking-[.15em] text-[hsl(var(--secondary))]">Countdown to opening</p><Countdown /></div>
          </div>
        </div>
      </section>

      <section id="context" className="scroll-reveal grid-paper px-5 py-24 sm:px-8 sm:py-32 lg:px-12" aria-labelledby="context-title">
        <div className="mx-auto grid max-w-[1280px] gap-14 lg:grid-cols-[.7fr_1.3fr] lg:gap-28">
          <div><p className="font-mono-label text-[10px] uppercase tracking-[.2em] text-[hsl(var(--secondary))]">01 / The context</p><div className="mt-10 hidden h-32 w-px bg-[hsl(var(--primary))] lg:block" /><p className="mt-6 max-w-xs font-display text-3xl leading-[1.08] text-[hsl(var(--foreground))]">One incident can travel far beyond the factory gate.</p></div>
          <div><h2 id="context-title" className="max-w-4xl font-display text-5xl leading-[.94] tracking-[-.035em] sm:text-7xl">Protecting workers means strengthening the <em className="text-[hsl(var(--secondary))]">whole system.</em></h2><p className="mt-9 max-w-3xl text-base leading-8 text-[hsl(var(--muted-foreground))]">Globalization, industrial development, emerging infections, non-communicable diseases, workplace accidents, environmental hazards, and sudden medical emergencies are reshaping occupational health. Workplaces in manufacturing, construction, energy, transportation, and other labour-intensive sectors need adaptive, resilient, and integrated response systems.</p><p className="mt-5 max-w-3xl text-base leading-8 text-[hsl(var(--muted-foreground))]">BUICH 2026 is a scientific forum to share evidence, exchange practice, and formulate joint strategies that connect occupational health services, community health resources, emergency responders, and referral networks.</p><div className="mt-12 grid gap-7 border-t border-[hsl(var(--border))] pt-7 sm:grid-cols-3"><div><p className="font-display text-4xl text-[hsl(var(--secondary))]">13,000</p><p className="mt-2 text-sm leading-5 text-[hsl(var(--muted-foreground))]">workplace accident cases recorded in Batam in 2022, according to BPJS Ketenagakerjaan.</p></div><div><p className="font-display text-4xl text-[hsl(var(--secondary))]">2.93M</p><p className="mt-2 text-sm leading-5 text-[hsl(var(--muted-foreground))]">workers die annually from occupational accidents and work-related diseases globally, according to ILO.</p></div><div><p className="font-display text-4xl text-[hsl(var(--accent))]">1 forum</p><p className="mt-2 text-sm leading-5 text-[hsl(var(--muted-foreground))]">to build safer, healthier, and more resilient workplaces and surrounding communities.</p></div></div><div className="mt-16 border-t border-[hsl(var(--border))] pt-7"><p className="font-mono-label text-[10px] uppercase tracking-[.2em] text-[hsl(var(--secondary))]">Objectives</p><div className="mt-5 grid gap-0 sm:grid-cols-2">{objectives.map((objective, index) => <div key={objective} className="flex gap-4 border-b border-[hsl(var(--border))] py-4 text-sm leading-6 text-[hsl(var(--muted-foreground))]"><span className="font-mono-label text-[10px] text-[hsl(var(--secondary))]">{String(index + 1).padStart(2, '0')}</span><span>{objective}</span></div>)}</div></div></div>
        </div>
      </section>

      <section className="bg-[hsl(var(--card))] px-5 py-20 sm:px-8 sm:py-24 lg:px-12"><div className="mx-auto max-w-[1280px]"><p className="font-mono-label text-[10px] uppercase tracking-[.2em] text-[hsl(var(--secondary))]">What this forum is for</p><div className="mt-8 grid gap-0 border-y border-[hsl(var(--border))] md:grid-cols-3"><div className="border-b border-[hsl(var(--border))] py-7 md:border-b-0 md:border-r md:pr-8"><ShieldCheck className="text-[hsl(var(--secondary))]" size={24} /><h3 className="mt-5 font-display text-3xl">Prepare earlier</h3><p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">Enhance emergency and critical care knowledge among workers, responders, and community stakeholders.</p></div><div className="border-b border-[hsl(var(--border))] py-7 md:border-b-0 md:px-8 md:border-r"><Network className="text-[hsl(var(--accent))]" size={24} /><h3 className="mt-5 font-display text-3xl">Connect systems</h3><p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">Strengthen coordination between workplace health systems, community services, and emergency referral networks.</p></div><div className="py-7 md:pl-8"><Sparkles className="text-[hsl(var(--secondary))]" size={24} /><h3 className="mt-5 font-display text-3xl">Build resilience</h3><p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">Foster multi-sectoral collaboration, practical protocols, innovation, and resilient systems for routine and large-scale crises.</p></div></div><div className="mt-16 grid gap-7 lg:grid-cols-[.7fr_1.3fr]"><div><p className="font-mono-label text-[10px] uppercase tracking-[.2em] text-[hsl(var(--secondary))]">Who is in the room</p><h3 className="mt-4 font-display text-4xl leading-none">Built for the people who keep communities moving.</h3></div><div className="grid gap-3 sm:grid-cols-2"><div className="border border-[hsl(var(--border))] p-4 text-sm text-[hsl(var(--foreground))]">Healthcare practitioners</div><div className="border border-[hsl(var(--border))] p-4 text-sm text-[hsl(var(--foreground))]">Occupational health and safety experts</div><div className="border border-[hsl(var(--border))] p-4 text-sm text-[hsl(var(--foreground))]">Public health professionals</div><div className="border border-[hsl(var(--border))] p-4 text-sm text-[hsl(var(--foreground))]">Academics and researchers</div><div className="border border-[hsl(var(--border))] p-4 text-sm text-[hsl(var(--foreground))]">University students</div><div className="border border-[hsl(var(--border))] p-4 text-sm text-[hsl(var(--foreground))]">Non-governmental organizations</div></div></div></div></section>

      <section id="program" className="bg-[hsl(var(--background))] px-5 py-24 sm:px-8 sm:py-32 lg:px-12" aria-labelledby="program-title"><div className="mx-auto max-w-[1280px]"><div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end"><div><p className="font-mono-label text-[10px] uppercase tracking-[.2em] text-[hsl(var(--secondary))]">02 / The program</p><h2 id="program-title" className="mt-5 max-w-2xl font-display text-5xl leading-[.93] tracking-[-.04em] sm:text-7xl">Two days.<br /><em className="text-[hsl(var(--secondary))]">One response.</em></h2></div><div className="flex border border-[hsl(var(--border))] p-1"><button onClick={() => setScheduleDay('day1')} className={`px-4 py-3 font-mono-label text-[10px] uppercase tracking-[.14em] ${scheduleDay === 'day1' ? 'bg-[hsl(var(--secondary))] text-[hsl(var(--primary-foreground))]' : 'text-[hsl(var(--muted-foreground))]'}`} data-testid="button-schedule-day1">Day 01 · Dec 04</button><button onClick={() => setScheduleDay('day2')} className={`px-4 py-3 font-mono-label text-[10px] uppercase tracking-[.14em] ${scheduleDay === 'day2' ? 'bg-[hsl(var(--secondary))] text-[hsl(var(--primary-foreground))]' : 'text-[hsl(var(--muted-foreground))]'}`} data-testid="button-schedule-day2">Day 02 · Dec 05</button></div></div><div className="mt-14 border-t border-[hsl(var(--border))]">{schedule[scheduleDay].map(([time, title, detail], index) => <div key={`${time}-${title}`} className="group grid gap-3 border-b border-[hsl(var(--border))] py-6 transition-colors hover:bg-[hsl(var(--muted)/.45)] sm:grid-cols-[130px_1fr] sm:gap-8" data-testid={`row-schedule-${scheduleDay}-${index}`}><span className="font-mono-label text-[10px] tracking-[.08em] text-[hsl(var(--secondary))]">{time}</span><div><h3 className="font-display text-2xl text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--secondary))]">{title}</h3>{detail && <p className="mt-2 max-w-3xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">{detail}</p>}</div></div>)}</div></div></section>

      <section id="speakers" className="grid-paper px-5 py-24 sm:px-8 sm:py-32 lg:px-12" aria-labelledby="speakers-title"><div className="mx-auto max-w-[1280px]"><div className="flex items-end justify-between gap-5"><div><p className="font-mono-label text-[10px] uppercase tracking-[.2em] text-[hsl(var(--secondary))]">03 / The people</p><h2 id="speakers-title" className="mt-5 max-w-3xl font-display text-5xl leading-[.93] tracking-[-.04em] sm:text-7xl">The signal<br /><em className="text-[hsl(var(--secondary))]">carriers.</em></h2></div><span className="hidden font-mono-label text-[10px] uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))] sm:block">Keynote + plenary speakers</span></div><div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{speakers.map((speaker) => <article key={speaker.code} className="glass-panel group flex min-h-[290px] flex-col justify-between p-5 transition-transform duration-300 hover:-translate-y-2" data-testid={`card-speaker-${speaker.code}`}><div className="flex items-start justify-between"><span className={`flex h-12 w-12 items-center justify-center border font-mono-label text-xs ${speaker.tone === 'amber' ? 'border-[hsl(var(--secondary))] text-[hsl(var(--secondary))]' : speaker.tone === 'coral' ? 'border-[hsl(5_70%_58%)] text-[hsl(5_70%_58%)]' : 'border-[hsl(var(--accent))] text-[hsl(var(--accent))]'}`}>{speaker.code}</span><ArrowUpRight size={17} className="text-[hsl(var(--muted-foreground))] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></div><div><p className="font-mono-label text-[9px] uppercase tracking-[.15em] text-[hsl(var(--secondary))]">{speaker.role}</p><h3 className="mt-2 font-display text-[28px] leading-[1] text-[hsl(var(--foreground))]">{speaker.name}</h3><p className="mt-3 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{speaker.affiliation}</p><p className="mt-4 border-t border-[hsl(var(--border))] pt-3 text-sm leading-5 text-[hsl(var(--foreground))]">{speaker.topic}</p></div></article>)}</div></div></section>

      <section id="topics" className="bg-[hsl(var(--card))] px-5 py-24 sm:px-8 sm:py-32 lg:px-12" aria-labelledby="topics-title"><div className="mx-auto max-w-[1280px]"><div className="grid gap-12 lg:grid-cols-[.7fr_1.3fr] lg:gap-20"><div><p className="font-mono-label text-[10px] uppercase tracking-[.2em] text-[hsl(var(--secondary))]">04 / Six scopes</p><h2 id="topics-title" className="mt-5 max-w-md font-display text-5xl leading-[.93] tracking-[-.04em] sm:text-7xl">Bring your<br /><em className="text-[hsl(var(--secondary))]">discipline.</em></h2><p className="mt-8 max-w-sm text-sm leading-7 text-[hsl(var(--muted-foreground))]">Papers should align with the conference theme and one of the official scopes below. Browse the conversation before you submit.</p><div className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">{scopeData.map((scope, index) => <button key={scope.title} onClick={() => setActiveScope(index)} className={`focus-ring flex items-center gap-2 border p-3 text-left font-mono-label text-[10px] uppercase tracking-[.08em] transition-colors ${activeScope === index ? 'border-[hsl(var(--secondary))] bg-[hsl(var(--secondary))] text-[hsl(var(--primary-foreground))]' : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary))]'}`} data-testid={`button-scope-${index}`}>{scope.index}<span className="truncate">{scope.title}</span></button>)}</div></div><div className="min-h-[440px] border-t border-[hsl(var(--border))] pt-7 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0"><div className="flex items-start justify-between gap-4"><div><p className="font-mono-label text-[10px] uppercase tracking-[.15em] text-[hsl(var(--secondary))]">{scopeData[activeScope].index} / scope</p><h3 className="mt-4 font-display text-5xl leading-none text-[hsl(var(--foreground))]">{scopeData[activeScope].title}</h3></div><div className="mt-2 flex h-11 w-11 items-center justify-center border border-[hsl(var(--primary))] text-[hsl(var(--accent))]">{(() => { const Icon = scopeData[activeScope].icon; return <Icon size={21} />; })()}</div></div><p className="mt-7 max-w-2xl text-base leading-7 text-[hsl(var(--muted-foreground))]">{scopeData[activeScope].description}</p><div className="mt-10 grid gap-0 border-t border-[hsl(var(--border))] sm:grid-cols-2">{scopeData[activeScope].topics.map((topic, index) => <div key={topic} className="flex gap-3 border-b border-[hsl(var(--border))] py-4 text-sm leading-5 text-[hsl(var(--foreground))]"><span className="font-mono-label text-[10px] text-[hsl(var(--secondary))]">{String(index + 1).padStart(2, '0')}</span>{topic}</div>)}</div></div></div></div></section>

      <section id="papers" className="bg-[hsl(var(--background))] px-5 py-24 sm:px-8 sm:py-32 lg:px-12" aria-labelledby="papers-title"><div className="mx-auto max-w-[1280px]"><div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-24"><div><p className="font-mono-label text-[10px] uppercase tracking-[.2em] text-[hsl(var(--secondary))]">05 / Call for papers</p><h2 id="papers-title" className="mt-5 max-w-xl font-display text-5xl leading-[.93] tracking-[-.04em] sm:text-7xl">Evidence that can <em className="text-[hsl(var(--secondary))]">move.</em></h2><p className="mt-8 max-w-md text-sm leading-7 text-[hsl(var(--muted-foreground))]">The committee invites academics, researchers, practitioners, students, and professionals to submit original scientific papers aligned with the conference theme.</p><button onClick={() => setDialog('abstract')} className="magnetic mt-8 inline-flex items-center gap-3 bg-[hsl(var(--secondary))] px-5 py-4 font-mono-label text-[10px] uppercase tracking-[.15em] text-[hsl(var(--primary-foreground))]" data-testid="button-papers-submit">Submit an abstract <ArrowUpRight size={16} /></button></div><div className="grid gap-0 border-t border-[hsl(var(--border))]"><div className="grid gap-6 border-b border-[hsl(var(--border))] py-7 sm:grid-cols-[1fr_1.5fr]"><div><FileText className="text-[hsl(var(--secondary))]" size={22} /><h3 className="mt-4 font-display text-3xl">Manuscript requirements</h3></div><ul className="space-y-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]"><li>Written in English with an IMRAD structure.</li><li>3,000–5,000 words; Times New Roman, size 12; 1.5 spacing.</li><li>Official committee template required; .doc / .docx format.</li><li>Original work not previously published. Primary research is preferred.</li></ul></div><div className="grid gap-6 border-b border-[hsl(var(--border))] py-7 sm:grid-cols-[1fr_1.5fr]"><div><Check className="text-[hsl(var(--accent))]" size={22} /><h3 className="mt-4 font-display text-3xl">Review + publication</h3></div><div className="text-sm leading-7 text-[hsl(var(--muted-foreground))]"><p>All submissions undergo double-blind peer review by qualified reviewers, evaluated for originality, relevance, scientific quality, and clarity.</p><p className="mt-3">Accepted papers will be published in conference proceedings (ISBN). Selected papers may be recommended for SINTA-indexed national journals or international journals, subject to additional review.</p></div></div><div className="grid gap-6 py-7 sm:grid-cols-[1fr_1.5fr]"><div><CalendarDays className="text-[hsl(var(--secondary))]" size={22} /><h3 className="mt-4 font-display text-3xl">Important dates</h3></div><div className="space-y-3 text-sm text-[hsl(var(--muted-foreground))]"><p className="flex justify-between gap-5 border-b border-[hsl(var(--border))] pb-3"><span>Abstract submission deadline</span><span className="font-mono-label text-[10px] uppercase text-[hsl(var(--secondary))]">To be announced</span></p><p className="flex justify-between gap-5 border-b border-[hsl(var(--border))] pb-3"><span>Acceptance notification</span><span className="font-mono-label text-[10px] uppercase text-[hsl(var(--secondary))]">To be announced</span></p><p className="flex justify-between gap-5 border-b border-[hsl(var(--border))] pb-3"><span>Full paper submission</span><span className="font-mono-label text-[10px] uppercase text-[hsl(var(--secondary))]">To be announced</span></p><p className="flex justify-between gap-5"><span>Submission link</span><span className="font-mono-label text-[10px] uppercase text-[hsl(var(--secondary))]">To be announced</span></p></div></div></div></div></div></section>

      <section className="relative overflow-hidden bg-[hsl(var(--secondary))] px-5 py-20 text-[hsl(var(--primary-foreground))] sm:px-8 sm:py-28 lg:px-12"><div className="absolute -right-28 -top-36 h-[480px] w-[480px] rounded-full border border-[hsl(var(--primary-foreground)/.18)]" /><div className="absolute right-24 top-20 h-3 w-3 rounded-full bg-[hsl(var(--accent))]" /><div className="relative mx-auto flex max-w-[1280px] flex-col justify-between gap-8 md:flex-row md:items-end"><div><p className="font-mono-label text-[10px] uppercase tracking-[.2em]">The invitation</p><h2 className="mt-4 max-w-3xl font-display text-5xl leading-[.9] tracking-[-.04em] sm:text-7xl">What happens at work<br />shapes what happens <em>around it.</em></h2></div><button onClick={() => setDialog('register')} className="magnetic inline-flex h-fit items-center gap-3 border border-[hsl(var(--primary-foreground))] px-5 py-4 font-mono-label text-[10px] uppercase tracking-[.15em] hover:bg-[hsl(var(--primary-foreground))] hover:text-[hsl(var(--secondary))]" data-testid="button-cta-register">Register your interest <ArrowUpRight size={16} /></button></div></section>

      <footer id="contact" className="bg-[hsl(var(--card))] px-5 pb-8 pt-20 sm:px-8 sm:pt-24 lg:px-12"><div className="mx-auto max-w-[1280px]"><div className="grid gap-14 lg:grid-cols-[1.2fr_.8fr_.8fr]"><div><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center border border-[hsl(var(--secondary))] text-[hsl(var(--secondary))]"><Network size={19} /></span><span className="font-mono-label text-[10px] uppercase leading-[1.2] tracking-[.14em]">The 1st BUICH<br />International Conference on Health</span></div><h2 className="mt-10 max-w-xl font-display text-5xl leading-[.92] sm:text-6xl">A safer system<br /><em className="text-[hsl(var(--secondary))]">starts together.</em></h2><p className="mt-7 max-w-sm text-sm leading-6 text-[hsl(var(--muted-foreground))]">Organized by the Institute of Research and Community Services, Batam University (LPPM UNIBA), in collaboration with the Faculty of Medicine, Batam University.</p></div><div><p className="font-mono-label text-[10px] uppercase tracking-[.2em] text-[hsl(var(--secondary))]">Navigate</p><div className="mt-6 grid gap-4 text-sm text-[hsl(var(--muted-foreground))]">{navItems.map(([label, href]) => <AppLink key={href} href={href} className="line-link w-fit">{label}</AppLink>)}</div></div><div><p className="font-mono-label text-[10px] uppercase tracking-[.2em] text-[hsl(var(--secondary))]">Official updates</p><p className="mt-6 text-sm leading-6 text-[hsl(var(--muted-foreground))]">Registration, submission links, meeting credentials, and remaining deadlines are to be announced by the committee.</p>{subscribed ? <p className="mt-6 flex items-center gap-2 text-sm text-[hsl(var(--accent))]" data-testid="status-subscribed"><Check size={15} /> You are subscribed.</p> : <form className="mt-5 flex border-b border-[hsl(var(--border))]" onSubmit={(event) => { event.preventDefault(); if (email) setSubscribed(true); }}><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" className="min-w-0 flex-1 bg-transparent py-3 text-sm text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--muted-foreground))]" data-testid="input-newsletter-email" /><button aria-label="Subscribe to updates" className="text-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))]" data-testid="button-newsletter-subscribe"><ArrowUpRight size={18} /></button></form>}<button onClick={() => setDialog('newsletter')} className="mt-5 inline-flex items-center gap-2 font-mono-label text-[10px] uppercase tracking-[.14em] text-[hsl(var(--secondary))]" data-testid="button-open-newsletter">Open update form <ArrowUpRight size={13} /></button></div></div><div className="mt-16 grid gap-5 border-t border-[hsl(var(--border))] pt-6 text-sm text-[hsl(var(--muted-foreground))] sm:grid-cols-3"><div className="flex items-start gap-3"><MapPin size={16} className="mt-1 shrink-0 text-[hsl(var(--secondary))]" /><span>Graha Bintang and Rumengan Hall<br />Batam University, Batam</span></div><div className="flex items-start gap-3"><Clock3 size={16} className="mt-1 shrink-0 text-[hsl(var(--secondary))]" /><span>04–05 December 2026<br />08.00–16.00 GMT+7</span></div><div className="flex items-start gap-3"><Mail size={16} className="mt-1 shrink-0 text-[hsl(var(--secondary))]" /><span>Committee contact<br /><span className="text-[hsl(var(--secondary))]">To be announced</span></span></div></div><div className="mt-10 flex flex-col justify-between gap-3 border-t border-[hsl(var(--border))] pt-5 font-mono-label text-[9px] uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))] sm:flex-row"><span>© 2026 Batam University International Conference on Health</span><span>Workers · communities · systems</span><span>Hybrid · Batam + Zoom</span></div></div></footer>
    </main>
    {dialog && <Modal kind={dialog} onClose={() => setDialog(null)} language={language} />}
  </div>;
}

function Router() {
  return <RoutedErrorBoundary><Switch><Route path="/" component={Home} /><Route component={NotFound} /></Switch></RoutedErrorBoundary>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;