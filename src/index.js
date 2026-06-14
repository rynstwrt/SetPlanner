const fs = require("fs");
const path = require("path");
const {parseStream} = require("music-metadata");


const MUSIC_DIR = "test/music";
// const START_FILE = path.join(MUSIC_DIR, "Amy Kisnorbo - Squeeeze");


let usedSongs = [];


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
let songs;


// function shiftCamelotNum(camelotNum, shift) {
//     const rolled = (camelotNum + shift + 12) % 12;
//     return rolled || 12;
//     // return rolled === 0 ? 12 : rolled;
// }


const shiftCamelotNum = (camelotNum, shift) => (camelotNum + shift + 12) % 12 || 12;


function findUnusedCompatibleSongsInKey(key) {
    const matches = key.match(/(\d{1,2})([A|B])/);
    const [_, camelotNum, camelotLetter] = matches;

    console.log(camelotNum, camelotLetter)

    // Find exact song key matches
    return songs.filter(song => {
        if (song.key === key)
            return true;

        let targetCamelotLetter = (camelotLetter === "A") ? "B" : "A";
        let targetCamelotNum = (targetCamelotLetter === "A") ? camelotNum-1 : camelotNum+1;

    });

    // TODO: Find energy boost matches

    // TODO: Find energy drop matches

    // TODO: Randomly select if nothing else found
    
    // for (const match of matches) {
    //     console.log(match)
    // }
    // songs.forEach(song => {

    // });
}



(async () => {
    // console.log(13 % 12);
    // console.log((1 - 1 + 12) % 12);
    console.log(shiftCamelotNum(1, 1));
    console.log(shiftCamelotNum(12, 1));
    console.log(shiftCamelotNum(1, -1));
    return;
    songs = await getFilesWithKey();

    const startSongIdx = Math.floor(Math.random() * songs.length);
    const startSong = songs[startSongIdx];
    songs.splice(startSongIdx, 1);

    usedSongs.push(startSong);

    for (let i = 0; i < 10; ++i) {
        const lastUsedSong = usedSongs[usedSongs.length - 1];
        const nextSong = findUnusedCompatibleSongsInKey(lastUsedSong.key);
        // songs.splice(startSongIdx, 1);
        // usedSongs.push(nextSong);
    }
})();