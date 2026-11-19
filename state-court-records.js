const filter = document.querySelector('#state-filter');
const input = document.querySelector('#state-query');
const status = document.querySelector('#state-results');
const entries = Array.from(document.querySelectorAll('#state-directory li'), (entry) => ({
  entry,
  name: entry.querySelector('strong').textContent.toLowerCase(),
  code: entry.dataset.code.toLowerCase()
}));

function filterStates() {
  const query = input.value.toLowerCase().trim().replace(/\s+/g, ' ');
  const normalized = query.replace(/\./g, '');
  const abbreviation = normalized === 'washington dc' ? 'dc' : normalized;
  const isPostalCode = entries.some(({code}) => code === abbreviation);
  let count = 0;
  for (const {entry, name, code} of entries) {
    const matches = isPostalCode ? code === abbreviation : name.includes(query);
    entry.hidden = !matches;
    if (matches) count += 1;
  }
  status.textContent = count
    ? `Showing ${count} of ${entries.length} jurisdictions.`
    : 'No jurisdictions match that search.';
}

input.addEventListener('input', filterStates);
filter.hidden = false;
filterStates();
