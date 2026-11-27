import sympy as sp
x,L,EI,eta = sp.symbols('x L EI eta', positive=True)
C1,C2,C3,C4 = sp.symbols('C1:5')
wa,pa,we,pe = sp.symbols('w_a phi_a w_e phi_e')
GA=EI/eta
M = C1*x + C2
beta = sp.integrate(-M/EI,(x,0,x)) + C3
w = sp.integrate(beta+C1/GA,(x,0,x)) + C4
print("beta(x) =", sp.expand(beta)); print("w(x) =", sp.expand(w))
A = sp.Matrix([[sp.diff(e,c) for c in (C1,C2,C3,C4)] for e in (w.subs(x,0), -beta.subs(x,0), w.subs(x,L), -beta.subs(x,L))])
sp.pprint(A)
sol = sp.solve([w.subs(x,0)-wa, -beta.subs(x,0)-pa, w.subs(x,L)-we, -beta.subs(x,L)-pe],[C1,C2,C3,C4])
psi=sp.symbols('psi')
for c in (C1,C2,C3,C4):
    e = sp.simplify(sol[c].subs(eta,(1/psi-1)*L**2/12))
    print(c, "=", sp.collect(sp.expand(e),[wa,pa,we,pe]))
