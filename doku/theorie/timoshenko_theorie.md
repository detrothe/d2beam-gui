---
title: "d2beam – Theorie-Handbuch"
subtitle: "Der Timoshenko-Balken im Weggrößenverfahren"
author: "Prof. Dr.-Ing. Detlef Rothe"
date: "Entwurf, Stand 27.11.2026 – Teile 1 und 2"
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

Teil 1 (Kapitel 1 bis 6) behandelt

- die Koordinatensysteme und Vorzeichenregeln,
- die Differentialgleichungen des Timoshenko-Balkens,
- die Elementsteifigkeitsmatrix,
- die Transformationen für gedrehte Stäbe, gedrehte Lager, starre Stabenden und Gelenke,
- den Ablauf der Berechnung im Gesamtsystem.

Teil 2 (Kapitel 7 bis 10) behandelt

- die Elementlasten und ihre Volleinspanngrößen,
- die Elementteilung, mit der d2beam einen Stab für die Berechnung in mehrere finite Elemente teilt,
- die Schnittgrößen und Verformungen entlang des Stabes (Zustandslinien),
- die elastische Bettung nach Winkler.

Theorie II. Ordnung, Knickeigenwerte und Dynamik folgen in weiteren Teilen.

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

# Elementlasten

## Grundgedanke

Lasten, die zwischen den Knoten auf einen Stab wirken, werden im Weggrößenverfahren über
**Volleinspanngrößen** berücksichtigt: Man hält beide Stabenden fest
($\boldsymbol{\delta} = \mathbf{0}$) und bestimmt die Stabendgrößen, die die Last dann hervorruft. Das ist der
Lastvektor $\mathbf{p}$ in

$$
\mathbf{f} = \mathbf{k}\,\boldsymbol{\delta} + \mathbf{p} .
$$

$\mathbf{p}$ wird in Konvention II angegeben (im Programm `eload[].re`) und wie in Abschnitt 5.5 mit
$\mathbf{P}_e = \mathbf{T}_U^T\,\mathbf{p}$ in das Knotensystem transformiert (`eload[].el_r`). Im
Gesamtsystem steht $\mathbf{P}_e$ mit negativem Vorzeichen auf der rechten Seite.

Für die Zustandslinien (Kapitel 9) braucht man zusätzlich den Verlauf der Verformungen im eingespannten Stab,
die **Partikulärlösung**. Auch sie wird hier hergeleitet.

Alle Lasten beziehen sich auf den elastischen Stab ($0 \le x \le L$). Auf den starren Enden gibt es keine
Elementlasten.

## Lastarten der Streckenlast

![Bild 10: Die fünf Arten der Trapezstreckenlast](bilder/lastarten){width=100%}

Die Streckenlast verläuft linear von $p_a$ am Stabanfang bis $p_e$ am Stabende. Sie wird zuerst in eine
Querlast $q$ (Richtung $z_L$) und eine Längslast $n$ (Richtung $x_L$) zerlegt, jeweils bezogen auf die
Stablänge:

| Art | Richtung und Bezugslänge | $q$ (quer) | $n$ (längs) |
|:---:|:---|:---:|:---:|
| 0 | senkrecht auf den Stab | $p$ | $0$ |
| 1 | global $z$, je m Stablänge | $p\cos\alpha$ | $p\sin\alpha$ |
| 2 | global $z$, je m Grundrissprojektion | $p\cos^2\alpha$ | $p\sin\alpha\cos\alpha$ |
| 3 | global $x$, je m Stablänge | $-p\sin\alpha$ | $p\cos\alpha$ |
| 4 | global $x$, je m Projektion auf die $z$-Achse | $-p\sin^2\alpha$ | $p\sin\alpha\cos\alpha$ |

Bei den Projektionslasten (Art 2 und 4) wird die Last zuerst mit dem Verhältnis Projektionslänge zu Stablänge
($L_x/L_0 = \cos\alpha$ bzw. $L_z/L_0 = \sin\alpha$) auf die Stablänge umgerechnet. Das **Eigengewicht**
wird automatisch als Last der Art 1 mit $p = \gamma \cdot A$ angesetzt.

## Querlast (Trapezlast)

Für die Querlast $q(x) = q_a + m_q\,x$ mit $m_q = (q_e - q_a)/L$ liefern die Gleichungen aus Kapitel 3

