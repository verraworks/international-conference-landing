import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  BriefcaseMedical,
  CalendarDays,
  Check,
  Clock3,
  FileText,
  Globe2,
  HeartPulse,
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
import speaker1Portrait from '@assets/generated_images/buich-speaker-1.jpg';
import speaker2Portrait from '@assets/generated_images/buich-speaker-2.jpg';
import speaker3Portrait from '@assets/generated_images/buich-speaker-3.jpg';
import speaker4Portrait from '@assets/generated_images/buich-speaker-4.jpg';
import speaker5Portrait from '@assets/generated_images/buich-speaker-5.jpg';
import speaker6Portrait from '@assets/generated_images/buich-speaker-6.jpg';
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
    tone: 'coral',
    portrait: speaker1Portrait,
  },
  {
    name: 'Prof. Idrus Patarusi, Sp.OT (K)',
    role: 'Plenary speaker 01',
    affiliation: 'Orthopaedic and trauma specialist',
    topic: 'Common Individual Accident and Mass Casualty Incident in Industrial Setting Management, Triage Systems and Transportation',
    code: '02',
    tone: 'blue',
    portrait: speaker2Portrait,
  },
  {
    name: 'dr. Sutrisno Gunawan, SpAn-TI, FCICM',
    role: 'Plenary speaker 02',
    affiliation: 'Townsville University Hospital, Queensland, Australia',
    topic: 'Prehospital Critical Care: Stabilization and Safe Transport of Critically Ill Patients',
    code: '03',
    tone: 'mint',
    portrait: speaker3Portrait,
  },
  {
    name: 'dr. Anita Johan, M.KK',
    role: 'Plenary speaker 03',
    affiliation: 'Secretary of the Association of Occupational Health Physicians Indonesia (IDKI)',
    topic: 'Integrating Emergency Referral Pathways Between Workplace Health Facilities and Hospitals',
    code: '04',
    tone: 'coral',
    portrait: speaker4Portrait,
  },
  {
    name: 'Dr. dr. Hendra Zufry, Sp.PD, KEMD, FINASIM',
    role: 'Plenary speaker 04',
    affiliation: 'Faculty of Medicine, Universitas Syiah Kuala / Dr. Zainoel Abidin Hospital, Banda Aceh, Indonesia',
    topic: "What's new on Diabetic Ketoacidosis",
    code: '05',
    tone: 'blue',
    portrait: speaker5Portrait,
  },
  {
    name: 'Dr med. Benny Santosa, SpPD, KEMD, FINASIM',
    role: 'Plenary speaker 05',
    affiliation: 'St Joseph Krankenhaus Balserische Stiftung Gießen',
    topic: 'Steroid Use, Abuse and Adrenal Crisis',
    code: '06',
    tone: 'mint',
    portrait: speaker6Portrait,
  },
];

const scopeData = [
  { title: 'Occupational Health', index: '01', icon: ShieldCheck, description: 'From OSH management and risk assessment to emergency response, mental health, rehabilitation, and the community impact of industrial hazards.', topics: ['Occupational Safety and Health (OSH) Management', 'Workplace Hazard Identification and Risk Assessment', 'Industrial Hygiene and Environmental Monitoring', 'Workplace Emergency Preparedness and Response', 'Occupational Mental Health and Psychosocial Hazards', 'Heat Stress and Climate Change in Occupational Settings', 'Community Impact of Industrial and Workplace Hazards'] },
  { title: 'Medical Science Education', index: '02', icon: BookOpen, description: 'Evidence-led education for the next generation of health professionals, including simulation, digital learning, and interprofessional practice.', topics: ['Innovation in Medical and Health Professions Education', 'Competency-Based Medical Education', 'Simulation-Based Learning in Emergency and Critical Care', 'Interprofessional Education and Collaborative Practice', 'Digital Learning and Artificial Intelligence in Medical Education', 'Clinical Skills Training and Assessment', 'Continuing Professional Development for Healthcare Workers'] },
  { title: 'Public Health Sciences', index: '03', icon: Network, description: 'Global threats, surveillance, environmental health, systems strengthening, disaster risk reduction, and One Health approaches.', topics: ['Global Health and Emerging Health Threats', 'Epidemiology and Disease Surveillance', 'Occupational and Environmental Public Health', 'Public Health Emergency Preparedness and Response', 'Infectious Disease Prevention and Control', 'Disaster Risk Reduction and Community Resilience', 'One Health and Planetary Health Approaches'] },
  { title: 'Biomedical Sciences', index: '04', icon: Sparkles, description: 'Molecular insight and translational innovation for occupational, emergency, and critical illness.', topics: ['Molecular and Cellular Biology', 'Pathophysiology of Occupational and Critical Illnesses', 'Toxicology and Biomarker Research', 'Immunology and Infectious Diseases', 'Biomedical Engineering and Medical Technology', 'Artificial Intelligence in Biomedical Sciences', 'Biomedical Approaches in Emergency and Critical Care'] },
  { title: 'Clinical Medicine', index: '05', icon: BriefcaseMedical, description: 'Emergency and critical care, trauma, chronic disease management, patient safety, ethics, and functional recovery.', topics: ['Emergency and Critical Care Medicine', 'Occupational and Environmental Medicine', 'Trauma and Acute Care Management', 'Cardiovascular and Respiratory Emergencies', 'Disaster Medicine and Mass Casualty Management', 'Patient Safety and Quality Improvement', 'Rehabilitation Medicine and Functional Recovery'] },
  { title: 'Nutrition', index: '06', icon: Users, description: 'Clinical, occupational, community, and sustainable nutrition for resilience, performance, and disease prevention.', topics: ['Clinical Nutrition and Metabolic Disorders', 'Nutrition in Emergency and Critical Care', 'Occupational Nutrition and Worker Performance', 'Community and Public Health Nutrition', 'Nutrition and Non-Communicable Diseases', 'Nutritional Epidemiology', 'Sustainable Nutrition and Food Systems'] },
];

