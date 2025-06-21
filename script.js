const noteInput = document.getElementById("noteInput");
const sendBtn = document.getElementById("sendBtn");
const fishBtn = document.getElementById("fishBtn");
const fishedNote = document.getElementById("fishedNote");
const noteType = document.getElementById("noteType");
let fishedIDs = new Set();
let lastFishedNoteId = null;
let reactedNoteIDs = JSON.parse(localStorage.getItem("reactedNotes")) || [];

if (!localStorage.getItem("driftNotes")){
    localStorage.setItem("driftNotes", JSON.stringify([]));
}

function getNotes(){
    return JSON.parse(localStorage.getItem("driftNotes")) || [];
}

function saveNote(noteText, type = "misc") {
    const currentNotes = getNotes();
    const newNote = {
        id: Date.now(),
        text: noteText,
        type: type,
        timestamp: new Date().toISOString(),
        fishcount: 0,
        drift: drift,
        reactions: {
            heart: 0,
            laugh: 0,
            sad: 0
        }
    }
    currentNotes.push(newNote);
    localStorage.setItem("driftNotes", JSON.stringify(currentNotes));
}

sendBtn.addEventListener("click", () => {
    const note = noteInput.value.trim();
    const type = noteType.value;

    if (note.length === 0){
        alert("Please write something before sending!");
        return;
    }

    saveNote(note, type);
    noteInput.value = "";
    alert("Your note has been set adrift the ocean");
});

document.getElementById("resetFish").addEventListener("click", () => {
    fishedIDs.clear();
    fishedNote.textContent = "The sea stirs again...";
});

fishBtn.addEventListener("click", () => {
    const allNotes = getNotes();
    const selectedTypes = Array.from(document.querySelectorAll("#tagFilters input:checked")).map(cb => cb.value)
    const keepAll = document.getElementById("keepNotesToggle").checked;

    const now = new Date();
    const availableNotes = allNotes.filter(n => {
        const noteAge = (now - new Date(n.timestamp)) / (1000 * 60 * 60 * 24);
        return n.drift &&
            selectedTypes.includes(n.type) &&
            !fishedIDs.has(n.id) &&
            (keepAll || (noteAge <= 7 && (n.fishcount || 0) < 5));

    });

    
    if (availableNotes.length === 0) {
        fishedNote.textContent = "You've fished up everything! The sea feels empty...";
        return;
    }



    const randomNote = availableNotes[Math.floor(Math.random() * availableNotes.length)];
    randomNote.fishcount = (randomNote.fishCount || 0) + 1;

    const allUpdatedNotes = allNotes.map(n => n.id === randomNote.id ? randomNote : n);

    fishedIDs.add(randomNote.id);
    fishedNote.innerHTML = `
    <p> "${randomNote.text || '[No message found]'}" </p>
    <p>(${randomNote.type || 'misc'})</p>
    <p style="font-size: 0.9em;"> ❤️ ${randomNote.reactions?.heart || 0}
        😂${randomNote.reactions?.laugh || 0}
        😢${randomNote.reactions?.sad || 0}</p>
    `;

    lastFishedNoteId = randomNote.id;
    document.getElementById("reactionButtons").style.display = 
        reactedNoteIDs.includes(randomNote.id) ? "none": "flex";
});

function cleanExpiredNotes(){
    const keepAll = document.getElementById("keepNotesToggle")?.checked ?? true;
    const now = new Date();

    const validNotes = getNotes().filter(n => {
        const age = (now - new Date(n.timestamp)) / (1000 * 60 * 60 * 24);
        return keepAll || (age <= 7 && (n.fishCount || 0) < 5);
    });

    localStorage.setItem("driftNotes", JSON.stringify(validNotes));
}

window.addEventListener("DOMContentLoaded", cleanExpiredNotes);

function reactToNote(type) {
    if(!lastFishedNoteId) return;

    if (reactedNoteIDs.includes(lastFishedNoteId)){
        alert("You've already reacted to this note.");
        return;
    }

    const allNotes = getNotes();
    const noteIndex = allNotes.findIndex(n => n.id === lastFishedNoteId);
    if (noteIndex === -1) return;

    if(!allNotes[noteIndex].reactions){
        allNotes[noteIndex].reactions = {heart: 0, laugh: 0, sad: 0};
    }

    allNotes[noteIndex].reactions[type] += 1;

    localStorage.setItem("driftNotes", JSON.stringify(allNotes));

    reactedNoteIDs.push(lastFishedNoteId);
    localStorage.setItem("reactedNotes",  JSON.stringify(reactedNoteIDs));
    document.getElementById("reactionButtons").style.display = "none";

    const updateNote = allNotes[noteIndex];
    fishedNote.innerHTML = `
    <p> "${updateNote.text || '[No message found]'}" </p>
    <p>(${updateNote.type || 'misc'})</p>
    <p style="font-size: 0.9em;"> ❤️ ${updateNote.reactions.heart || 0}
        😂${updateNote.reactions.laugh || 0}
        😢${updateNote.reactions.sad || 0}</p>
    `;

}