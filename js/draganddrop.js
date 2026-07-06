const slots = document.querySelectorAll(".slot");

//remembers which image is being dragged
let draggedDot = null;
let soundsData = []; //json file imported
let playSounds = {};

// Load sounds data and render dots
async function loadSoundsAndRenderDots() {
    try {
        const response = await fetch("content.json");
        soundsData = await response.json();
        renderDotsFromJSON();
        setupDotEventListeners();
    } catch (error) {
        console.error("ERROR loading sounds:", error);
    }
}

// Render dots dynamically from JSON
function renderDotsFromJSON() {
    const dotsContainer = document.getElementById("dotsContainer");
    
    soundsData.forEach(sound => {
        const dot = document.createElement("div");
        dot.classList.add("dot");
        dot.setAttribute("data-id", sound.id);
        dot.setAttribute("draggable", "true");
        
        if (sound.position) {
            dot.style.left = sound.position.left;
            dot.style.top = sound.position.top;
        }
        
    const popup = document.createElement("div");
    popup.classList.add("popup");

    const img = document.createElement("img");
    img.src = sound.img;
    img.alt = sound.name;

    const title = document.createElement("p");
    title.textContent = sound.name;

    popup.appendChild(img);
    popup.appendChild(title);

    dot.appendChild(popup);
    dotsContainer.appendChild(dot);
    });
}

// Set up drag/drop event listeners for dots
function setupDotEventListeners() {
    const dots = document.querySelectorAll(".dot");
    
    dots.forEach(dot => {
        dot.addEventListener("dragstart", (e) => {
            draggedDot = e.currentTarget;
            e.dataTransfer.setData("text/plain", dot.dataset.id);
        });

        dot.addEventListener("dragend", (e) => {
            draggedDot = null;
        });
    });
}

loadSoundsAndRenderDots(); //does the actual function

//start tone.js
document.addEventListener("click", async () => {
    await Tone.start();
    console.log("Audio context started");
}, { once: true });

//loop through each slot
slots.forEach(slot => {
    slot.addEventListener("dragover", (e) => {
        e.preventDefault(); //prevents browser's natural behaviors from acting
    });

    slot.addEventListener("drop", (e) => {
        e.preventDefault();

        if (!draggedDot) return; //nothing is being dragged --> draggedDot = null

        const dotId = draggedDot.dataset.id; //get dot ID

        // Find the sound data for this dot
        const soundData = soundsData.find(s => s.id === dotId);

        if (!soundData) return;

        // create volume node
        const volumeNode = new Tone.Volume(0);

        // pitch node
        const pitchNode = new Tone.PitchShift(0);

        // create player and connect chain: player -> pitch -> volume -> destination
        const player = new Tone.Player(soundData.sound, () => {
            player.loop = true;
            player.connect(pitchNode);
            pitchNode.connect(volumeNode);
            volumeNode.toDestination();
            player.start();
        });

        // store on slot (include pitch node for pitch control)
        slot.tone = {
            player,
            pitchNode,
            volumeNode
        };


        // Create an image element
        const img = document.createElement("img");
        img.src = soundData.img;
        img.alt = soundData.name;
        img.classList.add("grid-image", "spin-in");

        img.addEventListener("click", () => {
            selectSlot(slot);
        });

        slot.innerHTML = "";
        slot.appendChild(img);

        draggedDot = null;
    });
});