$$
\begin{aligned}
V(x) &= -q_a\,x - m_q\,\frac{x^2}{2} + C_1 , \\
M(x) &= -q_a\,\frac{x^2}{2} - m_q\,\frac{x^3}{6} + C_1\,x + C_2 , \\
E I_y\,\beta(x) &= q_a\,\frac{x^3}{6} + m_q\,\frac{x^4}{24} - C_1\,\frac{x^2}{2} - C_2\,x + E I_y\, C_3 , \\
E I_y\,w(x) &= q_a\,\frac{x^4}{24} + m_q\,\frac{x^5}{120} - C_1\,\frac{x^3}{6} - C_2\,\frac{x^2}{2} \\
  &\quad + \eta\left( -q_a\,\frac{x^2}{2} - m_q\,\frac{x^3}{6} + C_1\,x \right) + E I_y\,(C_3\,x + C_4) .
\end{aligned}
$$

Beim beidseitig eingespannten Stab ist $w(0) = \beta(0) = 0$, also $C_3 = C_4 = 0$. Aus $w(L) = \beta(L) = 0$
folgen $C_1$ und $C_2$. Sie sind nichts anderes als Querkraft und Moment am Stabanfang des eingespannten
Stabes: $C_1 = V(0)$, $C_2 = M(0)$. Mit dem Schubparameter $\psi$ aus Abschnitt 4.1 lauten die
Volleinspanngrößen

$$
\begin{aligned}
V_a &= -\frac{L}{60}\Big[ (20+\psi)\, q_a + (10-\psi)\, q_e \Big], &
M_a &= \frac{L^2}{120}\Big[ (5+\psi)\, q_a + (5-\psi)\, q_e \Big], \\
V_e &= -\frac{L}{60}\Big[ (10-\psi)\, q_a + (20+\psi)\, q_e \Big], &
M_e &= -\frac{L^2}{120}\Big[ (5-\psi)\, q_a + (5+\psi)\, q_e \Big],
\end{aligned}
$$

und $C_1 = -V_a$, $C_2 = -M_a$.

**Kontrollen:**

- Gleichlast ($q_a = q_e = q$): $V_a = V_e = -qL/2$, $M_a = -M_e = qL^2/12$, unabhängig von der
  Schubverformung.
- Schubstarr ($\psi = 1$): $V_a = -L(7q_a + 3q_e)/20$, $M_a = L^2(3q_a + 2q_e)/60$, die bekannten Werte
  aus den Tabellenwerken.

Im Programm: `berechneElementlasten`, Arten 0 bis 4 (Volleinspanngrößen und $C_1$, $C_2$ für die
Zustandslinien).

## Längslast

Für die Längslast $n(x) = n_a + (n_e - n_a)\,x/L$ folgt aus $EA\,u'' = -n$ mit $u(0) = u(L) = 0$

$$
F_a = -\frac{L}{6}\,(2 n_a + n_e), \qquad F_e = -\frac{L}{6}\,(n_a + 2 n_e)
$$

und die Partikulärlösung

$$
u_p(x) = \frac{x\,(L-x)}{6\,EA\,L}\Big[ (2L - x)\, n_a + (L + x)\, n_e \Big] .
$$

Bei konstanter Längslast ist $u_p = n\,x\,(L-x)/(2EA)$.

## Temperatur

Ein linear über die Querschnittshöhe veränderlicher Temperaturverlauf mit $T_o$ am oberen und $T_u$ am unteren
Rand bewirkt eine Dehnung der Schwerachse und eine Krümmung:

$$
\varepsilon_T = \alpha_T\,T_s, \quad T_s = T_o + (T_u - T_o)\,\frac{z_{so}}{h}, \qquad
\kappa_T = \alpha_T\,\frac{T_u - T_o}{h} .
$$

$z_{so}$ ist der Abstand des Schwerpunkts vom oberen Rand. Im eingespannten Stab sind die Verformungen null,
also $u' = N/EA + \varepsilon_T = 0$ und $\beta' = -M/EI_y - \kappa_T = 0$:

$$
F_a = -F_e = EA\,\varepsilon_T, \qquad M_a = -M_e = EI_y\,\kappa_T, \qquad V_a = V_e = 0 .
$$

