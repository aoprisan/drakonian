import type { View } from '../types';
import { sigilSvg, sigilSvgStandalone } from '../components/sigil';
import { addEntry } from '../state/journal';

/** Combine the practitioner's inputs into a single deterministic seed. */
function sealKey(name: string, intent: string): string {
  return `seal::${name.trim().toLowerCase()}::${intent.trim().toLowerCase()}`;
}

function slug(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'sigil'
  );
}

export function createSealView(): View {
  return {
    mount(container) {
      const section = document.createElement('section');
      section.className = 'view view-seal';
      section.innerHTML = `
        <header>
          <h1 class="display-title">The Personal Seal</h1>
          <p class="subtitle">Inscribe a name or intent; the same words always raise the same seal.</p>
        </header>

        <div class="seal-grid">
          <form class="seal-form">
            <label class="seal-field">
              <span>Magical name</span>
              <input type="text" name="name" placeholder="The name you take upon the path" autocomplete="off" />
            </label>
            <label class="seal-field">
              <span>Intent <i>(optional)</i></span>
              <textarea name="intent" rows="3" placeholder="A statement of will to bind into the seal…"></textarea>
            </label>
            <p class="seal-note">Nothing is sent anywhere. The seal is drawn from your words on this device alone.</p>
          </form>

          <div class="seal-stage">
            <figure class="seal-figure">
              <div class="seal-render" aria-live="polite"></div>
              <figcaption class="seal-caption"></figcaption>
            </figure>
            <div class="seal-actions">
              <button type="button" class="primary-btn" data-act="download" disabled>Download seal</button>
              <button type="button" class="ghost-btn" data-act="inscribe" disabled>Inscribe in journal</button>
            </div>
            <p class="seal-msg" aria-live="polite"></p>
          </div>
        </div>
      `;
      container.appendChild(section);

      const nameInput = section.querySelector<HTMLInputElement>('input[name="name"]')!;
      const intentInput = section.querySelector<HTMLTextAreaElement>('textarea[name="intent"]')!;
      const render = section.querySelector<HTMLElement>('.seal-render')!;
      const caption = section.querySelector<HTMLElement>('.seal-caption')!;
      const downloadBtn = section.querySelector<HTMLButtonElement>('[data-act="download"]')!;
      const inscribeBtn = section.querySelector<HTMLButtonElement>('[data-act="inscribe"]')!;
      const msg = section.querySelector<HTMLElement>('.seal-msg')!;

      function currentName(): string {
        return nameInput.value.trim();
      }
      function currentIntent(): string {
        return intentInput.value.trim();
      }
      function hasInput(): boolean {
        return currentName().length > 0 || currentIntent().length > 0;
      }

      function update() {
        msg.textContent = '';
        const name = currentName();
        const intent = currentIntent();
        if (!hasInput()) {
          render.innerHTML = `<p class="seal-placeholder">Your seal will be revealed here.</p>`;
          caption.textContent = '';
          downloadBtn.disabled = true;
          inscribeBtn.disabled = true;
          return;
        }
        const key = sealKey(name, intent);
        render.innerHTML = sigilSvg(key, { size: 220, className: 'sigil-seal' });
        caption.textContent = name || intent;
        downloadBtn.disabled = false;
        inscribeBtn.disabled = false;
      }

      nameInput.addEventListener('input', update);
      intentInput.addEventListener('input', update);

      downloadBtn.addEventListener('click', async () => {
        if (!hasInput()) return;
        const name = currentName();
        const intent = currentIntent();
        const key = sealKey(name, intent);
        const svg = sigilSvgStandalone(key, { size: 1024, caption: name });
        try {
          const blob = await svgToPng(svg);
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `drakonian-seal-${slug(name || intent)}.png`;
          a.click();
          URL.revokeObjectURL(url);
        } catch {
          msg.textContent = 'This device could not render the image. Try a different browser.';
        }
      });

      inscribeBtn.addEventListener('click', async () => {
        if (!hasInput()) return;
        const name = currentName();
        const intent = currentIntent();
        await addEntry({
          type: 'note',
          title: name ? `Seal — ${name}` : 'Personal seal',
          body: intent,
        });
        msg.textContent = 'Inscribed in your journal.';
      });

      update();
    },
    destroy() {},
  };
}

/** Rasterise a standalone SVG string to a PNG blob via an offscreen canvas. */
function svgToPng(svg: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 1024;
      canvas.height = img.naturalHeight || 1024;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('no 2d context'));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((out) => {
        if (out) resolve(out);
        else reject(new Error('toBlob failed'));
      }, 'image/png');
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('image load failed'));
    };
    img.src = url;
  });
}
