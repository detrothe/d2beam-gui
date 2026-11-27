# Erzeugt die Testmodelle (.d2beam, Version 6) im Ordner modelle/.
# Aufruf: python3 modelle.py
# Die Sollwerte stehen in pruefen.py.
import json, os
os.makedirs(os.path.join(os.path.dirname(os.path.abspath(__file__)), "modelle"), exist_ok=True)
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), "modelle"))
QS = ["t", "mat-1", 30000, 160000, 1200, 40, 30, 1, 0, 0, 0.3, 20, 1e-05, 0, 0, 0, 0, 0, 1]   # EI=48000, EA=3.6e6, schubstarr

def basis(name, th2=False, nlf=1, kombis=None):
    return {"created_by": "d2beam-gui", "version": 6, "system": 0, "dateiname": name,
            "nloadcases": nlf, "ncombinations": len(kombis or []), "nquerschnittsets": 1, "nelteilungen": 10,
            "einheit_kraft": "kN", "einheit_bemassung": "m", "n_iter": 20, "THIIO_flag": "1" if th2 else "0",
            "matprop_flag": "0", "maxU_node_ID": "", "maxU_dir": "1", "maxU_schief": "0", "neigv": 0 if not th2 else 1,
            "P_delta": "false", "ausgabe_SG": "true", "epsDisp_tol": "1e-9", "epsForce_tol": "1e-12", "stadyn": "0",
            "dyn_neigv": 1, "eig_solver": "2", "niter_neigv": "500", "freetxt": "", "max_Lastfall": nlf,
            "raster_dx": 1, "raster_dz": 1, "raster_offset_x": 0, "raster_offset_z": 0, "raster_xmin": -1,
            "raster_xmax": 15, "raster_zmin": -10, "raster_zmax": 10, "fangweite_cursor": 20, "maxBettung": 0,
            "minMass": "0.0", "loadcases": [[""] for _ in range(nlf)], "combination": kombis or [],
            "qsclassname": ["QuerschnittRechteck"], "qswerte": [QS], "cadNodes": [], "elements": [],
            "max_value_lasten": [{"eload": 0} for _ in range(nlf)]}

class M:
    def __init__(self, name, **kw):
        self.d = basis(name, **kw); self.seq = 0
    def s(self):
        self.seq += 1; return self.seq
    def knoten(self, x, z):
        i = len(self.d["cadNodes"])
        self.d["cadNodes"].append({"qname": "", "isActive": True, "ID": i + 1, "x": x, "z": z, "nel": 0,
                                   "index_FE": -1, "offset_Px": 0, "offset_Pz": 0, "offset_My": 0})
        return i
    def stab(self, i1, i2, aL=0, aR=0, gelenk=(0,)*6, nTeil=1, k0=0):
        e = {"seq": self.s(), "qname": "", "className": "TCAD_Stab", "isActive": True, "isSelected": False,
             "multiSelected": False, "elTyp": 2, "index1": i1, "two_obj": None, "elNo": 1, "stabTyp": 0,
             "index2": i2, "name_querschnitt": "t", "nGelenke": sum(1 for g in gelenk if g), "gelenk": list(gelenk),
             "sinus": 0, "cosinus": 1, "alpha": 0, "aL": aL, "aR": aR, "k_0": k0, "nTeil": nTeil, "elast": []}
        self.d["elements"].append(e)
        for i in (i1, i2): self.d["cadNodes"][i]["nel"] += 1
        return e
    def streckenlast(self, st, lf, art, pL, pR):
        st["elast"].append({"seq": self.s(), "className": "TCAD_Streckenlast", "lastfall": lf, "isActive": True,
                            "isSelected": False, "multiSelected": False, "typ": 0, "art": art, "pL": pL, "pR": pR,
                            "xa": 0.0, "xb": -1.0})
    def vorverformung(self, st, lf, w0a, w0m, w0e):
        st["elast"].append({"seq": self.s(), "className": "TCAD_Stabvorverformung", "lastfall": lf, "isActive": True,
                            "isSelected": False, "multiSelected": False, "typ": 5, "w0a": w0a, "w0m": w0m, "w0e": w0e,
                            "eingabeart": 0})
    def lager(self, i, Lorg):
        n = self.d["cadNodes"][i]
        self.d["elements"].append({"seq": self.s(), "qname": "", "className": "TCAD_Lager", "isActive": True,
            "isSelected": False, "multiSelected": False, "elTyp": 4, "index1": i, "two_obj": None, "nel": 0,
            "node": {"x": n["x"], "z": n["z"], "L": [0, 0, 0], "L_org": list(Lorg), "kx": 0, "kz": 0, "kphi": 0,
                     "nel": 0, "is_used": False, "phi": 0, "co": 1, "si": 0, "show_phi": True, "spring_index": -1}})
        n["nel"] += 1
    def knotenlast(self, i, lf, Px, Pz, My=0):
        self.d["elements"].append({"seq": self.s(), "qname": "", "className": "TCAD_Knotenlast", "isActive": True,
            "isSelected": False, "multiSelected": False, "elTyp": 3, "index1": i, "two_obj": None,
            "knlast": {"node": i, "lf": lf, "Px": Px, "Pz": Pz, "Px_org": Px, "Pz_org": Pz, "p": [Px, Pz, My], "alpha": 0}})
        self.d["cadNodes"][i]["nel"] += 1
    def knotenverformung(self, i, lf, ux="", uz="", phi=""):
        self.d["elements"].append({"seq": self.s(), "qname": "", "className": "TCAD_Knotenverformung", "isActive": True,
            "isSelected": False, "multiSelected": False, "elTyp": 12, "index1": i, "two_obj": None,
            "nodeDisp": {"node": i, "lf": lf, "dispx0": ux, "dispz0": uz, "phi0": phi}})
        self.d["cadNodes"][i]["nel"] += 1
    def save(self, f):
        json.dump(self.d, open(f, "w"), indent=1)

