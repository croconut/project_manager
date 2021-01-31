const red = (arg) => console.log("\x1b[31m%s\x1b[0m", arg);
const green = (arg) => console.log("\x1b[32m%s\x1b[0m", arg);
const yellow = (arg) => console.log("\x1b[33m%s\x1b[0m", arg);
const blue = (arg) => console.log("\x1b[34m%s\x1b[0m", arg);
const cyan = (arg) => console.log("\x1b[36m%s\x1b[0m", arg);
const white = (arg) => console.log("\x1b[37m%s\x1b[0m", arg);

module.exports = { red, green, yellow, blue, cyan, white };