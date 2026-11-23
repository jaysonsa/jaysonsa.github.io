// Small mock demos shown inside a project panel. All data here is made up.

function UploadDemo() {
  return (
    <div className="demo demo-upload">
      <ol className="flow">
        <li>Upload</li>
        <li>Tag</li>
        <li>Publish</li>
      </ol>
      <div className="sites">
        {['Site A', 'Site B', 'Site C'].map((s, i) => (
          <div key={s} className="site">
            <span className={`thumb t${i}`} aria-hidden="true" />
            {s}
          </div>
        ))}
      </div>
      <pre className="code">
        {'<script src="…/asset-loader.js"\n  data-tag="homepage-hero"></script>\n<script>\n  function onImagesLoaded(images) { /* render */ }\n</script>'}
      </pre>
      <p className="demo-caption">One upload, served to every site that uses the tag. Snippet is illustrative.</p>
    </div>
  );
}

function TelegramDemo() {
  return (
    <div className="demo demo-telegram">
      <div className="tg-head">
        <span className="tg-avatar" aria-hidden="true">AA</span>
        <div>
          <strong>Anomaly Alerts</strong>
          <small>bot</small>
        </div>
      </div>
      <div className="tg-msg">
        <p>
          <strong>⚠️ Rule: Unusual refund spike</strong>
        </p>
        <p>3 new rows matched (refunds_1h &gt; 50)</p>
        <p>• acct_10482 · 74</p>
        <p>• acct_20931 · 61</p>
        <p>• acct_33017 · 58</p>
        <time>09:42</time>
      </div>
      <p className="demo-caption">Sample message with mock data. Rows already alerted inside the cooldown are skipped.</p>
    </div>
  );
}

function WebhookDemo() {
  const payload = {
    event_id: 'evt_01J9X4',
    sequence: 1842,
    type: 'promotion.changed',
    occurred_at: '2026-01-15T09:30:00Z',
    changes: [{ field: 'end_date', before: '2026-01-31', after: '2026-02-15' }],
    promotion: { id: 1024, title: 'Weekend Reward', brand: 'brand-a' },
  };
  return (
    <div className="demo">
      <p className="demo-label">POST {'{client webhook URL}'} (mock)</p>
      <pre className="code">
        {'X-Timestamp: 1736933400\nX-Signature: sha256=9f2c…e81a\n\n'}
        {JSON.stringify(payload, null, 2)}
      </pre>
      <p className="demo-caption">
        Signed with HMAC-SHA256 over timestamp + body. Failed deliveries retry at 1m, 5m, 30m, 2h and 12h.
      </p>
    </div>
  );
}

function DirectoryDemo() {
  const rows = [
    ['acct_10482', 'Gold', '2 days ago', '48,200'],
    ['acct_20931', 'Silver', '9 days ago', '12,950'],
    ['acct_33017', 'Gold', 'Today', '31,400'],
  ];
  return (
    <div className="demo">
      <div className="filters" aria-hidden="true">
        <span>Segment: Gold</span>
        <span>Active: 30 days</span>
        <span className="export">Export CSV</span>
      </div>
      <table className="ledger">
        <thead>
          <tr>
            <th>Account</th>
            <th>Tier</th>
            <th>Last active</th>
            <th className="num">Lifetime</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([a, t, l, v]) => (
            <tr key={a}>
              <td>{a}</td>
              <td>{t}</td>
              <td>{l}</td>
              <td className="num">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="demo-caption">Mock rows. Exports run in the background and arrive as a zipped, multi-part CSV.</p>
    </div>
  );
}

function LedgerDemo() {
  const rows = [
    ['Feeds', 'Owner', '12,400'],
    ['Vaccines', 'Partner', '3,250'],
    ['Rent', 'Owner', '5,000'],
  ];
  return (
    <div className="demo">
      <table className="ledger">
        <thead>
          <tr>
            <th>Category</th>
            <th>Paid by</th>
            <th className="num">Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([c, p, a]) => (
            <tr key={c}>
              <td>{c}</td>
              <td>{p}</td>
              <td className="num">₱{a}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="demo-caption">Mock rows. The real app is private and requires a login.</p>
    </div>
  );
}

const DEMOS = {
  upload: UploadDemo,
  telegram: TelegramDemo,
  webhook: WebhookDemo,
  directory: DirectoryDemo,
  ledger: LedgerDemo,
};

export default function Demo({ type }) {
  const Component = DEMOS[type];
  return Component ? <Component /> : null;
}
