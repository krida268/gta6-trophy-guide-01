// Leonida Trophy Atlas — checklist, tracker and guide for the 55 GTA VI trophies.
// Progress lives in localStorage only; the trophy data comes from data/trophies.json.
const PROGRESS_KEY = 'leonida-trophy-atlas-progress-v1';
const SPOILER_KEY = 'leonida-trophy-atlas-spoilers-v1';
const TOTAL = 55;

const listEl = document.getElementById('trophyList');
const detailEl = document.getElementById('detailPanel');
const earnedCountEl = document.getElementById('earnedCount');
const progressFillEl = document.getElementById('progressFill');
const progressBarEl = document.getElementById('progressBarWrap');
const progressNoteEl = document.getElementById('progressNote');
const resultCountEl = document.getElementById('resultCount');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade');
const spoilerEl = document.getElementById('spoilers');

let trophies = [];
let earned = new Set();
let selectedName = null;
let activeKind = 'all';

function loadStored() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) earned = new Set(parsed.filter((n) => typeof n === 'string'));
  } catch {
    earned = new Set();
  }
  try {
    spoilerEl.checked = localStorage.getItem(SPOILER_KEY) === '1';
  } catch {
    spoilerEl.checked = false;
  }
}

function saveProgress() {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify([...earned].sort()));
  } catch {
    // Storage full or unavailable: progress still shows for this session.
  }
}

function isStory(t) {
  return (t.kind || '').toLowerCase() === 'story';
}

function isSpoilerHidden(t) {
  return spoilerEl.checked && isStory(t) && !earned.has(t.name);
}

function gradeOf(t) {
  return (t.grade || 'bronze').toLowerCase();
}

function trophyText(t) {
  const steps = Array.isArray(t.steps) ? t.steps.join(' ') : '';
  const sources = Array.isArray(t.sources) ? t.sources.map((s) => s.name || '').join(' ') : '';
  return [t.name, t.description, t.guide, steps, sources].join(' ').toLowerCase();
}

function matchesFilters(t) {
  if (activeKind === 'missable' && !t.missable) return false;
  if (activeKind !== 'all' && activeKind !== 'missable' && (t.kind || '').toLowerCase() !== activeKind) return false;
  if (gradeEl.value !== 'all' && gradeOf(t) !== gradeEl.value) return false;
  const q = searchEl.value.trim().toLowerCase();
  if (q && !trophyText(t).includes(q)) return false;
  return true;
}

function badge(text, cls) {
  const span = document.createElement('span');
  span.className = 'badge ' + cls;
  span.textContent = text;
  return span;
}

function renderList() {
  listEl.replaceChildren();
  const visible = trophies.filter(matchesFilters);
  for (const t of visible) {
    const li = document.createElement('li');
    li.className = 'trophy-card' + (earned.has(t.name) ? ' earned' : '') + (selectedName === t.name ? ' selected' : '');
    li.dataset.name = t.name;

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.name);
    box.setAttribute('aria-label', 'Mark ' + t.name + ' as earned');
    box.addEventListener('click', (event) => event.stopPropagation());
    box.addEventListener('change', (event) => {
      event.stopPropagation();
      if (box.checked) earned.add(t.name);
      else earned.delete(t.name);
      saveProgress();
      renderAll();
    });
    li.append(box);

    const body = document.createElement('div');
    const name = document.createElement('p');
    name.className = 'trophy-name';
    if (isSpoilerHidden(t)) {
      const hidden = document.createElement('span');
      hidden.className = 'hidden-label';
      hidden.textContent = 'Hidden trophy — earn it to reveal';
      name.append(hidden);
    } else {
      name.textContent = t.name;
    }
    body.append(name);

    const desc = document.createElement('p');
    desc.className = 'trophy-desc';
    desc.textContent = isSpoilerHidden(t) ? 'Its name and description stay hidden until you earn it.' : (t.description || '');
    body.append(desc);

    const meta = document.createElement('div');
    meta.className = 'trophy-meta';
    meta.append(badge(t.grade || 'Bronze', 'grade-' + gradeOf(t)));
    if (t.kind) meta.append(badge(t.kind, 'kind'));
    if (t.missable) meta.append(badge('Missable', 'missable'));
    body.append(meta);
    li.append(body);

    const dot = document.createElement('span');
    dot.className = 'grade-dot ' + gradeOf(t);
    dot.setAttribute('aria-hidden', 'true');
    li.append(dot);

    li.addEventListener('click', () => {
      selectedName = t.name;
      renderDetail();
      renderListSelection();
    });
    li.tabIndex = 0;
    li.setAttribute('role', 'button');
    li.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectedName = t.name;
        renderDetail();
        renderListSelection();
      }
    });
    listEl.append(li);
  }
  resultCountEl.textContent = visible.length === trophies.length
    ? 'Showing all ' + trophies.length + ' trophies.'
    : 'Showing ' + visible.length + ' of ' + trophies.length + ' trophies.';
}