const schedule: Record<ScheduleDay, string[][]> = {
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

function BrandMark({ inverse = false }: { inverse?: boolean }) {
  return <span className={`flex h-10 w-10 items-center justify-center rounded-[13px] ${inverse ? 'bg-[hsl(var(--primary-foreground)/.14)] text-[hsl(var(--primary-foreground))]' : 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'}`}><HeartPulse size={20} strokeWidth={2.2} /></span>;
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
  return <div className="grid grid-cols-4 gap-2" data-testid="countdown-event">{units.map(([label, value]) => <div key={label} className="rounded-2xl bg-[hsl(var(--primary-foreground)/.12)] px-2 py-3 text-center"><div className="font-display text-3xl leading-none">{String(value).padStart(2, '0')}</div><div className="mt-2 font-mono-label text-[9px] uppercase tracking-[.13em] opacity-70">{label}</div></div>)}</div>;
}

function Modal({ kind, onClose, language }: { kind: Exclude<DialogKind, null>; onClose: () => void; language: Language }) {
  const [sent, setSent] = useState(false);
  const abstract = kind === 'abstract';
  const newsletter = kind === 'newsletter';
  const title = newsletter ? 'Stay close to the conversation.' : abstract ? 'Bring your work to Batam.' : 'Join the gathering.';
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);
  if (sent) return <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true"><div className="modal-card soft-shadow w-full max-w-lg rounded-[28px] bg-[hsl(var(--background))] p-8 text-center sm:p-12"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"><Check size={28} /></div><p className="mt-6 font-mono-label text-[10px] uppercase tracking-[.2em] text-[hsl(var(--primary))]">Received with thanks</p><h2 className="mt-3 font-display text-5xl leading-none">You are on the list.</h2><p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-[hsl(var(--muted-foreground))]">{abstract ? 'Your interest in presenting at BUICH 2026 has been recorded. Submission details will be shared when available.' : 'The organizing committee will share the next steps and official links when they are available.'}</p><button onClick={onClose} className="focus-ring magnetic mt-8 rounded-full bg-[hsl(var(--primary))] px-7 py-3 font-mono-label text-[10px] uppercase tracking-[.16em] text-[hsl(var(--primary-foreground))]" data-testid="button-finish-dialog">Close</button></div></div>;
  return <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="modal-card soft-shadow relative my-4 w-full max-w-xl rounded-[28px] bg-[hsl(var(--background))] p-7 sm:p-10"><button onClick={onClose} className="focus-ring absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]" aria-label="Close dialog" data-testid="button-close-dialog"><X size={18} /></button><p className="font-mono-label text-[10px] uppercase tracking-[.2em] text-[hsl(var(--primary))]">{abstract ? 'Call for papers' : newsletter ? 'Conference updates' : language === 'ID' ? 'Pendaftaran peserta' : 'Participation'}</p><h2 className="mt-3 max-w-md font-display text-5xl leading-[.94]">{title}</h2><p className="mt-4 max-w-lg text-sm leading-6 text-[hsl(var(--muted-foreground))]">{abstract ? 'The official submission link and important dates are to be announced. Register your interest and we will notify you when the portal opens.' : newsletter ? 'Leave your email for official updates from the BUICH 2026 organizing committee.' : 'Registration details, fees, and the official registration link are to be announced by the organizing committee.'}</p><form className="mt-7 space-y-4" onSubmit={(event) => { event.preventDefault(); setSent(true); }}>{!newsletter && <label className="block"><span className="font-mono-label text-[10px] uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))]">Full name</span><input required className="mt-2 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.4)] px-4 py-3 text-sm outline-none focus:border-[hsl(var(--primary))]" placeholder="Your name" data-testid="input-full-name" /></label>}<label className="block"><span className="font-mono-label text-[10px] uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))]">Email address</span><input required type="email" className="mt-2 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.4)] px-4 py-3 text-sm outline-none focus:border-[hsl(var(--primary))]" placeholder="you@institution.org" data-testid="input-email" /></label>{!newsletter && <label className="block"><span className="font-mono-label text-[10px] uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))]">Participation format</span><select className="mt-2 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.4)] px-4 py-3 text-sm outline-none focus:border-[hsl(var(--primary))]" defaultValue="hybrid" data-testid="select-participation-format"><option value="hybrid">Hybrid / undecided</option><option value="onsite">On-site at Batam University</option><option value="online">Online via Zoom Meeting</option></select></label>}{abstract && <label className="block"><span className="font-mono-label text-[10px] uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))]">Contribution type</span><select className="mt-2 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.4)] px-4 py-3 text-sm outline-none focus:border-[hsl(var(--primary))]" defaultValue="oral" data-testid="select-contribution-type"><option value="oral">Oral presentation</option><option value="poster">Poster presentation</option></select></label>}<button className="focus-ring magnetic mt-3 inline-flex w-full items-center justify-center gap-3 rounded-full bg-[hsl(var(--primary))] px-5 py-4 font-mono-label text-[10px] uppercase tracking-[.17em] text-[hsl(var(--primary-foreground))]" data-testid="button-submit-dialog">{abstract ? 'Register interest' : newsletter ? 'Subscribe to updates' : 'Continue'} <ArrowUpRight size={15} /></button></form></div></div>;
}

