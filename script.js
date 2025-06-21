const noteInput = document.getElementById("noteInput");
const sendBtn = document.getElementById("sendBtn");
const fishBtn = document.getElementById("fishBtn");
const fishedNote = document.getElementById("fishedNote");
const noteType = document.getElementById("noteType");
let fishedIDs = new Set();
let lastFishedNoteId = null;

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

    const availableNotes = allNotes.filter(n => !fishedIDs.has(n.id));
    
    if (availableNotes.length === 0) {
        fishedNote.textContent = "You've fished up everything! The sea feels empty...";
        return;
    }

    const randomNote = availableNotes[Math.floor(Math.random() * availableNotes.length)];
    fishedIDs.add(randomNote.id);
    fishedNote.innerHTML = `
    <p> "${randomNote.text || '[No message found]'}" </p>
    <p>(${randomNote.type || 'misc'})</p>
    <p style="font-size: 0.9em;"> ❤️ ${randomNote.reactions?.heart || 0}
        😂${randomNote.reactions?.heart || 0}
        😢${randomNote.reactions?.heart || 0}
    `;

    lastFishedNoteId = randomNote.id;
    document.getElementById("reactionButtons").style.display = "flex";
});

