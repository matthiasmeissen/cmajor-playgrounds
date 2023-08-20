
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
        this.sequence = [
            {note: 60, velocity: 120, duration: 400},
            {note: 62, velocity: 120, duration: 1200},
            {note: 64, velocity: 120, duration: 800},
            {note: 65, velocity: 120, duration: 200}
        ];
        this.currentNoteIndex = 0;
    }

    compileSequence() {
        // Get input value
        let input = this.querySelector('#sequenceInput').value;

        // Transform the input into the desired format
        let lines = input.split(',\n');
        let sequence = [];

        for(let line of lines) {
            let [note, velocity, duration] = line.match(/\d+/g).map(Number);
            sequence.push({ note, velocity, duration });
        }

        // Update the sequence of the web component
        this.sequence = sequence;
    }

    sendMIDINote(note, velocity, channel = 0) {
        const status = 0x90 + channel; // Note On for channel
        const midiMessage = (status << 16) | (note << 8) | velocity;
        this.patchConnection.sendMIDIInputEvent("midiIn", midiMessage);
        this.patchConnection.sendEventOrValue("gainParam", velocity / 127);
    }
    
    sendMIDINoteOff(note, channel = 0) {
        const status = 0x80 + channel; // Note Off for channel
        const midiMessage = (status << 16) | (note << 8);
        this.patchConnection.sendMIDIInputEvent("midiIn", midiMessage);
    }

    playSequence() {
        if (this.currentNoteIndex < this.sequence.length) {
            const noteEvent = this.sequence[this.currentNoteIndex];
    
            this.sendMIDINote(noteEvent.note, noteEvent.velocity);
    
            setTimeout(() => {
                this.sendMIDINoteOff(noteEvent.note);
                this.currentNoteIndex++;
                
                // If it's the end of the sequence, reset index to start over
                if (this.currentNoteIndex >= this.sequence.length) {
                    this.currentNoteIndex = 0;
                }
    
                this.playSequence(); // Continue playing, either the next note or starting over.
            }, noteEvent.duration);
        }
    }

    connectedCallback() {
        // Connecting elements by using the same name as the endpoint in the patch
        // Add Note Button
        const midiSendButton = this.querySelector("#midiIn");
        midiSendButton.onmousedown = () => this.patchConnection.sendMIDIInputEvent(midiSendButton.id, 9452644); // Note On
        midiSendButton.onmouseup = () => this.patchConnection.sendMIDIInputEvent(midiSendButton.id, 8404032); // Note Off

        this.querySelector("#compileButton").addEventListener('click', () => this.compileSequence());

        this.playSequence();
    }

    getHTML() {
        return `
        <style>
            body {
                margin: 0;
                font-family: sans-serif;
            }
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

            button {
                font-family: sans-serif;
                font-size: 16px;
                width: fit-content;
                padding: 10px;
                background: hsl(0deg, 0%, 20%);
                color: hsl(0deg, 0%, 90%);
            }

            textarea {
                width: 100%;
                font-family: 'Courier New', monospace;
                font-size: 20px;
                margin-top: 10px;
            }

            .param {
                display: inline-block;
                margin: 10px;
                width: 300px;
            }
        </style>

        <div class="controls">
          <p>Your GUI goes here!</p>
          <textarea id="sequenceInput" rows="10" cols="30">
(60, 120, 400),
(62, 120, 1200),
(64, 120, 800),
(65, 120, 200)
</textarea>
          <button id="compileButton">Compile</button>
          <button id="midiIn">Send Note</button>
        </div>`;
    }
}

window.customElements.define("playground05-view", playground05_View);

export default function createPatchView(patchConnection) {
    return new playground05_View(patchConnection);
}
