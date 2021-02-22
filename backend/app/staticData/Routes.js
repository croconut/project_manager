module.exports = {
  mainRoute: { name: "ProjectManager", route: "/" },
  navbarRoutes: [
    /* TODO: create a view tasklist page, user profile page, create project page */
    { name: "Sign Up", route: "/join" },
    { name: "Login", route: "/login" },
  ],
  loggedInRoutes: [
    { name: "Logout", route: "/logout" },
    { name: "Create a Tasklist", route: "/tasklist/create" },
  ],
  loginRouter: { route: "/api/login", methods: ["POST"] },
  logoutRouter: { route: "/api/logout", methods: ["POST"] },
  registerRouter: { route: "/api/register", methods: ["POST"] },
  tasklistRouter: { route: "/api/tasklist", methods: ["POST"] },
  tasklistAdd: { route: "/api/tasklist/add", methods: ["POST"] },
  tasklistReadOne: { route: "/api/tasklist/read/", methods: ["GET"] },
  tasklistReadAll: { route: "/api/tasklist/", methods: ["GET"] },
  tasklistUpdate: { route: "/api/tasklist/update/", methods: ["POST"] },
  tasklistDelete: { route: "/api/tasklist/delete/", methods: ["DELETE"] },
  taskRouter: { route: "/api/task", methods: ["GET"] },
  taskReadOne: { route: "/api/task/read/", methods: ["GET"] },
  taskAdd: { route: "/api/task/add/", methods: ["POST"] },
  taskUpdate: { route: "/api/task/update/", methods: ["POST"] },
  taskDelete: { route: "/api/task/delete/", methods: ["DELETE"] },
  // no methods for the base yet
  usersRouter: { route: "/api/users", methods: [] },
  usersUpdate: { route: "/api/users/update", methods: ["POST"] },
  // can only delete yourself while logged in
  usersDelete: { route: "/api/users/delete", methods: ["DELETE"] },
  usersSearch: { route: "/api/users/search", methods: ["GET"] },
  // want email to send user to frontend, then frontend to use this api
  usersPasswordReset: { route: "/api/userPasswordReset", methods: ["POST"] },
  // can a user register, given this email and/or username
  registerCapable: { route: "/api/register/existence", methods: ["GET"] },
  usersPrivateInfo: { route: "/api/users/myinfo", methods: ["GET"] },
};
