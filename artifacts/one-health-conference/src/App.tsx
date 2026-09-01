import { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Dna,
  Globe2,
  Leaf,
  Mail,
  MapPin,
  Menu,
  MoveUpRight,
  PawPrint,
  Quote,
  Send,
  X,
} from 'lucide-react';
import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

type Language = 'EN' | 'ID';
type DialogKind = 'register' | 'abstract' | null;

const navItems = [
  ['Story', '#story'],
  ['Program', '#program'],
  ['People', '#people'],
  ['Attend', '#attend'],
];

const speakers = [
  {
    name: 'Dr. Siti Nur Aisyah',
    role: 'Epidemiologist & One Health Advocate',
    affiliation: 'Universitas Gadjah Mada, Indonesia',
    initials: 'SA',
    color: 'bg-[#d6a846]',
  },
  {
    name: 'Prof. James O. McKenzie',
    role: 'Director, Planetary Health Alliance',
    affiliation: 'University of Edinburgh, Scotland',
    initials: 'JM',
    color: 'bg-[#d98263]',
  },
  {
    name: 'Dr. Thandi Ndlovu',
    role: 'Veterinary Public Health Scientist',
    affiliation: 'University of Pretoria, South Africa',
    initials: 'TN',
    color: 'bg-[#77a59a]',
  },
];

function AppLink({
  href,
  children,
  className = '',
  onClick,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={`focus-ring ${className}`}
      data-testid={`link-${href.replace('#', '').replace('/', '') || 'home'}`}
    >
      {children}
    </a>
  );
}

