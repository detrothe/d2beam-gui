---
title: "d2beam – Theorie-Handbuch"
subtitle: "Der Timoshenko-Balken im Weggrößenverfahren"
author: "Prof. Dr.-Ing. Detlef Rothe"
date: "Entwurf, Stand 27.11.2026 – Teil 1"
lang: de
---

# Einleitung

## Worum es geht

Dieses Handbuch erklärt, was d2beam beim Rechnen mit einem Stab tatsächlich tut. Es richtet sich an dich als
Studierende oder Studierender, die oder der die Ergebnisse nachvollziehen möchte, und an Kolleginnen und
Kollegen, die das Programm in der Lehre einsetzen oder weiterentwickeln.

Alle Formeln in diesem Handbuch wurden mit dem Programmcode abgeglichen. Die symbolischen Herleitungen der
Matrizen wurden zusätzlich mit dem Computeralgebrasystem SymPy nachgerechnet (siehe Anhang A). Wo es hilft,
ist angegeben, in welcher Funktion von `timoshenko_beam.ts` die Formel umgesetzt ist.

Teil 1 behandelt

- die Koordinatensysteme und Vorzeichenregeln,
- die Differentialgleichungen des Timoshenko-Balkens,
- die Elementsteifigkeitsmatrix,
- die Transformationen für gedrehte Stäbe, gedrehte Lager, starre Stabenden und Gelenke,
- den Ablauf der Berechnung im Gesamtsystem.

Elementlasten, Zustandslinien, Bettung, Theorie II. Ordnung, Knickeigenwerte und Dynamik folgen in weiteren Teilen.

## Annahmen

- Ebene Stabwerke in der $x$-$z$-Ebene, Belastung in dieser Ebene.
- Linear-elastischer Werkstoff (die nichtlineare Werkstoffoption wird später gesondert behandelt).
- Kleine Verformungen: Gleichgewicht am unverformten System (Theorie I. Ordnung). Die Erweiterung auf
  Theorie II. Ordnung folgt in einem späteren Teil.
- **Timoshenko-Balken:** Die Querschnitte bleiben eben, stehen nach der Verformung aber nicht mehr senkrecht auf
  der Stabachse. Die Schubverformung wird also berücksichtigt. Mit Schubfaktor $0$ rechnet d2beam schubstarr;
  dann gehen alle Formeln in die bekannten Formeln des Bernoulli-Balkens über.

## Aufbau eines Stabelements

Ein Stab in d2beam verbindet zwei Knoten $K_a$ (Stabanfang) und $K_e$ (Stabende). Er kann an jedem Ende ein
**starres Ende** der Länge $\ell_a$ bzw. $\ell_e$ besitzen, z. B. um die Ausdehnung eines Knotenbereichs in
einem Rahmen abzubilden. Dazwischen liegt der **elastische Stab** der Länge

$$L = L_0 - \ell_a - \ell_e ,$$

dessen Enden wir mit $a$ und $e$ bezeichnen. $L_0$ ist der Abstand der beiden Knoten. Am Übergang vom starren
Ende zum elastischen Stab können **Gelenke** angeordnet werden (Momenten-, Querkraft- oder Normalkraftgelenk).

![Bild 1: Stabelement mit starren Enden und Gelenken](bilder/stab_uebersicht){width=95%}

Ohne starre Enden ($\ell_a = \ell_e = 0$) fallen $K_a$ mit $a$ und $K_e$ mit $e$ zusammen. Die Herleitungen in
Kapitel 3 und 4 beziehen sich immer auf den elastischen Stab von $a$ nach $e$. Die starren Enden und Gelenke
kommen erst in Kapitel 5 über die Transformation hinzu.

# Koordinatensysteme und Vorzeichen

## Globales und lokales Koordinatensystem

Das **globale** Koordinatensystem hat die $x$-Achse nach rechts und die $z$-Achse nach unten. Jeder Stab hat
ein **lokales** Koordinatensystem $x_L$, $z_L$: $x_L$ zeigt vom Stabanfang zum Stabende, $z_L$ ist dazu um
$90°$ im Uhrzeigersinn gedreht. Der Winkel $\alpha$ zwischen $x$ und $x_L$ ist positiv im Uhrzeigersinn
(Bild 5).

Drehungen $\varphi$ und Momente in Konvention II (siehe unten) sind bei dieser Achsenlage **positiv entgegen dem
Uhrzeigersinn**.

## Schnittgrößen (Vorzeichenkonvention I)

Für die Schnittgrößen $N$, $V$, $M$ entlang des Stabes gilt die übliche Vorzeichenregel der Statik: Am
positiven Schnittufer (Normale in Richtung $+x_L$) zeigen positive Schnittgrößen in die positiven
Koordinatenrichtungen, am negativen Schnittufer entgegengesetzt. Ein positives Moment erzeugt Zug an der
gestrichelten Faser (Unterseite, $+z_L$).

