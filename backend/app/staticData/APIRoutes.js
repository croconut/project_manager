module.exports = {
  loginRouter: { route: "/api/login", methods: ["POST"] },
  logoutRouter: { route: "/api/logout", methods: ["POST"] },
  registerRouter: { route: "/api/register", methods: ["POST"] },
  tasklistRouter: { route: "/api/tasklist", methods: ["POST"] },
  // no methods for the base yet
  usersRouter: { route: "/api/users", methods: [] },
  usersSearch: { route: "/api/users/search", methods: ["GET"] },
  // can a user register, given this email and/or username
  registerCapable: { route: "/api/register/existence", methods: ["GET"] },
  usersPrivateInfo: { route: "/api/users/myinfo", methods: ["GET"] },
};
