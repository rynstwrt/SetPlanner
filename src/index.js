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


function addSongToSet(song) {
    setList.push(song);
    unusedSongs.splice(unusedSongs.indexOf(song), 1);
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


function createSetList(tracks) {
    for (const track of tracks) {
        const song = new Song(track);
        song.loadKey();
        unusedSongs.push(song);
    } 

    const startSong = chooseRandom(unusedSongs);
    addSongToSet(startSong);

    for (let i = unusedSongs.length - 1; i >= 0; --i) {
        const nextSong = selectNextSong(setList[setList.length - 1]);
        addSongToSet(nextSong);
    }

    console.log("FINISHED SETLIST:");
    for (const [i, song] of setList.entries()) {
        console.log(`[${i}] ${path.basename(song.path)} (${song.key})`);
    }
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

    const tracks = selectedPlaylistIDs.flatMap(id => rb.loadPlaylistTracks(id));

    createSetList(tracks);

    rb.stop();
});


rb.start();


(async () => {
    // await main("./test/music");


    // intro(`create-my-app`);
    // outro(`You're all set!`);
})();