![Bild 2: Positive Schnittgrößen am infinitesimalen Element (Konvention I)](bilder/schnittgroessen){width=75%}

Mit dieser Konvention werden die Zustandslinien gezeichnet und die Schnittgrößen ausgegeben.

## Stabendgrößen und Weggrößen (Vorzeichenkonvention II)

Für das Weggrößenverfahren ist eine andere Regel bequemer: An **beiden** Stabenden sind Kräfte und
Verschiebungen positiv in Richtung der lokalen Achsen, Momente und Drehungen positiv entgegen dem
Uhrzeigersinn.

![Bild 3: Positive Stabendgrößen und Stabendverformungen am elastischen Stab (Konvention II)](bilder/stabendgroessen){width=95%}

Die Stabendgrößen und Stabendverformungen fassen wir zu Vektoren zusammen:

$$
\mathbf{f} = \begin{bmatrix} F_a \\ V_a \\ M_a \\ F_e \\ V_e \\ M_e \end{bmatrix}, \qquad
\boldsymbol{\delta} = \begin{bmatrix} u_a \\ w_a \\ \varphi_a \\ u_e \\ w_e \\ \varphi_e \end{bmatrix} .
$$

Am Stabende $e$ ist das Schnittufer positiv, am Stabanfang $a$ negativ. Daraus folgt der Zusammenhang zwischen
beiden Konventionen:

$$
\begin{aligned}
F_a &= -N(0), & V_a &= -V(0), & M_a &= -M(0), \\
F_e &= N(L),  & V_e &= V(L),  & M_e &= M(L).
\end{aligned}
$$

d2beam rechnet intern mit Konvention II und dreht am Ende der Berechnung die Vorzeichen am Stabanfang um
(`berechneInterneKraefte`: „Linke Seite Vorzeichen nach KGV“). Ausgegeben werden die Stabendgrößen deshalb in
Konvention I.

## Drehwinkel $\varphi$ und Querschnittsdrehung $\beta$

Beim Timoshenko-Balken ist die Drehung des Querschnitts nicht mehr gleich der Neigung der Biegelinie. In den
Differentialgleichungen (Kapitel 3) verwenden wir die Querschnittsdrehung $\beta$, die – wie $w'$ – positiv
**im** Uhrzeigersinn ist. Der Freiheitsgrad $\varphi$ ist positiv **entgegen** dem Uhrzeigersinn. Es gilt also

$$
\varphi = -\beta , \qquad \text{beim schubstarren Stab:} \quad \varphi = -w' .
$$

In der Ausgabe von d2beam steht die Querschnittsdrehung $\beta$.

# Differentialgleichungen des Timoshenko-Balkens

## Gleichgewicht

Am infinitesimalen Element (Bild 2) mit der Querlast $q(x)$ in $z$-Richtung und der Längslast $n(x)$ in
$x$-Richtung gilt

$$
\frac{dN}{dx} = -n(x), \qquad \frac{dV}{dx} = -q(x), \qquad \frac{dM}{dx} = V(x).
$$

## Kinematik

![Bild 4: Kinematik des Timoshenko-Balkens](bilder/kinematik){width=65%}

Ein Querschnitt verschiebt sich um $u$ in Stabrichtung und um $w$ quer dazu und dreht sich um $\beta$. Beim
Bernoulli-Balken bleibt der Querschnitt senkrecht zur verformten Achse, d. h. $\beta = w'$. Beim
Timoshenko-Balken unterscheiden sich beide Winkel um die mittlere Gleitung $\gamma_m$ (Bild 4):

$$
\frac{dw}{dx} = \beta + \gamma_m .
$$

## Werkstoffgesetz

Normalkraft, Moment und Querkraft hängen über die Steifigkeiten mit den Verzerrungen zusammen:

$$
\frac{du}{dx} = \frac{N}{EA}, \qquad
\frac{d\beta}{dx} = -\frac{M}{EI_y} - \kappa_T, \qquad
\gamma_m = \frac{V}{G A_s} .
$$

Dabei ist

- $\kappa_T = \alpha_T \, \Delta T / h$ die Krümmung aus einem Temperaturunterschied $\Delta T = T_u - T_o$
  (wird bei den Elementlasten behandelt),
- $G = \dfrac{E}{2\,(1+\nu)}$ der Schubmodul mit der Querdehnzahl $\nu$,
- $A_s = \kappa_s \cdot A$ die Schubfläche mit dem **Schubfaktor** $\kappa_s$ aus der Querschnittseingabe
  (z. B. $5/6$ für das Rechteck).

Für die Schubverformung führen wir die Abkürzung

