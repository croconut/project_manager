const log = require("../app/utils/logcolors");

// requires visual inspection
describe("colored logging functions", () => {
  it("doesn't error out, no string modifications", () => {
    const str = "playful";
    log.red(str);
    expect(str).toEqual("playful");
    log.blue(str);
    expect(str).toEqual("playful");
    log.cyan(str);
    expect(str).toEqual("playful");
    log.green(str);
    expect(str).toEqual("playful");
    log.white(str);
    expect(str).toEqual("playful");
    log.yellow(str);
    expect(str).toEqual("playful");
    log.yellow();
  });
});