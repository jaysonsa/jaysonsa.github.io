// All text shown on the site lives here, so it can be edited without touching the 3D code.
// Work projects are anonymized: generic names, no company details, mock data only.

export const profile = {
  handle: 'jaysonsa',
  name: '', // optional: your display name, e.g. 'Jayson S.'
  role: 'Full-Stack Web Developer',
  intro:
    'I build internal tools for data, risk, marketing, and content teams: alerting pipelines, dashboards over millions of records, asset delivery, and APIs with signed webhooks. Mostly Laravel and React.',
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
    tagline: 'A central banner and media library that other websites pull from, with no backend work on their side.',
    problem:
      'Promo banners were used across many websites. Swapping a banner meant touching each site, and there was no single place to manage, tag, or archive them.',
    solution:
      'A media library module inside an internal CMS. Staff bulk-upload images, GIFs, and videos, tag them, and order them by drag and drop. Websites then consume a tag through a public JSON API or a drop-in JavaScript snippet, so changing banners in the library updates every site.',
    highlights: [
      'Embeddable JS loader with lifecycle callbacks, so external sites integrate without a backend',
      'Tag-based delivery: re-tagging or re-ordering banners updates many sites at once',
      'Short public image links (slug aliases) with rate limiting and a fallback image',
      'Drag-and-drop upload with progress, auto-detected banner sizes, and duplicate-name handling',
      'Archive/restore that moves the actual file in object storage, not just a database flag',
      'Fine-grained per-action permissions, feature toggles, IP allow-lists, and a full audit log',
      'OpenAPI (Swagger) documented endpoint',
    ],
    impact: ['One source of truth for banners across sites', 'Banner changes no longer need a deploy on each site'],
    tech: ['Laravel 11', 'Inertia.js', 'React', 'Tailwind CSS', 'S3-compatible storage', 'spatie/laravel-permission', 'OpenAPI'],
    demo: 'upload',
  },

  'anomaly-alerts': {
    type: 'project',
    kind: WORK_NOTE,
    title: 'Anomaly Alerts',
    tagline: 'Self-service alert rules: write a query, set conditions and a schedule, get anomalies in Telegram.',
    problem:
      'Analysts had to keep re-running queries and watching dashboards to catch unusual activity, and each new check needed a developer.',
    solution:
      'A rule builder where trusted staff write a read-only SQL query against the data warehouse, add column conditions (comparisons, ranges, contains, empty checks; all or any), pick identifier columns and a schedule, and link a Telegram channel. A scheduler runs due rules on a queue and sends only the rows that matched.',
    highlights: [
      'Atomic rule claiming with a conditional UPDATE, so a rule never runs twice across ticks or servers',
      'SQL guard that allows a single SELECT/WITH and ignores keywords hidden inside strings or comments',
      'De-duplication by hashing identifier columns, with cooldown or "only new today" modes',
      'Cooldown starts only after a successful send, so failed alerts are retried',
      'Background "test run" with polling; a rule can only be saved if the tested query matches',
      'Self-healing: stuck runs are closed, rules pause after 3 failures, and a fallback bot reports delivery problems',
      'Encrypted bot tokens, message trimming for Telegram limits, and automatic history pruning',
    ],
    impact: ['New checks no longer need a developer', 'Repeat alerts are suppressed, so channels stay readable'],
    tech: ['Laravel 11', 'Queues & cron', 'Redis', 'Trino (SQL)', 'Telegram Bot API', 'React'],
    demo: 'telegram',
  },

  'customer-insights': {
    type: 'project',
    kind: WORK_NOTE,
    title: 'Customer Insights',
    tagline: 'A directory of millions of customer accounts with financial KPIs, plus scheduled performance reports.',
    problem:
      'Account-level numbers lived in a large analytics warehouse. Teams needed fast filtering and exports over millions of rows, and recurring performance reports were assembled by hand.',
    solution:
      'Two features in a risk-management platform. A directory syncs account KPIs from the warehouse into an indexed table and serves a searchable, filterable view with summary cards and async exports. A performance module syncs per-brand results several times a day and delivers password-protected Excel reports to Telegram.',
    features: [
      {
        title: 'Customer directory',
        points: [
          'Daily sync streams warehouse pages into the app database with chunked upserts, cancellable mid-run',
          'Pre-computed summary table swapped in a transaction, so readers never see empty data',
          'Version-keyed caching: a new sync invalidates old summaries automatically',
          'Pagination without COUNT(*), which had taken over a minute on millions of rows',
          'Composite and virtual-column indexes shaped around the real filters',
          'Async export with keyset reads, multi-part CSV in a ZIP, formula-injection guard, 24h download links',
          'Watchdog that alerts on silent failures: dead workers, stalled syncs, missed schedules',
        ],
      },
      {
        title: 'Performance reports',
        points: [
          'Wraps another team’s SQL with explicit column mapping, so schema changes fail loudly',
          'Streaming upserts with query listeners disabled, fixing memory blow-ups past 512 MB',
          'Stale rows are removed only after the warehouse confirms the query finished',
          'Excel reports streamed in chunks, split to stay under Telegram’s file limit, encrypted, sent, then deleted',
          'Row-level styling made report generation about 3x faster',
          'Filter whitelists, injection detection with alerts, and per-route rate limits',
        ],
      },
    ],
    impact: ['Fast filtering and exports over millions of rows', 'Recurring reports delivered automatically'],
    tech: ['Laravel 11', 'Inertia.js', 'React', 'Redis queues', 'Trino', 'OpenSpout', 'S3-compatible storage', 'Telegram Bot API'],
    demo: 'directory',
  },

  'promo-radar': {
    type: 'project',
    kind: WORK_NOTE,
    title: 'Promo Radar',
    tagline: 'Tracks every promotion on our brands and competitor brands, and feeds the changes to other teams through an API and signed webhooks.',
    problem:
      'Knowing which promotions were live, what changed in their terms, and what competitors offered was manual, and another team’s system needed the latest terms without polling.',
    solution:
      'Two features in an internal AI tools platform. The monitor keeps a versioned catalogue of every promotion across brands, currencies, and languages, with change alerts and side-by-side comparison. The Promotion API exposes our brands’ promotions to an internal client system and pushes signed webhooks whenever something changes.',
    features: [
      {
        title: 'Promotion monitoring',
        points: [
          'Scheduled collection from each site’s public promotion feed, with retries, back-off, and proxy support',
          'Fingerprint-based versioning with New / Changed / Back / Removed states and a full history',
          'Noise filter that separates real changes from typos and formatting differences',
          'Telegram alerts for changes and broken links; compare view with Excel export',
          'Market-gap view: offers competitors run that we don’t, and the reverse',
          'AI-assisted extraction of key T&C details, where every value must quote the source text',
          'Per-link locks and transactional saves to prevent double reads and false alerts',
        ],
      },
      {
        title: 'Promotion API & webhooks',
        points: [
          'Token-authenticated REST API with hashed tokens, constant-time checks, and 24h rotation overlap',
          'Per-client IP allow-lists, pause switch, rate limits, and request logging',
          'Cursor pagination and updated_since filtering for efficient syncs',
          'Transactional outbox: one frozen payload per client and change, with dedupe keys',
          'HMAC-SHA256 signatures over timestamp + body, dual signatures during secret rotation',
          'Retries at 1m, 5m, 30m, 2h, 12h with a fair time budget per client',
          'SSRF protection for webhook targets and built-in developer docs',
        ],
      },
    ],
    impact: ['Support and marketing work from the latest terms', 'The client system syncs on change instead of polling'],
    tech: ['Laravel 13', 'Inertia.js', 'React 19', 'Webhooks (HMAC)', 'REST API', 'Laravel AI SDK', 'Telegram Bot API'],
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
    highlights: [
      'Editor and viewer roles enforced by PostgreSQL row-level security, not just the UI',
      'Email allow-list: only invited accounts can see any data',
      'Totals per batch, category, and person, with pagination and CSV export',
    ],
    impact: ['Clear per-batch cost picture for both partners'],
    tech: ['JavaScript', 'Supabase', 'PostgreSQL RLS', 'GitHub Pages'],
    demo: 'ledger',
  },

  skills: {
    type: 'skills',
    kind: 'Whiteboard',
    title: 'Skills',
    tagline: 'Tools I use to build and ship.',
    groups: [
      { name: 'Backend', items: ['PHP & Laravel', 'Queues & scheduler', 'Redis', 'REST APIs', 'Webhooks (HMAC)'] },
      { name: 'Frontend', items: ['React', 'Inertia.js', 'Tailwind CSS', 'JavaScript', 'Three.js / R3F'] },
      { name: 'Data', items: ['SQL', 'Trino', 'PostgreSQL', 'Supabase', 'Large exports'] },
      { name: 'Integrations', items: ['Telegram Bot API', 'S3 storage', 'LLM APIs', 'OpenAPI', 'GitHub Actions'] },
    ],
  },

  contact: {
    type: 'contact',
    kind: 'Exit',
    title: 'Contact',
    tagline: 'Thanks for visiting. Let’s talk.',
  },
};

export const ORDER = [
  'about',
  'asset-hub',
  'anomaly-alerts',
  'customer-insights',
  'promo-radar',
  'farm-ledger',
  'skills',
  'contact',
];