$$
\eta = \frac{E I_y}{G A_s} \qquad (\text{Einheit } \mathrm{m}^2)
$$

ein. Beim schubstarren Stab (Schubfaktor $0$ in d2beam) ist $\eta = 0$.

In d2beam kann die Dehnsteifigkeit mit einem Faktor (`faktor_dehn`) multipliziert werden, z. B. um einen Stab
näherungsweise dehnstarr zu machen. Er steckt im Folgenden in $EA$.

## Lösung der Differentialgleichungen für den unbelasteten Stab

Für die Steifigkeitsmatrix genügt der unbelastete Stab ($q = 0$, $\kappa_T = 0$). Die Lasten kommen bei den
Elementlasten hinzu. Mit den Integrationskonstanten $C_1 \ldots C_4$ erhält man durch fortgesetzte Integration

$$
\begin{aligned}
V(x) &= C_1 , \\
M(x) &= C_1\, x + C_2 , \\
\beta(x) &= -\frac{1}{E I_y}\left( C_1 \frac{x^2}{2} + C_2\, x \right) + C_3 , \\
w(x) &= -\frac{1}{E I_y}\left( C_1 \frac{x^3}{6} + C_2 \frac{x^2}{2} \right) + C_3\, x + C_4
        + \frac{\eta}{E I_y}\, C_1\, x .
\end{aligned}
$$

Der letzte Summand in $w(x)$ ist der Anteil aus der Schubverformung $\int \gamma_m\,dx$.

# Elementsteifigkeitsmatrix

## Biegeanteil

Die Randbedingungen $w(0) = w_a$, $\varphi(0) = -\beta(0) = \varphi_a$, $w(L) = w_e$, $\varphi(L) = \varphi_e$
ergeben ein lineares Gleichungssystem für die Konstanten:

$$
\begin{bmatrix} w_a \\ \varphi_a \\ w_e \\ \varphi_e \end{bmatrix} =
\begin{bmatrix}
0 & 0 & 0 & 1 \\
0 & 0 & -1 & 0 \\
\dfrac{L\,\eta}{E I_y} - \dfrac{L^3}{6 E I_y} & -\dfrac{L^2}{2 E I_y} & L & 1 \\
\dfrac{L^2}{2 E I_y} & \dfrac{L}{E I_y} & -1 & 0
\end{bmatrix}
\begin{bmatrix} C_1 \\ C_2 \\ C_3 \\ C_4 \end{bmatrix}
\qquad \text{kurz} \quad \boldsymbol{\delta}_b = \mathbf{A}\,\mathbf{C} .
$$

Mit dem **Schubparameter**

$$
\psi = \frac{1}{1 + \dfrac{12\,\eta}{L^2}} = \frac{1}{1 + \dfrac{12\, E I_y}{G A_s\, L^2}}
\qquad (\psi = 1 \text{ beim schubstarren Stab})
$$

lautet die Lösung $\mathbf{C} = \mathbf{A}^{-1}\boldsymbol{\delta}_b$:

$$
\begin{aligned}
C_1 &= \frac{E I_y\,\psi}{L^3}\left( -12\, w_a + 6L\,\varphi_a + 12\, w_e + 6L\,\varphi_e \right), \\
C_2 &= \frac{E I_y}{L^2}\left( 6\psi\, w_a - (1+3\psi)\,L\,\varphi_a - 6\psi\, w_e + (1-3\psi)\,L\,\varphi_e \right), \\
C_3 &= -\varphi_a , \qquad C_4 = w_a .
\end{aligned}
$$

Die Stabendgrößen folgen aus $V$ und $M$ an den Stabenden mit den Beziehungen aus Abschnitt 2.3:

$$
V_a = -C_1, \quad M_a = -C_2, \quad V_e = C_1, \quad M_e = C_1 L + C_2 .
$$

## Längsanteil

Aus $u' = N/EA$ folgt $N = EA\,(u_e - u_a)/L$ und damit $F_a = -N$, $F_e = N$.

## Die Steifigkeitsbeziehung

Zusammengefasst ergibt sich die Steifigkeitsbeziehung $\mathbf{f} = \mathbf{k}\,\boldsymbol{\delta}$
(ohne Lasten) mit

