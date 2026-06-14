const fs = require("fs");
const path = require("path");
const {parseStream} = require("music-metadata");


const MUSIC_DIR = "test/music";
// const START_FILE = path.join(MUSIC_DIR, "Amy Kisnorbo - Squeeeze");


let setList = [];


function getFilesWithKey() {
    return new Promise((res, rej) => {
        fs.readdir(MUSIC_DIR, (err, files) => {
            const audioFiles = [];

            files.forEach(async (file, i) => {
                const filePath = path.join(MUSIC_DIR, file)

                const audioStream = fs.createReadStream(filePath);
                const metadata = await parseStream(audioStream, {mimeType: "audio/mpeg"});

                const key = metadata.common.key;
                if (!key)
                    return console.warn(`File ${filePath} does not have a key!`);

                audioFiles.push({path: filePath, key: key});

                if (i === files.length - 1)
                    res(audioFiles)
            });
        });

    });
}


function chooseRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}



/*  
 * PERFECT MATCH:
 *   - same key 
 *   - 2A->1B (-1 and change letter if A)
 *   - 1B->2A (+1 and change letter if B)
 * 
 * 
 * 
 * ENERGY+:
 *   - 2A->2B (change letter)
 *   - 2A->3A (+1)
 * 
 * ENERGY++:
 *   - 2A->11A (-3)
 * 
 * ENERGY+++:
 *   - 2A->4A (+2)
 *   - 2A->9A (-5)
 * 
 * 
 * 
 * ENERGY-:
 *   - 2A->1A (-1)
 *  
 * ENERGY--: 
 *   - 2A->5A (+3)
 * 
 * ENERGY---:
 *   - 2A->12A (-2)
 *   - 2A->7A (+5)
 */
let unusedSongs;


// function shiftCamelotNum(camelotNum, shift) {
//     const rolled = (camelotNum + shift + 12) % 12;
//     return rolled || 12;
//     // return rolled === 0 ? 12 : rolled;
// }


const shiftCamelotNum = (camelotNum, shift) => ((parseInt(camelotNum) + shift + 12) % 12) || 12;
const flipCamelotLetter = (camelotLetter) => camelotLetter === "A" ? "B" : "A";


function changeCamelot(key, numShift=0, changeLetter=false) {
    const matches = key.match(/(\d{1,2})([A|B])/);
    const [_, camelotNum, camelotLetter] = matches;

    const shiftedNum = shiftCamelotNum(camelotNum, numShift);
    const flippedOrUnflippedLetter = changeLetter ? flipCamelotLetter(camelotLetter) : camelotLetter;
    return `${shiftedNum}${flippedOrUnflippedLetter}`;
}


function selectNextSong(key) {
    const matches = key.match(/(\d{1,2})([A|B])/);
    const [_, camelotNum, camelotLetter] = matches;

    console.log(`Finding unusedSongs compatible with key: ${key}`)

    // Find exact song key matches
    const exactMatches = unusedSongs.filter(song => {
        if (song.key === key)
            return true;

        if (camelotLetter === "A" && song.key === changeCamelot(key, -1, true))
            return true;

        if (camelotLetter === "B" && song.key === changeCamelot(key, 1, true))
            return true;
        // let targetCamelotLetter = (camelotLetter === "A") ? "B" : "A";
        // let targetCamelotNum = (targetCamelotLetter === "A") ? camelotNum-1 : camelotNum+1;

        return false;
    });

    console.log(`exact matches:`);
    exactMatches.forEach(exactMatch => console.log(exactMatch));

    if (exactMatches.length)
        // return exact Matches[Math.floor(Math.random() * exactMatches.length)];
        return chooseRandom(exactMatches);

    // TODO: Find energy boost matches
    const energyBoostMatches = [];
    if (energyBoostMatches.length) 
        return chooseRandom(energyBoostMatches);
    
    const energyBoost2Matches = [];
    if (energyBoost2Matches.length) 
        return chooseRandom(energyBoost2Matches);
    
    const energyBoost3Matches = [];
    if (energyBoost3Matches.length) 
        return chooseRandom(energyBoost3Matches);


    // TODO: Find energy Drop matches
    const energyDropMatches = [];
    if (energyDropMatches.length)
        return chooseRandom(energyDropMatches);

    const energyDrop2Matches = [];
    if (energyDrop2Matches.length)
        return chooseRandom(energyDrop2Matches);

    const energyDrop3Matches = [];
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
    unusedSongs = await getFilesWithKey();

    // const startSongIdx = Math.floor(Math.random() * unusedSongs.length);
    // const startSong = unusedSongs[startSongIdx];
    // unusedSongs.splice(startSongIdx, 1);
    // setList.push(startSong);
    const startSong = chooseRandom(unusedSongs);
    addSongToSet(startSong);

    for (let i = 0; i < 10; ++i) {
        const lastUsedSong = setList[setList.length - 1];
        const nextSong = selectNextSong(lastUsedSong.key);

        addSongToSet(nextSong);
        // const nextSongIdx = unusedSongs.indexOf(nextSong);
        // unusedSongs.splice(nextSongIdx, 1);
        // setList.push(nextSong);
    }

    // console.log(setList) 
})();