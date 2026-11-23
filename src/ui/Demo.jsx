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
      <p className="demo-caption">One upload, served to every site that uses it.</p>
    </div>
  );
}

function TelegramDemo() {
  return (
    <div className="demo demo-telegram">
      <div className="tg-head">
        <span className="tg-avatar" aria-hidden="true">KS</span>
        <div>
          <strong>KPI Sentinel</strong>
          <small>bot</small>
        </div>
      </div>
      <div className="tg-msg">
        <p>
          <strong>⚠️ KPI alert</strong>
        </p>
        <p>Transactions (last hour): 412</p>
        <p>▼ 38% vs. 7-day average</p>
        <p>Threshold: −25%</p>
        <time>09:42</time>
      </div>
      <p className="demo-caption">Sample message with mock numbers.</p>
    </div>
  );
}

function WebhookDemo() {
  const payload = {
    event: 'promotion.terms_updated',
    promotion_id: 'PROMO-1024',
    changed: ['max_reward', 'valid_until'],
    updated_at: '2026-01-15T09:30:00Z',
  };
  return (
    <div className="demo">
      <p className="demo-label">POST /webhooks/support (mock)</p>
      <pre className="code">{JSON.stringify(payload, null, 2)}</pre>
      <p className="demo-caption">When promo terms change, support gets a payload like this.</p>
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

const DEMOS = { upload: UploadDemo, telegram: TelegramDemo, webhook: WebhookDemo, ledger: LedgerDemo };

export default function Demo({ type }) {
  const Component = DEMOS[type];
  return Component ? <Component /> : null;
}
