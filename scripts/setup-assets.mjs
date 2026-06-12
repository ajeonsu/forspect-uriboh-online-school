import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const indexPath = path.join(root, "index.html");
const lines = fs.readFileSync(indexPath, "utf8").split(/\r?\n/);
fs.mkdirSync(path.join(root, "app"), { recursive: true });
fs.writeFileSync(path.join(root, "app", "globals.css"), lines.slice(11, 3837).join("\n"));

const srcThumbs = path.join(root, "thumbs");
const destThumbs = path.join(root, "public", "thumbs");
fs.mkdirSync(destThumbs, { recursive: true });
for (const name of fs.readdirSync(srcThumbs)) {
  fs.copyFileSync(path.join(srcThumbs, name), path.join(destThumbs, name));
}

console.log("globals.css and public/thumbs ready");
