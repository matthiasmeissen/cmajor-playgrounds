class playground02_View extends HTMLElement {
    constructor(patchConnection) {
        super();
        this.patchConnection = patchConnection;
        this.dragging = false;
        this.circleSize = 40;
        this.boundingBoxMargin = 20;
        this.classList = "main-view-element";
        this.innerHTML = this.generateUI();
    }

    // UI Generation (HTML & CSS)
    generateUI() {
        return `
            ${this.generateStyles()}
            ${this.generateHTML()}
        `;
    }

    generateStyles() {
        return `
            <style>
            .main-view-element {
                background: hsl(0, 0%, 90%);
                width: 100vw;
                height: 100vh;
                position: relative;
                overflow: hidden;
            }
            .controls {
                width: 100%;
                height: 100%;
            }
            .circle {
                width: ${this.circleSize}px;
                height: ${this.circleSize}px;
                border-radius: 50%;
                background-color: blue;
                position: absolute;
                top: 150px;
                left: 150px;
                cursor: grab;
            }
            </style>
        `;
    }

    generateHTML() {
        return `
        <div class="controls">
            <div class="circle" id="circleDiv"></div>
        </div>
        `;
    }

    // Event Handlers & Lifecycle Methods
    connectedCallback() {
        this.circleDiv = this.querySelector('#circleDiv');
        this.addEventListeners();
    }

    addEventListeners() {
        this.circleDiv.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    handleMouseDown(e) {
        this.dragging = true;
        this.offsetX = e.clientX - this.circleDiv.getBoundingClientRect().left;
        this.offsetY = e.clientY - this.circleDiv.getBoundingClientRect().top;
        this.circleDiv.style.cursor = 'grabbing';
    }

    handleMouseMove(e) {
        if (!this.dragging) return;

        const x = e.clientX - this.offsetX;
        const y = e.clientY - this.offsetY;
        
        const maxWidth = this.clientWidth - this.circleSize - this.boundingBoxMargin;
        const maxHeight = this.clientHeight - this.circleSize - this.boundingBoxMargin;
        
        // Clamp values to ensure circle stays within bounds
        const clampedX = Math.max(this.boundingBoxMargin, Math.min(maxWidth, x));
        const clampedY = Math.max(this.boundingBoxMargin, Math.min(maxHeight, y));
        
        this.circleDiv.style.left = clampedX + 'px';
        this.circleDiv.style.top = clampedY + 'px';
        
        // Normalize position and send frequency value
        const normalizedX = clampedX / maxWidth;
        const normalizedY = clampedY / maxHeight;
        this.sendFrequency(normalizedX, normalizedY);
    }

    handleMouseUp() {
        this.dragging = false;
        this.circleDiv.style.cursor = 'grab';
    }

    handleResize() {
        // Ensure circle stays within bounds after resize
        const maxWidth = this.clientWidth - this.circleSize - this.boundingBoxMargin;
        const maxHeight = this.clientHeight - this.circleSize - this.boundingBoxMargin;

        const currentX = parseInt(this.circleDiv.style.left, 10);
        const currentY = parseInt(this.circleDiv.style.top, 10);

        const clampedX = Math.max(this.boundingBoxMargin, Math.min(maxWidth, currentX));
        const clampedY = Math.max(this.boundingBoxMargin, Math.min(maxHeight, currentY));

        this.circleDiv.style.left = clampedX + 'px';
        this.circleDiv.style.top = clampedY + 'px';
    }

    sendFrequency(normalizedValueX, normalizedValueY) {
        const MAX_FREQUENCY = 1000;  // You can adjust this value
        const frequency = normalizedValueX * MAX_FREQUENCY;
        const volume = 1 - normalizedValueY;
        this.patchConnection.sendEventOrValue("frequency", frequency);
        this.patchConnection.sendEventOrValue("volume", volume);
    }
}

// Define custom element & export main function
window.customElements.define("playground02-view", playground02_View);

export default function createPatchView(patchConnection) {
    return new playground02_View(patchConnection);
}
