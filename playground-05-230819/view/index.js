
/*
    This simple web component just manually creates a set of plain sliders for the
    known parameters, and uses some listeners to connect them to the patch.
*/
class playground05_View extends HTMLElement {
    constructor(patchConnection) {
        super();
        this.patchConnection = patchConnection;
        this.classList = "main-view-element";
        this.innerHTML = this.getHTML();
    }

    connectedCallback() {
        // Connecting elements by using the same name as the endpoint in the patch
        // Add Frequency Slider
        const freqSlider = this.querySelector("#frequencyParam")
        freqSlider.oninput = () => this.patchConnection.sendEventOrValue(freqSlider.id, freqSlider.value);

        // Add Note Button
        const midiSendButton = this.querySelector("#midiIn");
        midiSendButton.onmousedown = () => this.patchConnection.sendMIDIInputEvent(midiSendButton.id, 9452644); // Note On
        midiSendButton.onmouseup = () => this.patchConnection.sendMIDIInputEvent(midiSendButton.id, 8404032); // Note Off
    }

    disconnectedCallback() {
        this.patchConnection.removeParameterListener("frequencyParam", this.freqListener);
    }

    getHTML() {
        return `
        <style>
            .main-view-element {
                background: hsl(0deg, 0%, 90%);
                display: block;
                width: 100vw;
                height: 100vh;
                padding: 10px;
                overflow: auto;
            }

            .controls {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .inputType {
                width: 100%;
                padding: 10px;
                border: 1px solid black;
                border-radius: 5px;
                display: flex;
                flex-direction: column;
            }

            button {
                width: fit-content;
                background: hsl(0deg, 0%, 20%);
                color: hsl(0deg, 0%, 90%);
            }

            .param {
                display: inline-block;
                margin: 10px;
                width: 300px;
            }
        </style>

        <div class="controls">
          <p>Your GUI goes here!</p>

          <div class='inputType'>
            <label for="frequencyParam">Frequency</label>
            <input type="range" class="param" id="frequencyParam" min="5" max="1000" />
          </div>

          <button id="midiIn">Send Note</button>
        </div>`;
    }
}

window.customElements.define("playground05-view", playground05_View);

export default function createPatchView(patchConnection) {
    return new playground05_View(patchConnection);
}
