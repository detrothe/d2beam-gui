# Volleinspanngrößen und Partikulärlösungen der Elementlasten, Vergleich mit timoshenko_beam.ts
import sympy as sp
x,s,L,EI,eta,EA = sp.symbols('x s L EI eta EA', positive=True)
qL,qR,P,Mm,xP,pL,pR = sp.symbols('q_L q_R P M x_P p_L p_R')
C1,C2,C3,C4 = sp.symbols('C1:5')
psi = 1/(1+12*eta/L**2)
mq = (qR-qL)/L

def balken(qfun):
    """Allgemeine Lösung mit Last q(x), beidseitig eingespannt. Liefert V, M, w, beta."""
    V = -sp.integrate(qfun,(x,0,x)) + C1
    M = sp.integrate(V,(x,0,x)) + C2
    beta = sp.integrate(-M/EI,(x,0,x)) + C3
    w = sp.integrate(beta + eta*V/EI,(x,0,x)) + C4
    sol = sp.solve([w.subs(x,0), beta.subs(x,0), w.subs(x,L), beta.subs(x,L)],[C1,C2,C3,C4])
    return [sp.simplify(e.subs(sol)) for e in (V,M,w,beta)], sol

# ---------- Trapezlast quer
(V,M,w,beta),sol = balken(qL+mq*x)
re = [ -V.subs(x,0), -M.subs(x,0), V.subs(x,L), M.subs(x,L)]   # Konvention II: re[1], re[2], re[4], re[5]
p1 = -L*(qR+qL)/120; p2 = -L*(qR-qL)/120
ps = sp.symbols('psi')
code = [30*p1-(10+2*psi)*p2, -5*L*p1+L*psi*p2, 30*p1+(10+2*psi)*p2, 5*L*p1+L*psi*p2]
print("Trapez re:", [sp.simplify(a-b) for a,b in zip(re,code)])
print("  re[2] (M_a):", sp.factor(sp.simplify(re[1])))
c1code = ((120*L*eta+10*L**3)*qL + 40*L**2*mq*eta + 3*L**4*mq)/(240*eta+20*L**2)
c2code = -((60*L**2*eta+5*L**4)*qL + 30*L**3*mq*eta + 2*L**5*mq)/(720*eta+60*L**2)
print("Trapez C1, C2:", sp.simplify(sol[C1]-c1code), sp.simplify(sol[C2]-c2code))
# Partikulärlösung im Code: EI w = qL x^4/24 + dq x^5/(120 L) - C1 x^3/6 - C2 x^2/2 + eta(-qL x^2/2 - dq x^3/(6L) + C1 x)
dq=qR-qL
wcode = (qL*x**4/24 + dq*x**5/(120*L) - sol[C1]*x**3/6 - sol[C2]*x**2/2 + eta*(-qL*x**2/2 - dq*x**3/(6*L) + sol[C1]*x))/EI
print("Trapez w_p:", sp.simplify(w-wcode))
bcode = (qL*x**3/6 + dq*x**4/(24*L) - sol[C1]*x**2/2 - sol[C2]*x)/EI
print("Trapez beta_p:", sp.simplify(beta-bcode))

# ---------- Längslast trapezförmig, beidseitig fest
u = sp.Function('u')
pfun = pL + (pR-pL)*x/L
uu = sp.dsolve(sp.Eq(EA*u(x).diff(x,2), -pfun), u(x), ics={u(0):0, u(L):0}).rhs
dp = pR-pL
ucode = (pL + dp*x/3)*x*(L-x)/2/EA
print("Längslast u_p korrekt:", sp.factor(sp.simplify(uu)))
print("Längslast u_p Code - korrekt:", sp.factor(sp.simplify(ucode-uu)))
N = EA*uu.diff(x)
print("Längslast re[0], re[3]:", sp.simplify(-N.subs(x,0)), sp.simplify(N.subs(x,L)),
      " Code:", -L*(2*pL+pR)/6, -L*(pL+2*pR)/6)

