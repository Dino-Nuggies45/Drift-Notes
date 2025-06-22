const noteInput = document.getElementById("noteInput");
const sendBtn = document.getElementById("sendBtn");
const fishBtn = document.getElementById("fishBtn");
const fishedNote = document.getElementById("fishedNote");
const noteType = document.getElementById("noteType");
const replyInput = document.getElementById("replyInput");
const submitReplyBtn = document.getElementById("submitReplyBtn");
const repliesList = document.getElementById("repliesList");
const replySection = document.getElementById("replySection");
let fishedIDs = new Set();
let lastFishedNoteId = null;
let reactedNoteIDs = JSON.parse(localStorage.getItem("reactedNotes")) || [];
let bookmarkedNotes = JSON.parse(localStorage.getItem("bookmarkedNotes")) || [];

if (!localStorage.getItem("driftNotes")){
    localStorage.setItem("driftNotes", JSON.stringify([]));
}

function getNotes(){
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
        reactions: {
            heart: 0,
            laugh: 0,
            sad: 0
        },
        replies: []
    }
    currentNotes.push(newNote);
    localStorage.setItem("driftNotes", JSON.stringify(currentNotes));
}

sendBtn.addEventListener("click", () => {
    const note = noteInput.value.trim();
    const type = noteType.value;
    const drift = document.getElementById("keepNotesToggle").checked

    if (note.length === 0){
        alert("Please write something before sending!");
        return;
    }

    saveNote(note, type, drift);
    noteInput.value = "";
    document.getElementById("keepNotesToggle").checked = true;
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

    function renderNote(note){
    fishedNote.innerHTML = `
        <p>"${note.text}"</p>
        <p>(${note.type})</p>
        <p> style="font-size: 0.9em;">
            heart ${note.reactions?.heart || 0}
            laugh ${note.reactions?.laugh || 0}   
            sad ${note.reactions?.sad || 0}
        </p>
        ${!readOnly ? '<button id="bookmarkBtn">Bookmark</button>' : ''}
    `;

    if (!readOnly && reactedNoteIDs.includes(note.id)){
        document.getElementById("reactionButton").style.display = "none";
    } else {
        document.getElementById("reactionButtons").style.display = "flex";
    }

    if (!readOnly) {
        replySection.style.display = "block";
        renderReplies(note.replies || []);
        const bookmarkBtn = document.getElementById("bookmarkBtn");
        bookmarkBtn.addEventListener("click", () => {
            if (!bookmarkedNotes.includes(note.id)) {
                bookmarkedNotes.push(note.id);
                localStorage.setItem("bookmarkedNotes", JSON.stringify(bookmarkedNotes));
                alert("Note Bookmarked");
            }else{
                alert("Already bookmarked");
            }

            renderNote(note);
        });
    } else {
        replySection.style.display = "none";
    }
    
}

    fishedIDs.add(randomNote.id);
    renderNote(randomNote)

   
    if (!bookmarkedNotes.includes(randomNote.id)) {
        bookmarkedNotes.push(randomNote.id);
        localStorage.setItem("bookmarkedNotes", JSON.stringify(bookmarkedNotes));
        alert("Note Bookmarked!")
    } else {
        alert("Already bookmarked");
    }
    

    lastFishedNoteId = randomNote.id;
    document.getElementById("reactionButtons").style.display = 
        reactedNoteIDs.includes(randomNote.id) ? "none": "flex";

    replySection.style.display = "block";
    renderReplies(randomNote.replies || []);
});

