const noteInput = document.getElementById("noteInput");
const sendBtn = document.getElementById("sendBtn");
const fishBtn = document.getElementById("fishBtn");
const fishedNote = document.getElementById("fishedNote");
const noteType = document.getElementById("noteType");

const noteFolded = document.getElementById("noteFolded");
const bottle = document.getElementById("bottle");
const oceanMessage = document.getElementById("oceanMessage");
const fadeOverlay = document.getElementById("fadeOverlay");

let fishedIDs = new Set();
let lastSetNote = null

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
        timestamp: new Date().toISOString()
    }
    currentNotes.push(newNote);
    localStorage.setItem("driftNotes", JSON.stringify(currentNotes));
    lastSetNote = newNote;
}

sendBtn.addEventListener("click", () => {
    const note = noteInput.value.trim();
    const type = noteType.value;

    if (note.length === 0){
        alert("Please write something before sending!")
        return;
    }

    saveNote(note, type);
    noteInput.value = "";
    playSendNoteAnimation(lastSetNote.text)
});

document.getElementById("resetFish").addEventListener("click", () => {
    fishedIDs.clear();
    fishedNote.textContent = "The sea stirs again...";
    hideAllAnimations();
})

fishBtn.addEventListener("click", () => {
    const allNotes = getNotes();

    const availableNotes = allNotes.filter(n => !fishedIDs.has(n.id));
    
    if (availableNotes.length === 0) {
        fishedNote.textContent = "You've fished up everything! The sea feels empty...";
        return;
    }

    const randomNote = availableNotes[Math.floor(Math.random() * availableNotes.length)];
    fishedIDs.add(randomNote.id);
    fishedNote.textContent = `"${randomNote.text || '[No message found]'}" - (${randomNote.type || 'misc'})`;
    playFishBottleAnimation(randomNote.text)
});

function playSendNoteAnimation(text){
    noteFolded.textContent = text;
    noteFolded.style.opacity = "1";
    noteFolded.style.transform = "rotateY(0deg) scale(1) translateX(0) translateY(0)";
    noteFolded.classList.remove("foldedNoteAnim")

    void noteFolded.offsetWidth;

    noteFolded.classList.add("foldNoteAnim");

    setTimeout(() => {
        noteFolded.style.opacity = "0";
    }, 2000);

    alert("Your note has been set adrift the ocean")
}

function playFishBottleAnimation(noteText) {
    oceanMessage.style.opacity = "1";
    
    setTimeout(() => {
        oceanMessage.style.opacity = "0";
        bottle.style.opacity = "1";

        setTimeout(() => {
            fadeToBlackAndBack(() => {
                showNoteOnFoldedPaper(noteText);
            });
        }, 3000);
    }, 2000);
}

function fadeToBlackAndBack(callback) {
    setTimeout(() => {
        fadeOverlay.style.opacity = "0";

        setTimeout(() => {
            fadeOverlay.style.pointerEvents = "none";
            if (callback) callback();
        }, 1000);
    }, 1000);
}

function showNoteOnFoldedPaper(text) {
    bottle.style.opacity = "0";

    noteFolded.textContent = text;
    noteFolded.style.opacity = "1";
    noteFolded.style.transform = "scale(1) rotateY(0deg) translateX(0) translateY(0)";
    fishedNote.textContent = `"${text}"`
}

function hideAllAnimations() {
    noteFolded.style.opacity = "0";
    bottle.style.opacity = "0";
    oceanMessage.style.opacity = "0";
    fadeOverlay.style.opacity = "0";
    fadeOverlay.style.pointerEvents = "none";
}