# ---------- Einzellast P und Einzelmoment M an der Stelle xP (Heaviside)
H = sp.Heaviside
V = -P*H(x-xP) + C1
M = C1*x + C2 - P*(x-xP)*H(x-xP) - Mm*H(x-xP)
beta = sp.integrate(-M/EI,(x,0,x)) + C3
w = sp.integrate(beta + eta*V/EI,(x,0,x)) + C4
def at_L(e): return sp.simplify(e.subs(x,L).rewrite(sp.Piecewise).subs(H(L-xP),1))
eqs=[w.subs(x,0), beta.subs(x,0)]
wL_ = sp.integrate(sp.integrate(-(C1*s+C2-P*(s-xP)-Mm)/EI,(s,xP,x)),(x,xP,L))
# einfacher: getrennt auf [0,xP] und [xP,L] integrieren
b1 = -(C1*x**2/2 + C2*x)/EI + C3
w1 = sp.integrate(b1,(x,0,x)) + eta*C1*x/EI + C4
Mr = C1*x + C2 - P*(x-xP) - Mm
b2 = b1.subs(x,xP) + sp.integrate(-Mr/EI,(x,xP,x))
w2 = w1.subs(x,xP) + sp.integrate(b2,(x,xP,x)) + eta*(C1-P)*(x-xP)/EI
sol = sp.solve([C3, C4, w2.subs(x,L), b2.subs(x,L)],[C1,C2,C3,C4])
VL = sol[C1]; ML = sol[C2]
re1 = -VL; re2 = -ML; re4 = (sol[C1]-P); re5 = Mr.subs(sol).subs(x,L)
sl,sl2,sl3 = L,L**2,L**3
alf = 12*sl*eta+sl3
VL_P = (12*(xP-sl)*P*eta + (-2*xP**3+3*sl*xP**2-sl3)*P)/alf
ML_P = -(6*(xP-sl)*xP*P*eta + (-sl*xP**3+2*sl2*xP**2-sl3*xP)*P)/alf
VL_M = (6*(xP**2-sl*xP)*Mm)/alf
ML_M = (12*(xP-sl)*Mm*eta + (-3*sl*xP**2+4*sl2*xP-sl3)*Mm)/alf
VR_P = -VL_P-P; MR_P = VR_P*sl + P*xP - ML_P
VR_M = -VL_M; MR_M = -ML_M - Mm - VL_M*sl
print("Einzellast re:", [sp.simplify(a-b) for a,b in zip([re1,re2,re4,re5],[VL_P+VL_M, ML_P+ML_M, VR_P+VR_M, MR_P+MR_M])])
# Verformung am Lastangriffspunkt
wP = sp.simplify(w1.subs(sol).subs(x,xP)); bP = sp.simplify(b1.subs(sol).subs(x,xP))
CwP = -((36*xP**2-36*sl*xP)*P*eta**2 + (-3*xP**4+6*sl*xP**3-3*sl3*xP)*P*eta + (xP**6-3*sl*xP**5+3*sl2*xP**4-sl3*xP**3)*P)/3/alf/EI
CphiP = ((2*xP**5-5*sl*xP**4+4*sl2*xP**3-sl3*xP**2)*P)/2/alf/EI
CwM = ((2*xP**5-5*sl*xP**4+4*sl2*xP**3-sl3*xP**2)*Mm)/2/alf/EI
CphiM = -((12*xP**2-12*sl*xP)*Mm*eta + (3*xP**4-6*sl*xP**3+4*sl2*xP**2-sl3*xP)*Mm)/alf/EI
print("Einzellast w(xP):", sp.simplify(wP-(CwP+CwM)))
print("Einzellast phi(xP)=-beta:", sp.simplify(-bP-(CphiP+CphiM)), " beta:", sp.simplify(bP-(CphiP+CphiM)))

# Handbuchformeln der Trapezlast mit psi
(V,M,w,beta),sol = balken(qL+mq*x)
hb = [-L/60*((20+psi)*qL+(10-psi)*qR), L**2/120*((5+psi)*qL+(5-psi)*qR),
      -L/60*((10-psi)*qL+(20+psi)*qR), -L**2/120*((5-psi)*qL+(5+psi)*qR)]
print("Handbuch Trapez V_a, M_a, V_e, M_e:", [sp.simplify(a-b) for a,b in zip([-V.subs(x,0),-M.subs(x,0),V.subs(x,L),M.subs(x,L)],hb)])
# Handbuchformeln Einzellast
aP = L**3+12*eta*L
hbV = -P/aP*(L**3-3*L*xP**2+2*xP**3+12*eta*(L-xP)) - 6*Mm/aP*xP*(L-xP)
hbM = P/aP*xP*(L-xP)*(L*(L-xP)+6*eta) - Mm/aP*(L**3-4*L**2*xP+3*L*xP**2+12*eta*(L-xP))
print("Handbuch Einzellast V_a, M_a:", sp.simplify(hbV-(VL_P+VL_M)), sp.simplify(hbM-(ML_P+ML_M)))
