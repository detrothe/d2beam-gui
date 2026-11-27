# Herleitung der Timoshenko-Steifigkeitsmatrix aus der DGL (Vorzeichen wie d2beam)
import sympy as sp
x,L,EI,GA,EA,eta = sp.symbols('x L EI GAs EA eta', positive=True)
C1,C2,C3,C4 = sp.symbols('C1:5')
wa,pa,we,pe,ua,ue = sp.symbols('w_a phi_a w_e phi_e u_a u_e')
# q = 0
V = C1
M = C1*x + C2
beta = sp.integrate(-M/EI,(x,0,x)) + C3          # beta' = -M/EI
gam = V/GA
w = sp.integrate(beta+gam,(x,0,x)) + C4          # w' = beta + gamma
phi = -beta
sol = sp.solve([w.subs(x,0)-wa, phi.subs(x,0)-pa, w.subs(x,L)-we, phi.subs(x,L)-pe],[C1,C2,C3,C4])
Vx = V.subs(sol); Mx = M.subs(sol)
N = EA*(ue-ua)/L
f = [-N, -Vx.subs(x,0), -Mx.subs(x,0), N, Vx.subs(x,L), Mx.subs(x,L)]
d = [ua,wa,pa,ue,we,pe]
K = sp.Matrix([[sp.diff(fi,dj) for dj in d] for fi in f]).subs(GA, EI/eta)
psi = sp.symbols('psi')
Kpsi = sp.simplify(K.subs(eta, (1/psi-1)*L**2/12))
sp.pprint(sp.simplify(Kpsi))
# Vergleich mit Code
code = sp.Matrix([
 [EA/L,0,0,-EA/L,0,0],
 [0,12*EI*psi/L**3,-6*EI*psi/L**2,0,-12*EI*psi/L**3,-6*EI*psi/L**2],
 [0,-6*EI*psi/L**2,(1+3*psi)*EI/L,0,6*EI*psi/L**2,(3*psi-1)*EI/L],
 [-EA/L,0,0,EA/L,0,0],
 [0,-12*EI*psi/L**3,6*EI*psi/L**2,0,12*EI*psi/L**3,6*EI*psi/L**2],
 [0,-6*EI*psi/L**2,(3*psi-1)*EI/L,0,6*EI*psi/L**2,(1+3*psi)*EI/L]])
print("Differenz zu Code:", sp.simplify(Kpsi-code))
# Ansatzfunktionen w(x) und phi(x) aus homogener Loesung
wsol = sp.expand(w.subs(sol).subs(GA,EI/eta))
phisol = sp.expand(phi.subs(sol).subs(GA,EI/eta))
Nw = sp.Matrix([[sp.simplify(sp.diff(wsol,v)) for v in (wa,pa,we,pe)]])
Np = sp.Matrix([[sp.simplify(sp.diff(phisol,v)) for v in (wa,pa,we,pe)]])
print("N_w =", [sp.factor(n) for n in Nw])
print("N_phi =", [sp.factor(n) for n in Np])
import pickle
pickle.dump({'Nw':Nw,'Np':Np},open('ansatz.pkl','wb'))

# Kontrolle der im Handbuch angegebenen Form mit xi = x/L, lambda = 12 eta / L^2
xi, lam = sp.symbols('xi lambda', positive=True)
ps = 1/(1+lam)
hb = [ps*(1-3*xi**2+2*xi**3+lam*(1-xi)),
      -ps*L*xi*(1-2*xi+xi**2+lam/2*(1-xi)),
      ps*(3*xi**2-2*xi**3+lam*xi),
      ps*L*xi*(xi-xi**2+lam/2*(1-xi))]
sub = {x: xi*L, eta: lam*L**2/12}
print("Ansatzfunktionen Handbuch - Herleitung:", [sp.simplify(Nw[i].subs(sub)-hb[i]) for i in range(4)])
