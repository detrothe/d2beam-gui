// Elementteilung eines Stabes für die FE-Berechnung (reine Rechenfunktionen ohne DOM)
//
// Alle Positionen x sind ab Beginn des elastischen Stabteils gemessen (0 ... L_el), wie xe der
// Einzellasten und xa/xb der Streckenlasten. Die starren Stabenden liegen außerhalb.

//--------------------------------------------------------------------------------------------------------
export interface TStabTeilung {
    //----------------------------------------------------------------------------------------------------
    xs: number[]                 // alle Teilungspunkte, sortiert, xs[0] = 0, xs[n] = L_el
    feste: number[]              // Teilungspunkte aus Lasten und Stabenden (Teilmenge von xs)
    hinweise: string[]           // zusammengefasste Punkte (für die Ausgabe)
}

//--------------------------------------------------------------------------------------------------------
export function fange_punkt(x: number, feste: number[], tol: number): number {
    //----------------------------------------------------------------------------------------------------
    // x auf den nächsten festen Punkt verschieben, wenn er näher als tol liegt
    let best = x, dmin = tol
    for (const f of feste) {
        const d = Math.abs(f - x)
        if (d <= dmin) { dmin = d; best = f }
    }
    return best
}

//--------------------------------------------------------------------------------------------------------
export function stab_teilen(L_el: number, nTeil: number, tol: number,
    punkte_einzellast: number[], punkte_streckenlast: number[]): TStabTeilung {
    //----------------------------------------------------------------------------------------------------
    // 1. feste Punkte: Stabenden, Einzellasten (gewinnen), dann Grenzen der Teilstreckenlasten
    // 2. Punkte, die näher als tol beieinander liegen, werden zusammengefasst
    // 3. jeder Abschnitt zwischen festen Punkten wird mit der Ziel-Elementlänge L_el/nTeil geteilt

    const hinweise: string[] = []
    const feste: number[] = [0.0, L_el]

    const hinzu = (x: number) => {
        if (x <= 0.0 || x >= L_el) return
        const f = fange_punkt(x, feste, tol)
        if (f !== x) {
            if (Math.abs(f - x) > 1e-9 * Math.max(1.0, L_el)) hinweise.push(`x=${x} -> ${f}`)
            return
        }
        feste.push(x)
    }

    for (const x of [...punkte_einzellast].sort((a, b) => a - b)) hinzu(x)
    for (const x of [...punkte_streckenlast].sort((a, b) => a - b)) hinzu(x)

    feste.sort((a, b) => a - b)

    const n_ziel = Math.max(1, Math.round(nTeil))
    const h = L_el / n_ziel
    const xs: number[] = [feste[0]]
    for (let i = 1; i < feste.length; i++) {
        const x0 = feste[i - 1], x1 = feste[i]
        const n = Math.max(1, Math.ceil((x1 - x0) / h - 1e-6))
        for (let k = 1; k < n; k++) xs.push(x0 + (x1 - x0) * k / n)
        xs.push(x1)
    }
    return { xs, feste, hinweise }
}

//--------------------------------------------------------------------------------------------------------
export function vorverformung_teil(w0a: number, stich: number, w0e: number, L_el: number, s0: number, s1: number): number[] {
    //----------------------------------------------------------------------------------------------------
    // Parabel w0(x) = w0a + (w0e - w0a)·ξ + 4·Stich·ξ·(1 - ξ) über den ganzen Stab, ξ = x/L_el;
    // für das Teilelement s0..s1: [w0 am Anfang, w0 am Ende, Stich gegenüber der Sehne des Teilelements]
    const w0 = (x: number) => {
        const xi = x / L_el
        return w0a + (w0e - w0a) * xi + 4.0 * stich * xi * (1.0 - xi)
    }
    const l = s1 - s0
    return [w0(s0), w0(s1), stich * (l / L_el) ** 2]
}
