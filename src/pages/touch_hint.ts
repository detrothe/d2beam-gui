//------------------------------------------------------------------------------------------------
// Hilfetext-Fenster bei langem Drücken (Touch/Stift) – Ersatz für hover/title, das dort nicht geht.
//
// Verwendung:  enableTouchHints(container)
//   - gilt für alle Elemente im Container mit Attribut data-hint oder title
//   - Text: data-hint (falls gesetzt), sonst title
//   - Maus: keine Änderung, dort bleibt der normale title-Tooltip
//   - nach dem Hinweis wird der folgende click unterdrückt, die Button-Aktion wird also nicht ausgelöst
//------------------------------------------------------------------------------------------------

const LONG_PRESS_MS = 300;   // so lange muss gedrückt werden, bis der Hinweis erscheint
const HIDE_AFTER_MS = 1500;  // so lange bleibt der Hinweis nach dem Loslassen sichtbar
const MOVE_TOLERANCE = 10;   // px, bei größerer Bewegung gilt es nicht als langes Drücken
const HINT_SELECTOR = '[data-hint],[title]';

let bubble: HTMLDivElement | null = null;
let pressTimer = 0;
let hideTimer = 0;
let hintShownFor: Element | null = null;
let startX = 0;
let startY = 0;

//------------------------------------------------------------------------------------------------
function getBubble(): HTMLDivElement {
    //--------------------------------------------------------------------------------------------
    if (!bubble) {
        bubble = document.createElement('div');
        bubble.popover = 'manual';
        bubble.setAttribute('role', 'tooltip');
        Object.assign(bubble.style, {
            position: 'fixed',
            inset: 'auto',
            margin: '0',
            maxWidth: 'min(18rem, calc(100vw - 16px))',
            padding: '0.35rem 0.6rem',
            border: '1px solid #888',
            borderRadius: '6px',
            background: '#333',
            color: '#fff',
            font: '0.9rem/1.3 system-ui, sans-serif',
            boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
            pointerEvents: 'none',
        });
        document.body.appendChild(bubble);
    }
    return bubble;
}

//------------------------------------------------------------------------------------------------
function showHint(target: HTMLElement, text: string) {
    //--------------------------------------------------------------------------------------------
    const b = getBubble();
    window.clearTimeout(hideTimer);
    b.textContent = text;
    if (!b.matches(':popover-open')) b.showPopover();

    // Position, damit der Finger den Text nicht verdeckt:
    //   1. über dem Element (zentriert)
    //   2. kein Platz oben -> rechts daneben, sonst links daneben
    //   3. auch dort kein Platz -> darunter
    const GAP = 8;
    const r = target.getBoundingClientRect();
    const w = b.offsetWidth;
    const h = b.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const clampX = (v: number) => Math.min(Math.max(GAP, v), vw - w - GAP);
    const clampY = (v: number) => Math.min(Math.max(GAP, v), vh - h - GAP);

    let x: number;
    let y: number;
    if (r.top - h - GAP >= GAP) {
        x = clampX(r.left + r.width / 2 - w / 2);
        y = r.top - h - GAP;
    } else if (r.right + GAP + w <= vw - GAP) {
        x = r.right + GAP;
        y = clampY(r.top);
    } else if (r.left - GAP - w >= GAP) {
        x = r.left - GAP - w;
        y = clampY(r.top);
    } else {
        x = clampX(r.left + r.width / 2 - w / 2);
        y = clampY(r.bottom + GAP);
    }
    b.style.left = `${x}px`;
    b.style.top = `${y}px`;
}

//------------------------------------------------------------------------------------------------
export function hideTouchHint() {
    //--------------------------------------------------------------------------------------------
    window.clearTimeout(hideTimer);
    if (bubble?.matches(':popover-open')) bubble.hidePopover();
}

//------------------------------------------------------------------------------------------------
export function enableTouchHints(root: HTMLElement) {
    //--------------------------------------------------------------------------------------------

    // langes Drücken soll kein Kontextmenü / keine Textauswahl / keine iOS-Lupe auslösen
    root.style.setProperty('-webkit-touch-callout', 'none');
    root.style.setProperty('-webkit-user-select', 'none');
    root.style.setProperty('user-select', 'none');

    root.addEventListener('pointerdown', (ev: PointerEvent) => {
        hintShownFor = null;
        window.clearTimeout(pressTimer);
        if (ev.pointerType === 'mouse') return;

        const target = (ev.target as Element).closest<HTMLElement>(HINT_SELECTOR);
        if (!target || !root.contains(target)) return;
        const text = target.dataset.hint || target.title;
        if (!text) return;

        startX = ev.clientX;
        startY = ev.clientY;
        pressTimer = window.setTimeout(() => {
            showHint(target, text);
            hintShownFor = target;
        }, LONG_PRESS_MS);
    });

    root.addEventListener('pointermove', (ev: PointerEvent) => {
        if (Math.hypot(ev.clientX - startX, ev.clientY - startY) > MOVE_TOLERANCE) {
            window.clearTimeout(pressTimer);
        }
    });

    const release = () => {
        window.clearTimeout(pressTimer);
        window.clearTimeout(hideTimer);
        hideTimer = window.setTimeout(hideTouchHint, HIDE_AFTER_MS);
    };
    root.addEventListener('pointerup', release);
    root.addEventListener('pointercancel', release);

    // click nach langem Drücken unterdrücken (capture: läuft vor den Handlern der Buttons)
    root.addEventListener('click', (ev: MouseEvent) => {
        if (hintShownFor && (ev.target as Element).closest(HINT_SELECTOR) === hintShownFor) {
            ev.stopPropagation();
            ev.preventDefault();
        }
        hintShownFor = null;
    }, true);

    root.addEventListener('contextmenu', (ev: Event) => {
        if (hintShownFor) ev.preventDefault();
    });
}
