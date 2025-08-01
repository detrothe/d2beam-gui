import { alertdialog } from "./rechnen";



export function info_Materialeigenschaften() {

    const question_Text = "Die Option 'nichtlinear' ist zu wählen, wenn das System Fachwerkstäbe enthält, " +
        "die nur Zug- oder Druckkräfte übertragen können. Die Berechnung erfolgt dann iterativ."

    alertdialog('ok', question_Text);

}


export function info_Eigenwertberechnung() {

    const question_Text = "Die simultane Vektoriteration konvergiert sehr langsam, aber meist erfolgreich. Der Startvektor wird durch Zufallszahlen zu Beginn " +
    "jeder neuen Berechnung bestimmt. Deshalb kann eine erneute Berechnung nach einer erfolglosen Berechnung zum Erfolg führen." +
    "Die QR Methode aus der GNU Bibliothek konvergiert sehr schnell, wenn sie konvergiert."

    alertdialog('ok', question_Text);

}