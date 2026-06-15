# SetPlanner
A NodeJS CLI tool to generate a rough draft of a DJ set tracklist from Rekordbox playlists.

1. It automatically detects your Rekordbox playlists and tracks
2. It selects a random song from the selected playlists
3. It uses camelot wheel theory to select the next song to add to the tracklist.
    a. First it looks for songs in keys that are exact matches, energy boosts, energy drops, mood changes (in that order).

You should probably edit the result it gives you to account for BPM, style, etc.

## Setup
Right now, it's:
1. Download the code.
2. Run `npm i` (or `pnpm i`) in a console while in the project's folder.
3. Run `npm run start` or `pnpm run start` to run the program.
