import type { View } from '../types';
import { THELEMA, THELEMA_RITE_INDEX, FEASTS, nextFeast } from '../data/thelema';
import { getRitual } from '../data/rituals';
import { sigilSvg } from '../components/sigil';
import { unicursalHexagramSvg } from '../components/hexagram';
import { reshStation, thelemicDate } from '../sys/thelemic-date';

function escapeHtml(s: string): string {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** The reckoning strip: the Thelemic date and the adoration now due. */
function reckoningHtml(now: Date): string {
  const date = thelemicDate(now);
  const station = reshStation(now);
  return `
    <dl class="reckoning-grid">
      <div><dt>Sol</dt><dd><span class="reckoning-glyph">${date.sol.glyph}&#xFE0E;</span> ${escapeHtml(date.sol.label)}</dd></div>
      <div><dt>Luna</dt><dd><span class="reckoning-glyph">${date.luna.glyph}&#xFE0E;</span> ${escapeHtml(date.luna.label)}</dd></div>
      <div><dt>Dies</dt><dd>${escapeHtml(date.dies)}</dd></div>
      <div><dt>Anno</dt><dd>${escapeHtml(date.year.roman)} <span class="reckoning-note">year ${date.year.aeonYear} of the Aeon</span></dd></div>
    </dl>
    <a class="reckoning-station" href="#/ritual/rite-resh-${station.id}">
      <span class="reckoning-hour">${escapeHtml(station.hour)} · ${escapeHtml(station.quarter)}</span>
      <span class="reckoning-god">Adore ${escapeHtml(station.godform)}</span>
      <span class="reckoning-aspect">${escapeHtml(station.aspect)} &#x25B8;</span>
    </a>`;
}

export function createThelemaView(): View {
  let ticker: number | null = null;

  return {
    mount(container) {
      const section = document.createElement('section');
      section.className = 'view view-thelema';

      const now = new Date();
      const upcoming = nextFeast(now);

      const cards = THELEMA.map(
        (t) => `
        <li class="topic-card">
          <a href="#/thelema/${t.id}">
            <span class="topic-card-sigil" aria-hidden="true">${sigilSvg(t.sigil, { size: 64 })}</span>
            <span class="topic-card-kicker">${escapeHtml(t.kicker)}</span>
            <span class="topic-card-title">${escapeHtml(t.title)}</span>
            <span class="topic-card-epithet">${escapeHtml(t.epithet)}</span>
          </a>
        </li>`,
      ).join('');

      const rites = THELEMA_RITE_INDEX.map((entry) => {
        const rite = getRitual(entry.id);
        if (!rite) return '';
        return `
          <li>
            <a href="#/ritual/${rite.id}">
              <span class="rite-list-title">${escapeHtml(rite.title)}</span>
              <span class="rite-list-blurb">${escapeHtml(entry.blurb)}</span>
              <span class="rite-list-meta">${rite.steps.length} steps</span>
            </a>
          </li>`;
      }).join('');

      const feasts = FEASTS.map((f) => {
        const isNext = upcoming.feast.name === f.name;
        return `
          <li class="${isNext ? 'feast-next' : ''}">
            <span class="feast-date">${f.day} ${MONTHS[f.month - 1]}</span>
            <span class="feast-name">${escapeHtml(f.name)}</span>
            <span class="feast-note">${escapeHtml(f.note)}</span>
            ${isNext ? '<span class="feast-flag">next</span>' : ''}
          </li>`;
      }).join('');

      section.innerHTML = `
        <header class="page-head">
          <p class="kicker">&#x0398;&#x03B5;&#x03BB;&#x03B7;&#x03BC;&#x03B1; &middot; The Aeon of Horus</p>
          <h1 class="display-title">Thelema</h1>
          <p class="subtitle">The current received at Cairo in 1904: will for law, love for method.</p>
        </header>

        <div class="thelema-hero">
          <div class="thelema-hero-glyph">${unicursalHexagramSvg({ size: 190 })}</div>
          <blockquote class="thelema-law">
            <p>Do what thou wilt shall be the whole of the Law.</p>
            <p>Love is the law, love under will.</p>
            <cite>Liber AL vel Legis I:40, I:57</cite>
          </blockquote>
        </div>

        <section class="leaf reckoning">
          <h2 class="section-title">The Reckoning</h2>
          <div class="reckoning-body">${reckoningHtml(now)}</div>
        </section>

        <h2 class="section-title">The Matter</h2>
        <ul class="card-grid topic-grid">${cards}</ul>

        <h2 class="section-title">Rites of the Aeon</h2>
        <ul class="rite-list">${rites}</ul>
        <p class="thelema-note">
          The four adorations of Liber Resh are worked from the Reckoning above — the station
          shown is the one your own clock is nearest to.
        </p>

        <h2 class="section-title">The Feasts</h2>
        <ol class="feast-list">${feasts}</ol>

        <p class="thelema-note">
          This section is a study companion, not the curriculum of any order. Quotations are short
          and attributed; the surrounding prose, and every rite here, is written for this book.
          The Nightside half of the grimoire treats much of the same country under another map —
          see <a href="#/thelema/abyss">the Abyss</a>.
        </p>`;

      container.appendChild(section);

      // The reckoning is a clock: keep it honest while the page is open.
      const body = section.querySelector<HTMLElement>('.reckoning-body')!;
      ticker = window.setInterval(() => {
        body.innerHTML = reckoningHtml(new Date());
      }, 60_000);
    },

    destroy() {
      if (ticker !== null) {
        clearInterval(ticker);
        ticker = null;
      }
    },
  };
}
