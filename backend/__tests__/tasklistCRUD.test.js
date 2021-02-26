const request = require("supertest");
// const { delete } = require("../app/routes/tasklists");
// const User = require("../app/models/user.model");
const api = require("../app/staticData/Routes");

describe("can perform tasklist CRUD operations", () => {
  let cookie;
  let currentUser;

  
  let user1 = {
    email: "blah@mail.co",
    username: "some-username",
    password: "noonecaresabout432PASSword",
    tasklists: [
      {
        name: "first tasklist!",
        description: "fake af",
        tasks: [
          { name: "first task too!" },
          { name: "another one" },
          { name: "this one is way cooler" },
          {
            name: "this one got assigned to someone who doesn't exist lol",
            assignedUsername: "joe-bobby",
          },
          { name: "this one is way less cooler" },
          { name: "this one is just lame" },
        ],
      },
    ],
  };

  const checkUnchanged = async () => {
    const response = await getInfo();
    expect(response.body.tasklists).toEqual(currentUser.tasklists);
  };

  const getInfo = async () => {
    return await tester
      .get(api.usersPrivateInfo.route)
      .set("Cookie", cookie)
      .expect(200);
  };

  let tester;

  beforeAll(async (done) => {
    tester = request(server);
    const response = await tester.post(api.registerRouter.route).send(user1);
    cookie = response.headers["set-cookie"][1];
    expect(cookie).toBeDefined();
    currentUser = response.body.user;
    delete currentUser.updatedAt;
    done();
  });

  it("can add a new tasklist", async () => {
    const tasklist = {
      name: "some kinda tasklist",
      description: "yeah it's a nice tasklist am i right?",
      tasks: [
        { name: "this is fine" },
        { name: "this too" },
        { name: "and this" },
        { name: "sure man" },
        { name: "this too" },
      ],
      stages: {
        stage1: [3, 2, 4],
        stage2: [],
        stage3: [0],
        stage4: [1],
      },
    };
    const returnedList = await tester
      .post(api.tasklistAdd.route)
      .send(tasklist)
      .set("Cookie", cookie)
      .expect(201);
    expect(returnedList.body.tasklist.tasks.length).toEqual(5);
    expect(returnedList.body.tasklist.stage1.length).toEqual(3);
    const response = await getInfo();
    expect(response.body.tasklists.length).toEqual(
      currentUser.tasklists.length + 1
    );
    currentUser = response.body;
    delete currentUser.updatedAt;
  });

  it("can read a single tasklist", async () => {
    const response = await tester
      .get(api.tasklistReadOne.route + currentUser.tasklists[1]._id)
      .set("Cookie", cookie)
      .expect(200);
    expect(response.body.tasklist).toEqual(currentUser.tasklists[1]);
  });

  it("can read all tasklists", async () => {
    const response = await tester
      .get(api.tasklistReadAll.route)
      .set("Cookie", cookie)
      .expect(200);
    expect(response.body.tasklists).toEqual(currentUser.tasklists);
  });

  it("can update a single tasklist", async () => {
    const tasklist = {
      name: "this is my new name lol",
    };
    const response = await tester
      .post(api.tasklistUpdate.route + currentUser.tasklists[1]._id)
      .send(tasklist)
      .set("Cookie", cookie)
      .expect(200);
    expect(response.body.tasklist.description).toEqual(
      currentUser.tasklists[1].description
    );
    expect(response.body.tasklist.name).toEqual(tasklist.name);
    const newUser = await getInfo();
    currentUser = newUser.body;
    delete currentUser.updatedAt;
  });

  it("can delete tasklists", async () => {
    await tester
      .delete(api.tasklistDelete.route + currentUser.tasklists[0]._id)
      .set("Cookie", cookie)
      .expect(204);
    const response = await getInfo();
    expect(response.body.tasklists.length).toEqual(
      currentUser.tasklists.length - 1
    );
    currentUser = response.body;
    delete currentUser.updatedAt;
  });

  it("no tasklist operations without session cookie", async () => {
    const promises = [];
    promises.push(tester.get(api.tasklistReadAll.route).expect(302));
    promises.push(
      tester
        .get(api.tasklistReadOne.route + currentUser.tasklists[0]._id)
        .expect(302)
    );
    promises.push(
      tester
        .post(api.tasklistUpdate.route + currentUser.tasklists[0]._id)
        .send({ name: "lol" })
        .expect(302)
    );
    promises.push(
      tester.post(api.tasklistAdd.route).send({ name: "lmao" }).expect(302)
    );
    promises.push(
      tester
        .delete(api.tasklistDelete.route + currentUser.tasklists[0]._id)
        .expect(302)
    );
    await Promise.all(promises);
    await checkUnchanged();
  });

  it("refuses to add tasklists missing required arguments (only name)", async () => {
    const promises = [];
    promises.push(
      tester
        .post(api.tasklistAdd.route)
        .send({})
        .set("Cookie", cookie)
        .expect(400)
    );
    promises.push(
      tester
        .post(api.tasklistAdd.route)
        .send({ nae: "lmao" })
        .set("Cookie", cookie)
        .expect(400)
    );
    promises.push(
      tester
        .post(api.tasklistAdd.route)
        .send({ name: "" })
        .set("Cookie", cookie)
        .expect(400)
    );
    promises.push(
      tester
        .post(api.tasklistAdd.route)
        .send({ name: {} })
        .set("Cookie", cookie)
        .expect(400)
    );
    promises.push(
      tester
        .post(api.tasklistAdd.route)
        .send({ description: "lmao" })
        .set("Cookie", cookie)
        .expect(400)
    );
    promises.push(
      tester
        .post(api.tasklistAdd.route)
        .send({ description: "lmao", tasks: [] })
        .set("Cookie", cookie)
        .expect(400)
    );
    await Promise.all(promises);
    await checkUnchanged();
  });

  it("discards bad tasks / stages when adding a new tasklist, dont care about duplicate named tasklists...", async () => {
    const tasklist = {
      name: "mikeyboy",
      description: { not: "allowed" },
      tasks: [{ baloney: "invalid task, no name" }],
      // this would be valid if the task were valid
      stages: { stage1: [], stage2: [], stage3: [0], stage4: [] },
    };
    const tasklist2 = { ...tasklist };
    tasklist2.tasks = [{ name: "a valid task array" }];
    // wrong index
    tasklist2.stages = { stage1: [], stage2: [], stage3: [1], stage4: [] };
    // the resultant stages should have 0 in stage1 and nothing in the rest since
    // the badly formed stages object wasn't allowed
    const tasklist3 = { ...tasklist2 };
    // referencing a stage that doesn't exist btw
    // will also have exactly one stage (0) in stage1
    tasklist3.stages = { stage1: [1], stage2: [], stage3: [0], stage4: [] };
    const tasklist4 = { ...tasklist };
    delete tasklist4.tasks;
    const tasklist5 = { ...tasklist };
    tasklist5.tasks = [
      { name: "one" },
      { name: "one" },
      { name: "one" },
      { name: "three" },
      { name: "one" },
    ];
    // one extra too many
    tasklist5.stages = {
      stage1: [2, 3],
      stage2: [0],
      stage3: [1],
      stage4: [4, 5],
    };
    tasklist5.description = "i'm special!";
    const tasklist6 = { ...tasklist5 };
    // missing a task index from the end
    tasklist6.stages = { stage1: [2], stage2: [0], stage3: [1], stage4: [3] };
    const tasklist7 = { ...tasklist5 };
    // missing a task index in the middle
    // would add up to 8 btw which is wrong for my test
    tasklist7.stages = { stage1: [4], stage2: [0], stage3: [1], stage4: [3] };

    const promises = [];
    const adder = (tasklist) =>
      tester
        .post(api.tasklistAdd.route)
        .send(tasklist)
        .set("Cookie", cookie)
        .expect(201);
    promises.push(adder(tasklist));
    promises.push(adder(tasklist2));
    promises.push(adder(tasklist3));
    promises.push(adder(tasklist4));
    promises.push(adder(tasklist5));
    promises.push(adder(tasklist6));
    await Promise.all(promises);
    // ensuring this is last tasklist to get added
    await adder(tasklist7);
    // parenthesis to encapsulate the await or it'll try to grab the promise obj itself
    const newUser = (await getInfo()).body;
    expect(newUser.tasklists.length >= 6).toBeTruthy();
    // all the newly added tasks have task lists as long as the stage 1 lengths
    newUser.tasklists.slice(newUser.tasklists.length - 6).forEach((element) => {
      expect(element.stage1.length).toEqual(element.tasks.length);
    });
    const laststage1 = newUser.tasklists[newUser.tasklists.length - 1].stage1;
    const sum = laststage1.reduce((sum, curr) => sum + curr, 0);
    // sum of 0..n = 1..n = (n * (n+1))/2, and here n is laststage1.length - 1
    // also proves based on size of tasklist and tasks being equal that they at least probably
    // contain the correct numbers
    expect(sum).toEqual((laststage1.length * (laststage1.length - 1)) / 2);
  });

  it("refuses to update tasklists missing required arguments", async () => {
    const newUser = (await getInfo()).body;
    delete newUser.updatedAt;
    currentUser = newUser;
    const promises = [];
    const updater = (
      jsonObj,
      id = currentUser.tasklists[0]._id,
      expect = 400
    ) =>
      tester
        .post(api.tasklistUpdate.route + id)
        .send(jsonObj)
        .set("Cookie", cookie)
        .expect(expect);
    promises.push(updater({}));
    promises.push(updater({ random: "something not on tasklist queue" }));
    // name, description, tasks, or stages exist but badly typed
    promises.push(updater({ name: {} }));
    promises.push(updater({ description: {} }));
    promises.push(updater("just like a string here"));
    promises.push(updater({ name: "something that would be okay" }, "/", 404));
    promises.push(
      updater({
        name: 1235,
        description: { not: "okay" },
      })
    );
    // gotta pass all the stages even if all indices are defined in stage1
    promises.push(
      updater({
        stages: { stage1: [0, 1, 2, 3, 4] },
      })
    );
    promises.push(
      updater({
        stages: { stage1: [0, 1, 2, 3, 4], stage2: [], stage3: [], stage4: "okay" },
        taskslength: 5,
      })
    );
    promises.push(
      updater({
        stages: { stage1: [0, 1, 2, 3, 4], stage2: [], stage4: [] },
        taskslength: 5,
      })
    );
    promises.push(
      updater({
        stages: { stage1: [0, 1, 2, 3, 4], stage2: [], stage3: [] },
        taskslength: 5,
      })
    );
    promises.push(
      updater({
        stages: { stage1: [0, 1, 2, 3, 4], stage3: [], stage4: [] },
        taskslength: 5,
      })
    );
    promises.push(
      updater({
        stages: { stage2: [0, 1, 2, 3, 4], stage3: [], stage4: [] },
        taskslength: 5,
      })
    );
    // too many tasks bruh
    promises.push(
      updater({
        stages: { stage1: [0, 1, 2, 3, 4], stage2: [], stage3: [], stage4: [5] },
        taskslength: 5,
      })
    );
    // not enough tasks
    promises.push(
      updater({
        stages: { stage1: [0, 1, 3, 4,], stage2: [], stage3: [], stage4: [] },
        taskslength: 5,
      })
    );
    // correct stages for the given taskslength but taskslength is not accurate size of tasks in database
    promises.push(
      updater({
        stages: { stage1: [0, 1, 3, 4, 2], stage2: [5], stage3: [], stage4: [] },
        taskslength: 6,
      })
    );
    await Promise.all(promises);
    await checkUnchanged();
    //confirming that we really could change task stages
    const goodstages = { stage1: [0, 1, 3, 4], stage2: [2], stage3: [], stage4: [] }
    const response = await updater({
      stages: goodstages,
      taskslength: 5,
    }, undefined, 200);
    expect(response.body.tasklist.stage1).toEqual(goodstages.stage1);
    expect(response.body.tasklist.stage2).toEqual(goodstages.stage2);
    expect(response.body.tasklist.stage3).toEqual(goodstages.stage3);
    expect(response.body.tasklist.stage4).toEqual(goodstages.stage4);
  });

  it("refuses to delete tasklists that dont exist", async () => {
    const newUser = (await getInfo()).body;
    delete newUser.updatedAt;
    currentUser = newUser;
    const promises = [];
    promises.push(
      tester
        .delete(api.tasklistDelete.route + "asgoina3333333333")
        .set("Cookie", cookie)
        .expect(400)
    );
    promises.push(
      tester.delete(api.tasklistDelete.route).set("Cookie", cookie).expect(404)
    );
    await Promise.all(promises);
    await checkUnchanged();
  });

  it("cannot initialize/change tasks if invalidly sent for tasklist add / update", async () => {
    const taskname = "some kinda fake task";
    await tester
      .post(api.tasklistAdd.route)
      // show that description can be mistyped and still work
      // description will just be it's default
      .send({
        name: "a new tasklist name",
        description: { text: "not real" },
        // need name, priority, and stage to create a task
        // nae is mistyped and the task array will be initialized to [] instead
        tasks: [{ name: taskname }, { nae: "some other task" }],
      })
      .set("Cookie", cookie)
      .expect(201);
    const response = await getInfo();
    const newTasklist =
      response.body.tasklists[response.body.tasklists.length - 1];
    expect(newTasklist.tasks.length).toEqual(0);
    expect(newTasklist.description).toEqual("");
    const newName = "some other name";
    const newDescription = `{ text: "not real" }`;
    const faketasks = [{ name: taskname }, { name: "some other task" }];
    await tester
      .post(api.tasklistUpdate.route + newTasklist._id)
      .send({
        name: newName,
        description: newDescription,
        tasks: faketasks,
      })
      .set("Cookie", cookie)
      .expect(400);
    const response2 = await getInfo();
    const newTasklist2 =
      response2.body.tasklists[response2.body.tasklists.length - 1];
    // name and description were changed but task changes were ignored
    expect(newTasklist2.name).not.toEqual(newName);
    expect(newTasklist2.description).not.toEqual(newDescription);
    // update current user
    currentUser = response2.body;
    delete currentUser.updatedAt;
  });

  it("query params for update / delete / read get 404'd", async () => {
    const promises = [];
    promises.push(
      tester
        .delete(
          api.tasklistDelete.route + "?id=" + currentUser.tasklists[0]._id
        )
        .set("Cookie", cookie)
        .expect(404)
    );
    promises.push(
      tester
        .post(api.tasklistUpdate.route + "?id=" + currentUser.tasklists[0]._id)
        .send({ name: "decently creatable tasklist" })
        .set("Cookie", cookie)
        .expect(404)
    );
    promises.push(
      tester
        .get(api.tasklistReadOne.route + "?id=" + currentUser.tasklists[0]._id)
        .set("Cookie", cookie)
        .expect(404)
    );
    await Promise.all(promises);
    await checkUnchanged();
  });

  it("even after deleting all tasklists, get empty tasklist when trying to readall instead of 404", async () => {
    const promises = [];
    const getuser = await getInfo();
    getuser.body.tasklists.forEach((element) => {
      promises.push(
        tester
          .delete(api.tasklistDelete.route + element._id)
          .set("Cookie", cookie)
          .expect(204)
      );
    });
    await Promise.all(promises);
    const response = await getInfo();
    expect(response.body.tasklists.length).toEqual(0);
    currentUser = response.body;
    delete currentUser.updatedAt;
    const response2 = await tester
      .get(api.tasklistReadAll.route)
      .set("Cookie", cookie)
      .expect(200);
    expect(response2.body.tasklists).toEqual([]);
  });
});
