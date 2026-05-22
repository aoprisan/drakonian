import '@fontsource/cinzel/600.css';
import '@fontsource/cinzel/700.css';
import '@fontsource/eb-garamond/400.css';
import '@fontsource/eb-garamond/500.css';
import '@fontsource/eb-garamond/400-italic.css';
import './styles/main.css';

import { registerSW } from 'virtual:pwa-register';
import { route, fallback, startRouter } from './router';
import { buildNav } from './components/nav';
import { startSmoke } from './fx/smoke';
import { loadPersisted } from './state/journal';

import { createTreeView } from './views/tree';
import { createQliphaView } from './views/qlipha';
import { createRitualView } from './views/ritual';
import { createJournalView } from './views/journal';
import { createAboutView } from './views/about';

// --- Routes ---------------------------------------------------------------
route('/', createTreeView);
route('/qlipha/:id', createQliphaView);
route('/ritual/:id', createRitualView);
route('/journal', createJournalView);
route('/about', createAboutView);
fallback(createTreeView);

// --- Shell ----------------------------------------------------------------
const app = document.getElementById('app')!;
document.body.prepend(buildNav());

// Atmosphere: drifting smoke behind everything (auto-disabled under reduced-motion).
const smokeHost = document.getElementById('smoke-layer')!;
startSmoke(smokeHost);

// --- Boot -----------------------------------------------------------------
void loadPersisted();
startRouter(app);

// --- PWA ------------------------------------------------------------------
registerSW({ immediate: true });
