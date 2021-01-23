module.exports = {
  mainRoute: { name: "ProjectManager", link: "/" },
  navbarRoutes: [
    { name: "Create a Tasklist", link: "/tasklist/create" },
    /* TODO: create a view tasklist page, user profile page, create project page */
    { name: "Sign Up", link: "/join" },
  ],
  otherRoutes: [{ name: "Edit Exercise", link: "/tasklist/edit/:id" }],
  apiRoutes: {
    getUsers: "/api/users/:username",
    addUser: "/api/users/add",
    getExercises: "/api/tasklist",
    addExercise: "/api/tasklist/add",
  },
};
