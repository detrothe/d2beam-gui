import { msg } from '@lit/localize';
import { alertdialog } from "./rechnen";



export function info_Materialeigenschaften() {

    const question_Text = msg('Die Option `nichtlinear` ist zu wählen, wenn das System Fachwerkstäbe enthält, die nur Zug- oder Druckkräfte übertragen können. Die Berechnung erfolgt dann iterativ.');

    alertdialog(msg('ok'), question_Text);

}


export function info_Eigenwertberechnung() {

    let txt1 = msg('Die simultane Vektoriteration konvergiert sehr langsam, aber meist erfolgreich. Der Startvektor wird durch Zufallszahlen zu Beginn jeder neuen Berechnung bestimmt. Deshalb kann eine erneute Berechnung nach einer erfolglosen Berechnung zum Erfolg führen.');
    let txt2 = msg('Die QR Methode aus der GNU Bibliothek konvergiert sehr schnell, wenn sie konvergiert.');
    let txt3 = msg('Der ARPACK (ARnoldi PACKage) Eigenwertlöser ist für die Berechnung einiger Eigenwerte und -vektoren großer Systeme entwickelt worden. Er konvergiert schnell, auch bei mehreren gesuchten Eigenwerten.');

    let question_Text =  txt1 + "<br>" + txt2 + "<br>" + txt3;

    alertdialog(msg('ok'), question_Text);

}