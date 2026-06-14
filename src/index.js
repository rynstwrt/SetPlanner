const fs = require("fs");
const path = require("path");
const {parseStream} = require("music-metadata");


const MUSIC_DIR = "test/music";
const START_FILE = path.join(MUSIC_DIR, "Amy Kisnorbo - Squeeeze");


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


function findUnusedCompatibleSongsInKey(key) {

}


(async () => {
    const files = await getFilesWithKey();

    
})();