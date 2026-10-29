// saveFile.ts
// Speichern mit drei Stufen:
//   1. File System Access API (showSaveFilePicker) -> echter Speichern-Dialog (Chromium Desktop)
//   2. Web Share API mit Dateien (optional, v. a. iOS/Android)
//   3. Blob + <a download> -> funktioniert praktisch überall

export type SaveMethod = 'picker' | 'share' | 'download';

export type SaveResult =
    | { ok: true; method: SaveMethod }
    | { ok: false; reason: 'cancelled' };

export interface SaveOptions {
    filename: string;
    data: BlobPart | Blob;
    /** z. B. "application/json" */
    mimeType?: string;
    /** Beschriftung im Dateidialog */
    description?: string;
    /** Auf Geräten mit Web-Share-Unterstützung das Teilen-Menü statt Download nutzen */
    preferShare?: boolean;
}

// ---------- Feature-Detection ----------

export const capabilities = {
    get secureContext(): boolean {
        return typeof window !== 'undefined' && window.isSecureContext === true;
    },
    get savePicker(): boolean {
        return (
            this.secureContext &&
            typeof (window as any).showSaveFilePicker === 'function'
        );
    },
    get openPicker(): boolean {
        return (
            this.secureContext &&
            typeof (window as any).showOpenFilePicker === 'function'
        );
    },
    canShareFile(file: File): boolean {
        return (
            typeof navigator !== 'undefined' &&
            typeof navigator.share === 'function' &&
            typeof navigator.canShare === 'function' &&
            navigator.canShare({ files: [file] })
        );
    },
};

// ---------- Hilfsfunktionen ----------

export function isAbortError(err: unknown): boolean {
    return err instanceof DOMException && err.name === 'AbortError';
}

function getExtension(filename: string): string {
    const i = filename.lastIndexOf('.');
    return i > 0 ? filename.slice(i) : '';
}

function toBlob(data: BlobPart | Blob, mimeType: string): Blob {
    return data instanceof Blob ? data : new Blob([data], { type: mimeType });
}

function downloadViaAnchor(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
    // Nicht sofort freigeben, manche Browser starten den Download asynchron
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

// ---------- Hauptfunktion ----------

/**
 * Muss aus einem Nutzer-Event (z. B. Klick) aufgerufen werden,
 * sonst verweigern Picker und Share den Dienst.
 */
export async function saveFile(opts: SaveOptions): Promise<SaveResult> {
    const mimeType = opts.mimeType ?? 'application/octet-stream';
    const blob = toBlob(opts.data, mimeType);
    const ext = getExtension(opts.filename);

    // Stufe 1: Speichern-Dialog
    if (capabilities.savePicker) {
        try {
            const handle = await (window as any).showSaveFilePicker({
                suggestedName: opts.filename,
                types: ext
                    ? [
                        {
                            description: opts.description ?? 'Datei',
                            accept: { [blob.type || mimeType]: [ext] },
                        },
                    ]
                    : undefined,
            });
            const writable = await handle.createWritable();
            try {
                await writable.write(blob);
            } finally {
                await writable.close();
            }
            return { ok: true, method: 'picker' };
        } catch (err) {
            if (isAbortError(err)) return { ok: false, reason: 'cancelled' };
            // SecurityError (z. B. iframe), NotAllowedError usw. -> weiter zum Fallback
            console.warn('showSaveFilePicker fehlgeschlagen, nutze Fallback:', err);
        }
    }

    // Stufe 2: Web Share (nur auf Wunsch)
    if (opts.preferShare) {
        const file = new File([blob], opts.filename, { type: blob.type || mimeType });
        if (capabilities.canShareFile(file)) {
            try {
                await navigator.share({ files: [file], title: opts.filename });
                return { ok: true, method: 'share' };
            } catch (err) {
                if (isAbortError(err)) return { ok: false, reason: 'cancelled' };
                console.warn('navigator.share fehlgeschlagen, nutze Download:', err);
            }
        }
    }

    // Stufe 3: Download-Link
    downloadViaAnchor(blob, opts.filename);
    return { ok: true, method: 'download' };
}

// ---------- Beispiel ----------
// button.addEventListener('click', async () => {
//   const result = await saveFile({
//     filename: 'daten.json',
//     data: JSON.stringify(myData, null, 2),
//     mimeType: 'application/json',
//     description: 'JSON-Datei',
//     preferShare: true,
//   });
//   if (!result.ok) return; // abgebrochen
//   console.log('Gespeichert über:', result.method);
// });