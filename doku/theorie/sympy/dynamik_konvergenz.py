# Eigenfrequenzen des Einfeldträgers mit n Elementen (Steifigkeits- und Massenmatrix wie im Programm)
import numpy as np
def matrizen(le, EI, eta, mue):
    psi = 1.0/(1.0+12.0*eta/le**2)
    k = EI*np.array([[12*psi/le**3, -6*psi/le**2, -12*psi/le**3, -6*psi/le**2],
                     [-6*psi/le**2, (1+3*psi)/le, 6*psi/le**2, (3*psi-1)/le],
                     [-12*psi/le**3, 6*psi/le**2, 12*psi/le**3, 6*psi/le**2],
                     [-6*psi/le**2, (3*psi-1)/le, 6*psi/le**2, (1+3*psi)/le]])
    f = mue*le/840; p = psi; p2 = psi**2
    m = f*np.array([[280+28*p+4*p2, -le*(35+7*p+2*p2), 140-28*p-4*p2, le*(35-7*p-2*p2)],
                    [-le*(35+7*p+2*p2), le**2*(7+p2), -le*(35-7*p-2*p2), -le**2*(7-p2)],
                    [140-28*p-4*p2, -le*(35-7*p-2*p2), 280+28*p+4*p2, le*(35+7*p+2*p2)],
                    [le*(35-7*p-2*p2), -le**2*(7-p2), le*(35+7*p+2*p2), le**2*(7+p2)]])
    return k, m
def freq(n, L, EI, eta, mue, nmod=3):
    le = L/n; k, m = matrizen(le, EI, eta, mue)
    K = np.zeros((2*n+2,)*2); M = np.zeros_like(K)
    for e in range(n):
        K[2*e:2*e+4, 2*e:2*e+4] += k; M[2*e:2*e+4, 2*e:2*e+4] += m
    frei = [i for i in range(2*n+2) if i not in (0, 2*n)]
    K = K[np.ix_(frei, frei)]; M = M[np.ix_(frei, frei)]
    w2 = np.sort(np.linalg.eigvals(np.linalg.solve(M, K)).real)
    return np.sqrt(w2[:nmod])/(2*np.pi)
L, EI, mue = 5.0, 1.0e4, 0.25        # m, kNm², t/m
for eta in (0.0, 0.25):
    ex = [np.sqrt((j*np.pi/L)**4*EI/mue/(1+(j*np.pi/L)**2*eta))/(2*np.pi) for j in (1, 2, 3)]
    print(f"\neta = {eta}: exakt (ohne Drehträgheit) f1, f2, f3 = " + ", ".join(f"{v:.3f}" for v in ex) + " Hz")
    for n in (1, 2, 4, 8):
        fn = freq(n, L, EI, eta, mue)
        txt = "  ".join(f"f{j+1}={fn[j]:8.3f} ({100*(fn[j]-ex[j])/ex[j]:+6.2f} %)" for j in range(min(3, len(fn))))
        print(f"  n={n}: {txt}")
