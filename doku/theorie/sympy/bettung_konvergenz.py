# Genauigkeit der konsistenten Bettungsmatrix: frei aufliegender Balken auf Winkler-Bettung,
# Einzellast in Feldmitte. Exakte Lösung der DGL gegen FE-Lösung mit n Elementen (schubstarr).
import numpy as np, sympy as sp

EI, k, L, P = 1.0e5, 5.0e4, 10.0, 500.0           # kNm², kN/m², m, kN
lam = (k/(4*EI))**0.25
Lc = 1/lam
# exakte Lösung, halbe Länge 0<=x<=L/2 (x ab Feldmitte), Symmetrie
x = sp.symbols('x')
c = sp.symbols('c1:5')
l = sp.Float(lam)
w = sum(ci*f for ci,f in zip(c,[sp.exp(l*x)*sp.cos(l*x), sp.exp(l*x)*sp.sin(l*x),
                                     sp.exp(-l*x)*sp.cos(l*x), sp.exp(-l*x)*sp.sin(l*x)]))
M = -EI*w.diff(x,2); V = -EI*w.diff(x,3)
eqs = [w.diff(x).subs(x,0), V.subs(x,0) + P/2, M.subs(x,L/2), V.subs(x,L/2)]
sol = sp.solve(eqs, c)
w0 = float(w.subs(sol).subs(x,0)); M0 = float(M.subs(sol).subs(x,0))

def fe(n):
    le = L/n
    kb = EI/le**3*np.array([[12,-6*le,-12,-6*le],[-6*le,4*le**2,6*le,2*le**2],
                            [-12,6*le,12,6*le],[-6*le,2*le**2,6*le,4*le**2]])
    kk = k*le/420*np.array([[156,-22*le,54,13*le],[-22*le,4*le**2,-13*le,-3*le**2],
                            [54,-13*le,156,22*le],[13*le,-3*le**2,22*le,4*le**2]])
    ke = kb+kk
    K = np.zeros((2*n+2,2*n+2))
    for e in range(n):
        i = 2*e
        K[i:i+4,i:i+4] += ke
    R = np.zeros(2*n+2); R[2*(n//2)] = P
    d = np.linalg.solve(K,R)
    e = n//2-1; i = 2*e
    f = ke @ d[i:i+4]
    return d[2*(n//2)], f[3]          # w Mitte, M_e (Konvention I am Elementende) = M Mitte

print(f"charakteristische Länge Lc = 1/lambda = {Lc:.3f} m")
print(f"exakt:  w = {w0*1000:.3f} mm,  M = {M0:.2f} kNm")
print(" n   le/Lc   w [mm]   Fehler    M [kNm]   Fehler")
for n in (2,4,6,8,12,16,24):
    wn, Mn = fe(n)
    print(f"{n:2d}  {L/n/Lc:6.2f}  {wn*1000:7.3f}  {100*(wn-w0)/w0:6.2f} %  {Mn:8.2f}  {100*(Mn-M0)/M0:6.2f} %")