function renderListSelection() {
  for (const li of listEl.children) {
    li.classList.toggle('selected', li.dataset.name === selectedName);
  }
}

function renderProgress() {
  const count = trophies.filter((t) => earned.has(t.name)).length;
  earnedCountEl.textContent = String(count);
  progressFillEl.style.width = (count / TOTAL * 100).toFixed(1) + '%';
  progressBarEl.setAttribute('aria-valuenow', String(count));
  progressNoteEl.textContent = count >= TOTAL
    ? 'Platinum earned — every trophy in Leonida is yours.'
    : (TOTAL - count) + ' to go. The platinum unlocks when the other 54 are earned.';
}

function renderDetail() {
  const t = trophies.find((x) => x.name === selectedName);
  if (!t) {
    detailEl.innerHTML = '';
    const p = document.createElement('p');
    p.className = 'detail-empty';
    p.textContent = 'Pick a trophy to read its guide, steps and sources.';
    detailEl.append(p);
    return;
  }
  detailEl.replaceChildren();
  const hidden = isSpoilerHidden(t);

  const h = document.createElement('h2');
  h.textContent = hidden ? 'Hidden trophy' : t.name;
  detailEl.append(h);

  const meta = document.createElement('div');
  meta.className = 'trophy-meta';
  meta.append(badge(t.grade || 'Bronze', 'grade-' + gradeOf(t)));
  if (t.kind) meta.append(badge(t.kind, 'kind'));
  if (t.missable) meta.append(badge('Missable', 'missable'));
  detailEl.append(meta);

  const desc = document.createElement('p');
  desc.className = 'official-desc';
  desc.textContent = hidden ? 'Its name and description stay hidden until you earn it.' : (t.description || '');
  detailEl.append(desc);

  const earnedLine = document.createElement('p');
  earnedLine.className = 'earned-line';
  earnedLine.textContent = earned.has(t.name) ? 'Earned ✓ — ticked off in your checklist.' : 'Not earned yet.';
  detailEl.append(earnedLine);

  if (!hidden) {
    const guideH = document.createElement('h3');
    guideH.textContent = 'Guide';
    detailEl.append(guideH);
    const guide = document.createElement('p');
    guide.textContent = t.guide || '';
    detailEl.append(guide);

    if (Array.isArray(t.steps) && t.steps.length) {
      const stepsH = document.createElement('h3');
      stepsH.textContent = 'Steps';
      detailEl.append(stepsH);
      const ol = document.createElement('ol');
      for (const step of t.steps) {
        const li = document.createElement('li');
        li.textContent = step;
        ol.append(li);
      }
      detailEl.append(ol);
    }

    if (t.roadmap) {
      const road = document.createElement('p');
      road.className = 'roadmap-line';
      road.textContent = 'Roadmap: stage ' + t.roadmap.stage + ' — ' + (t.roadmap.label || '');
      detailEl.append(road);
    }

    if (Array.isArray(t.sources) && t.sources.length) {
      const srcH = document.createElement('h3');
      srcH.textContent = 'Sources';
      detailEl.append(srcH);
      const ul = document.createElement('ul');
      ul.className = 'sources';
      for (const s of t.sources) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = s.url;
        a.textContent = s.name || s.url;
        a.target = '_blank';
        a.rel = 'noopener';
        li.append(a);
        ul.append(li);
      }
      detailEl.append(ul);
    }
  } else {
    const note = document.createElement('p');
    note.textContent = 'Turn off “Hide story spoilers”, or earn this trophy, to read its guide and sources.';
    detailEl.append(note);
  }
}

