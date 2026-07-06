let selectedSlot = null;

const defaultSliderValues = {
    volume: 50,
    pitch: 50,
    tempo: 100
};

const slotSliderState = new Map();

function saveSliderState(slot) {
    slotSliderState.set(slot, {
        volume: document.getElementById("volumeSlider")?.value ?? defaultSliderValues.volume,
        pitch: document.getElementById("pitchSlider")?.value ?? defaultSliderValues.pitch,
        tempo: document.getElementById("tempoSlider")?.value ?? defaultSliderValues.tempo
    });
}

function restoreSliderState(slot) {
    const state = slotSliderState.get(slot);
    const volumeSlider = document.getElementById("volumeSlider");
    const pitchSlider = document.getElementById("pitchSlider");
    const tempoSlider = document.getElementById("tempoSlider");

    if (!state) {
        if (volumeSlider) volumeSlider.value = defaultSliderValues.volume;
        if (pitchSlider) pitchSlider.value = defaultSliderValues.pitch;
        if (tempoSlider) tempoSlider.value = defaultSliderValues.tempo;
        return;
    }

    if (volumeSlider) volumeSlider.value = state.volume;
    if (pitchSlider) pitchSlider.value = state.pitch;
    if (tempoSlider) tempoSlider.value = state.tempo;
}

function selectSlot(slot) {
    if (selectedSlot && selectedSlot !== slot) {
        saveSliderState(selectedSlot);
    }

    // Remove previous selection
    document.querySelectorAll(".slot").forEach(s => {
        s.classList.remove("selected");
    });

    // Remember selected slot
    selectedSlot = slot;

    // Highlight it
    slot.classList.add("selected");

    restoreSliderState(slot);
}

function deleteSelectedSound() {
    if (!selectedSlot) return;

    if (selectedSlot.tone) {
        selectedSlot.tone.player?.dispose();
        selectedSlot.tone.pitchNode?.dispose();
        selectedSlot.tone.volumeNode?.dispose();
    }

    selectedSlot.innerHTML = "";
    selectedSlot.tone = null;
    selectedSlot.classList.remove("selected");

    saveSliderState(selectedSlot);
    restoreSliderState(selectedSlot);

    selectedSlot = null;
}

const deleteButton = document.getElementById("deleteButton");
if (deleteButton) {
    deleteButton.addEventListener("click", deleteSelectedSound);
}

const toggleHeatmapButton = document.getElementById("toggleHeatmapButton");
const mapHeat = document.getElementById("mapHeat");
let heatmapVisible = false;

function toggleHeatmap() {
    if (!mapHeat || !toggleHeatmapButton) return;

    heatmapVisible = !heatmapVisible;
    mapHeat.classList.toggle("visible", heatmapVisible);
    toggleHeatmapButton.textContent = heatmapVisible ? "hide heatmap" : "toggle heatmap";
}

if (toggleHeatmapButton) {
    toggleHeatmapButton.addEventListener("click", toggleHeatmap);
}

function clearAllSounds() {
    document.querySelectorAll(".slot").forEach(slot => {
        if (slot.tone) {
            slot.tone.player?.dispose();
            slot.tone.pitchNode?.dispose();
            slot.tone.volumeNode?.dispose();
        }

        slot.innerHTML = "";
        slot.tone = null;
        slot.classList.remove("selected");
    });

    selectedSlot = null;
    restoreSliderState(null);
}

const clearAllButton = document.getElementById("clearAllButton");
if (clearAllButton) {
    clearAllButton.addEventListener("click", clearAllSounds);
}

//volume
const volumeSlider = document.getElementById("volumeSlider");

volumeSlider.addEventListener("input", () => {

    if (!selectedSlot) return;
    if (!selectedSlot.tone) return;

    const volumeNode = selectedSlot.tone.volumeNode;
    if (!volumeNode) return;

    const t = Number(volumeSlider.value) / 100;

     // map 0–100 → -30 dB to +12 dB
    const db = -30 + (t * 42);

    volumeNode.volume.value = db;
});

// pitch
const pitchSlider = document.getElementById("pitchSlider");

if (pitchSlider) {
    pitchSlider.addEventListener("input", () => {
        if (!selectedSlot) return;
        if (!selectedSlot.tone || !selectedSlot.tone.pitchNode) return;

        // Map 0–100 → -12 to +12 semitones
        const t = Number(pitchSlider.value) / 100;
        const pitch = -12 + (t * 24);

        selectedSlot.tone.pitchNode.pitch = pitch;
    });
}

//tempo 
const tempoSlider = document.getElementById("tempoSlider");

tempoSlider.addEventListener("input", () => {

    if (!selectedSlot) return;
    if (!selectedSlot.tone || !selectedSlot.tone.player) return;

    const speed = Number(tempoSlider.value) / 100;

    selectedSlot.tone.player.playbackRate = speed;
});