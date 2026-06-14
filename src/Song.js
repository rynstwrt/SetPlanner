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



const shiftCamelotNum = (camelotNum, shift) => ((parseInt(camelotNum) + shift + 12) % 12) || 12;
const flipCamelotLetter = (camelotLetter) => camelotLetter === "A" ? "B" : "A";


function changeCamelot(key, numShift = 0, changeLetter = false) {
    const matches = key.match(/(\d{1,2})([A|B])/);
    const [_, camelotNum, camelotLetter] = matches;

    const shiftedNum = shiftCamelotNum(camelotNum, numShift);
    const flippedOrUnflippedLetter = changeLetter ? flipCamelotLetter(camelotLetter) : camelotLetter;
    return `${shiftedNum}${flippedOrUnflippedLetter}`;
}


class Song {
    constructor(filePath) {
        this.path = filePath;
        this.key = undefined;

        this.camelotNum = undefined;
        this.camelotLetter = undefined;
    }


    async loadKey() {
        const audioStream = fs.createReadStream(this.path);
        const metadata = await parseStream(audioStream, {mimeType: "audio/mpeg"});

        this.key = metadata.common.key;
        if (!this.key) {
            console.warn(`File ${this.path} does not have a key!`);
            return false;
        }

        const matches = this.key.match(/(\d{1,2})([A|B])/);
        this.camelotNum = matches[1];
        this.camelotLetter = matches[2];
        return true;
    }


    /*
      EXACT MATCH:
        - Same key
        - 2A->1B (-1 and change letter if A)
        - 1B->2A (+1 and change letter if B)
     */
    getExactMatchingKeys() {
        return [this.key, changeCamelot(this.key, (this.camelotLetter === "A" ? -1 : 1), true)];
    }


    /*
      ENERGY+:
        - 2A->2B (change letter if A)
        - 2A->3A (+1)
    */
    getEnergyBoost1Keys() {
        const energyBoost1Keys = [];

        if (this.camelotLetter === "A")
            energyBoost1Keys.push(changeCamelot(this.key, 0, true));

        energyBoost1Keys.push(changeCamelot(this.key, 1));

        return energyBoost1Keys;
    }


    /*
      ENERGY++:
        - 2A->11A (-3)
     */
    getEnergyBoost2Keys() {
        return [changeCamelot(this.key, -3)];
    }


    /*
      ENERGY+++:
        - 2A->4A (+2)
        - 2A->9A (-5)
     */
    getEnergyBoost3Keys() {
        return [changeCamelot(this.key, 2), changeCamelot(this.key, -5)];
    }



    /*
      ENERGY-:
        - 2A->1A (-1)
        - 2B->2A (change letter if B)
     */
    getEnergyDrop1Keys() {
        const energyDrop1Keys = [changeCamelot(this.key, -1)];

        if (this.camelotLetter === "B")
            energyDrop1Keys.push(changeCamelot(this.key, 0, true));

        return energyDrop1Keys;
    }


    /*
      ENERGY--:
        - 2A->5A (+3)
     */
    getEnergyDrop2Keys() {
        return [changeCamelot(this.key, 3)];
    }


    /*
      ENERGY---:
        - 2A->12A (-2)
        - 2A->7A (+5)
     */
    getEnergyDrop3Keys() {
        return [changeCamelot(this.key, -2), changeCamelot(this.key, 5)];
    }
}


module.exports = {Song};