function Modal({
  kind,
  onClose,
  language,
}: {
  kind: Exclude<DialogKind, null>;
  onClose: () => void;
  language: Language;
}) {
  const [sent, setSent] = useState(false);
  const isAbstract = kind === 'abstract';
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#102f29]/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={isAbstract ? 'Submit abstract' : 'Register'}>
      <div className="relative w-full max-w-lg border border-[#c6b888] bg-[#f7f4ec] p-6 shadow-2xl sm:p-10">
        <button onClick={onClose} className="focus-ring absolute right-5 top-5 text-[#315b4d] transition-transform hover:rotate-90" aria-label="Close dialog" data-testid="button-close-dialog">
          <X size={22} strokeWidth={1.5} />
        </button>
        {sent ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#315b4d] text-[#f7f4ec]"><Check size={26} /></div>
            <p className="font-mono-label text-[10px] uppercase tracking-[.24em] text-[#b05b4b]">Received with thanks</p>
            <h2 className="mt-4 font-display text-4xl text-[#163d34]">You are on the list.</h2>
            <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-[#587067]">We have sent the next steps to your inbox. We look forward to welcoming you to Yogyakarta.</p>
            <button onClick={onClose} className="mt-7 border border-[#315b4d] px-6 py-3 font-mono-label text-[10px] uppercase tracking-[.18em] text-[#315b4d] transition-colors hover:bg-[#315b4d] hover:text-[#f7f4ec]" data-testid="button-finish-dialog">Close</button>
          </div>
        ) : (
          <>
            <p className="font-mono-label text-[10px] uppercase tracking-[.24em] text-[#b05b4b]">{isAbstract ? 'Call for contributions' : 'Join the gathering'}</p>
            <h2 className="mt-3 max-w-sm font-display text-4xl leading-[1.05] text-[#163d34]">{isAbstract ? 'Bring a question to the table.' : 'Reserve your place in the room.'}</h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-[#587067]">{isAbstract ? 'Share the work that is changing how we understand health across species and systems.' : 'Three days of clear-eyed exchange, generous conversation, and practical collaboration.'}</p>
            <form className="mt-7 space-y-4" onSubmit={(event) => { event.preventDefault(); setSent(true); }}>
              <label className="block">
                <span className="font-mono-label text-[10px] uppercase tracking-[.16em] text-[#587067]">{language === 'ID' ? 'Nama lengkap' : 'Full name'}</span>
                <input required className="mt-2 w-full border-b border-[#b9b8a9] bg-transparent px-0 py-3 text-[#163d34] outline-none placeholder:text-[#9a9e91] focus:border-[#b05b4b]" placeholder="Your name" data-testid="input-full-name" />
              </label>
              <label className="block">
                <span className="font-mono-label text-[10px] uppercase tracking-[.16em] text-[#587067]">Email address</span>
                <input required type="email" className="mt-2 w-full border-b border-[#b9b8a9] bg-transparent px-0 py-3 text-[#163d34] outline-none placeholder:text-[#9a9e91] focus:border-[#b05b4b]" placeholder="you@institution.org" data-testid="input-email" />
              </label>
              {isAbstract && <label className="block">
                <span className="font-mono-label text-[10px] uppercase tracking-[.16em] text-[#587067]">Contribution type</span>
                <select className="mt-2 w-full border-b border-[#b9b8a9] bg-transparent px-0 py-3 text-[#163d34] outline-none focus:border-[#b05b4b]" defaultValue="oral" data-testid="select-contribution-type">
                  <option value="oral">Oral presentation</option><option value="poster">Poster presentation</option><option value="workshop">Workshop proposal</option>
                </select>
              </label>}
              <button className="mt-3 inline-flex w-full items-center justify-center gap-3 bg-[#b05b4b] px-5 py-4 font-mono-label text-[10px] uppercase tracking-[.18em] text-[#f7f4ec] transition-colors hover:bg-[#163d34]" data-testid="button-submit-dialog">
                {isAbstract ? 'Continue to submission' : 'Continue to registration'} <ArrowUpRight size={15} />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function Home() {
  const [language, setLanguage] = useState<Language>('EN');
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setMenuOpen(false); setDialog(null); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const closeMenu = () => setMenuOpen(false);
  const copy = language === 'ID' ? {
    register: 'Daftar sekarang',
    abstract: 'Kirim abstrak',
    eyebrow: 'Konferensi internasional · Yogyakarta 2025',
    title: <>Satu kesehatan.<br /><em>Satu masa depan.</em></>,
    intro: 'Sebuah pertemuan lintas disiplin untuk merawat kehidupan—manusia, hewan, dan planet yang kita bagi.',
  } : {
    register: 'Register to attend',
    abstract: 'Submit an abstract',
    eyebrow: 'International conference · Yogyakarta 2025',
    title: <>One health.<br /><em>One future.</em></>,
    intro: 'A cross-disciplinary gathering to care for life—human, animal, and the planet we share.',
  };

  return (
    <div className="site-shell grain min-h-[100dvh] bg-[#f7f4ec] text-[#163d34]">
      <header className="absolute left-0 right-0 top-0 z-30">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-6 sm:px-10 lg:px-16">
          <AppLink href="#" className="group flex items-center gap-3" onClick={closeMenu}>
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c6b888] text-[#e4bc57]"><Leaf size={20} strokeWidth={1.5} /></span>
            <span className="hidden font-mono-label text-[10px] uppercase leading-[1.25] tracking-[.18em] text-[#f7f4ec] sm:block">Universitas<br />Gadjah Mada</span>
          </AppLink>
          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map(([label, href]) => <AppLink key={href} href={href} className="line-link font-mono-label text-[10px] uppercase tracking-[.18em] text-[#dce4d7] transition-colors hover:text-[#e4bc57]">{label}</AppLink>)}
            <button onClick={() => setLanguage(language === 'EN' ? 'ID' : 'EN')} className="focus-ring flex items-center gap-1 border-l border-[#668178] pl-7 font-mono-label text-[10px] tracking-[.16em] text-[#e4bc57]" data-testid="button-language-toggle"><Globe2 size={14} /> {language}</button>
          </nav>
          <button onClick={() => setMenuOpen(!menuOpen)} className="focus-ring flex h-10 w-10 items-center justify-center border border-[#668178] text-[#f7f4ec] md:hidden" aria-label="Toggle navigation" data-testid="button-mobile-menu">{menuOpen ? <X size={18} /> : <Menu size={18} />}</button>
        </div>
        {menuOpen && <div className="mx-4 border border-[#668178] bg-[#163d34] p-5 md:hidden">
          <div className="grid gap-5">
            {navItems.map(([label, href]) => <AppLink key={href} href={href} onClick={closeMenu} className="font-mono-label text-[11px] uppercase tracking-[.2em] text-[#f7f4ec]">{label}</AppLink>)}
            <button onClick={() => setLanguage(language === 'EN' ? 'ID' : 'EN')} className="flex items-center gap-2 text-left font-mono-label text-[11px] uppercase tracking-[.2em] text-[#e4bc57]" data-testid="button-mobile-language"><Globe2 size={14} /> {language === 'EN' ? 'Bahasa Indonesia' : 'English'}</button>
          </div>
        </div>}
      </header>

      <main>
        <section className="relative min-h-[780px] overflow-hidden bg-[#163d34] text-[#f7f4ec] sm:min-h-[860px]">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 72% 28%, #d6a846 0, transparent 20%), radial-gradient(circle at 84% 74%, #b05b4b 0, transparent 25%)' }} />
          <div className="absolute -right-40 top-24 h-[620px] w-[620px] rounded-full border border-[#6d8c7a]/40 sm:-right-20 sm:h-[760px] sm:w-[760px]" />
          <div className="absolute -right-24 top-40 h-[470px] w-[470px] rounded-full border border-[#6d8c7a]/25 sm:right-8 sm:h-[610px] sm:w-[610px]" />
          <div className="absolute right-[12%] top-[29%] h-3 w-3 rounded-full bg-[#e4bc57] shadow-[0_0_0_12px_rgba(228,188,87,.12)]" />
          <div className="absolute bottom-[13%] left-[8%] hidden h-28 w-28 rounded-full border border-[#6d8c7a]/40 lg:block" />
          <div className="relative mx-auto flex min-h-[780px] max-w-[1440px] flex-col justify-end px-5 pb-16 pt-32 sm:min-h-[860px] sm:px-10 sm:pb-24 lg:px-16">
            <div className="mb-9 flex items-center gap-4 reveal"><span className="h-px w-10 bg-[#e4bc57]" /><span className="font-mono-label text-[10px] uppercase tracking-[.22em] text-[#e4bc57]">{copy.eyebrow}</span></div>
            <h1 className="max-w-4xl font-display text-[clamp(4.4rem,11vw,10.5rem)] leading-[.83] tracking-[-.055em] reveal reveal-delay-1">{copy.title}</h1>
            <div className="mt-12 grid gap-10 sm:grid-cols-[1fr_auto] sm:items-end reveal reveal-delay-2">
              <p className="max-w-md text-lg leading-[1.45] text-[#c9d6ca] sm:text-xl">{copy.intro}</p>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => setDialog('register')} className="focus-ring group inline-flex items-center gap-4 bg-[#e4bc57] px-5 py-4 font-mono-label text-[10px] uppercase tracking-[.15em] text-[#163d34] transition-colors hover:bg-[#f7f4ec]" data-testid="button-hero-register">{copy.register}<ArrowUpRight size={16} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></button>
                <AppLink href="#story" className="focus-ring inline-flex items-center gap-3 border border-[#789286] px-5 py-4 font-mono-label text-[10px] uppercase tracking-[.15em] text-[#f7f4ec] transition-colors hover:border-[#e4bc57] hover:text-[#e4bc57]">Explore the gathering <ArrowDown size={15} /></AppLink>
              </div>
            </div>
            <div className="mt-20 flex flex-wrap gap-x-10 gap-y-4 border-t border-[#668178] pt-5 font-mono-label text-[10px] uppercase tracking-[.16em] text-[#b4c8ba] reveal reveal-delay-3">
              <span className="flex items-center gap-2"><CalendarDays size={14} className="text-[#e4bc57]" /> 17—19 October 2025</span>
              <span className="flex items-center gap-2"><MapPin size={14} className="text-[#e4bc57]" /> Grha Sabha Pramana · UGM</span>
              <span className="flex items-center gap-2"><Globe2 size={14} className="text-[#e4bc57]" /> Yogyakarta, Indonesia</span>
            </div>
          </div>
        </section>

        <section id="story" className="grid-paper relative bg-[#f7f4ec] px-5 py-24 sm:px-10 sm:py-32 lg:px-16">
          <div className="mx-auto grid max-w-[1280px] gap-14 lg:grid-cols-[.8fr_1.2fr] lg:gap-28">
            <div><p className="font-mono-label text-[10px] uppercase tracking-[.22em] text-[#b05b4b]">01 / The premise</p><div className="mt-12 hidden h-36 w-px bg-[#c6b888] lg:block" /><p className="mt-6 max-w-[270px] font-display text-2xl leading-[1.2] text-[#315b4d]">“The health of people is inseparable from the health of animals and the living world.”</p></div>
            <div><h2 className="max-w-3xl font-display text-5xl leading-[.98] tracking-[-.04em] text-[#163d34] sm:text-7xl">The questions that matter most now <em className="text-[#b05b4b]">refuse to stay in one discipline.</em></h2><p className="mt-10 max-w-2xl text-lg leading-8 text-[#587067]">One Health is more than a framework. It is a way of paying attention—to the connections between a child’s lungs, a changing forest, a farmer’s livelihood, and the systems that hold them all. This conference is a place to make those connections visible, and useful.</p><div className="mt-12 grid max-w-2xl gap-7 border-t border-[#c6b888] pt-7 sm:grid-cols-3"><div><Dna className="text-[#b05b4b]" size={25} strokeWidth={1.3} /><p className="mt-4 font-display text-2xl">Human</p><p className="mt-1 text-sm leading-5 text-[#587067]">Public health, care & equity</p></div><div><PawPrint className="text-[#b05b4b]" size={25} strokeWidth={1.3} /><p className="mt-4 font-display text-2xl">Animal</p><p className="mt-1 text-sm leading-5 text-[#587067]">Veterinary science & welfare</p></div><div><Leaf className="text-[#b05b4b]" size={25} strokeWidth={1.3} /><p className="mt-4 font-display text-2xl">Planet</p><p className="mt-1 text-sm leading-5 text-[#587067]">Ecology, climate & place</p></div></div></div>
          </div>
        </section>

        <section id="program" className="bg-[#e8e2d2] px-5 py-24 sm:px-10 sm:py-32 lg:px-16">
          <div className="mx-auto max-w-[1280px]">
            <div className="flex flex-col justify-between gap-7 sm:flex-row sm:items-end"><div><p className="font-mono-label text-[10px] uppercase tracking-[.22em] text-[#b05b4b]">02 / The program</p><h2 className="mt-5 max-w-2xl font-display text-5xl leading-[.95] tracking-[-.04em] sm:text-7xl">From evidence<br /><em>to action.</em></h2></div><AppLink href="#attend" className="line-link mb-2 inline-flex items-center gap-2 self-start font-mono-label text-[10px] uppercase tracking-[.16em] text-[#315b4d] sm:self-auto">View full program <ArrowUpRight size={15} /></AppLink></div>
            <div className="mt-16 border-t border-[#b9af95]">
              {[
                ['01', 'Plenary conversations', 'The big picture, held by the people closest to it.', '07:45 — 09:30'],
                ['02', 'Field notes', 'What changes when research meets the realities of a place.', '10:00 — 12:30'],
                ['03', 'Working tables', 'Small rooms for difficult questions and practical next steps.', '14:00 — 16:00'],
                ['04', 'Night garden', 'An evening of food, music, and unhurried exchange.', '19:00 — late'],
              ].map(([number, title, description, time]) => <div key={number} className="group grid gap-4 border-b border-[#b9af95] py-7 transition-colors hover:bg-[#f2eddf] sm:grid-cols-[70px_1fr_auto] sm:items-center sm:gap-8"><span className="font-mono-label text-[11px] text-[#b05b4b]">{number}</span><div><h3 className="font-display text-3xl text-[#163d34] transition-transform group-hover:translate-x-2">{title}</h3><p className="mt-1 text-sm text-[#587067]">{description}</p></div><span className="flex items-center gap-2 font-mono-label text-[10px] uppercase tracking-[.1em] text-[#587067]"><Clock3 size={14} /> {time}</span></div>)}
            </div>
          </div>
        </section>

        <section id="people" className="bg-[#f7f4ec] px-5 py-24 sm:px-10 sm:py-32 lg:px-16">
          <div className="mx-auto max-w-[1280px]">
            <div className="flex items-end justify-between gap-5"><div><p className="font-mono-label text-[10px] uppercase tracking-[.22em] text-[#b05b4b]">03 / The people</p><h2 className="mt-5 max-w-2xl font-display text-5xl leading-[.95] tracking-[-.04em] sm:text-7xl">Voices with<br /><em>something at stake.</em></h2></div><span className="hidden pb-2 font-mono-label text-[10px] uppercase tracking-[.16em] text-[#587067] sm:block">Keynote speakers · 2025</span></div>
            <div className="mt-16 grid gap-5 md:grid-cols-3">{speakers.map((speaker, index) => <article key={speaker.name} className={`group border border-[#d4cbb6] p-4 transition-all duration-300 hover:-translate-y-2 hover:border-[#315b4d] ${index === 1 ? 'md:mt-14' : index === 2 ? 'md:mt-7' : ''}`} data-testid={`card-speaker-${index}`}><div className={`relative flex aspect-[1.12] items-end overflow-hidden ${speaker.color} p-5`}><div className="absolute -right-10 -top-10 h-44 w-44 rounded-full border border-[#163d34]/20" /><div className="absolute right-10 top-10 h-24 w-24 rounded-full border border-[#163d34]/20" /><span className="relative font-display text-8xl leading-none tracking-[-.08em] text-[#163d34]/80">{speaker.initials}</span><span className="absolute right-4 top-4 font-mono-label text-[10px] text-[#163d34]">0{index + 1}</span></div><div className="px-1 pb-2 pt-5"><h3 className="font-display text-2xl text-[#163d34]">{speaker.name}</h3><p className="mt-2 text-sm font-medium text-[#b05b4b]">{speaker.role}</p><p className="mt-1 text-sm text-[#587067]">{speaker.affiliation}</p></div></article>)}</div>
            <div className="mt-24 grid gap-7 border-t border-[#c6b888] pt-8 sm:grid-cols-[1fr_2fr]"><Quote className="text-[#b05b4b]" size={34} strokeWidth={1.2} /><blockquote className="max-w-3xl font-display text-3xl leading-[1.15] text-[#315b4d] sm:text-4xl">“We do not need another conversation about silos. We need the courage—and the methods—to work across them.”<cite className="mt-5 block font-mono-label text-[10px] not-italic uppercase tracking-[.16em] text-[#b05b4b]">— Dr. Maya Rachman · Conference chair</cite></blockquote></div>
          </div>
        </section>

        <section id="attend" className="bg-[#315b4d] px-5 py-24 text-[#f7f4ec] sm:px-10 sm:py-32 lg:px-16">
          <div className="mx-auto max-w-[1280px]">
            <div className="grid gap-14 lg:grid-cols-[1fr_1.2fr] lg:gap-28"><div><p className="font-mono-label text-[10px] uppercase tracking-[.22em] text-[#e4bc57]">04 / Make your way here</p><h2 className="mt-5 font-display text-5xl leading-[.95] tracking-[-.04em] sm:text-7xl">Worth the<br /><em>journey.</em></h2><p className="mt-8 max-w-sm leading-7 text-[#c9d6ca]">Come for the program. Stay for the conversations that happen between sessions, over coffee, and on the walk home.</p><div className="mt-10 flex flex-wrap gap-3"><button onClick={() => setDialog('register')} className="focus-ring group inline-flex items-center gap-4 bg-[#e4bc57] px-5 py-4 font-mono-label text-[10px] uppercase tracking-[.15em] text-[#163d34] transition-colors hover:bg-[#f7f4ec]" data-testid="button-attend-register">{copy.register}<ArrowUpRight size={16} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></button><button onClick={() => setDialog('abstract')} className="focus-ring inline-flex items-center gap-3 border border-[#89a397] px-5 py-4 font-mono-label text-[10px] uppercase tracking-[.15em] text-[#f7f4ec] transition-colors hover:border-[#e4bc57] hover:text-[#e4bc57]" data-testid="button-attend-abstract">{copy.abstract}<Send size={14} /></button></div></div>
              <div className="grid gap-10 sm:grid-cols-2"><div className="border-t border-[#789286] pt-5"><MapPin size={22} className="text-[#e4bc57]" strokeWidth={1.4} /><h3 className="mt-5 font-display text-3xl">Grha Sabha Pramana</h3><p className="mt-3 text-sm leading-6 text-[#c9d6ca]">Universitas Gadjah Mada<br />Bulaksumur, Yogyakarta 55281<br />Indonesia</p><AppLink href="https://maps.google.com/?q=Grha+Sabha+Pramana+UGM" className="line-link mt-6 inline-flex items-center gap-2 font-mono-label text-[10px] uppercase tracking-[.14em] text-[#e4bc57]">Open map <MoveUpRight size={13} /></AppLink></div><div className="border-t border-[#789286] pt-5"><Globe2 size={22} className="text-[#e4bc57]" strokeWidth={1.4} /><h3 className="mt-5 font-display text-3xl">Travel lightly</h3><p className="mt-3 text-sm leading-6 text-[#c9d6ca]">Adisucipto International Airport is 8 km from campus. We encourage rail travel from Jakarta and local, shared transport once you arrive.</p><AppLink href="#contact" className="line-link mt-6 inline-flex items-center gap-2 font-mono-label text-[10px] uppercase tracking-[.14em] text-[#e4bc57]">Travel guidance <ArrowUpRight size={13} /></AppLink></div></div>
            </div>
          </div>
        </section>

        <section className="bg-[#e8e2d2] px-5 py-24 sm:px-10 sm:py-32 lg:px-16">
          <div className="mx-auto grid max-w-[1280px] gap-16 lg:grid-cols-[.75fr_1.25fr] lg:gap-28">
            <div><p className="font-mono-label text-[10px] uppercase tracking-[.22em] text-[#b05b4b]">05 / Mark the calendar</p><h2 className="mt-5 font-display text-5xl leading-[.95] tracking-[-.04em] sm:text-7xl">The time<br /><em>is now.</em></h2></div>
            <div className="border-t border-[#b9af95]">{[['05 May 2025', 'Registration opens', 'Early registration and travel bursary applications begin.'], ['30 June 2025', 'Abstract deadline', 'Share your research, practice, or provocation with the gathering.'], ['15 July 2025', 'Programme announced', 'See the full constellation of sessions and speakers.'], ['17 October 2025', 'We gather', 'Three days at UGM, Yogyakarta.']].map(([date, title, detail], index) => <div key={date} className="grid gap-2 border-b border-[#b9af95] py-6 sm:grid-cols-[150px_1fr] sm:gap-8"><span className={`font-mono-label text-[10px] uppercase tracking-[.1em] ${index === 3 ? 'text-[#b05b4b]' : 'text-[#587067]'}`}>{date}</span><div><h3 className="font-display text-2xl text-[#163d34]">{title}</h3><p className="mt-1 max-w-lg text-sm leading-6 text-[#587067]">{detail}</p></div></div>)}</div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#d6a846] px-5 py-20 sm:px-10 sm:py-28 lg:px-16">
          <div className="absolute -right-20 -top-36 h-[480px] w-[480px] rounded-full border border-[#163d34]/20" /><div className="absolute right-20 top-12 h-3 w-3 rounded-full bg-[#b05b4b]" />
          <div className="relative mx-auto grid max-w-[1280px] gap-10 sm:grid-cols-[1fr_auto] sm:items-end"><div><p className="font-mono-label text-[10px] uppercase tracking-[.22em] text-[#315b4d]">For the work ahead</p><h2 className="mt-4 max-w-3xl font-display text-5xl leading-[.92] tracking-[-.04em] text-[#163d34] sm:text-7xl">Bring what you know.<br />Leave with <em>more.</em></h2></div><button onClick={() => setDialog('abstract')} className="focus-ring group inline-flex h-fit items-center gap-4 border border-[#315b4d] px-5 py-4 font-mono-label text-[10px] uppercase tracking-[.15em] text-[#315b4d] transition-colors hover:bg-[#315b4d] hover:text-[#f7f4ec]" data-testid="button-cta-abstract">Submit an abstract <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></button></div>
        </section>

        <footer id="contact" className="bg-[#163d34] px-5 pb-8 pt-20 text-[#f7f4ec] sm:px-10 sm:pt-24 lg:px-16">
          <div className="mx-auto max-w-[1280px]">
            <div className="grid gap-14 lg:grid-cols-[1.3fr_.7fr_.7fr]"><div><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c6b888] text-[#e4bc57]"><Leaf size={20} strokeWidth={1.5} /></span><span className="font-mono-label text-[10px] uppercase leading-[1.25] tracking-[.18em]">International<br />Conference on One Health</span></div><h2 className="mt-10 max-w-xl font-display text-5xl leading-[.95] text-[#f7f4ec] sm:text-6xl">A shared future<br /><em className="text-[#e4bc57]">starts here.</em></h2><p className="mt-7 max-w-sm text-sm leading-6 text-[#b9cbbd]">A gathering hosted by Universitas Gadjah Mada for the people making health possible across species and systems.</p></div><div><p className="font-mono-label text-[10px] uppercase tracking-[.2em] text-[#e4bc57]">Explore</p><div className="mt-6 grid gap-4 text-sm text-[#dce4d7]">{navItems.map(([label, href]) => <AppLink key={href} href={href} className="line-link w-fit">{label}</AppLink>)}<AppLink href="#contact" className="line-link w-fit">Contact team</AppLink></div></div><div><p className="font-mono-label text-[10px] uppercase tracking-[.2em] text-[#e4bc57]">Stay close</p><p className="mt-6 text-sm leading-6 text-[#b9cbbd]">Occasional notes on the program, travel, and the ideas we are carrying forward.</p>{subscribed ? <p className="mt-6 flex items-center gap-2 text-sm text-[#e4bc57]"><Check size={15} /> You are subscribed.</p> : <form className="mt-5 flex border-b border-[#668178]" onSubmit={(event) => { event.preventDefault(); if (email) setSubscribed(true); }}><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" className="min-w-0 flex-1 bg-transparent py-3 text-sm text-[#f7f4ec] outline-none placeholder:text-[#8da99a]" data-testid="input-newsletter-email" /><button aria-label="Subscribe to updates" className="text-[#e4bc57] transition-transform hover:translate-x-1" data-testid="button-newsletter-subscribe"><ArrowUpRight size={18} /></button></form>}<a href="mailto:onehealth@ugm.ac.id" className="mt-6 inline-flex items-center gap-2 text-sm text-[#dce4d7] hover:text-[#e4bc57]" data-testid="link-contact-email"><Mail size={15} /> onehealth@ugm.ac.id</a></div></div>
            <div className="mt-20 flex flex-col justify-between gap-4 border-t border-[#668178] pt-5 font-mono-label text-[9px] uppercase tracking-[.15em] text-[#8da99a] sm:flex-row"><span>© 2025 UGM One Health Conference</span><span>Humans · Animals · Planet</span><span>Yogyakarta, Indonesia</span></div>
          </div>
        </footer>
      </main>
      {dialog && <Modal kind={dialog} onClose={() => setDialog(null)} language={language} />}
    </div>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;