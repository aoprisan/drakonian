import type { View } from '../types';
import { createBuildInfo, type BuildInfo } from '../components/build-info';

export function createAboutView(): View {
  let buildInfo: BuildInfo | null = null;

  return {
    mount(container) {
      const section = document.createElement('section');
      section.className = 'view view-about';
      section.innerHTML = `
        <header class="page-head">
          <p class="kicker">Colophon &amp; Preface</p>
          <h1 class="display-title">The Mysteries</h1>
          <p class="subtitle">On the Draconian path and the Tree of Death.</p>
        </header>

        <article class="leaf prose">
          <h2>The Nightside</h2>
          <p>
            The Qabalistic Tree of Life has a shadow. Where the ten Sephiroth radiate ordered
            light, the <strong>Qliphoth</strong> — the "shells" or "husks" — form the Tree of
            Death, the Nightside. Each shell inverts a sphere of the dayside: its excess, its
            shadow, its rejected power. The Draconian current treats these not as evil to be
            shunned but as gates to be opened — stages of an initiation that descends in order
            to ascend.
          </p>

          <h2>The Dragon</h2>
          <p>
            At the root of this work is the Dragon: the primordial force coiled at the base of
            the spine and at the base of the world. To wake the dragon is to take responsibility
            for one's own becoming — to refuse the inherited sleep and climb the Tree of Death
            from the gate of <strong>Lilith</strong> to the divided crown of <strong>Thaumiel</strong>,
            shell by shell.
          </p>

          <h2>The Eleven Gates &amp; the Ladder</h2>
          <p>
            This grimoire follows the ascent through ten shells, each with its ruler, its
            correspondences, and its rite. Over them is laid an initiatory ladder in the
            <em>X.0</em> notation of the Draconian orders — a structural map of the climb, from
            the awakening at Lilith (1.0) to the divided crown (10.0). The exact curriculum of any
            living order is its own; what is offered here is the shape of the path and a set of
            original rites faithful to its spirit.
          </p>

          <h2>How to Use This Book</h2>
          <ul>
            <li><strong>The Tree</strong> — the map. Touch a shell to read its mystery, or a path between shells to walk one of the twenty-two <em>Tunnels of Set</em>.</li>
            <li><strong>The Codex</strong> — each shell's ruler, planet, element, and rite.</li>
            <li><strong>The Rites</strong> — guided workings with breath, invocation, and vision. Best worked in darkness.</li>
            <li><strong>The Black Book</strong> — your private journal and initiation tracker. Nothing leaves this device; export a backup to keep it safe.</li>
            <li><strong>Thelema</strong> — the daylight half of the same magick: the Law, the True Will, the Book of the Law, and the Aeon this book is written in.</li>
          </ul>

          <h2>On Thelema</h2>
          <p>
            Nearly every current in modern Western magick — the Draconian work in this book
            included — runs downstream of what Aleister Crowley wrote between 1904 and 1947. The
            <a href="#/thelema">Thelema</a> section sets out that inheritance plainly: the Law and
            what it does not mean, the True Will, the three godforms of the Book of the Law, the
            Aeons, the daily adorations of Liber Resh, and the Abyss where the Thelemic ladder and
            the Nightside ascent turn out to describe the same country.
          </p>

          <h2>A Word of Caution</h2>
          <p>
            This is a contemplative and educational artifact. The rites are tools for inner work
            and reflection. Approach the descent with respect, and rise the same way you went down
            — by your own will.
          </p>

          <p class="install-hint">
            Drakonian is a Progressive Web App: install it to your device from your browser's
            menu, and it will work fully offline, in the dark, wherever you are.
          </p>
        </article>
      `;

      buildInfo = createBuildInfo();
      section.appendChild(buildInfo.el);

      container.appendChild(section);
    },
    destroy() {
      buildInfo?.destroy();
      buildInfo = null;
    },
  };
}
