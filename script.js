const noteInput = document.getElementById("noteInput");
const sendBtn = document.getElementById("sendBtn");
const fishBtn = document.getElementById("fishBtn");
const fishedNote = document.getElementById("fishedNote");
const noteType = document.getElementById("noteType");
const replyInput = document.getElementById("replyInput");
const submitReplyBtn = document.getElementById("submitReplyBtn");
const repliesList = document.getElementById("repliesList");
const replySection = document.getElementById("replySection");
const reactionButtons = document.getElementById("reactionButtons");

let fishedIDs = new Set();
let lastFishedNoteId = null;
let reactedNoteIDs = JSON.parse(localStorage.getItem("reactedNotes")) || [];
let bookmarkedNotes = JSON.parse(localStorage.getItem("bookmarkedNotes")) || [];

if (!localStorage.getItem("driftNotes")) {
    localStorage.setItem("driftNotes", JSON.stringify([]));
}

function getNotes() {
    return JSON.parse(localStorage.getItem("driftNotes")) || [];
}

function saveNote(noteText, type = "misc", drift = true) {
    const currentNotes = getNotes();
    const visibleAfterInput = document.getElementById("visibleDate").value;
    const visibleAfter = visibleAfterInput ? new Date(visibleAfterInput).toISOString(): null;

    const newNote = {
        id: Date.now(),
        text: noteText,
        type: type,
        timestamp: new Date().toISOString(),
        visibleAfter: visibleAfter,
        fishcount: 0,
        drift: drift,
        reactions: { heart: 0, laugh: 0, sad: 0 },
        replies: []
    };
    currentNotes.push(newNote);
    localStorage.setItem("driftNotes", JSON.stringify(currentNotes));
}

function renderNote(note, readOnly = false) {
    fishedNote.innerHTML = `
        <p>"${note.text}"</p>
        <p>(${note.type})</p>
        <p style="font-size: 0.8 em;">Time ${new Date(note.timestamp).toLocaleString()}</p>  
        <p style="font-size: 0.9em;">
            ❤️ ${note.reactions?.heart || 0}
            😂 ${note.reactions?.laugh || 0}
            😢 ${note.reactions?.sad || 0} 
        </p>
        ${!readOnly ? '<button id="bookmarkBtn">Bookmark</button>' : ''}
    `;

  
    if (!readOnly && !reactedNoteIDs.includes(note.id)) {
        reactionButtons.style.display = "flex";
    } else {
        reactionButtons.style.display = "none";
    }

    if (!readOnly) {
        replySection.style.display = "block";
        renderReplies(note.replies || []);

        
        const oldBookmarkBtn = document.getElementById("bookmarkBtn");
        if (oldBookmarkBtn) {
            oldBookmarkBtn.onclick = null;
            oldBookmarkBtn.addEventListener("click", () => {
                if (!bookmarkedNotes.includes(note.id)) {
                    bookmarkedNotes.push(note.id);
                    localStorage.setItem("bookmarkedNotes", JSON.stringify(bookmarkedNotes));
                    alert("Note Bookmarked");
                } else {
                    alert("Already bookmarked");
                }
                renderNote(note);
            });
        }
    } else {
        replySection.style.display = "none";
    }
}

function renderReplies(replies = []) {
    repliesList.innerHTML = "";
    replies.forEach((r, index) => {
        const div = document.createElement("div");
        div.innerHTML = `
            <p>${r.text}</p>
            <button class="deleteReplyBtn" data-index="${index}">Delete</button>
            <hr />
        `;
        repliesList.appendChild(div);
    });

    const deleteButtons = repliesList.querySelectorAll(".deleteReplyBtn");
    deleteButtons.forEach(btn => {
        btn.onclick = () => {
            const idx = parseInt(btn.getAttribute("data-index"));
            deleteReply(idx);
        };
    });

    repliesList.scrollIntoView({ behavior: "smooth", block: "start" });
}

function deleteReply(index) {
    if (!lastFishedNoteId) return;
    const allNotes = getNotes();
    const noteIndex = allNotes.findIndex(n => n.id === lastFishedNoteId);
    if (noteIndex === -1) return;
    allNotes[noteIndex].replies.splice(index, 1);
    localStorage.setItem("driftNotes", JSON.stringify(allNotes));
    renderReplies(allNotes[noteIndex].replies);
}

submitReplyBtn.addEventListener("click", () => {
    const replyText = replyInput.value.trim();
    if (!replyText || !lastFishedNoteId) return;
    const allNotes = getNotes();
    const noteIndex = allNotes.findIndex(n => n.id === lastFishedNoteId);
    if (noteIndex === -1) return;
    allNotes[noteIndex].replies.push({ text: replyText, timestamp: new Date().toISOString() });
    localStorage.setItem("driftNotes", JSON.stringify(allNotes));
    replyInput.value = "";
    renderNote(allNotes[noteIndex]);
});