Weil keine Querkraft entsteht, hat die Schubverformung keinen Einfluss. Die Partikulärlösung ist null.

## Einzellast und Einzelmoment im Feld

![Bild 11: Einzellast und Einzelmoment am beidseitig eingespannten Stab](bilder/einzellast){width=70%}

Eine Einzellast $P$ in Richtung $z_L$ und ein Einzelmoment $M$ (positiv entgegen dem Uhrzeigersinn) greifen an
der Stelle $x_P$ an. Die Lösung setzt sich aus zwei Bereichen zusammen, die bei $x_P$ stetig ($w$, $\beta$)
aneinander anschließen. Mit $\alpha_P = L^3 + 12\,\eta\,L$ erhält man

$$
\begin{aligned}
V_a &= -\frac{P}{\alpha_P}\Big[ L^3 - 3L\,x_P^2 + 2x_P^3 + 12\,\eta\,(L - x_P) \Big]
       - \frac{6\,M}{\alpha_P}\,x_P\,(L - x_P) , \\
M_a &= \frac{P}{\alpha_P}\,x_P\,(L - x_P)\Big[ L\,(L - x_P) + 6\,\eta \Big]
       - \frac{M}{\alpha_P}\Big[ L^3 - 4L^2 x_P + 3L\,x_P^2 + 12\,\eta\,(L - x_P) \Big] ,
\end{aligned}
$$

und aus dem Gleichgewicht des ganzen Stabes

$$
V_e = -V_a - P, \qquad M_e = V_e\,L + P\,x_P - M_a - M .
$$

Für $\eta = 0$ ergeben sich die bekannten Werte, z. B. $M_a = P\,x_P\,(L - x_P)^2/L^2$.

Für die Zustandslinien werden zusätzlich Durchbiegung $w_P$ und Drehwinkel $\varphi_P$ des eingespannten
Stabes am Lastangriffspunkt gebraucht (`CwP`, `CphiP`, `CwM`, `CphiM` im Programm). Die Partikulärlösung
besteht dann aus zwei eingespannten Teilstäben $[0, x_P]$ und $[x_P, L]$, deren gemeinsames Ende sich um
$w_P$, $\varphi_P$ verformt; sie wird mit den Ansatzfunktionen aus Abschnitt 4.4 für die Teillängen
berechnet.

**Hinweis:** Seit der Elementteilung (Kapitel 8) wirken Einzellasten im Inneren eines Stabes als Knotenlasten
auf einen Zwischenknoten. Als Elementlast bleiben sie nur am Rand des elastischen Bereichs ($x_P = 0$ oder
$x_P = L$) erhalten, siehe Abschnitt 8.3.

## Vorspannung und Spannschloss

Eine zentrische Vorspannung $\sigma_V$ und ein Spannschloss, das den Stab um $\delta_s$ verkürzt, erzeugen im
beidseitig festgehaltenen Stab die Normalkraft $N_0 = \sigma_V A$ bzw. $N_0 = EA\,\delta_s/L$ (Zug).
Damit ist

$$
F_a = -N_0, \qquad F_e = N_0 .
$$

## Vorgegebene Knotenverformungen

Eine vorgegebene Verschiebung oder Verdrehung eines gehaltenen Knotens (z. B. eine Lagersenkung) wird als
Elementlast der angeschlossenen Stäbe behandelt. Aus den vorgegebenen Knotenwerten wird mit den Zeilen von
$\mathbf{T}_U$ der lokale Verformungsvektor $\boldsymbol{\delta}_0$ gebildet, und es ist

$$
\mathbf{p} = \mathbf{k}\,\boldsymbol{\delta}_0 .
$$

Bei Theorie II. Ordnung steht hier die Matrix einschließlich des geometrischen Anteils. In den
Zustandslinien wird $\boldsymbol{\delta}_0$ zu den Stabendverformungen addiert.

# Elementteilung

## Warum teilen?

Ein Timoshenko-Element mit den Ansatzfunktionen aus Abschnitt 4.4 liefert für die Lasten aus Kapitel 7 die
**exakte** Lösung der Stabtheorie I. Ordnung. Ein Element je Stab genügt dann. Bei der Bettung (Kapitel 10),
bei Theorie II. Ordnung und in der Dynamik sind die Ansatzfunktionen dagegen nur Näherungen. Die Genauigkeit
lässt sich verbessern, indem man den Stab in mehrere Elemente teilt.

