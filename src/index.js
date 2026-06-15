import {intro, outro, isCancel, text, multiselect} from "@clack/prompts";
import figlet from "figlet";
import {RekordboxConnect} from "rekordbox-connect";
import {table} from "console-table-without-index";
import chalk from "chalk";
import {getCompatibleKeys} from "./util/song-util.js";
import {chooseRandom} from "./util/misc-util.js";



const rb = new RekordboxConnect({
    pollIntervalMs: 2000,
    maxRows: 5000,
    historyMaxRows: 100
});



function generateSetList(tracks, setListLength) {
    let setList = [];

    const startTrack = chooseRandom(tracks);
    setList.push(startTrack);
    tracks.splice(tracks.indexOf(startTrack), 1);

    for (let i = setListLength - 1; i >= 0; --i) {
        const lastTrackCompatibleKeyArrs = getCompatibleKeys(setList[setList.length - 1]);

        let nextTrack = chooseRandom(tracks);
        for (const compatKeyTypeArr of lastTrackCompatibleKeyArrs) {
            const tracksInCurrentCompatKeyType = tracks.filter(track => compatKeyTypeArr.includes(track.key));
            if (tracksInCurrentCompatKeyType.length) {
                nextTrack = chooseRandom(tracksInCurrentCompatKeyType);
                break;
            }
        }

        setList.push(nextTrack);
        tracks.splice(tracks.indexOf(nextTrack), 1);
    }

    return setList;
}



rb.on("ready", async _ => {
    console.log(chalk.green(await figlet.text("SetPlanner")));

    const playlists = rb.loadPlaylists();
    if (!playlists.length)
        return console.error("Error: No Rekordbox playlists were found!");


    const selectedPlaylistIDs = await multiselect({
        message: "Select playlists to create a set with.",
        options: playlists.map(playlist => ({value: playlist.ID, label: playlist.Name}))
    }) || [];


    const tracks = [...new Set(selectedPlaylistIDs.flatMap(id => rb.loadPlaylistTracks(id)))];


    const setListLength = parseInt(await text({
        message: "Enter the number of tracks desired, if any.",

    }) || tracks.length) - 1;


    const setList = generateSetList(tracks, setListLength);


    console.log("FINISHED SETLIST:");
    console.log(table(
        setList.map((track, i) => ({
            '#': i,
            title: track.title,
            key: track.key,
            // path: track.filePath
        }))
    ));


    rb.stop();
});


rb.start();