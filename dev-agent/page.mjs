import { mount } from "./ui.mjs";
import { theme } from "../hiring/ui.mjs";
theme();
const root = document.querySelector("#dev-agent-root");
mount(root);
root.querySelector(".agent-fallback")?.remove();
