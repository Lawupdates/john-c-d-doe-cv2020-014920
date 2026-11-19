async function loadArchiveUpdates() {
  const list = document.getElementById("archive-updates");
  if (!list) return;

  try {
    const response = await fetch("feed.xml", { cache: "no-cache" });
    if (!response.ok) return;
    const feed = new DOMParser().parseFromString(await response.text(), "application/xml");
    const items = [...feed.querySelectorAll("entry")].slice(0, 3).flatMap((entry) => {
      const href = entry.querySelector('link:not([rel])')?.getAttribute("href");
      const title = entry.querySelector("title")?.textContent;
      if (!href || !title) return [];
      const target = new URL(href, response.url);
      if (target.origin !== location.origin) return [];

      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = target.href;
      link.textContent = title;
      const summary = document.createElement("p");
      summary.textContent = entry.querySelector("summary")?.textContent ?? "";
      item.append(link, summary);
      return [item];
    });
    if (items.length) list.replaceChildren(...items);
  } catch {
    // The HTML snapshot remains visible if the feed is unavailable.
  }
}

loadArchiveUpdates();
