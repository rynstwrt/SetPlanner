const {intro, outro, isCancel, cancel, text, multiselect} = require("@clack/prompts");
const figlet = require("figlet");
const {RekordboxConnect} = require("rekordbox-connect");


const rb = new RekordboxConnect({
    pollIntervalMs: 2000,
    maxRows: 5000,
    historyMaxRows: 100
});


let setList = [];


const chooseRandom = (list) => list[Math.floor(Math.random() * list.length)];


function parseCamelotKey(camelotKey) {
    const matches = camelotKey.match(/(\d{1,2})([A|B])/);
    const camelotNum = parseInt(matches[1]);
    const camelotLetter = matches[2];
    return [camelotNum, camelotLetter];
}


function getCompatibleKeys(track) {
    const [camelotNum, camelotLetter] = parseCamelotKey(track.key);

    function changeCamelot(numShift = 0, changeLetter = false) {
        const shiftedNum = ((camelotNum) + numShift + 12) % 12 || 12;
        const flippedOrUnflippedLetter = changeLetter ? (camelotLetter === "A" ? "B" : "A") : camelotLetter;
        return `${shiftedNum}${flippedOrUnflippedLetter}`;
    }

    const compatibleKeys = new Set();

    // Exact matches
    compatibleKeys.add(track.key);
    compatibleKeys.add(changeCamelot((camelotLetter === "A" ? -1 : 1), true));

    // Energy+ keys
    compatibleKeys.add(changeCamelot(1));
    if (camelotLetter === "A")
        compatibleKeys.add(changeCamelot(0, true));

    // Energy++ keys
    compatibleKeys.add(changeCamelot(-3));

    // Energy+++ keys
    compatibleKeys.add(changeCamelot(2));
    compatibleKeys.add(changeCamelot(-5));

    // Energy- keys
    compatibleKeys.add(changeCamelot(-1));
    if (camelotLetter === "B")
        compatibleKeys.add(changeCamelot(0, true));

    // Energy-- keys
    compatibleKeys.add(changeCamelot(3));

    // Energy--- keys
    compatibleKeys.add(changeCamelot(-2));
    compatibleKeys.add(changeCamelot(5));

    // Mood change keys
    compatibleKeys.add(changeCamelot((camelotLetter === "A" ? 3 : -3), true));

    return compatibleKeys;
}


rb.on("ready", async info => {
    console.log(await figlet.text("SetPlanner"));

    const playlists = rb.loadPlaylists();
    if (!playlists.length)
        return console.error("Error: No Rekordbox playlists were found!");

    const selectedPlaylistIDs = await multiselect({
        message: "Select playlists to create a set with.",
        options: playlists.map(playlist => ({value: playlist.ID, label: playlist.Name}))
    }) || [];

    const tracks = [...new Set(selectedPlaylistIDs.flatMap(id => rb.loadPlaylistTracks(id)))];

    const numTracks = parseInt(await text({
        message: "Enter the number of tracks desired, if any."
    }) || tracks.length) - 1;

    const startTrack = chooseRandom(tracks);
    setList.push(startTrack);
    tracks.splice(tracks.indexOf(startTrack), 1);

    // for (let i = tracks.length - 1; i >= 0; --i) {
    for (let i = numTracks - 1; i >= 0; --i) {
        const lastTrackCompatibleKeys = getCompatibleKeys(setList[setList.length - 1]);

        let nextTrack = chooseRandom(tracks);
        for (const compatKey of lastTrackCompatibleKeys) {
            const tracksInCurrentCompatKey = tracks.filter(track => track.key === compatKey);
            if (tracksInCurrentCompatKey.length) {
                nextTrack = chooseRandom(tracksInCurrentCompatKey);
                break;
            }
        }

        setList.push(nextTrack);
        tracks.splice(tracks.indexOf(nextTrack), 1);
    }

    console.log("FINISHED SETLIST:");
    for (const [i, track] of setList.entries()) {
        console.log(`[${i + 1}] ${track.title} (${track.key})`);
    }

    rb.stop();
});


rb.start();