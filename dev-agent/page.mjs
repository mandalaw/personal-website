import { mount } from "./ui.mjs?v=d683840c0fb4";
import { theme } from "../hiring/ui.mjs";
theme();
const root = document.querySelector("#dev-agent-root");
mount(root);
root.querySelector(".agent-fallback")?.remove();