$$
\mathbf{k} =
\begin{bmatrix}
\dfrac{EA}{L} & 0 & 0 & -\dfrac{EA}{L} & 0 & 0 \\[2mm]
0 & \dfrac{12 EI_y\psi}{L^3} & -\dfrac{6 EI_y\psi}{L^2} & 0 & -\dfrac{12 EI_y\psi}{L^3} & -\dfrac{6 EI_y\psi}{L^2} \\[2mm]
0 & -\dfrac{6 EI_y\psi}{L^2} & \dfrac{(1+3\psi)\,EI_y}{L} & 0 & \dfrac{6 EI_y\psi}{L^2} & \dfrac{(3\psi-1)\,EI_y}{L} \\[2mm]
-\dfrac{EA}{L} & 0 & 0 & \dfrac{EA}{L} & 0 & 0 \\[2mm]
0 & -\dfrac{12 EI_y\psi}{L^3} & \dfrac{6 EI_y\psi}{L^2} & 0 & \dfrac{12 EI_y\psi}{L^3} & \dfrac{6 EI_y\psi}{L^2} \\[2mm]
0 & -\dfrac{6 EI_y\psi}{L^2} & \dfrac{(3\psi-1)\,EI_y}{L} & 0 & \dfrac{6 EI_y\psi}{L^2} & \dfrac{(1+3\psi)\,EI_y}{L}
\end{bmatrix} .
$$

Im Programm: `berechneLokaleElementsteifigkeitmatrix`, Matrix `estm`.

**Kontrolle schubstarr:** Mit $\psi = 1$ wird $(1+3\psi) = 4$ und $(3\psi-1) = 2$. Man erhält die bekannte
Steifigkeitsmatrix des Bernoulli-Balkens mit $4EI/L$, $2EI/L$, $6EI/L^2$ und $12EI/L^3$.

**Einfluss der Schubverformung:** In der Literatur wird oft $\Phi = 12EI/(GA_sL^2)$ verwendet, also
$\psi = 1/(1+\Phi)$. Dann lauten die Biegeterme $\frac{(4+\Phi)EI}{(1+\Phi)L}$ und
$\frac{(2-\Phi)EI}{(1+\Phi)L}$. Für einen Rechteckquerschnitt aus Stahlbeton mit $h/L = 1/10$ ist
$\Phi \approx 0{,}03$; die Schubverformung spielt erst bei gedrungenen Stäben ($h/L \gtrsim 1/5$) eine
nennenswerte Rolle.

## Ansatzfunktionen

Setzt man die Konstanten in $w(x)$ und $\varphi(x) = -\beta(x)$ ein, erhält man die Verformungen im Inneren des
unbelasteten Stabes als Funktion der Stabendverformungen:

$$
w(x) = \mathbf{N}_w(x)\,\boldsymbol{\delta}_b , \qquad \varphi(x) = \mathbf{N}_\varphi(x)\,\boldsymbol{\delta}_b ,
\qquad \boldsymbol{\delta}_b = [w_a,\ \varphi_a,\ w_e,\ \varphi_e]^T .
$$

Mit $\xi = x/L$ und $\lambda = 12\,\eta / L^2$ (also $\psi = 1/(1+\lambda)$):

$$
\begin{aligned}
N_{w,1} &= \psi\left(1 - 3\xi^2 + 2\xi^3 + \lambda\,(1-\xi)\right), \\
N_{w,2} &= -\psi\, L\,\xi\left( 1 - 2\xi + \xi^2 + \tfrac{\lambda}{2}\,(1-\xi) \right), \\
N_{w,3} &= \psi\left(3\xi^2 - 2\xi^3 + \lambda\,\xi\right), \\
N_{w,4} &= \psi\, L\,\xi\left( \xi - \xi^2 + \tfrac{\lambda}{2}\,(1-\xi) \right).
\end{aligned}
$$

