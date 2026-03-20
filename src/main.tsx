import { render } from "preact";
import "./globals.css";
import { App } from "@/components/App";

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

render(<App />, root);
