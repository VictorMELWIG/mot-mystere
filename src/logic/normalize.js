export function normalizeWord(str) {
    str = str.toUpperCase();
    str = str.normalize("NFD")
    str = str.replace("Œ", "OE");
}