export function normalizeWord(str) {
    return str
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") 
        .replace(/Œ/g, "OE")             
        .replace(/œ/g, "OE");         
}