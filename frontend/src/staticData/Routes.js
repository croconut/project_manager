module.exports = {
  mainRoute: { name: "ExerciseTracker", link: "/" },
  navbarRoutes: [
    { name: "Record an Exercise", link: "/exercise/create" },
    { name: "Sign Up", link: "/join" },
  ],
  nonNavbarRoutes: [{ name: "Edit Exercise", link: "/exercise/edit/:id" }],
  apiRoutes: {
    getUsers: "/api/users",
    addUser: "/api/users/add",
    getExercises: "/api/exercises",
    addExercise: "/api/exercises/add",
  },
};
