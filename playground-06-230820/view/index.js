
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

    sendMIDINote(note, velocity, channel = 0) {
        const status = 0x90 + channel; // Note On for channel
        const midiMessage = (status << 16) | (note << 8) | velocity;
        this.patchConnection.sendMIDIInputEvent("midiIn", midiMessage);
        console.log(`Sending Note On: Note=${note}, Velocity=${velocity}`);
    }
    
    sendMIDINoteOff(note, channel = 0) {
        const status = 0x80 + channel; // Note Off for channel
        const midiMessage = (status << 16) | (note << 8);
        this.patchConnection.sendMIDIInputEvent("midiIn", midiMessage);
        console.log(`Sending Note Off: Note=${note}`);
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

        this.playSequence();
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
          <button id="midiIn">Send Note</button>
        </div>`;
    }
}

window.customElements.define("playground05-view", playground05_View);

export default function createPatchView(patchConnection) {
    return new playground05_View(patchConnection);
}
