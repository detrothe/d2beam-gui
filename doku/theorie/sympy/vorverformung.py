# Ersatzlasten aus Stabvorverformung (Parabel): konsistent N * int Nw'^T w0' dx gegen Code (schubstarr)
import sympy as sp, pickle
x,L,eta,Nn = sp.symbols('x L eta N', positive=True)
w0a,w0e,v0m = sp.symbols('w0a w0e v0m')
d = pickle.load(open('ansatz.pkl','rb')); Nw=d['Nw'].subs(eta,0)
w0 = w0a + (w0e-w0a)*x/L + 4*v0m*x/L*(1-x/L)
f_kons = (Nn*sp.integrate(Nw.diff(x).T*sp.Matrix([w0.diff(x)]),(x,0,L))).applyfunc(sp.simplify)
fct=1/(60*L); ks = sp.Matrix([[60*fct+12*fct,-6*fct*L,-(60+12)*fct,-6*fct*L],
                              [-6*fct*L,(5+3)*fct*L**2,6*fct*L,(3-5)*fct*L**2],
                              [-(72)*fct,6*fct*L,72*fct,6*fct*L],
                              [-6*fct*L,(3-5)*fct*L**2,6*fct*L,8*fct*L**2]])   # psi = 1
def v_code():
    v2 = -(w0e - w0a/L); v5 = v2
    return sp.Matrix([w0a, v2-4*v0m/L, w0e, v5+4*v0m/L])
def v_richtig():
    v2 = -(w0e - w0a)/L; v5 = v2
    return sp.Matrix([w0a, v2-4*v0m/L, w0e, v5+4*v0m/L])
print("richtig - konsistent:", (Nn*ks*v_richtig()-f_kons).applyfunc(sp.simplify).T)
print("Code    - konsistent:", (Nn*ks*v_code()-f_kons).applyfunc(sp.simplify).T)
