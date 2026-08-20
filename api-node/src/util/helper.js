const connection = require("./connection")


exports.db = connection;

exports.toInt = (data) => {
    const num = parseInt(data, 10);
    return isNaN(num) ? null : num;
}
exports.isArray = (data) => {
    return Array.isArray(data);
}
exports.isEmpty = (data) => {
    if (data === null || data === undefined) return true;
    if (typeof data === "string") return data.trim().length === 0;
    if (Array.isArray(data)) return data.length === 0;
    if (typeof data === "object") return Object.keys(data).length === 0;
    return false;
}
exports.isEmail = (data) => {
    if (!data || typeof data !== "string") return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data);
}
exports.formatDateServer = (data) => {
    if (!data) return null;
    const date = new Date(data);
    return isNaN(date.getTime()) ? null : date.toISOString().slice(0, 19).replace("T", " ");
}



