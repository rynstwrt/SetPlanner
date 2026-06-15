const fs = require("fs");
const {parseStream} = require("music-metadata");


/*
 * PERFECT MATCH:
 *   - same key
 *   - 2A->1B (-1 and change letter if A)
 *   - 1B->2A (+1 and change letter if B)
 *
 *
 *
 * ENERGY+:
 *   - 2A->2B (change letter if A)
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
 *   - 2B->2A (change letter if B)
 *
 * ENERGY--:
 *   - 2A->5A (+3)
 *
 * ENERGY---:
 *   - 2A->12A (-2)
 *   - 2A->7A (+5)
 */
class Song {
    constructor(track) {
        this.path = track.filePath;
        this.key = track.key;
        this.camelotNum = undefined;
        this.camelotLetter = undefined;
    }


    loadKey() {
        // const audioStream = fs.createReadStream(this.path);
        // const metadata = await parseStream(audioStream, {mimeType: "audio/mpeg"});

        // this.key = metadata.common.key;
        // if (!this.key) {
        //     console.warn(`File ${this.path} does not have a key!`);
        //     return false;
        // }

        const matches = this.key.match(/(\d{1,2})([A|B])/);
        this.camelotNum = matches[1];
        this.camelotLetter = matches[2];
        // return true;
    }


    changeCamelot(numShift = 0, changeLetter = false) {
        const shiftedNum = (parseInt((this.camelotNum) + numShift + 12) % 12) || 12;
        const flippedOrUnflippedLetter = changeLetter ? (this.camelotLetter === "A" ? "B" : "A") : this.camelotLetter;
        return `${shiftedNum}${flippedOrUnflippedLetter}`;
    }


    /*
      EXACT MATCH:
        - Same key
        - 2A->1B (-1 and change letter if A)
        - 1B->2A (+1 and change letter if B)
     */
    getExactMatchingKeys() {
        return [this.key, this.changeCamelot((this.camelotLetter === "A" ? -1 : 1), true)];
    }


    /*
      ENERGY+:
        - 2A->2B (change letter if A)
        - 2A->3A (+1)
    */
    getEnergyBoost1Keys() {
        const energyBoost1Keys = [];

        if (this.camelotLetter === "A")
            energyBoost1Keys.push(this.changeCamelot(0, true));

        energyBoost1Keys.push(this.changeCamelot(1));

        return energyBoost1Keys;
    }


    /*
      ENERGY++:
        - 2A->11A (-3)
     */
    getEnergyBoost2Keys() {
        return [this.changeCamelot(-3)];
    }


    /*
      ENERGY+++:
        - 2A->4A (+2)
        - 2A->9A (-5)
     */
    getEnergyBoost3Keys() {
        return [this.changeCamelot(2), this.changeCamelot(-5)];
    }


    /*
      ENERGY-:
        - 2A->1A (-1)
        - 2B->2A (change letter if B)
     */
    getEnergyDrop1Keys() {
        const energyDrop1Keys = [this.changeCamelot(-1)];

        if (this.camelotLetter === "B")
            energyDrop1Keys.push(this.changeCamelot(0, true));

        return energyDrop1Keys;
    }


    /*
      ENERGY--:
        - 2A->5A (+3)
     */
    getEnergyDrop2Keys() {
        return [this.changeCamelot(3)];
    }


    /*
      ENERGY---:
        - 2A->12A (-2)
        - 2A->7A (+5)
     */
    getEnergyDrop3Keys() {
        return [this.changeCamelot(-2), this.changeCamelot(5)];
    }
}


module.exports = {Song};