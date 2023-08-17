/*
    This simple web component just manually creates a set of plain sliders for the
    known parameters, and uses some listeners to connect them to the patch.
*/

class playground03_View extends HTMLElement {
    constructor(patchConnection) {
        super();
        this.patchConnection = patchConnection;
        this.classList = "main-view-element";
        this.innerHTML = this.getHTML();
    }

    connectedCallback() {
        this.paramListener = (event) => {
            // Each of our sliders has the same IDs as an endpoint, so we can find
            // the HTML element from the endpointID that has changed:
            const slider = this.querySelector("#" + event.endpointID);

            if (slider)
                slider.value = event.value;
        };

        // Attach a parameter listener that will be triggered when any param is moved
        this.patchConnection.addAllParameterListener(this.paramListener);

        for (const param of this.querySelectorAll(".param")) {
            // When one of our sliders is moved, this will send the new value to the patch.
            param.oninput = () => this.patchConnection.sendEventOrValue(param.id, param.value);

            // for each slider, request an initial update, to make sure it shows the right value
            this.patchConnection.requestParameterValue(param.id);
        }
    }

    disconnectedCallback() {
        // when our element goes offscreen, we should remove any listeners
        // from the PatchConnection (which may be shared with other clients)
        this.patchConnection.removeAllParameterListener(this.paramListener);
    }

    getHTML() {
        return `
        <style>
            .main-view-element {
                background: #bcb;
                display: block;
                width: 100%;
                height: 100%;
                padding: 10px;
                overflow: auto;
            }

            .param {
                display: inline-block;
                margin: 10px;
                width: 300px;
            }
        </style>

        <div id="controls">
          <p>Your GUI goes here!</p>
          <input type="range" class="param" id="frequencyIn" min="5" max="1000">Frequency</input>
          <input type="range" class="param" id="frequency" min="5" max="1000" value="200">Filter Cutoff</input>
          <input type="range" class="param" id="q" min="0" max="100" value="1">Resonance</input>
        </div>`;
    }
}

window.customElements.define("playground03-view", playground03_View);

/* This is the function that a host (the command line patch player, or a Cmajor plugin
   loader, or our VScode extension, etc) will call in order to create a view for your patch.

   Ultimately, a DOM element must be returned to the caller for it to append to its document.
   However, this function can be `async` if you need to perform asyncronous tasks, such as
   fetching remote resources for use in the view, before completing.
*/

export default function createPatchView(patchConnection) {
    return new playground03_View(patchConnection);
}
