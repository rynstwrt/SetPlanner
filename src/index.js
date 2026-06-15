const {globby, convertPathToPattern} = require("globby");
const {Song} = require("./Song.js");
const path = require("path");
const {intro, outro, isCancel, cancel, text, multiselect} = require("@clack/prompts");
const figlet = require("figlet");
const {RekordboxConnect} = require("rekordbox-connect");


const rb = new RekordboxConnect({
    pollIntervalMs: 2000,
    maxRows: 5000,
    historyMaxRows: 100
});


const chooseRandom = (list) => list[Math.floor(Math.random() * list.length)];


let setList = [];
let unusedSongs = [];


function selectNextSong(prevSong) {
    // console.log(`Finding unusedSongs compatible with key: ${prevSong.key}`)

    // Find exact matches
    const exactMatches = unusedSongs.filter(song => prevSong.getExactMatchingKeys().includes(song.key));
    if (exactMatches.length)
        return chooseRandom(exactMatches);


    // Find energy boost matches
    const energyBoost1Matches = unusedSongs.filter(song => prevSong.getEnergyBoost1Keys().includes(song.key));
    if (energyBoost1Matches.length)
        return chooseRandom(energyBoost1Matches);

    const energyBoost2Matches = unusedSongs.filter(song => prevSong.getEnergyBoost2Keys().includes(song.key));
    if (energyBoost2Matches.length)
        return chooseRandom(energyBoost2Matches);

    const energyBoost3Matches = unusedSongs.filter(song => prevSong.getEnergyBoost3Keys().includes(song.key));
    if (energyBoost3Matches.length)
        return chooseRandom(energyBoost3Matches);


    // Find energy Drop matches
    const energyDrop1Matches = unusedSongs.filter(song => prevSong.getEnergyDrop1Keys().includes(song.key));
    if (energyDrop1Matches.length)
        return chooseRandom(energyDrop1Matches);

    const energyDrop2Matches = unusedSongs.filter(song => prevSong.getEnergyDrop2Keys().includes(song.key));
    if (energyDrop2Matches.length)
        return chooseRandom(energyDrop2Matches);

    const energyDrop3Matches = unusedSongs.filter(song => prevSong.getEnergyDrop3Keys().includes(song.key));
    if (energyDrop3Matches.length)
        return chooseRandom(energyDrop3Matches);


    // Randomly select if nothing else found
    return chooseRandom(unusedSongs);
}


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


function addSongToSet(song) {
    setList.push(song);
    unusedSongs.splice(unusedSongs.indexOf(song), 1);
}


function addTrackToSet(track) {
    setList.push(track);

}


// async function main(musicDir) {
//     const base = convertPathToPattern(musicDir)
//     const songPaths = await globby(`${base}/**/*`);
//     if (!songPaths.length)
//         return console.error("No music files found!");
//
//
//     for (const songPath of songPaths) {
//         const song = new Song(songPath);
//         if (await song.loadKey())
//             unusedSongs.push(song);
//     }
//
//
//     const startSong = chooseRandom(unusedSongs);
//     addSongToSet(startSong);
//
//     for (let i = unusedSongs.length - 1; i >= 0; --i) {
//         const nextSong = selectNextSong(setList[setList.length - 1]);
//         addSongToSet(nextSong);
//     }
//
//     console.log("FINISHED SETLIST:");
//     for (const [i, song] of setList.entries()) {
//         console.log(`[${i}] ${path.basename(song.path)} (${song.key})`);
//     }
// }


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

    const startTrack = chooseRandom(tracks);
    // console.log("START TRACK", startTrack)
    setList.push(startTrack);
    tracks.splice(tracks.indexOf(startTrack), 1);

    for (let i = tracks.length - 1; i >= 0; --i) {
        const lastTrackCompatibleKeys = getCompatibleKeys(setList[setList.length - 1]);

        let nextTrack = chooseRandom(tracks);
        for (const compatKey of lastTrackCompatibleKeys) {
            const tracksInCurrentCompatKey = tracks.filter(track => track.key === compatKey);
            if (tracksInCurrentCompatKey.length) {
                nextTrack = chooseRandom(tracksInCurrentCompatKey);
                break;
            }
        }

        // console.log("NEXT TRACK", nextTrack);
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


(async () => {
    // await main("./test/music");


    // intro(`create-my-app`);
    // outro(`You're all set!`);
})();


