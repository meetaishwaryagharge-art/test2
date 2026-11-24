// MODULE REGISTRY. To add a new dashboard section: create modules/<name>.js and add one line here.
// A module is { id, title, icon, mount(root) -> optional cleanup function }.
import overview from "./overview.js";
import appointments from "./appointments.js";
import healthchecks from "./healthchecks.js";

export default [overview, appointments, healthchecks];
