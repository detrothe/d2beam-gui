import sympy as sp, pickle
x,L,eta,psi,k0,mu = sp.symbols('x L eta psi k_0 mu', positive=True)
d = pickle.load(open('ansatz.pkl','rb')); Nw=d['Nw']; Np=d['Np']
def I(e): return sp.simplify(sp.integrate(sp.expand(e),(x,0,L)))
Kb = (Nw.T*Nw).applyfunc(I)*k0
n2=(1+12*eta/L**2)**2; L2,L3,L4=L**2,L**3,L**4
code_b = {(0,0): k0*(13*L4+294*eta*L2+1680*eta**2)/(35*n2*L3),
 (0,1): -k0*(11*L4+231*eta*L2+1260*eta**2)/(210*n2*L2),
 (0,2): k0*(9*L4+252*eta*L2+1680*eta**2)/(70*n2*L3),
 (0,3): k0*(13*L4+378*eta*L2+2520*eta**2)/(420*n2*L2),
 (1,1): k0*(L4+21*eta*L2+126*eta**2)/(105*n2*L),
 (1,2): -k0*(13*L4+378*eta*L2+2520*eta**2)/(420*n2*L2),
 (1,3): -k0*(L4+28*eta*L2+168*eta**2)/(140*n2*L),
 (2,2): k0*(13*L4+294*eta*L2+1680*eta**2)/(35*n2*L3),
 (2,3): k0*(11*L4+231*eta*L2+1260*eta**2)/(210*n2*L2),
 (3,3): k0*(L4+21*eta*L2+126*eta**2)/(105*n2*L)}
print("Bettung:", [sp.simplify(Kb[i,j]-v) for (i,j),v in code_b.items()])
# geometrische Matrix: int w' w' dx
dN = Nw.diff(x)
Kg = (dN.T*dN).applyfunc(I)
sub = {eta:(1/psi-1)*L**2/12}
f=1/(60*L)
code_g={(0,0):(60+12*psi**2)*f,(0,1):-6*psi**2*f*L,(0,2):-(60+12*psi**2)*f,(0,3):-6*psi**2*f*L,
 (1,1):(5+3*psi**2)*f*L2,(1,2):6*psi**2*f*L,(1,3):(3*psi**2-5)*f*L2,(2,2):(60+12*psi**2)*f,(2,3):6*psi**2*f*L,(3,3):(5+3*psi**2)*f*L2}
print("ksig int w'w':", [sp.simplify(Kg[i,j].subs(sub)-v) for (i,j),v in code_g.items()])
Mm = (Nw.T*Nw).applyfunc(I)*mu
fac=mu*L/840
code_m={(0,0):fac*(280+28*psi+4*psi**2),(0,1):-fac*L*(35+7*psi+2*psi**2),(0,2):fac*(140-28*psi-4*psi**2),(0,3):fac*L*(35-7*psi-2*psi**2),
 (1,1):fac*L2*(7+psi**2),(1,2):-fac*L*(35-7*psi-2*psi**2),(1,3):-fac*L2*(7-psi**2),(2,2):fac*(280+28*psi+4*psi**2),(2,3):fac*L*(35+7*psi+2*psi**2),(3,3):fac*L2*(7+psi**2)}
print("Masse int mu w w:", [sp.simplify(Mm[i,j].subs(sub)-v) for (i,j),v in code_m.items()])
print("Masse exakt (1,1):", sp.factor(Mm[1,1].subs(sub)))
print("Masse exakt (0,0):", sp.factor(Mm[0,0].subs(sub)))
