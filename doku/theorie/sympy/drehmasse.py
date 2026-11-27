# Drehträgheitsmatrix rho*I * int Nphi^T Nphi dx mit den Timoshenko-Ansatzfunktionen
import sympy as sp, pickle
x,L,eta,psi,J = sp.symbols('x L eta psi J', positive=True)   # J = rho*I [t m]
d = pickle.load(open('ansatz.pkl','rb')); Np = d['Np']
Mr = (J*(Np.T*Np).applyfunc(lambda e: sp.integrate(sp.expand(e),(x,0,L)))).subs(eta,(1/psi-1)*L**2/12)
Mr = Mr.applyfunc(lambda e: sp.factor(sp.simplify(e)))
for i in range(4):
    for j in range(i,4):
        print(f"m_rot[{i}][{j}] =", sp.collect(sp.expand(sp.simplify(Mr[i,j]*30*L/J)),psi), " * J/(30 L)")
print("schubstarr:", (Mr.subs(psi,1)*30*L/J).applyfunc(sp.simplify))