function roadmapStages() {
  const byStage = new Map();
  for (const t of trophies) {
    if (!t.roadmap || t.roadmap.stage == null) continue;
    const key = Number(t.roadmap.stage);
    if (!byStage.has(key)) byStage.set(key, { stage: key, label: t.roadmap.label || ('Stage ' + key), items: [] });
    byStage.get(key).items.push(t);
  }
  if (byStage.size) return [...byStage.values()].sort((a, b) => a.stage - b.stage);
  // Fallback if the data carries no roadmap stages: order by kind.
  const order = [
    { kind: 'story', label: 'Play the story through' },
    { kind: 'missable', label: 'Catch the missables while the story is open' },
    { kind: 'collectibles', label: 'Sweep the collectibles' },
    { kind: 'activities', label: 'Finish the activities and challenges' },
    { kind: 'online', label: 'Online, last' },
  ];
  return order.map((o, i) => ({
    stage: i + 1,
    label: o.label,
    items: trophies.filter((t) => o.kind === 'missable' ? t.missable : (t.kind || '').toLowerCase() === o.kind),
  })).filter((s) => s.items.length);
}

function renderRoadmap() {
  const list = document.getElementById('roadmapList');
  list.replaceChildren();
  for (const s of roadmapStages()) {
    const li = document.createElement('li');
    li.className = 'roadmap-stage';
    const h = document.createElement('h3');
    h.textContent = 'Stage ' + s.stage + ' — ' + s.label;
    li.append(h);
    const count = document.createElement('p');
    count.className = 'stage-count';
    const done = s.items.filter((t) => earned.has(t.name)).length;
    count.textContent = done + ' of ' + s.items.length + ' earned in this stage';
    li.append(count);
    const ul = document.createElement('ul');
    for (const t of s.items) {
      const item = document.createElement('li');
      const mark = document.createElement('span');
      mark.textContent = (earned.has(t.name) ? '✓ ' : '○ ') + (isSpoilerHidden(t) ? 'Hidden trophy' : t.name);
      item.append(mark);
      if (t.missable) item.append(badge('Missable', 'missable'));
      ul.append(item);
    }
    li.append(ul);
    list.append(li);
  }
}

function renderMissables() {
  const list = document.getElementById('missableList');
  list.replaceChildren();
  const missables = trophies.filter((t) => t.missable);
  for (const t of missables) {
    const li = document.createElement('li');
    li.className = 'trophy-card' + (earned.has(t.name) ? ' earned' : '');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.name);
    box.setAttribute('aria-label', 'Mark ' + t.name + ' as earned');
    box.addEventListener('click', (event) => event.stopPropagation());
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.name);
      else earned.delete(t.name);
      saveProgress();
      renderAll();
    });
    li.append(box);
    const body = document.createElement('div');
    const name = document.createElement('p');
    name.className = 'trophy-name';
    name.textContent = isSpoilerHidden(t) ? 'Hidden trophy — earn it to reveal' : t.name;
    body.append(name);
    const desc = document.createElement('p');
    desc.className = 'trophy-desc';
    desc.textContent = isSpoilerHidden(t) ? 'Its name and description stay hidden until you earn it.' : (t.description || '');
    body.append(desc);
    const meta = document.createElement('div');
    meta.className = 'trophy-meta';
    meta.append(badge(t.grade || 'Bronze', 'grade-' + gradeOf(t)));
    if (t.roadmap) meta.append(badge('Stage ' + t.roadmap.stage, 'kind'));
    body.append(meta);
    li.append(body);
    const dot = document.createElement('span');
    dot.className = 'grade-dot ' + gradeOf(t);
    dot.setAttribute('aria-hidden', 'true');
    li.append(dot);
    li.addEventListener('click', () => {
      selectedName = t.name;
      switchView('checklist');
      renderDetail();
      renderListSelection();
    });
    list.append(li);
  }
  if (!missables.length) {
    const p = document.createElement('p');
    p.textContent = 'No missable trophies are flagged in the data yet.';
    list.append(p);
  }
}

