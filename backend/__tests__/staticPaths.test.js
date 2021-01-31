const request = require("supertest");

// consumes global server variable

describe("static file paths", () => {
  it("should create a new post", async done => {
    const res = await request(server).get("/");
    expect(res.statusCode).toEqual(200);
    done();
  });
});
