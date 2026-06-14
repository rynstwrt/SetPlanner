const {globby} = require("globby");
const {Song} = require("./Song.js");
const path = require("path");


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



(async () => {
    const songPaths = await globby("./test/music/**/*");

    for (const songPath of songPaths) {
        const song = new Song(songPath);
        if (await song.loadKey())
            unusedSongs.push(song);
    }


    const startSong = chooseRandom(unusedSongs);
    addSongToSet(startSong);

    for (let i = unusedSongs.length-1; i >= 0; --i) {
        const nextSong = selectNextSong(setList[setList.length - 1]);
        addSongToSet(nextSong);
    }

    console.log("FINISHED SETLIST:");
    for (const [i, song] of setList.entries()) {
        console.log(`[${i}] ${path.basename(song.path)} (${song.key})`);
    }
})();