d2beam unterscheidet deshalb zwischen dem **Stab**, wie du ihn eingibst, und den **finiten Elementen**, mit
denen gerechnet wird. Bei der Eingabe gibst du je Stab eine Zielteilung $n_{Teil}$ an (Vorgabe 1).

## Teilungspunkte

Der elastische Bereich $0 \le x \le L$ wird so geteilt (`stab_teilen` in `cad_netz.ts`):

1. **Feste Punkte** sind die Stabenden, die Angriffspunkte der Einzellasten und die Grenzen von
   Teilstreckenlasten.
2. Liegen zwei feste Punkte näher als eine Fangtoleranz beieinander, werden sie zusammengefasst. Einzellasten
   haben dabei Vorrang. Die Ausgabe meldet zusammengefasste Punkte.
3. Jeder Abschnitt zwischen zwei festen Punkten wird gleichmäßig so geteilt, dass die Elemente höchstens etwa
   $L/n_{Teil}$ lang sind.

An jedem inneren Teilungspunkt entsteht ein neuer Knoten. Starre Enden und Gelenke des Stabes gehören nur zum
ersten bzw. letzten Element.

## Lasten bei der Teilung

- **Streckenlasten** werden auf alle Elemente verteilt, die im Lastbereich liegen. Anfangs- und Endwert je
  Element werden linear interpoliert. Wird die Grenze einer Teilstreckenlast auf einen benachbarten Punkt
  gefangen, wird die Last so skaliert, dass die Resultierende erhalten bleibt.
- **Einzellasten im Inneren** werden zu Knotenlasten am entsprechenden Zwischenknoten (Kraftkomponenten in
  $x$, $z$ und Moment).
- **Einzellasten am Rand des elastischen Bereichs** ($x_P = 0$ oder $x_P = L$) bleiben Elementlasten
  (Abschnitt 7.6): Queranteil und Moment wirken so auf der Stabseite eines eventuellen Gelenks und mit dem
  Hebelarm des starren Endes. Der Längsanteil wird als Knotenlast am Endknoten angesetzt, weil der starre Arm in
  Stabrichtung liegt. Bei einem Normalkraftgelenk an diesem Ende ist ein Längsanteil nicht möglich.
- **Temperatur** und **Vorspannung** wirken auf alle Elemente, ein **Spannschloss** nur auf das mittlere.

# Schnittgrößen und Verformungen entlang des Stabes

## Überlagerung

Nach der Lösung des Gleichungssystems sind für jedes Element die Stabendverformungen
$\boldsymbol{\delta}$ und die Stabendgrößen $\mathbf{f}$ bekannt (Abschnitt 5.6). Die Zustandslinien setzen
sich aus zwei Anteilen zusammen:

1. dem **homogenen Anteil** aus den Stabendverformungen, berechnet mit den Ansatzfunktionen
   (Abschnitt 4.4), und
2. dem **Partikulärteil** der Elementlasten am beidseitig eingespannten Stab (Kapitel 7).

Für die Schnittgrößen ist es einfacher, vom Stabanfang aus mit dem Gleichgewicht zu rechnen. Mit den
Stabendgrößen am Stabanfang in Konvention I ($N_L = -F_a$, $V_L = -V_a$, $M_L = -M_a$) gilt
(Programm: `berechneElementSchnittgroessen`):

$$
\begin{aligned}
N(x) &= N_L - n_a\,x - (n_e - n_a)\,\frac{x^2}{2L} , \\
V(x) &= V_L - q_a\,x - (q_e - q_a)\,\frac{x^2}{2L} , \\
M(x) &= M_L + V_L\,x - q_a\,\frac{x^2}{2} - (q_e - q_a)\,\frac{x^3}{6L} .
\end{aligned}
$$

Hinter einer Einzellast ($x > x_P$) kommen $-P$ in $V$ und $-M - P\,(x - x_P)$ in $M$ hinzu. An der Stelle
$x_P$ legt d2beam deshalb zwei Ausgabepunkte direkt hintereinander, um den Sprung darzustellen.

## Verformungen

Die Verformungen entlang des Stabes sind

