// All text shown on the site lives here, so it can be edited without touching the 3D code.
// Work projects are anonymized: generic names, no company details, mock data only.

export const profile = {
  handle: 'jaysonsa',
  name: '', // optional: your display name, e.g. 'Jayson S.'
  role: 'Web Developer',
  intro:
    'I build internal web tools that keep teams informed: asset libraries, monitoring bots, and data endpoints that other teams rely on every day.',
  links: {
    github: 'https://github.com/jaysonsa',
    linkedin: '', // optional: full LinkedIn URL
    email: '', // optional: public contact email
  },
};

export const WORK_NOTE = 'Work project · anonymized · demo uses mock data';

export const entries = {
  about: {
    type: 'about',
    kind: 'Front desk',
    title: 'About me',
    tagline: 'Welcome to my virtual office.',
  },

  'asset-hub': {
    type: 'project',
    kind: WORK_NOTE,
    title: 'Asset Hub',
    tagline: 'One central library for the images used across several websites.',
    problem:
      'Banner images were needed on several websites, and handling them separately per site made reuse and consistency harder.',
    solution:
      'A shared asset library where the team stores banners once and serves the same image to every site that needs it.',
    impact: ['One source of truth for banner images', 'Less duplicate uploading across sites'],
    tech: [], // add the stack you used, e.g. ['PHP', 'MySQL']
    demo: 'upload',
  },

  'kpi-sentinel': {
    type: 'project',
    kind: WORK_NOTE,
    title: 'KPI Sentinel',
    tagline: 'Watches key business numbers and alerts the team on Telegram when something looks wrong.',
    problem:
      'Spotting a sudden drop in important metrics depended on someone checking the dashboards at the right time.',
    solution:
      'A monitoring service that checks selected metrics on a schedule, compares them with thresholds, and posts an alert to a Telegram group when a value becomes alarming.',
    impact: ['The team is alerted without having to watch dashboards', 'Fewer manual checks during the day'],
    tech: ['Telegram Bot API', 'Scheduled jobs'],
    demo: 'telegram',
  },

  'promo-radar': {
    type: 'project',
    kind: WORK_NOTE,
    title: 'Promo Radar',
    tagline: 'Tracks live promotional banners (ours and competitors’) and keeps support teams up to date on promo terms.',
    problem:
      'Checking which promotions were live, on our sites and on competitor sites, was manual, and support agents needed the latest terms to answer customers.',
    solution:
      'A monitor that records the promotional banners shown on our sites and competitor sites, plus API endpoints the support team uses to read promotion terms. When terms change, a webhook pushes the update to them.',
    impact: ['Support answers from the latest terms', 'Competitor promotions visible in one place'],
    tech: ['REST API', 'Webhooks'],
    demo: 'webhook',
  },

  'farm-ledger': {
    type: 'project',
    kind: 'Personal project · private app',
    title: 'Farm Ledger',
    tagline: 'Expense, cull, and wingband tracker for a small gamefowl farm, shared by two partners.',
    problem:
      'Farm costs per batch were tracked by hand, so totals per category and who paid for what were hard to see.',
    solution:
      'A web app with batches, categorized expenses (feeds, vaccines, rent, wages), cull records, and a wingband registry. The owner can edit; the partner can only view.',
    impact: ['Totals per batch, category, and person', 'Editor and viewer roles enforced in the database', 'CSV export'],
    tech: ['JavaScript', 'Supabase', 'PostgreSQL row-level security', 'GitHub Pages'],
    demo: 'ledger',
  },

  skills: {
    type: 'skills',
    kind: 'Whiteboard',
    title: 'Skills',
    tagline: 'Tools I use to build and ship.',
    groups: [
      { name: 'Frontend', items: ['HTML & CSS', 'JavaScript', 'React', 'Three.js / R3F'] },
      { name: 'Backend & data', items: ['REST APIs', 'Webhooks', 'PostgreSQL', 'Supabase'] },
      { name: 'Integrations', items: ['Telegram Bot API', 'Scheduled jobs', 'Monitoring'] },
      { name: 'Tooling', items: ['Git & GitHub', 'GitHub Actions', 'GitHub Pages', 'Vite'] },
    ],
  },

  contact: {
    type: 'contact',
    kind: 'Exit',
    title: 'Contact',
    tagline: 'Thanks for visiting. Let’s talk.',
  },
};

export const ORDER = ['about', 'asset-hub', 'kpi-sentinel', 'promo-radar', 'farm-ledger', 'skills', 'contact'];
