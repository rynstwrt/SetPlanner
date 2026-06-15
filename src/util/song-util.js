function parseCamelotKey(camelotKey) {
    const matches = camelotKey.match(/(\d{1,2})([A|B])/);
    const camelotNum = parseInt(matches[1]);
    const camelotLetter = matches[2];return [camelotNum, camelotLetter];
}


export function getCompatibleKeys(track) {
    const [camelotNum, camelotLetter] = parseCamelotKey(track.key);

    function changeCamelot(numShift = 0, changeLetter = false) {
        const shiftedNum = ((camelotNum) + numShift + 12) % 12 || 12;
        const flippedOrUnflippedLetter = changeLetter ? (camelotLetter === "A" ? "B" : "A") : camelotLetter;
        return `${shiftedNum}${flippedOrUnflippedLetter}`;
    }

    const compatibleKeys = new Set();

    // Exact matches
    compatibleKeys.add([track.key, changeCamelot((camelotLetter === "A" ? -1 : 1), true)])

    // Energy+ keys
    compatibleKeys.add([
        changeCamelot(1),
        ...(camelotLetter === "A") ? [changeCamelot(0, true)] : []]);

    // Energy++ keys
    compatibleKeys.add([changeCamelot(-3)]);

    // Energy+++ keys
    compatibleKeys.add([changeCamelot(2), changeCamelot(-5)]);

    // Energy- keys
    compatibleKeys.add([
        changeCamelot(-1),
        ...(camelotLetter === "B") ? [changeCamelot(0, true)] : []]);

    // Energy-- keys
    compatibleKeys.add([changeCamelot(3)]);

    // Energy--- keys
    compatibleKeys.add([changeCamelot(-2), changeCamelot(5)]);

    // Mood change keys
    compatibleKeys.add([changeCamelot((camelotLetter === "A" ? 3 : -3), true)]);

    return compatibleKeys;
}