sendBtn.addEventListener("click", () => {
    const note = noteInput.value.trim();
    const type = noteType.value;
    const drift = document.getElementById("keepNotesToggle").checked;
    if (note.length === 0) {
        alert("Please write something before sending!");
        return;
    }
    saveNote(note, type, drift);
    noteInput.value = "";
    document.getElementById("keepNotesToggle").checked = true;
    alert("Your note has been set adrift the ocean");
});

fishBtn.addEventListener("click", () => {
    const allNotes = getNotes();
    const selectedTypes = Array.from(document.querySelectorAll("#tagFilters input:checked")).map(cb => cb.value);
    const keepAll = document.getElementById("keepNotesToggle").checked;
    const now = new Date();

    const availableNotes = allNotes.filter(n => {
        const noteAge = (now - new Date(n.timestamp)) / (1000 * 60 * 60 * 24);
        const isVisible = !n.visibleAfter || new Date(n.visibleAfter) <= now;

        return isVisible && n.drift && selectedTypes.includes(n.type) &&
                !fishedIDs.has(n.id) && (keepAll || noteAge <= 7 && (n.fishcount || 0) < 5)
  
    });

    if (availableNotes.length === 0) {
        fishedNote.textContent = "You've fished up everything! The sea feels empty...";
        reactionButtons.style.display = "none";
        replySection.style.display = "none";
        return;
    }

    const randomNote = availableNotes[Math.floor(Math.random() * availableNotes.length)];
    randomNote.fishcount = (randomNote.fishcount || 0) + 1;

    fishedIDs.add(randomNote.id);
    lastFishedNoteId = randomNote.id;
    renderNote(randomNote);

   
});


document.getElementById("viewBookmarksBtn").addEventListener("click", () => {
    const allNotes = getNotes();
    const savedNotes = allNotes.filter(n => bookmarkedNotes.includes(n.id));

    if (savedNotes.length === 0) {
        fishedNote.innerHTML = "<p>No bookmarks yet.</p>";
        reactionButtons.style.display = "none";
        replySection.style.display = "none";
        return;
    }

    
    fishedNote.innerHTML = "";

    
    savedNotes.forEach(note => {
        const noteDiv = document.createElement("div");
        noteDiv.classList.add("bookmarked-note");
        noteDiv.style.marginBottom = "1.5em";
        noteDiv.innerHTML = `
            <p>"${note.text}"</p>
            <p>(${note.type})</p>
            <p style="font-size: 0.9em;">
                ❤️ ${note.reactions?.heart || 0} 
                😂 ${note.reactions?.laugh || 0} 
                😢 ${note.reactions?.sad || 0}
            </p>
            <hr />
        `;
        fishedNote.appendChild(noteDiv);
    });

  
    reactionButtons.style.display = "none";
    replySection.style.display = "none";
});

function reactToNote(type) {
    if (!lastFishedNoteId) return;
    if (reactedNoteIDs.includes(lastFishedNoteId)) {
        alert("You've already reacted to this note.");
        return;
    }

    const allNotes = getNotes();
    const noteIndex = allNotes.findIndex(n => n.id === lastFishedNoteId);
    if (noteIndex === -1) return;

    allNotes[noteIndex].reactions[type] += 1;
    reactedNoteIDs.push(lastFishedNoteId);
    localStorage.setItem("driftNotes", JSON.stringify(allNotes));
    localStorage.setItem("reactedNotes", JSON.stringify(reactedNoteIDs));
    reactionButtons.style.display = "none";
    renderNote(allNotes[noteIndex]);
}

document.getElementById("resetFish").addEventListener("click", () => {
    fishedIDs.clear();
    fishedNote.textContent = "The sea stirs again...";
    reactionButtons.style.display = "none";
    replySection.style.display = "none";
});

document.getElementById("clearBookmarksBtn").addEventListener("click", () => {
    localStorage.removeItem("bookmarkedNotes");
    bookmarkedNotes = [];
    fishedNote.innerHTML = "<p>Bookmarks cleared!</p>";
    reactionButtons.style.display = "none";
    replySection.style.display = "none";
});

function cleanExpiredNotes() {
    const keepAll = document.getElementById("keepNotesToggle")?.checked ?? true;
    const now = new Date();
    const validNotes = getNotes().filter(n => {
        const age = (now - new Date(n.timestamp)) / (1000 * 60 * 60 * 24);
        return keepAll || (age <= 7 && (n.fishcount || 0) < 5);
    });
    localStorage.setItem("driftNotes", JSON.stringify(validNotes));
}

window.addEventListener("DOMContentLoaded", () => {
    cleanExpiredNotes();
    displayAnalytics();
    renderLeaderboard();
});
