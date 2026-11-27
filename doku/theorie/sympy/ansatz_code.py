# Vergleich der Ansatzfunktionen in berechneElementSchnittgroessen mit der Herleitung
import sympy as sp, pickle
x,L,eta = sp.symbols('x L eta', positive=True)
d = pickle.load(open('ansatz.pkl','rb')); Nw=d['Nw']; Np=d['Np']
sl=L; nenner = L**3+12*eta*L
Nwc = [(2*x**3-3*sl*x**2-12*eta*x+sl**3+12*eta*sl)/nenner,
       -((sl*x**3+(-2*sl**2-6*eta)*x**2+(sl**3+6*eta*sl)*x)/nenner),
       -((2*x**3-3*sl*x**2-12*eta*x)/nenner),
       -((sl*x**3+(6*eta-sl**2)*x**2-6*eta*sl*x)/nenner)]
Npc = [6*(sl*x-x**2)/nenner, (3*sl*x**2+(-12*eta-4*sl**2)*x+12*sl*eta+sl**3)/nenner,
       -6*(sl*x-x**2)/nenner, (3*sl*x**2+(12*eta-2*sl**2)*x)/nenner]
print("N_w :", [sp.simplify(Nw[i]-Nwc[i]) for i in range(4)])
print("N_phi (Code = -beta-Anteil, also phi):", [sp.simplify(Np[i]-Npc[i]) for i in range(4)])