# T1: Längslast trapezförmig (Art 3, global x längs Stab), beidseitig in x gehalten
m = M("t1"); a = m.knoten(0, 0); b = m.knoten(4, 0); st = m.stab(a, b)
m.streckenlast(st, 1, 3, 0.0, 10000.0); m.lager(a, (1, 1, 0)); m.lager(b, (1, 1, 0)); m.save("t1_laengslast.d2beam")

# T2: schräger Stab 45°, starres Ende links 1 m, Last Art 4 (global x, Projektion)
m = M("t2"); a = m.knoten(0, 0); b = m.knoten(3, 3); st = m.stab(a, b, aL=1.0)
m.streckenlast(st, 1, 4, 10.0, 10.0); m.lager(a, (1, 1, 1)); m.lager(b, (1, 1, 0)); m.save("t2_projektion_x.d2beam")

# T3: Th. II. O., Kombination 2*LF1 + 2*LF2; LF1 Art 3 (x längs), LF2 Art 0 (quer)
m = M("t3", th2=True, nlf=2, kombis=[["K1", "2", "2"]]); a = m.knoten(0, 0); b = m.knoten(4, 0); st = m.stab(a, b)
m.streckenlast(st, 1, 3, 10.0, 10.0); m.streckenlast(st, 2, 0, 10.0, 10.0)
m.lager(a, (1, 1, 0)); m.lager(b, (0, 1, 0)); m.save("t3_th2_faktor.d2beam")

# T4: Knotenverformung (Drehung 5 mrad) an Einspannung mit starrem Ende 1 m, rechts gelenkig
m = M("t4"); a = m.knoten(0, 0); b = m.knoten(5, 0); st = m.stab(a, b, aL=1.0)
m.lager(a, (1, 1, 1)); m.lager(b, (0, 1, 0)); m.knotenverformung(a, 1, phi="5"); m.save("t4_knotenverf_starr.d2beam")

# T5: Knotenverformung (Drehung 5 mrad) an Einspannung, Momentengelenk am Stabanfang, rechts gelenkig
m = M("t5"); a = m.knoten(0, 0); b = m.knoten(5, 0); st = m.stab(a, b, gelenk=(0, 0, 1, 0, 0, 0))
m.lager(a, (1, 1, 1)); m.lager(b, (0, 1, 0)); m.knotenverformung(a, 1, phi="5"); m.save("t5_knotenverf_gelenk.d2beam")

# T6: Th. II. O., gelenkige Stütze (waagerecht gezeichnet) mit Druck 1000 kN und Vorkrümmung Stich 20 mm, nTeil=4
for n in (1, 4):
    m = M("t6", th2=True, nlf=1, kombis=[["K1", "1"]]); a = m.knoten(0, 0); b = m.knoten(5, 0); st = m.stab(a, b, nTeil=n)
    m.vorverformung(st, 1, 0.0, 20.0, 0.0); m.knotenlast(b, 1, -1000.0, 0.0)
    m.lager(a, (1, 1, 0)); m.lager(b, (0, 1, 0)); m.save(f"t6_vorverformung_n{n}.d2beam")

# T7/T8: Stütze L = 20 m, Druck 300 kN, Vorkrümmung Stich 50 mm, 2 bzw. 8 Elemente
m = M("t7", th2=True, nlf=1, kombis=[["K1", "1"]]); a = m.knoten(0, 0); b = m.knoten(20, 0); st = m.stab(a, b, nTeil=2)
m.vorverformung(st, 1, 0.0, 50.0, 0.0); m.knotenlast(b, 1, -300.0, 0.0)
m.lager(a, (1, 1, 0)); m.lager(b, (0, 1, 0)); m.save("t7_vorverformung_L20_n2.d2beam")
m.d["elements"][0]["nTeil"] = 8; m.save("t8_vorverformung_L20_n8.d2beam")

# T9: Knickeigenwerte mit GSL (eig_solver 0) und ARPACK (2), neigv = 3, dyn_neigv = 1
m = M("t9", th2=True, nlf=1, kombis=[["K1", "1"]]); a = m.knoten(0, 0); b = m.knoten(5, 0); st = m.stab(a, b, nTeil=8)
m.knotenlast(b, 1, -1000.0, 0.0); m.lager(a, (1, 1, 0)); m.lager(b, (0, 1, 0))
m.d["eig_solver"] = "0"; m.d["neigv"] = 3; m.d["dyn_neigv"] = 1; m.save("t9_knicken_gsl.d2beam")
m.d["eig_solver"] = "2"; m.save("t9b_knicken_arpack.d2beam")

# T10: Eigenfrequenzen Einfeldträger (h = 1 m, b = 0,3 m, wichte 25), 16 Elemente, ohne/mit Drehträgheit
QS10 = ["d", "mat-1", 30000, 2500000, 3000, 100, 30, 1, 25, 0, 0.3, 50, 1e-05, 0, 0, 0, 0, 0, 1]
for dm in ("false", "true"):
    m = M("t10", nlf=1); m.d["qswerte"] = [QS10]; m.d["stadyn"] = "1"; m.d["dyn_neigv"] = 4; m.d["drehmasse"] = dm
    a = m.knoten(0, 0); b = m.knoten(5, 0); st = m.stab(a, b, nTeil=16); st["name_querschnitt"] = "d"
    m.lager(a, (1, 1, 0)); m.lager(b, (0, 1, 0))
    m.save(f"t10{'b' if dm == 'true' else 'a'}_dynamik_drehmasse_{dm}.d2beam")
print("Modelle geschrieben")