$$
\begin{aligned}
u(x) &= \left(1 - \frac{x}{L}\right) u_a + \frac{x}{L}\,u_e + u_p(x) , \\
w(x) &= \mathbf{N}_w(x)\,\boldsymbol{\delta}_b + w_p(x) , \\
\beta(x) &= -\mathbf{N}_\varphi(x)\,\boldsymbol{\delta}_b + \beta_p(x) .
\end{aligned}
$$

$w_p$ und $\beta_p$ sind die Ausdrücke aus Abschnitt 7.3 mit $C_3 = C_4 = 0$, $u_p$ ist die Partikulärlösung
der Längslast aus Abschnitt 7.4. Ausgegeben wird die Querschnittsdrehung $\beta$ (positiv im Uhrzeigersinn).
Weil die Ansatzfunktionen für den unbelasteten Timoshenko-Stab exakt sind, sind die Zustandslinien für
Theorie I. Ordnung ohne Bettung **exakt**.

## Starre Enden

![Bild 12: Momentenlinie über starre Enden und elastischen Stab](bilder/starr_momente){width=80%}

Auf den starren Enden wirken keine Lasten. Normal- und Querkraft sind dort konstant und gleich den Werten am
Rand des elastischen Bereichs, das Moment verläuft linear (`sg_starre_enden` in `grafik.ts`):

$$
M_{K_a} = M(0) - V(0)\,\ell_a, \qquad M_{K_e} = M(L) + V(L)\,\ell_e .
$$

Die Verformungen der starren Enden sind Starrkörperbewegungen der Knoten.

# Elastische Bettung

## Differentialgleichung

![Bild 13: Stab auf elastischer Bettung](bilder/bettung){width=70%}

Bei der Bettung nach Winkler ist die Bettungspressung proportional zur Durchbiegung. Je Meter Stablänge
wirkt die Rückstellkraft $-k_0\,w$, wobei $k_0$ in kN/m² der Bettungsmodul mal der Breite des Stabes ist
(z. B. $k_0 = k_s \cdot b$ für einen Streifenfundament-Balken). Die Gleichgewichtsbedingung lautet damit

$$
\frac{dV}{dx} = -q(x) + k_0\,w(x) .
$$

Die Bettung wirkt nur quer zur Stabachse.

## Bettungsmatrix

Die Arbeit der Bettungskräfte bei einer virtuellen Verschiebung
$\delta w = \mathbf{N}_w\,\delta\boldsymbol{\delta}_b$ führt auf die zusätzliche Steifigkeitsmatrix

$$
\mathbf{k}_B = k_0 \int_0^L \mathbf{N}_w^T\,\mathbf{N}_w\,dx ,
$$

die zur Biegesteifigkeitsmatrix addiert wird. Mit den Timoshenko-Ansatzfunktionen und
$n = (1 + 12\eta/L^2)^2$ erhält man für die Freiheitsgrade $w_a, \varphi_a, w_e, \varphi_e$ (Indizes 1 bis 4,
die Matrix ist symmetrisch):

$$
\begin{aligned}
k_{B,11} = k_{B,33} &= k_0\,\frac{13L^4 + 294\,\eta L^2 + 1680\,\eta^2}{35\,n\,L^3} , \\
k_{B,12} = -k_{B,34} &= -k_0\,\frac{11L^4 + 231\,\eta L^2 + 1260\,\eta^2}{210\,n\,L^2} , \\
k_{B,13} &= k_0\,\frac{9L^4 + 252\,\eta L^2 + 1680\,\eta^2}{70\,n\,L^3} , \\
k_{B,14} = -k_{B,23} &= k_0\,\frac{13L^4 + 378\,\eta L^2 + 2520\,\eta^2}{420\,n\,L^2} , \\
k_{B,22} = k_{B,44} &= k_0\,\frac{L^4 + 21\,\eta L^2 + 126\,\eta^2}{105\,n\,L} , \\
k_{B,24} &= -k_0\,\frac{L^4 + 28\,\eta L^2 + 168\,\eta^2}{140\,n\,L} .
\end{aligned}
$$