document.getElementById("viewBookmarksBtn").addEventListener("click", () => {
    const allNotes = getNotes();
    const saved = allNotes.filter(n => bookmarkedNotes.includes(n.id));

    if (saved.length === 0) {
        fishedNote.innerHTML = "<p> No bookmarks yet.</p>";
        return;
    } else {
       renderNote(saved[0], true)
    }

    document.getElementById("reactionButton").style.display = "none";
    replySection.style.display = "none";


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

    renderNote(allNotes[noteIndex]);

}


submitReplyBtn.addEventListener("click", () => {
        console.log("Submit reply button clicked")
        const replyText = replyInput.value.trim();
        if(!replyText || !lastFishedNoteId) return;

        const allNotes = getNotes();
        const noteIndex = allNotes.findIndex(n => n.id === lastFishedNoteId);
        if (noteIndex === -1) return;

        allNotes[noteIndex].replies.push({
            text: replyText,
            timestamp: new Date().toISOString()

        });

    localStorage.setItem("driftNotes", JSON.stringify(allNotes));
    replyInput.value = "";
    renderReplies(allNotes[noteIndex].replies);

});

function renderReplies(replies = []) {
        repliesList.innerHTML = "";
        replies.forEach((r, index) => {
            const div = document.createElement("div")
            div.innerHTML = `
            <p>${r.text}</p>
            <button onclick="deleteReply(${index})">Delete</button>
            <hr />
        `;
        repliesList.appendChild(div);
    })
    repliesList.scrollIntoView({behavior: "smooth", block: "start"});
}

function deleteReply(index){
        if(!lastFishedNoteId) return;

        const allNotes = getNotes();
        const noteIndex = allNotes.findIndex(n => n.id === lastFishedNoteId);
        if (noteIndex === -1) return;

    allNotes[noteIndex].replies.splice(index, 1);
    localStorage.setItem("driftNotes", JSON.stringify(allNotes));
    renderReplies(allNotes[noteIndex].replies);
}

function calculateAnalytics(){
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
        const reactions = (n.reactions?.heart || 0) + (n.reactions?.laugh || 0) + (n.reactions?.sad || 0) + (n.reactions?.misc || 0);
        stats.totalReactions += reactions;

        const replies = n.replies?.length || 0;
        stats.totalReplies += replies;
        if (replies > 0) stats.notesWithReplies++;
    });

    return stats;
}

function displayAnalytics(){
    const stats = calculateAnalytics();
    const avgReactions = stats.total ? (stats.totalReactions / stats.total).toFixed(2) : 0;
    const replyPercentage = stats.total ? ((stats.notesWithReplies / stats.total) * 100).toFixed(1): 0;

    document.getElementById("statsContainer").innerHTML = `
        <p>Total Notes Sent: ${stats.total}</p>
        <p>Love: ${stats.byType.love} | Vent: ${stats.byType.vent} | Sad: ${stats.byType.sad} | Misc: ${stats.byType.misc}</p>
        <p>Avg Reactions per Note: ${avgReactions}</p>
        <p>Total Replies: ${stats.totalReplies}</p>
        <p>% Notes with Replies: ${replyPercentage}%</p>
    `;
}

function getTopNotes(limit = 5){
    const notes = getNotes();

    const scorcedNotes = notes.map(n => {
        const total = (n.reactions?.heart || 0) + (n.reactions?.laugh || 0) + (n.reactions?.sad || 0) + (n.reactions?.misc || 0);
        return { ...n, totalReactions: total}
    });

    return scorcedNotes
        .sort((a, b) => b.totalReactions - a.totalReactions)
        .slice(0, limit);

}

function displayLeaderboard(){
    const topNotes = getTopNotes();
    const list = document.getElementById("leaderboardList");
    list.innerHTML = "";

    topNotes.forEach(note => {
        const li = document.createElement("li");
        li.innerHTML `
            <strong>${note.totalReactions} reactions</strong> - "${note.text.slice(0, 50)}${note.text.length > 50 ? "...": ""}" (${note.type})
        `;
        list.appendChild(li);
    });
}

document.getElementById("mostReactedBtn").addEventListener("click", () => {
    const allNotes = getNotes();

    if(allNotes.length === 0){
        fishedNote.innerHTML = "<p>No notes found.</p>";
        return;
    }

    const noteWithMostReactions = allNotes.reduce((max, note) => {
        const totalReactions =
            (note.reactions?.heart || 0) +
            (note.reactions?.laugh || 0) +
            (note.reactions?.sad || 0) ;
        const maxTotal =
            (max.reactions?.heart || 0) +
            (max.reactions?.laugh || 0) +
            (max.reactions?.sad || 0) ;
        return totalReactions > maxTotal ? note: max;
    });

    fishedNote.innerHTML = `
    <p> "${noteWithMostReactions.text}" </p>
    <p>(${noteWithMostReactions.type})</p>
    <p style="font-size: 0.9em;"> ❤️ ${noteWithMostReactions.reactions?.heart || 0}
        😂${noteWithMostReactions.reactions?.laugh || 0}
        😢${noteWithMostReactions.reactions?.sad || 0}</p>
        <p><em>This is the most reacted note.</em></p>
    `;

    document.getElementById("reactionButton").style.display = "none";
    replySection.style.display = "none";
});

