
export class ConfirmDialog {

    questionText = ''
    trueButtonText = ''
    falseButtonText = ''
    parent: any
    dialog: any
    trueButton: any
    falseButton: any

    constructor({ question_Text, trueButton_Text, falseButton_Text }: any) {
        this.questionText = question_Text || "Are you sure?";
        this.trueButtonText = trueButton_Text || "Yes";
        this.falseButtonText = falseButton_Text || "No";
        this.parent = document.body;

        this.dialog = undefined;
        this.trueButton = undefined;
        this.falseButton = undefined;

        this._createDialog();
        this._appendDialog();
    }

    confirm() {
        return new Promise((resolve, reject) => {
            const somethingWentWrongUponCreation =
                !this.dialog || !this.trueButton || !this.falseButton;
            if (somethingWentWrongUponCreation) {
                reject('Someting went wrong when creating the modal');
                return;
            }

            this.dialog.showModal();
            //this.trueButton.focus();

            this.trueButton.addEventListener("click", () => {
                resolve(true);
                this._destroy();
            });

            this.falseButton.addEventListener("click", () => {
                resolve(false);
                this._destroy();
            });
        });
    }

    _createDialog() {
        this.dialog = document.createElement("dialog");
        this.dialog.classList.add("confirm-dialog");

        const question = document.createElement("div");
        question.textContent = this.questionText;
        question.classList.add("confirm-dialog-question");
        this.dialog.appendChild(question);

        const buttonGroup = document.createElement("div");
        buttonGroup.classList.add("confirm-dialog-button-group");
        this.dialog.appendChild(buttonGroup);

        this.falseButton = document.createElement("button");
        this.falseButton.classList.add(
            "confirm-dialog-button",
            "confirm-dialog-button--false"
        );
        this.falseButton.type = "button";
        this.falseButton.textContent = this.falseButtonText;
        buttonGroup.appendChild(this.falseButton);

        this.trueButton = document.createElement("button");
        this.trueButton.classList.add(
            "confirm-dialog-button",
            "confirm-dialog-button--true"
        );
        this.trueButton.type = "button";
        this.trueButton.textContent = this.trueButtonText;
        buttonGroup.appendChild(this.trueButton);
    }

    _appendDialog() {
        this.parent.appendChild(this.dialog);
    }

    _destroy() {
        this.dialog.close('ok');
        //console.log("dialog",this.parent)
        // while (this.dialog.hasChildNodes()) {  // alte Optionen entfernen
        //     console.log("removing",this.dialog?.lastChild)
        //     // @ts-ignore
        //     this.dialog.removeChild(this.dialog?.lastChild);
        // }

        this.parent.removeChild(this.dialog);
        //console.log("_destroy this", this)
        //delete this;
    }
}

export class AlertDialog {

    questionText = ''
    trueButtonText = ''
    parent: any
    dialog: any
    trueButton: any
    falseButton: any

    constructor({ question_Text, trueButton_Text }: any) {
        this.questionText = question_Text || "Are you sure?";
        this.trueButtonText = trueButton_Text || "ok";
        this.parent = document.body;

        this.dialog = null;
        this.trueButton = undefined;

        this._createDialog();
        this._appendDialog();
    }

    confirm() {
        return new Promise((resolve, reject) => {
            const somethingWentWrongUponCreation =
                !this.dialog || !this.trueButton ;
            if (somethingWentWrongUponCreation) {
                reject('Someting went wrong when creating the modal');
                return;
            }

            this.dialog.showModal();
            //this.trueButton.focus();

            this.trueButton.addEventListener("click", () => {
                resolve(true);
                this._destroy();
            });

        });
    }

    _createDialog() {
        this.dialog = document.createElement("dialog");
        this.dialog.classList.add("confirm-dialog");

        const question = document.createElement("div");
        question.textContent = this.questionText;
        question.classList.add("confirm-dialog-question");
        this.dialog.appendChild(question);

        const buttonGroup = document.createElement("div");
        buttonGroup.classList.add("confirm-dialog-button-group");
        this.dialog.appendChild(buttonGroup);

        this.trueButton = document.createElement("button");
        this.trueButton.classList.add(
            "confirm-dialog-button",
            "confirm-dialog-button--true"
        );
        this.trueButton.type = "button";
        this.trueButton.textContent = this.trueButtonText;
        buttonGroup.appendChild(this.trueButton);
    }

    _appendDialog() {
        this.parent.appendChild(this.dialog);
    }

    _destroy() {
        this.dialog.close('ok');
        //console.log("dialog",this.parent)
        // while (this.dialog.hasChildNodes()) {  // alte Optionen entfernen
        //     console.log("removing",this.dialog?.lastChild)
        //     // @ts-ignore
        //     this.dialog.removeChild(this.dialog?.lastChild);
        // }

        this.parent.removeChild(this.dialog);
        //console.log("_destroy this", this)
        //delete this;
    }
}