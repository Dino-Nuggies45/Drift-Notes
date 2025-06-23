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
    const newNote = {
        id: Date.now(),
        text: noteText,
        type: type,
        timestamp: new Date().toISOString(),
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
        return n.drift && selectedTypes.includes(n.type) && !fishedIDs.has(n.id) && (keepAll || (noteAge <= 7 && (n.fishcount || 0) < 5));
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

document.getElementById("mostRepliedBtn").addEventListener("click", () => {
    const allNotes = getNotes();

    if (allNotes.length === 0) {
        fishedNote.innerHTML = "<p>No notes found.</p>";
        reactionButtons.style.display = "none";
        replySection.style.display = "none";
        return;
    }

    const mostReplied = allNotes.reduce((max, note) => {
        return (note.replies?.length || 0) > (max.replies?.length || 0) ? note : max;
    }, allNotes[0]);

    fishedNote.innerHTML = `
        <p>"${mostReplied.text}"</p>
        <p>(${mostReplied.type})</p>
        <p style="font-size: 0.9em;">💬 ${mostReplied.replies?.length || 0} replies</p>
        <p><em>This is the most replied note.</em></p>
    `;

    reactionButtons.style.display = "none";
    replySection.style.display = "none";
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

function calculateAnalytics() {
    const notes = getNotes();
    const stats = {
        total: notes.length,
        byType: { love: 0, vent: 0, joke: 0, misc: 0 },
        totalReactions: 0,
        totalReplies: 0,
        notesWithReplies: 0
    };

    notes.forEach(n => {
        stats.byType[n.type] = (stats.byType[n.type] || 0) + 1;
        const reactions = (n.reactions?.heart || 0) + (n.reactions?.laugh || 0) + (n.reactions?.sad || 0);
        stats.totalReactions += reactions;

        const replies = n.replies?.length || 0;
        stats.totalReplies += replies;
        if (replies > 0) stats.notesWithReplies++;
    });

    return stats;
}

function displayAnalytics() {
    const stats = calculateAnalytics();
    const avgReactions = stats.total ? (stats.totalReactions / stats.total).toFixed(2) : 0;
    const replyPercentage = stats.total ? ((stats.notesWithReplies / stats.total) * 100).toFixed(1) : 0;

    document.getElementById("statsContainer").innerHTML = `
        <p><strong>Total Notes Sent:</strong> ${stats.total}</p>
        <p>❤️ Love: ${stats.byType.love} | 😤 Vent: ${stats.byType.vent} | 😂 Joke: ${stats.byType.joke} | 📦 Misc: ${stats.byType.misc}</p>
        <p>📊 Avg Reactions per Note: ${avgReactions}</p>
        <p>💬 Total Replies: ${stats.totalReplies}</p>
        <p>💡 Notes With Replies: ${replyPercentage}%</p>
    `;
}

function renderLeaderboard() {
    const allNotes = getNotes();
    const list = document.getElementById("leaderboardList");
    const sortType = document.getElementById("sortType").value;

    const sorted = [...allNotes]
        .filter(n => (n.reactions?.heart || 0) + (n.reactions?.laugh || 0) + (n.reactions?.sad || 0) > 0)
        .sort((a, b) => {
            const getVal = note => {
                if (sortType === "total") {
                    return (note.reactions?.heart || 0) + (note.reactions?.laugh || 0) + (note.reactions?.sad || 0);
                }
                return note.reactions?.[sortType] || 0;
            };
            return getVal(b) - getVal(a);
        });

    list.innerHTML = "";

    if (sorted.length === 0) {
        list.innerHTML = "<li>No notes with reactions yet.</li>";
        return;
    }

    sorted.slice(0, 10).forEach((note, index) => {
        const total = (note.reactions?.heart || 0) + (note.reactions?.laugh || 0) + (note.reactions?.sad || 0);
        const li = document.createElement("li");
        li.innerHTML = `
            <strong>#${index + 1}</strong> — "${note.text.slice(0, 50)}${note.text.length > 50 ? "..." : ""}"<br/>
            ❤️ ${note.reactions.heart || 0} 😂 ${note.reactions.laugh || 0} 😢 ${note.reactions.sad || 0}
            <span style="font-size: 0.85em;">(${total} total)</span>
        `;
        list.appendChild(li);
    });
}

window.addEventListener("DOMContentLoaded", () => {
    cleanExpiredNotes();
    displayAnalytics();
    renderLeaderboard();
});