Schubstarr ($\eta = 0$) ist das die bekannte konsistente Matrix
$\frac{k_0 L}{420}\left[\begin{smallmatrix} 156 & -22L & 54 & 13L \\ & 4L^2 & -13L & -3L^2 \\ & & 156 & 22L \\ & & & 4L^2 \end{smallmatrix}\right]$
(mit $\varphi = -w'$). Im Programm: `berechneLokaleElementsteifigkeitmatrix`, Abschnitt `k_0 > 0`.

## Zustandslinien mit Bettung

Die Bettungskraft wird mit derselben Näherung $w_h(x) = \mathbf{N}_w(x)\,\boldsymbol{\delta}_b$ wie in der
Bettungsmatrix über den Stab integriert. Zu Querkraft und Moment aus Abschnitt 9.1 kommen

$$
\Delta V(x) = k_0 \int_0^x w_h(s)\,ds, \qquad
\Delta M(x) = k_0 \int_0^x w_h(s)\,(x - s)\,ds
$$

hinzu. So passen $V$ und $M$ am Stabende genau zu den Stabendgrößen. Die ausgegebene Bettungspressung ist
$p_B(x) = -k_0\,w(x)$.

## Genauigkeit und Elementteilung

Die Ansatzfunktionen sind für den gebetteten Stab nicht mehr exakt. Maßgebend für die Güte ist das Verhältnis
der Elementlänge $\ell_{el}$ zur **charakteristischen Länge**

$$
L_c = \sqrt[4]{\frac{4\,E I_y}{k_0}} .
$$

Die folgende Tabelle zeigt einen frei liegenden Balken ($L = 10$ m, $EI = 10^5$ kNm², $k_0 = 5\cdot10^4$ kN/m²,
$L_c = 1{,}68$ m) mit einer Einzellast $P = 500$ kN in Feldmitte. Verglichen werden Durchbiegung und Moment in
Feldmitte mit der exakten Lösung der Differentialgleichung (Skript `bettung_konvergenz.py`):

| Elemente | $\ell_{el}/L_c$ | $w$ [mm] | Fehler | $M$ [kNm] | Fehler |
|:---:|:---:|:---:|:---:|:---:|:---:|
| 2 | 2,97 | 2,575 | −14,9 % | 220,4 | +5,2 % |
| 4 | 1,49 | 2,966 | −1,9 % | 209,0 | −0,3 % |
| 6 | 0,99 | 3,012 | −0,4 % | 209,3 | −0,1 % |
| 8 | 0,74 | 3,020 | −0,1 % | 209,5 | 0,0 % |
| exakt | | 3,024 | | 209,6 | |

**Empfehlung:** Wähle die Zielteilung so, dass die Elemente nicht länger als die charakteristische Länge
sind ($\ell_{el} \le L_c$). Dann liegen die Fehler unter 0,5 %.

# Anhang A: Nachrechnung mit SymPy {-}

Im Ordner `doku/theorie/sympy` liegen die Skripte, mit denen die Formeln dieses Teils nachgerechnet wurden:

- `k_timoshenko.py`: Lösung der Differentialgleichung, Steifigkeitsmatrix, Vergleich mit dem Programmcode,
  Ansatzfunktionen.
- `konstanten.py`: Matrix $\mathbf{A}$ und Integrationskonstanten $C_1 \ldots C_4$.
- `bettung_ksig_masse.py`: Bettungs-, geometrische und Massenmatrix aus den Ansatzfunktionen, Vergleich mit dem
  Programmcode.
- `ansatz_code.py`: Ansatzfunktionen der Zustandslinien im Programmcode gegen die Herleitung.
- `elementlasten.py`: Volleinspanngrößen und Partikulärlösungen von Trapezlast, Längslast, Einzellast und
  Einzelmoment, Vergleich mit dem Programmcode.
- `bettung_konvergenz.py`: Genauigkeit der Bettungsmatrix in Abhängigkeit von der Elementteilung.

Aufruf jeweils mit `python3 <skript>.py` (benötigt das Paket `sympy`).

# Literatur {-}

1. Meskouris, K.; Hake, E.: Statik der Stabtragwerke. Springer, 2009.
2. Kindmann, R.: Stahlbau, Teil 2: Stabilität und Theorie II. Ordnung. Ernst & Sohn.
3. Przemieniecki, J. S.: Theory of Matrix Structural Analysis. McGraw-Hill, 1968 (Dover 1985).
4. Rothe, D.: Allgemeines Weggrößenverfahren. Vorlesungsunterlagen, Stand 5.2.2020.