window.addEventListener("DOMContentLoaded", () => { 
    cleanExpiredNotes();
    displayAnalytics();
    displayLeaderboard();

});

const sortSelect = document.getElementById("sortType");
const leaderboardList = document.getElementById("leaderboardList");
sortSelect.addEventListener("change", renderLeaderboard);
window.addEventListener("DOMContentLoaded", renderLeaderboard);

function renderLeaderboard() {
    const allNotes = getNotes();

    const sorted = [...allNotes]
        .filter(n => ((n.reactions?.heart || 0) + (n.reactions?.laugh || 0) + (n.reactions?.sad || 0) + (n.reactions?.misc || 0)) > 0)
        .sort((a, b) => {
            const type = sortSelect.value;
            const getValue = (note) => {
             if (type === "total") return (note.reactions?.heart || 0) + (note.reactions?.laugh || 0) + (note.reactions?.sad || 0) + (note.reactions?.misc || 0);
             return note.reactions?.[type] || 0;
            };
        return getValue(b) - getValue(a);
    });

    leaderboardList.innerHTML = "";

    sorted.slice(0, 10).forEach((note, index) => {
        const li = document.createElement("li");
        const total = (note.reactions?.heart || 0) + (note.reactions?.laugh || 0) + (note.reactions?.sad || 0) + (note.reactions?.misc || 0);
        li.innerHTML = `
            <strong>#${index + 1}</strong> - "${note.text}"<br />
            love ${note.reactions.heart} laugh${note.reactions.laugh} sad ${note.reactions.sad}
            <span style="font-size: 0.8em;">(${total} total)</span
        `;
        leaderboardList.appendChild(li);
    });
        
}

function renderNote(note){
    fishedNote.innerHTML = `
        <p>"${note.text}"</p>
        <p>(${note.type})</p>
        <p> style="font-size: 0.9em;">
            heart ${note.reactions?.heart || 0}
            laugh ${note.reactions?.laugh || 0}   
            sad ${note.reactions?.sad || 0}
        </p>
        <button id="bookmarkBtn">Bookmark</button>
    `;

    if (reactedNoteIDs.includes(note.id)){
        document.getElementById("reactionButton").style.display = "none";
    } else {
        document.getElementById("reactionButtons").style.display = "flex";
    }

    replySection.style.display = "block";
    renderReplies(note.replies || []);

    const bookmarkBtn = document.getElementById("bookmarkBtn");
    bookmarkBtn.addEventListener("click", () => {
        if (!bookmarkedNotes.includes(note.id)) {
            bookmarkedNotes.push(note.id);
            localStorage.setItem("bookmarkedNotes", JSON.stringify(bookmarkedNotes));
            alert("Note Bookmarked");
        }else{
            alert("Already bookmarked");
        }

        renderNote(note);
    });
    
}

document.getElementById("clearBookmarksBtn").addEventListener("click", () => {
    localStorage.removeItem("bookmarkedNotes");
    bookmarkedNotes = [];
    fishedNote.innerHTML = "<p>Bookmarks cleared!</p>";
})

window.addEventListener("DOMContentLoaded", () => {
    submitReplyBtn.addEventListener("click", () => {
        const replyText = replyInput.value.trim();
        if(!replyText || !lastFishedNoteId) return;

        const allNotes = getNotes();
        const noteIndex = allNotes.findIndex(n => n.id === lastFishedNoteId);
        if(noteIndex === -1) return;

        allNotes[noteIndex].replies.push({
            text: replyText,
            timestamp: new Date().toISOString()
        });

        localStorage.setItem("driftNotes", JSON.stringify(allNotes));
        replyInput.value = "";
        renderReplies(allNotes[noteIndex]);
    });
});

