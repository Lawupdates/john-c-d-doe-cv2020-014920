import fs from "node:fs";

const base = "https://lawupdates.github.io/john-c-d-doe-cv2020-014920/";
const source = fs.readFileSync("index.html", "utf8");
const match = source.match(/const raw = `\n([\s\S]*?)\n`;/);

if (!match) throw new Error("Could not find the filing data in index.html");

const escapeHtml = (value) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const filings = match[1].trim().split("\n").map((line) => {
  const [id, title, date, page, type] = line.split("|");
  const number = Number(id.slice(1));
  const pdfPath = number >= 113 ? `filing-${id}.html` : number >= 111 ? `${id}.pdf` : `filings/${id}.pdf`;
  const verifiedDate = /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(date);
  const isoDate = verifiedDate
    ? new Date(`${date} 12:00:00`).toISOString().slice(0, 10)
    : null;
  return { id, title, date, page, type, number, pdfPath, isoDate };
}).sort((a, b) => b.number - a.number);

const rows = filings.map((filing) => `
        <tr>
          <th scope="row">${filing.id.toUpperCase()}</th>
          <td><a href="${filing.pdfPath}">${escapeHtml(filing.title)}</a></td>
          <td>${escapeHtml(filing.date)}</td>
          <td>${escapeHtml(filing.type)}</td>
        </tr>`).join("");

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Court Filing Archive | JOHN C D DOE v. Big Brothers Big Sisters | CV2020-014920</title>
  <meta name="description" content="Static index of archived public court filings in JOHN C D DOE v. Big Brothers Big Sisters of America and Big Brothers Big Sisters of Central Arizona, CV2020-014920.">
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
  <link rel="canonical" href="${base}court-filings-index.html">
  <link rel="alternate" type="application/atom+xml" title="Case archive updates" href="${base}feed.xml">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="JOHN C D DOE Case Record Archive">
  <meta property="og:title" content="112 Court Filings | JOHN C D DOE v. Big Brothers Big Sisters">
  <meta property="og:description" content="Direct, crawlable index of the public filing PDFs archived for Arizona case CV2020-014920.">
  <meta property="og:url" content="${base}court-filings-index.html">
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"CollectionPage","name":"112 Court Filings in JOHN C D DOE v. Big Brothers Big Sisters","description":"Static index of public court filing PDFs archived for Maricopa County Superior Court case CV2020-014920.","url":"${base}court-filings-index.html","inLanguage":"en-US","isPartOf":{"@type":"WebSite","name":"JOHN C D DOE Case Record Archive","url":"${base}"},"about":{"@type":"Thing","name":"Arizona civil case CV2020-014920"}}</script>
  <style>
    :root{--navy:#0b2435;--gold:#c69a3a;--paper:#f6f2e8;--ink:#172b39;--line:#d8cfbd}
    *{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.55 system-ui,-apple-system,Segoe UI,sans-serif}
    header{background:var(--navy);color:#fff;border-bottom:5px solid var(--gold);padding:34px 22px}header div,main,footer{max-width:1120px;margin:auto}
    header a{color:#f6dc9b}h1{font:700 clamp(1.9rem,5vw,3.2rem)/1.1 Georgia,serif;margin:.5rem 0}main{padding:28px 18px 50px}
    .notice{background:#fff;border:1px solid var(--line);border-left:5px solid var(--gold);padding:18px 22px;margin-bottom:24px}
    .table-wrap{overflow:auto;background:#fff;border:1px solid var(--line)}table{width:100%;border-collapse:collapse}caption{text-align:left;padding:18px;font-weight:700;font-size:1.1rem}
    th,td{padding:11px 13px;text-align:left;vertical-align:top;border-top:1px solid #e7e0d4}thead th{background:#e9dfc9;border-top:0}tbody th{white-space:nowrap;color:#74243a}
    a{color:#075687;text-underline-offset:3px}a:hover,a:focus{color:#74243a}footer{padding:24px 18px 40px;border-top:1px solid var(--line)}
    @media(max-width:650px){th,td{padding:10px 8px;font-size:.9rem}thead th:nth-child(3),thead th:nth-child(4),tbody td:nth-child(3),tbody td:nth-child(4){display:none}}
  </style>
</head>
<body>
  <header><div><a href="./">← Main case archive</a><h1>Complete Court Filing Index</h1><p>JOHN C D DOE v. Big Brothers Big Sisters of America and Big Brothers Big Sisters of Central Arizona · CV2020-014920</p></div></header>
  <main>
    <section class="notice" aria-labelledby="index-note"><h2 id="index-note">Archived public filings</h2><p>This permanent HTML index gives readers and search engines a direct link to every archived PDF. Filing titles and verified dates follow the available copies. Allegations in party filings are not court findings. Check the official docket for the authoritative record and any later filings.</p><p><a href="case-timeline.html">Case timeline</a> · <a href="court-records.html">Court records guide</a> · <a href="media-research-guide.html">Media and research guide</a> · <a href="https://www.superiorcourt.maricopa.gov/docket/CivilCourtCases/caseInfo.asp?caseNumber=CV2020-014920">Official Maricopa County docket</a></p></section>
    <div class="table-wrap"><table>
      <caption>Archived filing PDFs, newest filing number first</caption>
      <thead><tr><th scope="col">Filing</th><th scope="col">Document title</th><th scope="col">Date</th><th scope="col">Type</th></tr></thead>
      <tbody>${rows}
      </tbody>
    </table></div>
  </main>
  <footer><p><a href="./">Return to the main case archive</a> · <a href="site-map.html">Site map</a></p><p>Independent public court-record archive. Not an official court website.</p></footer>
</body>
</html>
`;

const sitemapEntries = filings.map((filing) => {
  const lastmod = filing.isoDate ? `\n    <lastmod>${filing.isoDate}</lastmod>` : "";
  return `  <url>\n    <loc>${base}${filing.pdfPath}</loc>${lastmod}\n  </url>`;
}).join("\n");

const pdfSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</urlset>
`;

fs.writeFileSync("court-filings-index.html", html);
fs.writeFileSync("court-filings-sitemap.xml", pdfSitemap);

const latest = filings.slice(0, 5);
const feedEntries = latest.map((filing) => {
  const guidePath = [2, 8, 16, 23, 108, 109, 110, 111, 112].includes(filing.number)
    ? `filing-${filing.id}.html`
    : filing.pdfPath;
  const updated = filing.isoDate
    ? `${filing.isoDate}T12:00:00-07:00`
    : "2026-10-14T12:00:00-07:00";
  return `  <entry>
    <title>${escapeHtml(`${filing.id.toUpperCase()} — ${filing.title}`)}</title>
    <id>${base}${guidePath}</id>
    <link href="${base}${guidePath}" />
    <updated>${updated}</updated>
    <summary>${escapeHtml(`${filing.type} archived as ${filing.id.toUpperCase()}. Verify the document and current status against the official docket.`)}</summary>
  </entry>`;
}).join("\n");

const feed = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>JOHN C D DOE Case Record Archive Updates</title>
  <subtitle>Newly archived public filings in JOHN C D DOE v. Big Brothers Big Sisters of America and Big Brothers Big Sisters of Central Arizona, CV2020-014920.</subtitle>
  <id>${base}</id>
  <link href="${base}" />
  <link rel="self" type="application/atom+xml" href="${base}feed.xml" />
  <updated>2026-10-14T12:00:00-07:00</updated>
  <author><name>JOHN C D DOE Case Record Archive</name></author>
${feedEntries}
</feed>
`;

fs.writeFileSync("feed.xml", feed);

const mediaGuide = fs.readFileSync("media-research-guide.html", "utf8");
const mediaNeedle = '</ul><p>Read the <a href="arizona-sex-abuse-case.html">';
if (!mediaGuide.includes("court-filings-index.html")) {
  if (!mediaGuide.includes(mediaNeedle)) throw new Error("Media guide insertion point changed");
  fs.writeFileSync(
    "media-research-guide.html",
    mediaGuide.replace(
      mediaNeedle,
      '</ul><p><a href="court-filings-index.html">Browse the permanent HTML index with direct links to all 112 archived filing PDFs.</a></p><p>Read the <a href="arizona-sex-abuse-case.html">',
    ),
  );
}

console.log(`Generated ${filings.length} static filing links and sitemap URLs.`);
