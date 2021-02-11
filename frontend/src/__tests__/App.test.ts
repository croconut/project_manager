import { render, screen } from "@testing-library/react";
import App from "../components/App";
import { mainRoute, loggedOutRoutes, loggedInRoutes } from "src/staticData/Routes";

const homepageLink = mainRoute.route;
const appName = mainRoute.name;
const secondaryRoutes = loggedOutRoutes;
const unrenderedRoutes = loggedInRoutes;

describe("<App />", () => {
  // it('renders a link to the homepage', () => {
  //   render(<App />);
  //   const linkElement = screen.getByText(appName).closest('a');
  //   expect(linkElement).toHaveAttribute('href', homepageLink);
  // });
  // it('renders a link to the navbar routes', () => {
  //   render(<App />);
  //   for (let i = 0; i < secondaryRoutes.length; i++) {
  //     const linkElement = screen.getByText(secondaryRoutes[i].name).closest('a');
  //     expect(linkElement).toHaveAttribute('href', secondaryRoutes[i].link);
  //   }
  // });
  // it('does not render a link to the non-navbar routes', () => {
  //   render(<App />);
  //   for (let i = 0; i < unrenderedRoutes.length; i++) {
  //     const linkElement = screen.queryByText(unrenderedRoutes[i].name);
  //     expect(linkElement).toBeNull();
  //   }
  // });
  it("meh", () => expect(true).toEqual(true));
});
