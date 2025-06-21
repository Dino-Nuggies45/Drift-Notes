const noteInput = document.getElementById("noteInput");
const sendBtn = document.getElementById("sendBtn");
const fishBtn = document.getElementById("fishBtn");
const fishedNote = document.getElementById("fishedNote");

if (!localStorage.getItem("driftNotes")){
    localStorage.setItem("driftNotes", JSON.stringify([]));
}

function getNotes(){
    return JSON.parse(localStorage.getItem("driftNotes")) || [];
}

function saveNote(note) {
    const currentNotes = getNotes();
    currentNotes.push(note);
    localStorage.setItem("driftNotes", JSON.stringify(currentNotes));
}

sendBtn.addEventListener("click", () => {
    const note = noteInput.value.trim();
    if (note.length === 0){
        alert("Please write something before sending!")
        return;
    }

    saveNote(note);
    noteInput.value = "";
    alert("Your note has been set adrift the ocean")
});

fishBtn.addEventListener("click", () => {
    const allNotes = getNotes();
    
    if (allNotes.length === 0) {
        fishedNote.textContent = "No notes drifting yet...be the first!";
        return;
    }

    const randomNote = allNotes[Math.floor(Math.random() * allNotes.length)];
    fishedNote.textContent = `"${randomNote}"`;
});