Für $\lambda = 0$ sind das die kubischen Hermite-Polynome des Bernoulli-Balkens (mit $\varphi = -w'$). Diese
Funktionen sind für den unbelasteten Timoshenko-Balken **exakt**. d2beam verwendet sie, um die Matrizen für
Bettung, Theorie II. Ordnung und Masse zu bilden (folgende Teile).

# Transformationen

Die Steifigkeitsbeziehung aus Kapitel 4 gilt im lokalen System des elastischen Stabes. Für das Gesamtsystem
brauchen wir sie für die Knotenfreiheitsgrade. Dazu sind bis zu vier Schritte nötig:

1. Drehung vom globalen in das lokale System (Stabwinkel $\alpha$),
2. ggf. Drehung des Knotensystems bei gedrehten Lagern (Winkel $\vartheta$),
3. Übertragung vom Knoten $K_a$ zum Stabende $a$ über das starre Ende,
4. Einbau der Gelenke.

## Drehung um den Stabwinkel $\alpha$

![Bild 5: Gedrehter Stab im globalen Koordinatensystem](bilder/drehung){width=80%}

Eine Kraft mit den globalen Komponenten $F_x$, $F_z$ hat in Stabrichtung und quer dazu die Komponenten

$$
\begin{bmatrix} F \\ V \end{bmatrix} =
\begin{bmatrix} \cos\alpha & \sin\alpha \\ -\sin\alpha & \cos\alpha \end{bmatrix}
\begin{bmatrix} F_x \\ F_z \end{bmatrix}
= \mathbf{T}_P \begin{bmatrix} F_x \\ F_z \end{bmatrix} .
$$

Verschiebungen sind ebenfalls Vektoren und werden genauso transformiert. Moment und Drehwinkel bleiben bei der
Drehung um die $y$-Achse unverändert. Für ein Stabende gilt also

$$
\mathbf{T}(\alpha) =
\begin{bmatrix} \cos\alpha & \sin\alpha & 0 \\ -\sin\alpha & \cos\alpha & 0 \\ 0 & 0 & 1 \end{bmatrix},
\qquad \mathbf{T}^T\mathbf{T} = \mathbf{I}, \quad \mathbf{T}^{-1} = \mathbf{T}^T .
$$

Die Drehmatrix ist **orthogonal**. Das gilt für die folgenden Matrizen nicht mehr, deshalb leiten wir die
Transformation in Abschnitt 5.5 allgemein her.

## Gedrehte Lager

![Bild 6: Knotensystem eines gedrehten Lagers](bilder/gedrehtes_lager){width=60%}

An einem Knoten mit gedrehtem Lager beziehen sich die Knotenfreiheitsgrade $U'$, $W'$ und die Lagerkräfte auf
ein Knotensystem $x'$, $z'$, das um den Winkel $\vartheta$ **entgegen** dem Uhrzeigersinn gegen das globale
System gedreht ist (in der App heißt dieser Winkel $\varphi$; hier nennen wir ihn $\vartheta$, um ihn vom
Drehfreiheitsgrad zu unterscheiden). Das gilt für **alle** Stäbe, die an diesem Knoten angeschlossen sind.

Vom Knotensystem zum lokalen Stabsystem ist dann um den Winkel $\alpha + \vartheta$ zu drehen (Bild 6):

$$
\mathbf{T}_a = \mathbf{T}(\alpha + \vartheta_a), \qquad \mathbf{T}_e = \mathbf{T}(\alpha + \vartheta_e),
$$

mit den Elementen

$$
t_{00} = \cos\alpha\cos\vartheta - \sin\alpha\sin\vartheta = \cos(\alpha+\vartheta), \qquad
t_{01} = \sin\alpha\cos\vartheta + \cos\alpha\sin\vartheta = \sin(\alpha+\vartheta).
$$

So steht es auch im Programm (`t00`, `t01` bzw. `t33`, `t34`). Ohne gedrehtes Lager ist $\vartheta = 0$.

Die Knotenverschiebungen in lokaler Richtung, aber noch am Knoten, bezeichnen wir mit dem Index $K$:

$$
\begin{bmatrix} u_K \\ w_K \\ \varphi_K \end{bmatrix}_a = \mathbf{T}_a
\begin{bmatrix} U' \\ W' \\ \Phi \end{bmatrix}_{K_a} .
$$

## Starre Enden

![Bild 7: Kinematik des starren Endes am Stabanfang](bilder/starres_ende){width=70%}

Das starre Ende ist ein Stück Stab ohne Verformung. Der Punkt $a$ macht deshalb die Starrkörperbewegung des
Knotens mit. Dreht sich der Knoten um $\varphi_K$ (entgegen dem Uhrzeigersinn), hebt sich der Punkt $a$ im
Abstand $\ell_a$ um $\ell_a\,\varphi_K$, also entgegen der positiven $w$-Richtung (Bild 7):

$$
u_a = u_K, \qquad w_a = w_K - \ell_a\,\varphi_K, \qquad \varphi_a = \varphi_K .
$$

Am Stabende liegt der Punkt $e$ **vor** dem Knoten $K_e$, das Vorzeichen kehrt sich um:
$w_e = w_K + \ell_e\,\varphi_K$. In Matrizenform:

$$
\mathbf{S}_a = \begin{bmatrix} 1 & 0 & 0 \\ 0 & 1 & -\ell_a \\ 0 & 0 & 1 \end{bmatrix}, \qquad
\mathbf{S}_e = \begin{bmatrix} 1 & 0 & 0 \\ 0 & 1 & \ell_e \\ 0 & 0 & 1 \end{bmatrix} .
$$

Ohne Gelenke ist die Transformation vom Knotensystem zum elastischen Stab damit

$$
\boldsymbol{\delta} =
\begin{bmatrix} \mathbf{S}_a\mathbf{T}_a & \mathbf{0} \\ \mathbf{0} & \mathbf{S}_e\mathbf{T}_e \end{bmatrix}
\boldsymbol{\Delta}, \qquad
\mathbf{S}_a\mathbf{T}_a =
\begin{bmatrix} t_{00} & t_{01} & 0 \\ -t_{01} & t_{00} & -\ell_a \\ 0 & 0 & 1 \end{bmatrix} .
$$

Das starre Ende wird also nicht als eigenes Element gerechnet, sondern steckt vollständig in der
Transformationsmatrix. Die elastische Länge $L$ geht in die Steifigkeitsmatrix ein, die Gesamtlänge $L_0$ in
die Richtung des Stabes.

## Gelenke

![Bild 8: Momentengelenk am Übergang vom starren Ende zum elastischen Stab](bilder/gelenk_starr){width=80%}

Ein Gelenk entkoppelt eine Stabendverformung von der Knotenbewegung. In d2beam erhält jede gelenkige
Stabendverformung einen **zusätzlichen Freiheitsgrad** $\Delta_{G}$, der nur zu diesem Stab gehört. Er wird
nach den sechs Knotenfreiheitsgraden angehängt, in der Reihenfolge
$u_a, w_a, \varphi_a, u_e, w_e, \varphi_e$. Ein Stab mit $n_G$ Gelenken hat also $6 + n_G$ Freiheitsgrade.

In der Transformationsmatrix wird die Zeile der gelenkigen Stabendverformung durch einen Einheitsvektor auf den
zusätzlichen Freiheitsgrad **ersetzt**. Die anderen Zeilen bleiben unverändert. Formal ist das eine
Matrix $\mathbf{G}$, die von links multipliziert wird:

$$
\boldsymbol{\delta} = \mathbf{G}
\begin{bmatrix}
\mathbf{S}_a\mathbf{T}_a & \mathbf{0} & \mathbf{0} \\
\mathbf{0} & \mathbf{S}_e\mathbf{T}_e & \mathbf{0} \\
\mathbf{0} & \mathbf{0} & \mathbf{I}_{n_G}
\end{bmatrix}
\begin{bmatrix} \boldsymbol{\Delta} \\ \boldsymbol{\Delta}_G \end{bmatrix}
= \mathbf{T}_U
\begin{bmatrix} \boldsymbol{\Delta} \\ \boldsymbol{\Delta}_G \end{bmatrix} .
$$

$\mathbf{G}$ hat $6$ Zeilen und $6 + n_G$ Spalten. Zeile $i$ ist der Einheitsvektor $\mathbf{e}_i$, wenn
Stabendverformung $i$ kein Gelenk hat, sonst der Einheitsvektor auf den zugehörigen Gelenkfreiheitsgrad.

**Wo sitzt das Gelenk?** Weil $\mathbf{G}$ links von $\mathbf{S}$ steht, sitzt das Gelenk **zwischen starrem
Ende und elastischem Stab**, also im Punkt $a$ bzw. $e$, nicht im Knoten (Bild 8). Bei einem Momentengelenk am
Stabanfang bleibt deshalb in der Zeile für $w_a$ der Term $-\ell_a$ stehen: Das starre Ende dreht sich mit dem
Knoten ($\varphi_K$), nur der elastische Stab hat seine eigene Drehung $\varphi_a = \Delta_G$. Das entspricht
der baupraktischen Vorstellung eines biegesteifen Anschlussbereichs mit einem Gelenk an dessen Rand.

**Beispiel:** Waagerechter Stab ($\alpha = 0$, kein gedrehtes Lager) mit starrem Ende $\ell_a$ und
Momentengelenk am Stabanfang. Der Vektor der Freiheitsgrade ist
$[U_a, W_a, \Phi_a, U_e, W_e, \Phi_e, \Delta_G]^T$, und

$$
\mathbf{T}_U =
\begin{bmatrix}
1 & 0 & 0 & 0 & 0 & 0 & 0 \\
0 & 1 & -\ell_a & 0 & 0 & 0 & 0 \\
0 & 0 & 0 & 0 & 0 & 0 & 1 \\
0 & 0 & 0 & 1 & 0 & 0 & 0 \\
0 & 0 & 0 & 0 & 1 & 0 & 0 \\
0 & 0 & 0 & 0 & 0 & 1 & 0
\end{bmatrix} .
$$

Im Programm heißt diese Matrix `transU` (aufgebaut in `initialisiereElementdaten`).

## Transformation der Steifigkeitsbeziehung

Weil $\mathbf{T}_U$ nicht orthogonal und im Allgemeinen nicht einmal quadratisch ist, leiten wir die
Transformation mit dem Prinzip der virtuellen Verschiebungen her. Die virtuelle Arbeit der Stabendgrößen muss in
beiden Beschreibungen gleich sein:

$$
\delta\boldsymbol{\Delta}^T\,\mathbf{F} = \delta\boldsymbol{\delta}^T\,\mathbf{f}
= \delta\boldsymbol{\Delta}^T\,\mathbf{T}_U^T\,\mathbf{f}
\quad\Rightarrow\quad \mathbf{F} = \mathbf{T}_U^T\,\mathbf{f} .
$$

Hier steht $\boldsymbol{\Delta}$ kurz für alle $6+n_G$ Freiheitsgrade des Stabes. Mit
$\mathbf{f} = \mathbf{k}\,\boldsymbol{\delta} + \mathbf{p}$ ($\mathbf{p}$: Elementlasten in lokalen
Stabendgrößen) folgt

$$
\mathbf{F} = \underbrace{\mathbf{T}_U^T\,\mathbf{k}\,\mathbf{T}_U}_{\mathbf{K}_e}\,\boldsymbol{\Delta}
+ \underbrace{\mathbf{T}_U^T\,\mathbf{p}}_{\mathbf{P}_e} .
$$

Für den reinen Drehfall ($\mathbf{T}_U = \mathbf{T}$, orthogonal) ist das die bekannte Formel
$\mathbf{K}_e = \mathbf{T}^T\mathbf{k}\,\mathbf{T}$. Sie gilt aber auch mit starren Enden und Gelenken.

Im Programm: `berechneElementsteifigkeitsmatrix` (Matrix `estiffG`) und für die Lasten
`berechneElementlasten`. Die Gelenkfreiheitsgrade werden ganz normal mit in das Gesamtgleichungssystem
eingebaut, eine statische Kondensation findet nicht statt.

**Wie wirkt das Gelenk im Gleichungssystem?** Die Zeile des Gleichungssystems für einen Gelenkfreiheitsgrad lautet
$F_G = 0$ (keine äußere Last). $F_G$ ist nach $\mathbf{F} = \mathbf{T}_U^T\mathbf{f}$ genau die zugehörige
Stabendgröße des elastischen Stabes, bei einem Momentengelenk am Stabanfang also $M_a = 0$.

## Rücktransformation der Kräfte

Nach dem Lösen des Gleichungssystems sind die Knotenverschiebungen bekannt. Die Stabendverformungen folgen
direkt aus $\boldsymbol{\delta} = \mathbf{T}_U\,\boldsymbol{\Delta}$. Für die Kräfte berechnet d2beam zuerst
die Stabendkräfte im Knotensystem

$$
\mathbf{F} = \mathbf{K}_e\,\boldsymbol{\Delta} + \mathbf{P}_e
$$

und transformiert die sechs Knotenanteile dann in die lokalen Stabendgrößen am elastischen Stab. Die Gleichung
$\mathbf{F} = \mathbf{T}_U^T\mathbf{f}$ lässt sich dafür nicht einfach umkehren. Stattdessen nutzen wir das
Gleichgewicht am starren Ende.

![Bild 9: Gleichgewicht am starren Ende (Konvention II, lokale Richtungen)](bilder/kraefte_starr){width=80%}

Zuerst werden die Knotenkräfte mit der orthogonalen Matrix $\mathbf{T}_a$ in die lokale Richtung gedreht. Am
starren Ende (Bild 9) greifen am Knoten die Kräfte $F_K$, $V_K$, $M_K$ an, am Punkt $a$ die Stabendgrößen des
elastischen Stabes mit umgekehrtem Vorzeichen. Kräftegleichgewicht und Momentengleichgewicht um den Punkt $a$
liefern

$$
F_a = F_K, \qquad V_a = V_K, \qquad M_a = M_K + \ell_a\, V_K .
$$

Am Stabende entsprechend $M_e = M_K - \ell_e\, V_K$. In Matrizenform ist das gerade die inverse transponierte
Matrix des starren Endes:

$$
\mathbf{f}_a = \mathbf{S}_a^{-T}\,\mathbf{T}_a\,\mathbf{F}_{K_a}, \qquad
\mathbf{S}_a^{-T} = \begin{bmatrix} 1 & 0 & 0 \\ 0 & 1 & 0 \\ 0 & \ell_a & 1 \end{bmatrix}, \qquad
\mathbf{S}_e^{-T} = \begin{bmatrix} 1 & 0 & 0 \\ 0 & 1 & 0 \\ 0 & -\ell_e & 1 \end{bmatrix} .
$$

Das folgt auch formal aus der virtuellen Arbeit am starren Ende: Aus
$\boldsymbol{\delta}_a = \mathbf{S}_a\boldsymbol{\delta}_K$ folgt $\mathbf{f}_K = \mathbf{S}_a^T\mathbf{f}_a$
und damit $\mathbf{f}_a = \mathbf{S}_a^{-T}\mathbf{f}_K$.

Die Matrix

$$
\mathbf{T}_{F} =
\begin{bmatrix} \mathbf{S}_a^{-T}\mathbf{T}_a & \mathbf{0} \\ \mathbf{0} & \mathbf{S}_e^{-T}\mathbf{T}_e \end{bmatrix}
$$

heißt im Programm `TfG2L`. Wichtig: Sie hängt **nicht** von den Gelenken ab und ist immer voll besetzt. Das
Gleichgewicht am starren Ende gilt unabhängig davon, welche Kraftkomponente im Gelenk freigegeben ist. Bei
einem Querkraftgelenk an einem schrägen Stab enthält z. B. die globale Kraft $F_x$ trotzdem einen Anteil der
Normalkraft, der bei der Rücktransformation gebraucht wird.

**Kontrolle Momentengelenk:** Die Spalte von $\mathbf{T}_U$ für $\Phi_a$ enthält nur noch den Eintrag
$-\ell_a$ in der Zeile von $w_a$. Damit ist $M_{K} = -\ell_a\,V_a$ und
$M_a = M_K + \ell_a V_a = 0$, wie es sein muss.

Zum Schluss werden die Vorzeichen am Stabanfang umgedreht (Konvention II → I, Abschnitt 2.3). Die Ergebnisse
stehen in `FL` und als Anfangswerte $N_L$, $V_L$, $M_L$ für die Zustandslinien zur Verfügung.

# Gesamtsystem und Ablauf der Berechnung

## Zuordnung der Freiheitsgrade

Jeder Knoten hat drei Freiheitsgrade (im Knotensystem). Gehaltene Freiheitsgrade erhalten keine
Gleichungsnummer. Für jedes Gelenk wird eine weitere Gleichungsnummer vergeben. Der Zuordnungsvektor `lm` eines
Stabes enthält für seine $6 + n_G$ Freiheitsgrade die Gleichungsnummern im Gesamtsystem (bzw. $-1$ für
gehaltene Freiheitsgrade).

## Ablauf

1. Daten einlesen (Knoten, Stäbe, Lager, Lasten).
2. Für jeden Stab: $\mathbf{k}$ im lokalen System, $\mathbf{T}_U$ und $\mathbf{T}_F$ aufbauen,
   $\mathbf{K}_e = \mathbf{T}_U^T\mathbf{k}\,\mathbf{T}_U$ und $\mathbf{P}_e = \mathbf{T}_U^T\mathbf{p}$.
3. Gesamtsteifigkeitsmatrix $\mathbf{K}_g = \sum \mathbf{K}_e$ (Einbau über `lm`).
4. Lastvektor $\mathbf{R}_g = \sum \mathbf{P} - \sum \mathbf{P}_e$ (Knotenlasten minus Elementlasten).
5. Gleichungssystem $\mathbf{K}_g\,\boldsymbol{\Delta}_g = \mathbf{R}_g$ lösen.
6. Für jeden Stab: $\mathbf{F} = \mathbf{K}_e\,\boldsymbol{\Delta} + \mathbf{P}_e$, lokale Stabendgrößen
   $\mathbf{f} = \mathbf{T}_F\,\mathbf{F}$, Stabendverformungen $\boldsymbol{\delta} = \mathbf{T}_U\boldsymbol{\Delta}$.
7. Lagerkräfte aus dem Knotengleichgewicht: $\mathbf{A}_j = -\sum \mathbf{F} + \sum \mathbf{P}_j$
   (im Knotensystem, bei gedrehten Lagern also in $x'$, $z'$).
8. Schnittgrößen und Verformungen entlang der Stabachse (folgender Teil).

# Anhang A: Nachrechnung mit SymPy {-}

Im Ordner `doku/theorie/sympy` liegen die Skripte, mit denen die Formeln dieses Teils nachgerechnet wurden:

- `k_timoshenko.py`: Lösung der Differentialgleichung, Steifigkeitsmatrix, Vergleich mit dem Programmcode,
  Ansatzfunktionen.
- `konstanten.py`: Matrix $\mathbf{A}$ und Integrationskonstanten $C_1 \ldots C_4$.
- `bettung_ksig_masse.py`: Bettungs-, geometrische und Massenmatrix aus den Ansatzfunktionen, Vergleich mit dem
  Programmcode (für die folgenden Teile).

Aufruf jeweils mit `python3 <skript>.py` (benötigt das Paket `sympy`).

# Literatur {-}

1. Meskouris, K.; Hake, E.: Statik der Stabtragwerke. Springer, 2009.
2. Kindmann, R.: Stahlbau, Teil 2: Stabilität und Theorie II. Ordnung. Ernst & Sohn.
3. Przemieniecki, J. S.: Theory of Matrix Structural Analysis. McGraw-Hill, 1968 (Dover 1985).
4. Rothe, D.: Allgemeines Weggrößenverfahren. Vorlesungsunterlagen, Stand 5.2.2020.
