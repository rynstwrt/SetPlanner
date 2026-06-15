import {intro, outro, isCancel, text, select, multiselect} from "@clack/prompts";
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



async function runGenerateSetListDialog() {
    const playlists = rb.loadPlaylists();
    if (!playlists.length)
        throw Error("No Rekordbox playlists were found.");


    const selectedPlaylistIDs = await multiselect({
        message: "Select playlists to create a set with.",
        options: playlists.map(playlist => ({value: playlist.ID, label: playlist.Name}))
    }) || [];
    if (isCancel(selectedPlaylistIDs)) {
        throw Error("No playlist selected.")
    }


    const tracks = [...new Set(selectedPlaylistIDs.flatMap(id => rb.loadPlaylistTracks(id)))];
    if (!tracks.length)
        throw Error(`No tracks found in the selected playlists.`);

    const setListLength = parseInt(await text({
        message: "Enter the desired number of tracks in the set, or press enter to use all.",

    }) || tracks.length) - 1;


    const setList = generateSetList(tracks, setListLength);


    console.log("FINISHED SETLIST:");
    console.log(chalk.gray.bold(table(
        setList.map((track, i) => ({
            '#': i,
            title: track.title,
            key: track.key,
            // path: track.filePath
        })))
    ));
}



rb.on("ready", async _ => {
    console.log(chalk.cyanBright.bold(await figlet.text("SetPlanner", {font: "Standard"})));
    intro(chalk.gray("Starting SetPlanner."));

    try {
        const option = await select({
            message: chalk.cyan.bold("Select what to do."),
            options: [
                {value: "setlistgen", label: "Generate a set list from a Rekordbox playlist"}
            ]
        });

        if (option === "setlistgen") {
            await runGenerateSetListDialog();
        }
    } catch (err) {
        console.error(chalk.bold.redBright("Error:", err));
    } finally {
        rb.stop();
        outro(chalk.gray("Exiting SetPlanner."));
    }

});


rb.start();