function HeroArtwork() {
  return <div className="hero-stage relative mx-auto aspect-[.9] w-full max-w-[470px] sm:aspect-square" aria-label="Abstract illustration of connected people and care" role="img">
    <div className="hero-orbit hero-orbit-one" aria-hidden="true" />
    <div className="hero-orbit hero-orbit-two" aria-hidden="true" />
    <div className="hero-bubble hero-bubble-one" aria-hidden="true" />
    <div className="hero-bubble hero-bubble-two" aria-hidden="true" />
    <div className="hero-bubble hero-bubble-three" aria-hidden="true" />
    <div className="hero-blob absolute inset-[8%_5%_3%_10%] rotate-[-9deg] bg-[hsl(var(--primary))] opacity-95" />
    <div className="hero-blob-small drift absolute right-[4%] top-[5%] h-[31%] w-[31%] bg-[hsl(var(--accent))]" />
    <div className="absolute bottom-[7%] left-[4%] h-[27%] w-[27%] rounded-full bg-[#9acdbd] breathe" />
    <div className="care-motif absolute left-[7%] top-[18%] flex h-12 w-12 items-center justify-center rounded-full border border-[hsl(var(--primary)/.15)] bg-[hsl(var(--background)/.28)] text-[hsl(var(--primary))]" aria-hidden="true"><HeartPulse size={19} /></div>
    <div className="care-motif care-motif-delayed absolute bottom-[27%] right-[8%] flex h-10 w-10 items-center justify-center rounded-full border border-[hsl(var(--primary)/.15)] bg-[hsl(var(--background)/.38)] text-[hsl(var(--primary))]" aria-hidden="true"><ShieldCheck size={17} /></div>
    <svg className="absolute inset-[12%] h-[76%] w-[76%] text-[hsl(var(--primary-foreground))]" viewBox="0 0 400 400" fill="none" aria-hidden="true"><path d="M99 307c1-49 33-81 75-81s74 32 75 81" stroke="currentColor" strokeWidth="17" strokeLinecap="round"/><circle cx="174" cy="169" r="37" stroke="currentColor" strokeWidth="17"/><path d="M220 310c4-36 26-60 56-60 30 0 52 24 56 60" stroke="currentColor" strokeWidth="15" strokeLinecap="round"/><circle cx="276" cy="203" r="27" stroke="currentColor" strokeWidth="15"/><path d="M90 105c33 20 53 23 87 9 28-12 58-12 88 7 22 14 43 17 67 7" stroke="currentColor" strokeWidth="10" strokeLinecap="round" opacity=".85"/><path d="M199 104v-29m-15 15h30" stroke="currentColor" strokeWidth="10" strokeLinecap="round"/></svg>
    <div className="absolute bottom-[18%] right-[1%] rounded-full bg-[hsl(var(--background))] px-4 py-3 text-[hsl(var(--primary))] soft-shadow"><HeartPulse size={23} /></div>
  </div>;
}

