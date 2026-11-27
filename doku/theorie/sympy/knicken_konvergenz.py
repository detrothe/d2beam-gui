# Knicklast des beidseitig gelenkig gelagerten Stabes mit n Elementen (Matrizen wie im Programm)
import numpy as np
def matrizen(le, EI, eta):
    psi = 1.0/(1.0+12.0*eta/le**2)
    k = EI*np.array([[12*psi/le**3, -6*psi/le**2, -12*psi/le**3, -6*psi/le**2],
                     [-6*psi/le**2, (1+3*psi)/le, 6*psi/le**2, (3*psi-1)/le],
                     [-12*psi/le**3, 6*psi/le**2, 12*psi/le**3, 6*psi/le**2],
                     [-6*psi/le**2, (3*psi-1)/le, 6*psi/le**2, (1+3*psi)/le]])
    f = 1/(60*le); p2 = psi**2
    ks = np.array([[(60+12*p2)*f, -6*p2*f*le, -(60+12*p2)*f, -6*p2*f*le],
                   [-6*p2*f*le, (5+3*p2)*f*le**2, 6*p2*f*le, (3*p2-5)*f*le**2],
                   [-(60+12*p2)*f, 6*p2*f*le, (60+12*p2)*f, 6*p2*f*le],
                   [-6*p2*f*le, (3*p2-5)*f*le**2, 6*p2*f*le, (5+3*p2)*f*le**2]])
    return k, ks
def ncr(n, L, EI, eta):
    le = L/n; k, ks = matrizen(le, EI, eta)
    K = np.zeros((2*n+2,)*2); G = np.zeros_like(K)
    for e in range(n):
        K[2*e:2*e+4, 2*e:2*e+4] += k; G[2*e:2*e+4, 2*e:2*e+4] += ks
    frei = [i for i in range(2*n+2) if i not in (0, 2*n)]   # w=0 an beiden Enden
    K = K[np.ix_(frei, frei)]; G = G[np.ix_(frei, frei)]
    ev = np.linalg.eigvals(np.linalg.solve(G, K))
    return min(ev.real[ev.real > 0])
L, EI = 5.0, 1.0e4
NE = np.pi**2*EI/L**2
print(f"Euler N_E = {NE:.2f} kN")
for eta in (0.0, 0.25):
    GA = EI/eta if eta > 0 else np.inf
    eng = NE/(1+NE/GA)
    print(f"\neta = {eta}  (GA_s = {GA:.0f} kN), Engesser N_cr = {eng:.2f} kN")
    for n in (1, 2, 3, 4, 6, 8):
        N = ncr(n, L, EI, eta)
        print(f"  n={n}:  N_cr = {N:9.2f} kN   Fehler gegen Engesser {100*(N-eng)/eng:+6.2f} %")