function renderAll() {
  renderList();
  renderProgress();
  renderDetail();
  renderRoadmap();
  renderMissables();
}

function switchView(name) {
  for (const tab of document.querySelectorAll('.tab')) {
    const active = tab.dataset.view === name;
    tab.classList.toggle('active', active);
    if (active) tab.setAttribute('aria-current', 'page');
    else tab.removeAttribute('aria-current');
  }
  for (const view of document.querySelectorAll('.view')) {
    view.classList.toggle('hidden', view.id !== 'view-' + name);
  }
}

function flashStatus(message, isError) {
  let status = document.getElementById('importStatus');
  if (!status) {
    status = document.createElement('p');
    status.id = 'importStatus';
    status.className = 'import-status';
    document.querySelector('.controls').after(status);
  }
  status.textContent = message;
  status.classList.toggle('error', Boolean(isError));
}

function exportProgress() {
  const payload = {
    app: 'Leonida Trophy Atlas',
    game: 'Grand Theft Auto VI',
    exportedAt: new Date().toISOString(),
    total: trophies.length,
    earned: [...earned].sort(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'leonida-trophy-progress.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  flashStatus('Exported ' + earned.size + ' earned trophies to leonida-trophy-progress.json.');
}

async function importProgress(file) {
  try {
    const data = JSON.parse(await file.text());
    const names = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(names)) throw new Error('not a progress file');
    const known = new Set(trophies.map((t) => t.name));
    const valid = names.filter((n) => typeof n === 'string' && known.has(n));
    if (!valid.length && names.length) throw new Error('no known trophy names found');
    earned = new Set(valid);
    saveProgress();
    renderAll();
    flashStatus('Imported ' + valid.length + ' earned trophies.');
  } catch {
    flashStatus('That file is not a valid Leonida Trophy Atlas progress export.', true);
  }
}

document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => switchView(tab.dataset.view));
});
document.querySelectorAll('.chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.chip').forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
    activeKind = chip.dataset.kind;
    renderList();
  });
});
gradeEl.addEventListener('change', renderList);
searchEl.addEventListener('input', renderList);
spoilerEl.addEventListener('change', () => {
  try { localStorage.setItem(SPOILER_KEY, spoilerEl.checked ? '1' : '0'); } catch { /* ignore */ }
  renderAll();
});
document.getElementById('exportBtn').addEventListener('click', exportProgress);
document.getElementById('resetBtn').addEventListener('click', () => {
  if (window.confirm('Clear all earned trophies? This cannot be undone.')) {
    earned = new Set();
    saveProgress();
    renderAll();
    flashStatus('Progress cleared.');
  }
});
document.getElementById('importFile').addEventListener('change', (event) => {
  const file = event.target.files && event.target.files[0];
  if (file) importProgress(file);
  event.target.value = '';
});

loadStored();
const response = await fetch('data/trophies.json');
const data = await response.json();
trophies = Array.isArray(data) ? data : data.trophies;
renderAll();