function ScheduleTimeline({ entries }: { entries: string[][] }) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [timelineVisible, setTimelineVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const timelineDate = entries === schedule.day1
    ? { day: 'Friday', date: '04 December 2026' }
    : { day: 'Saturday', date: '05 December 2026' };

  useEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) return undefined;
    const updateProgress = () => {
      const rect = timeline.getBoundingClientRect();
      const start = window.innerHeight * 0.78;
      const amount = ((start - rect.top) / Math.max(rect.height, 1)) * 100;
      setProgress(Math.min(100, Math.max(0, amount)));
    };
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setTimelineVisible(true); }, { threshold: 0.06 });
    observer.observe(timeline);
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, [entries]);

  return (
    <div ref={timelineRef} className="timeline-shell mt-14" data-testid="schedule-timeline">
      <div className="timeline-date-heading">
        <span className="font-mono-label text-[9px] uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">Conference day</span>
        <strong className="font-display text-3xl text-[hsl(var(--foreground))] sm:text-4xl">{timelineDate.day}, {timelineDate.date}</strong>
      </div>
      <div className="timeline-rule" aria-hidden="true" />
      <div className="timeline-progress" style={{ height: `${progress}%` }} aria-hidden="true" />
      {entries.map(([time, title, detail], index) => {
        const highlight = /Keynote|Plenary/i.test(title);
        return (
          <article
            key={`${time}-${title}`}
            className={`timeline-event ${timelineVisible ? 'timeline-event-visible' : ''} ${highlight ? 'timeline-event-highlight' : ''}`}
            style={{ transitionDelay: timelineVisible ? `${index * 55}ms` : '0ms' }}
            data-testid={`row-schedule-event-${index}`}
          >
            <span className="timeline-node" aria-hidden="true" />
            <div className="pt-1">
              <span className="font-mono-label text-[10px] tracking-[.08em] text-[hsl(var(--primary))]">{time}</span>
            </div>
            <div className="timeline-card rounded-[18px] border border-[hsl(var(--border))] px-5 py-5 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <h3 className={`font-display text-2xl leading-[1.05] ${highlight ? 'text-[hsl(var(--primary))]' : ''}`}>{title}</h3>
                {highlight && <span className="shrink-0 rounded-full bg-[hsl(var(--accent)/.2)] px-2.5 py-1 font-mono-label text-[8px] uppercase tracking-[.12em] text-[hsl(var(--accent-foreground))]">Featured</span>}
              </div>
              {detail && <p className="mt-3 max-w-3xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">{detail}</p>}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function Home() {
  const [language, setLanguage] = useState<Language>('EN');
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [scheduleDay, setScheduleDay] = useState<ScheduleDay>('day1');
  const [activeScope, setActiveScope] = useState(0);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const id = language === 'ID';
  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>('main > section, footer'));
    if (!('IntersectionObserver' in window)) { items.forEach((item) => item.classList.add('visible')); return; }
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }), { threshold: 0.08 });
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);
  const closeMenu = () => setMenuOpen(false);
  return <div className="site-shell grain min-h-[100dvh] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-[hsl(var(--primary)/.08)] bg-[hsl(var(--background)/.86)] backdrop-blur-xl"><div className="mx-auto flex h-[76px] max-w-[1380px] items-center justify-between px-5 sm:px-8 lg:px-12"><AppLink href="#" className="flex items-center gap-3" onClick={closeMenu} testId="link-home"><BrandMark /><span className="font-mono-label text-[10px] uppercase leading-[1.25] tracking-[.11em]"><strong className="text-[hsl(var(--primary))]">BUICH</strong><br />Batam University · 2026</span></AppLink><nav className="hidden items-center gap-8 lg:flex">{navItems.map(([label, href]) => <AppLink key={href} href={href} className="line-link text-xs font-semibold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]">{label}</AppLink>)}</nav><div className="hidden items-center gap-4 md:flex"><button onClick={() => setLanguage(id ? 'EN' : 'ID')} className="focus-ring flex items-center gap-2 rounded-full px-2 py-2 text-xs font-semibold text-[hsl(var(--primary))]" data-testid="button-language-toggle"><Globe2 size={15} /> {language}</button><button onClick={() => setDialog('register')} className="focus-ring magnetic rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-xs font-bold text-[hsl(var(--primary-foreground))]" data-testid="button-header-register">{id ? 'Daftar sekarang' : 'Register now'}</button></div><button onClick={() => setMenuOpen(!menuOpen)} className="focus-ring flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--primary))] md:hidden" aria-label="Toggle navigation" data-testid="button-mobile-menu">{menuOpen ? <X size={18} /> : <Menu size={18} />}</button></div>{menuOpen && <div className="border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] p-5 md:hidden"><div className="grid gap-5">{navItems.map(([label, href]) => <AppLink key={href} href={href} onClick={closeMenu} className="font-semibold text-[hsl(var(--foreground))]">{label}</AppLink>)}<button onClick={() => setLanguage(id ? 'EN' : 'ID')} className="flex items-center gap-2 text-left text-sm font-semibold text-[hsl(var(--primary))]" data-testid="button-mobile-language"><Globe2 size={15} /> {id ? 'English' : 'Bahasa Indonesia'}</button><button onClick={() => { setDialog('register'); closeMenu(); }} className="rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-left text-sm font-bold text-[hsl(var(--primary-foreground))]" data-testid="button-mobile-register">Register now</button></div></div>}</header>
    <main>
      <section className="relative overflow-hidden bg-[hsl(var(--background))] px-5 pb-12 pt-32 sm:px-8 sm:pb-20 sm:pt-40 lg:px-12" aria-labelledby="hero-title"><div className="absolute -right-40 top-20 h-[560px] w-[560px] rounded-full bg-[hsl(var(--card))] opacity-70" /><div className="absolute left-[-140px] top-[47%] h-[270px] w-[270px] rounded-full bg-[hsl(var(--accent)/.12)]" /><div className="relative mx-auto grid max-w-[1380px] items-center gap-10 lg:grid-cols-[1.02fr_.98fr] lg:gap-14"><div className="max-w-3xl"><p className="accent-line reveal font-mono-label text-[10px] uppercase tracking-[.19em] text-[hsl(var(--primary))]">{id ? 'Konferensi internasional · Batam 2026' : 'International conference · Batam 2026'}</p><p className="reveal reveal-delay-1 mt-7 text-sm font-semibold text-[hsl(var(--muted-foreground))]">The 1st Batam University International Conference on Health (BUICH) 2026</p><h1 id="hero-title" className="reveal reveal-delay-1 mt-5 max-w-3xl font-display text-[clamp(3.8rem,8.4vw,8.2rem)] leading-[.88] tracking-[-.055em]">Health is a<br /><em className="text-[hsl(var(--primary))]">shared place.</em></h1><p className="reveal reveal-delay-2 mt-8 max-w-xl text-base leading-8 text-[hsl(var(--muted-foreground))] sm:text-lg">A welcoming scientific forum where occupational health, emergency care, and surrounding communities meet to make everyday life safer.</p><p className="reveal reveal-delay-2 mt-6 max-w-2xl rounded-r-2xl border-l-2 border-[hsl(var(--accent))] bg-[hsl(var(--card)/.55)] px-5 py-4 text-sm leading-6 text-[hsl(var(--muted-foreground))]"><span className="font-mono-label text-[10px] uppercase tracking-[.14em] text-[hsl(var(--primary))]">The theme</span><br />Occupational Health Amid Evolving Global Health Challenges: Strengthening Emergency and Critical Care in Workplace Settings to Protect Workers and Surrounding Communities</p><div className="reveal reveal-delay-2 mt-8 flex flex-wrap gap-3"><button onClick={() => setDialog('register')} className="focus-ring magnetic inline-flex items-center gap-3 rounded-full bg-[hsl(var(--primary))] px-6 py-4 text-sm font-bold text-[hsl(var(--primary-foreground))]" data-testid="button-hero-register">{id ? 'Daftar sekarang' : 'Register now'} <ArrowUpRight size={16} /></button><button onClick={() => setDialog('abstract')} className="focus-ring magnetic inline-flex items-center gap-3 rounded-full border border-[hsl(var(--primary)/.25)] bg-[hsl(var(--background))] px-6 py-4 text-sm font-bold text-[hsl(var(--primary))]" data-testid="button-hero-abstract">{id ? 'Kirim abstrak' : 'Submit abstract'} <Send size={14} /></button></div></div><div className="reveal reveal-delay-3 relative lg:pl-10"><HeroArtwork /><div className="absolute left-0 top-[18%] hidden rounded-2xl bg-[hsl(var(--background))] px-4 py-3 text-xs font-semibold text-[hsl(var(--primary))] soft-shadow sm:block"><span className="mb-1 block font-mono-label text-[9px] uppercase tracking-[.13em] text-[hsl(var(--muted-foreground))]">A forum for</span>workers + communities</div></div></div><div className="reveal reveal-delay-3 relative mx-auto mt-14 grid max-w-[1380px] gap-5 rounded-[24px] bg-[hsl(var(--primary))] p-5 text-[hsl(var(--primary-foreground))] sm:grid-cols-[1fr_1fr_1.25fr] sm:p-7"><div><p className="font-mono-label text-[9px] uppercase tracking-[.15em] opacity-70">Date / time</p><p className="mt-2 text-sm font-semibold">04–05 December 2026<br />08.00–16.00 GMT+7</p></div><div><p className="font-mono-label text-[9px] uppercase tracking-[.15em] opacity-70">Format / place</p><p className="mt-2 text-sm font-semibold">Hybrid · Graha Bintang + Rumengan Hall<br />Batam University · Zoom Meeting</p></div><div><p className="mb-3 font-mono-label text-[9px] uppercase tracking-[.15em] text-[hsl(var(--accent))]">Countdown to opening</p><Countdown /></div></div></section>
      <section id="context" className="scroll-reveal grid-paper px-5 py-24 sm:px-8 sm:py-32 lg:px-12" aria-labelledby="context-title"><div className="mx-auto grid max-w-[1250px] gap-12 lg:grid-cols-[.65fr_1.35fr] lg:gap-24"><div><p className="font-mono-label text-[10px] uppercase tracking-[.2em] text-[hsl(var(--primary))]">01 / The context</p><div className="mt-8 h-1 w-20 rounded-full bg-[hsl(var(--accent))]" /><p className="mt-7 max-w-xs font-display text-3xl leading-[1.08]">A healthy workplace is part of a healthy neighbourhood.</p></div><div><h2 id="context-title" className="max-w-4xl font-display text-5xl leading-[.95] tracking-[-.04em] sm:text-7xl">Care does not stop at the <em className="text-[hsl(var(--primary))]">factory gate.</em></h2><p className="mt-9 max-w-3xl text-base leading-8 text-[hsl(var(--muted-foreground))]">Globalization, industrial development, emerging infections, non-communicable diseases, workplace accidents, environmental hazards, and sudden medical emergencies are reshaping occupational health. Workplaces in manufacturing, construction, energy, transportation, and other labour-intensive sectors need adaptive, resilient, and integrated response systems.</p><p className="mt-5 max-w-3xl text-base leading-8 text-[hsl(var(--muted-foreground))]">BUICH 2026 is a scientific forum to share evidence, exchange practice, and formulate joint strategies that connect occupational health services, community health resources, emergency responders, and referral networks.</p><div className="mt-12 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl bg-[hsl(var(--background))] p-5"><p className="font-display text-4xl text-[hsl(var(--primary))]">13,000</p><p className="mt-2 text-sm leading-5 text-[hsl(var(--muted-foreground))]">workplace accident cases recorded in Batam in 2022, according to BPJS Ketenagakerjaan.</p></div><div className="rounded-2xl bg-[hsl(var(--background))] p-5"><p className="font-display text-4xl text-[hsl(var(--primary))]">2.93M</p><p className="mt-2 text-sm leading-5 text-[hsl(var(--muted-foreground))]">workers die annually from occupational accidents and work-related diseases globally, according to ILO.</p></div><div className="rounded-2xl bg-[hsl(var(--primary))] p-5 text-[hsl(var(--primary-foreground))]"><p className="font-display text-4xl text-[hsl(var(--accent))]">1 forum</p><p className="mt-2 text-sm leading-5 opacity-80">to build safer, healthier, and more resilient workplaces and surrounding communities.</p></div></div><div className="mt-16"><p className="font-mono-label text-[10px] uppercase tracking-[.2em] text-[hsl(var(--primary))]">Objectives</p><div className="mt-5 grid gap-x-8 sm:grid-cols-2">{objectives.map((objective, index) => <div key={objective} className="flex gap-4 border-b border-[hsl(var(--border))] py-4 text-sm leading-6 text-[hsl(var(--muted-foreground))]"><span className="font-mono-label text-[10px] text-[hsl(var(--accent-foreground))]">{String(index + 1).padStart(2, '0')}</span><span>{objective}</span></div>)}</div></div></div></div></section>
      <section className="scroll-reveal bg-[hsl(var(--primary))] px-5 py-20 text-[hsl(var(--primary-foreground))] sm:px-8 sm:py-28 lg:px-12"><div className="mx-auto max-w-[1250px]"><div className="grid gap-8 border-b border-[hsl(var(--primary-foreground)/.22)] pb-12 md:grid-cols-3"><div><HeartPulse className="text-[hsl(var(--accent))]" size={27} /><h3 className="mt-5 font-display text-3xl">Prepare earlier</h3><p className="mt-3 text-sm leading-6 opacity-75">Enhance emergency and critical care knowledge among workers, responders, and community stakeholders.</p></div><div><Network className="text-[hsl(var(--accent))]" size={27} /><h3 className="mt-5 font-display text-3xl">Connect systems</h3><p className="mt-3 text-sm leading-6 opacity-75">Strengthen coordination between workplace health systems, community services, and emergency referral networks.</p></div><div><Sparkles className="text-[hsl(var(--accent))]" size={27} /><h3 className="mt-5 font-display text-3xl">Build resilience</h3><p className="mt-3 text-sm leading-6 opacity-75">Foster collaboration, practical protocols, innovation, and resilient systems for routine and large-scale crises.</p></div></div><div className="mt-14 grid gap-7 lg:grid-cols-[.7fr_1.3fr]"><div><p className="font-mono-label text-[10px] uppercase tracking-[.2em] text-[hsl(var(--accent))]">Who is in the room</p><h3 className="mt-4 font-display text-4xl leading-none">Built for the people who keep communities moving.</h3></div><div className="grid gap-3 sm:grid-cols-2">{['Healthcare practitioners', 'Occupational health and safety experts', 'Public health professionals', 'Academics and researchers', 'University students', 'Non-governmental organizations'].map((item, index) => <div key={item} className="rounded-xl border border-[hsl(var(--primary-foreground)/.2)] p-4 text-sm">{String(index + 1).padStart(2, '0')} <span className="ml-3 opacity-80">{item}</span></div>)}</div></div></div></section>
       <section id="program" className="scroll-reveal bg-[hsl(var(--background))] px-5 py-24 sm:px-8 sm:py-32 lg:px-12" aria-labelledby="program-title"><div className="mx-auto max-w-[1250px]"><div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end"><div><p className="font-mono-label text-[10px] uppercase tracking-[.2em] text-[hsl(var(--primary))]">02 / The program</p><h2 id="program-title" className="mt-5 max-w-2xl font-display text-5xl leading-[.93] tracking-[-.04em] sm:text-7xl">Two days.<br /><em className="text-[hsl(var(--primary))]">Many ways in.</em></h2></div><div className="flex rounded-full bg-[hsl(var(--muted))] p-1" role="group" aria-label="Choose conference day"><button onClick={() => setScheduleDay('day1')} className={`focus-ring rounded-full px-4 py-3 text-[10px] font-bold uppercase tracking-[.12em] transition-all ${scheduleDay === 'day1' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'text-[hsl(var(--muted-foreground))]'}`} aria-pressed={scheduleDay === 'day1'} data-testid="button-schedule-day1">Day 01 · Dec 04</button><button onClick={() => setScheduleDay('day2')} className={`focus-ring rounded-full px-4 py-3 text-[10px] font-bold uppercase tracking-[.12em] transition-all ${scheduleDay === 'day2' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'text-[hsl(var(--muted-foreground))]'}`} aria-pressed={scheduleDay === 'day2'} data-testid="button-schedule-day2">Day 02 · Dec 05</button></div></div><ScheduleTimeline entries={schedule[scheduleDay]} /></div></section>
       <section id="speakers" className="scroll-reveal bg-[hsl(var(--card))] px-5 py-24 sm:px-8 sm:py-32 lg:px-12" aria-labelledby="speakers-title"><div className="mx-auto max-w-[1250px]"><div className="flex items-end justify-between gap-5"><div><p className="font-mono-label text-[10px] uppercase tracking-[.2em] text-[hsl(var(--primary))]">03 / The people</p><h2 id="speakers-title" className="mt-5 max-w-3xl font-display text-5xl leading-[.93] tracking-[-.04em] sm:text-7xl">People who<br /><em className="text-[hsl(var(--primary))]">carry the care.</em></h2></div><span className="hidden text-sm text-[hsl(var(--muted-foreground))] sm:block">Keynote + plenary speakers</span></div><div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{speakers.map((speaker) => <article key={speaker.code} className="group overflow-hidden rounded-[22px] bg-[hsl(var(--background))] soft-shadow transition-transform duration-300 hover:-translate-y-2" data-testid={`card-speaker-${speaker.code}`}><div className="relative h-56 overflow-hidden bg-[hsl(var(--muted))]"><img src={speaker.portrait} alt={`${speaker.name} — neutral editorial portrait`} className="h-full w-full object-cover object-top grayscale-[.08] transition-transform duration-500 group-hover:scale-[1.03]" data-testid={`img-speaker-${speaker.code}`} /><span className={`absolute left-5 top-5 flex h-11 w-11 items-center justify-center rounded-2xl font-mono-label text-xs text-[hsl(var(--primary-foreground))] shadow-sm ${speaker.tone === 'coral' ? 'bg-[hsl(var(--accent))]' : speaker.tone === 'mint' ? 'bg-[#91c9b1]' : 'bg-[hsl(var(--primary))]'}`}>{speaker.code}</span></div><div className="flex min-h-[285px] flex-col justify-between p-6"><div><div className="flex items-start justify-between gap-4"><p className="font-mono-label text-[9px] uppercase tracking-[.15em] text-[hsl(var(--primary))]">{speaker.role}</p><ArrowUpRight size={17} className="shrink-0 text-[hsl(var(--primary))] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></div><h3 className="mt-2 font-display text-[28px] leading-[1]">{speaker.name}</h3><p className="mt-3 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{speaker.affiliation}</p></div><p className="mt-5 border-t border-[hsl(var(--border))] pt-4 text-sm leading-5">{speaker.topic}</p></div></article>)}</div></div></section>
      <section id="topics" className="scroll-reveal bg-[hsl(var(--background))] px-5 py-24 sm:px-8 sm:py-32 lg:px-12" aria-labelledby="topics-title"><div className="mx-auto max-w-[1250px]"><div className="grid gap-12 lg:grid-cols-[.72fr_1.28fr] lg:gap-20"><div><p className="font-mono-label text-[10px] uppercase tracking-[.2em] text-[hsl(var(--primary))]">04 / Six scopes</p><h2 id="topics-title" className="mt-5 max-w-md font-display text-5xl leading-[.93] tracking-[-.04em] sm:text-7xl">Bring your<br /><em className="text-[hsl(var(--primary))]">discipline.</em></h2><p className="mt-8 max-w-sm text-sm leading-7 text-[hsl(var(--muted-foreground))]">Papers should align with the conference theme and one of the official scopes below. Browse the conversation before you submit.</p><div className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">{scopeData.map((scope, index) => <button key={scope.title} onClick={() => setActiveScope(index)} className={`focus-ring flex items-center gap-2 rounded-xl border p-3 text-left text-[10px] font-bold uppercase tracking-[.08em] transition-all ${activeScope === index ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary))]'}`} data-testid={`button-scope-${index}`}>{scope.index}<span className="truncate">{scope.title}</span></button>)}</div></div><div className="rounded-[28px] bg-[hsl(var(--card))] p-6 sm:p-9"><div className="flex items-start justify-between gap-4"><div><p className="font-mono-label text-[10px] uppercase tracking-[.15em] text-[hsl(var(--primary))]">{scopeData[activeScope].index} / scope</p><h3 className="mt-4 font-display text-5xl leading-none">{scopeData[activeScope].title}</h3></div><div className="breathe mt-2 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">{(() => { const Icon = scopeData[activeScope].icon; return <Icon size={21} />; })()}</div></div><p className="mt-7 max-w-2xl text-base leading-7 text-[hsl(var(--muted-foreground))]">{scopeData[activeScope].description}</p><div className="mt-10 grid gap-0 border-t border-[hsl(var(--border))] sm:grid-cols-2">{scopeData[activeScope].topics.map((topic, index) => <div key={topic} className="flex gap-3 border-b border-[hsl(var(--border))] py-4 text-sm leading-5"><span className="font-mono-label text-[10px] text-[hsl(var(--primary))]">{String(index + 1).padStart(2, '0')}</span>{topic}</div>)}</div></div></div></div></section>
      <section id="papers" className="scroll-reveal bg-[hsl(var(--card))] px-5 py-24 sm:px-8 sm:py-32 lg:px-12" aria-labelledby="papers-title"><div className="mx-auto max-w-[1250px]"><div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-24"><div><p className="font-mono-label text-[10px] uppercase tracking-[.2em] text-[hsl(var(--primary))]">05 / Call for papers</p><h2 id="papers-title" className="mt-5 max-w-xl font-display text-5xl leading-[.93] tracking-[-.04em] sm:text-7xl">Evidence that can <em className="text-[hsl(var(--primary))]">move.</em></h2><p className="mt-8 max-w-md text-sm leading-7 text-[hsl(var(--muted-foreground))]">The committee invites academics, researchers, practitioners, students, and professionals to submit original scientific papers aligned with the conference theme.</p><button onClick={() => setDialog('abstract')} className="focus-ring magnetic mt-8 inline-flex items-center gap-3 rounded-full bg-[hsl(var(--primary))] px-6 py-4 text-sm font-bold text-[hsl(var(--primary-foreground))]" data-testid="button-papers-submit">Submit an abstract <ArrowUpRight size={16} /></button></div><div className="grid gap-4"><div className="rounded-[22px] bg-[hsl(var(--background))] p-6 sm:grid sm:grid-cols-[1fr_1.5fr] sm:gap-6"><div><FileText className="text-[hsl(var(--primary))]" size={22} /><h3 className="mt-4 font-display text-3xl">Manuscript requirements</h3></div><ul className="mt-5 list-disc space-y-2 pl-5 text-sm leading-6 text-[hsl(var(--muted-foreground))] sm:mt-0"><li>Written in English with an IMRAD structure.</li><li>3,000–5,000 words; Times New Roman, size 12; 1.5 spacing.</li><li>Official committee template required; .doc / .docx format.</li><li>Original work not previously published. Primary research is preferred.</li></ul></div><div className="rounded-[22px] bg-[hsl(var(--background))] p-6 sm:grid sm:grid-cols-[1fr_1.5fr] sm:gap-6"><div><Check className="text-[hsl(var(--primary))]" size={22} /><h3 className="mt-4 font-display text-3xl">Review + publication</h3></div><div className="mt-5 text-sm leading-7 text-[hsl(var(--muted-foreground))] sm:mt-0"><p>All submissions undergo double-blind peer review by qualified reviewers, evaluated for originality, relevance, scientific quality, and clarity.</p><p className="mt-3">Accepted papers will be published in conference proceedings (ISBN). Selected papers may be recommended for SINTA-indexed national journals or international journals, subject to additional review.</p></div></div><div className="rounded-[22px] bg-[hsl(var(--background))] p-6 sm:grid sm:grid-cols-[1fr_1.5fr] sm:gap-6"><div><CalendarDays className="text-[hsl(var(--primary))]" size={22} /><h3 className="mt-4 font-display text-3xl">Important dates</h3></div><div className="mt-5 space-y-3 text-sm text-[hsl(var(--muted-foreground))] sm:mt-0"><p className="flex justify-between gap-5 border-b border-[hsl(var(--border))] pb-3"><span>Abstract submission deadline</span><span className="font-mono-label text-[10px] uppercase text-[hsl(var(--primary))]">To be announced</span></p><p className="flex justify-between gap-5 border-b border-[hsl(var(--border))] pb-3"><span>Acceptance notification</span><span className="font-mono-label text-[10px] uppercase text-[hsl(var(--primary))]">To be announced</span></p><p className="flex justify-between gap-5 border-b border-[hsl(var(--border))] pb-3"><span>Full paper submission</span><span className="font-mono-label text-[10px] uppercase text-[hsl(var(--primary))]">To be announced</span></p><p className="flex justify-between gap-5"><span>Submission link</span><span className="font-mono-label text-[10px] uppercase text-[hsl(var(--primary))]">To be announced</span></p></div></div></div></div></div></section>
      <section className="scroll-reveal relative overflow-hidden bg-[hsl(var(--primary))] px-5 py-20 text-[hsl(var(--primary-foreground))] sm:px-8 sm:py-28 lg:px-12"><div className="absolute -right-20 -top-28 h-[430px] w-[430px] rounded-full border border-[hsl(var(--primary-foreground)/.16)]" /><div className="relative mx-auto flex max-w-[1250px] flex-col justify-between gap-8 md:flex-row md:items-end"><div><p className="font-mono-label text-[10px] uppercase tracking-[.2em] text-[hsl(var(--accent))]">The invitation</p><h2 className="mt-4 max-w-3xl font-display text-5xl leading-[.9] tracking-[-.04em] sm:text-7xl">What happens at work<br />shapes what happens <em>around it.</em></h2></div><button onClick={() => setDialog('register')} className="focus-ring magnetic inline-flex h-fit items-center gap-3 rounded-full border border-[hsl(var(--primary-foreground)/.7)] px-6 py-4 text-sm font-bold hover:bg-[hsl(var(--primary-foreground))] hover:text-[hsl(var(--primary))]" data-testid="button-cta-register">Register your interest <ArrowUpRight size={16} /></button></div></section>
    </main>
    <footer id="contact" className="scroll-reveal bg-[hsl(var(--background))] px-5 pb-8 pt-20 sm:px-8 sm:pt-24 lg:px-12"><div className="mx-auto max-w-[1250px]"><div className="grid gap-14 lg:grid-cols-[1.2fr_.8fr_.8fr]"><div><div className="flex items-center gap-3"><BrandMark /><span className="font-mono-label text-[10px] uppercase leading-[1.2] tracking-[.14em]"><strong className="text-[hsl(var(--primary))]">The 1st BUICH</strong><br />International Conference on Health</span></div><h2 className="mt-10 max-w-xl font-display text-5xl leading-[.92] sm:text-6xl">A safer system<br /><em className="text-[hsl(var(--primary))]">starts together.</em></h2><p className="mt-7 max-w-sm text-sm leading-6 text-[hsl(var(--muted-foreground))]">Organized by the Institute of Research and Community Services, Batam University (LPPM UNIBA), in collaboration with the Faculty of Medicine, Batam University.</p></div><div><p className="font-mono-label text-[10px] uppercase tracking-[.2em] text-[hsl(var(--primary))]">Navigate</p><div className="mt-6 grid gap-4 text-sm text-[hsl(var(--muted-foreground))]">{navItems.map(([label, href]) => <AppLink key={href} href={href} className="line-link w-fit">{label}</AppLink>)}</div></div><div><p className="font-mono-label text-[10px] uppercase tracking-[.2em] text-[hsl(var(--primary))]">Official updates</p><p className="mt-6 text-sm leading-6 text-[hsl(var(--muted-foreground))]">Registration, submission links, meeting credentials, and remaining deadlines are to be announced by the committee.</p>{subscribed ? <p className="mt-6 flex items-center gap-2 text-sm text-[#4f997c]" data-testid="status-subscribed"><Check size={15} /> You are subscribed.</p> : <form className="mt-5 flex rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card)/.4)] px-4" onSubmit={(event) => { event.preventDefault(); if (email) setSubscribed(true); }}><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-[hsl(var(--muted-foreground))]" data-testid="input-newsletter-email" /><button aria-label="Subscribe to updates" className="focus-ring text-[hsl(var(--primary))]" data-testid="button-newsletter-subscribe"><ArrowUpRight size={18} /></button></form>}<button onClick={() => setDialog('newsletter')} className="focus-ring mt-5 inline-flex items-center gap-2 text-xs font-bold text-[hsl(var(--primary))]" data-testid="button-open-newsletter">Open update form <ArrowUpRight size={13} /></button></div></div><div className="mt-16 grid gap-5 border-t border-[hsl(var(--border))] pt-6 text-sm text-[hsl(var(--muted-foreground))] sm:grid-cols-3"><div className="flex items-start gap-3"><MapPin size={16} className="mt-1 shrink-0 text-[hsl(var(--primary))]" /><span>Graha Bintang and Rumengan Hall<br />Batam University, Batam</span></div><div className="flex items-start gap-3"><Clock3 size={16} className="mt-1 shrink-0 text-[hsl(var(--primary))]" /><span>04–05 December 2026<br />08.00–16.00 GMT+7</span></div><div className="flex items-start gap-3"><Mail size={16} className="mt-1 shrink-0 text-[hsl(var(--primary))]" /><span>Committee contact<br /><span className="text-[hsl(var(--primary))]">To be announced</span></span></div></div><div className="mt-10 flex flex-col justify-between gap-3 border-t border-[hsl(var(--border))] pt-5 font-mono-label text-[9px] uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))] sm:flex-row"><span>© 2026 Batam University International Conference on Health</span><span>Workers · communities · systems</span><span>Hybrid · Batam + Zoom</span></div></div></footer>
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