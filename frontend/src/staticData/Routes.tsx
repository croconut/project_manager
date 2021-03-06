export interface FrontendRoute {
  name: string;
  route: string;
}

export interface BackendRoute {
  route: string;
  methods: Array<string>;
}

export const mainRoute: FrontendRoute = { name: "ProjectManager", route: "/" };
export const loggedOutRoutes: Array<FrontendRoute> = [
  /* TODO: create a view tasklist page, user profile page, create project page */
  { name: "Sign Up", route: "/join" },
  { name: "Login", route: "/login" },
];
export const landingRoute: FrontendRoute = {
  name: "Welcome",
  route: "/welcome",
};
export const loggedInRoutes: Array<FrontendRoute> = [
  { name: "My Tasklists", route: "/tasklists" },
  { name: "My Organizations", route: "/organizations" },
  { name: "Profile", route: "/profile" },
  { name: "Logout", route: "/logout" },
];
export const nonNavbarRoutes: Array<FrontendRoute> = [
  { name: "Tasklist", route: "/tasklist/" },
  { name: "Create Tasklist", route: "/create/tasklist" },
  { name: "Organization", route: "/organization/" },
  { name: "Create Organization", route: "/create/organization" },
];
export const loginRouter: BackendRoute = {
  route: "/api/login",
  methods: ["POST"],
};
export const logoutRouter: BackendRoute = {
  route: "/api/logout",
  methods: ["POST"],
};
export const registerRouter: BackendRoute = {
  route: "/api/register",
  methods: ["POST"],
};
// no methods for the base yet
export const usersRouter: BackendRoute = { route: "/api/users", methods: [] };
export const usersUpdate: BackendRoute = {
  route: "/api/users/update",
  methods: ["POST"],
};

// can only delete yourself while logged in
export const usersDelete: BackendRoute = {
  route: "/api/users/delete",
  methods: ["DELETE"],
};

export const usersSearch: BackendRoute = {
  route: "/api/users/search",
  methods: ["GET"],
};

// want email to send user to frontend, then frontend to use this api
export const usersPasswordReset: BackendRoute = {
  route: "/api/userPasswordReset",
  methods: ["POST"],
};
// can a user register, given this email and/or username
export const registerCapable: BackendRoute = {
  route: "/api/register/existence",
  methods: ["GET"],
};

export const usersPrivateInfo: BackendRoute = {
  route: "/api/users/myinfo",
  methods: ["GET"],
};

// whatever changes are made to the tasklist should be bundled into this
export const updateTasklist: BackendRoute = {
  route: "/api/tasklist/update/",
  methods: ["POST"],
};

export const addTasklist: BackendRoute = {
  route: "/api/tasklist/add/",
  methods: ["POST"],
};

export const addTasks: BackendRoute = {
  route: "/api/tasklist/addTasks/",
  methods: ["POST"],
};

export const deleteTasklist: BackendRoute = {
  route: "/api/tasklist/delete/",
  methods: ["POST"],
};
