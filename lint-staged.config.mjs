import path from "node:path";

// Relative, quoted paths keep the command short enough for Windows' 8k limit.
const files = (list) => list.map((f) => JSON.stringify(path.relative(process.cwd(), f))).join(" ");

const config = {
  "*.{ts,tsx}": (list) => [
    `eslint --fix --max-warnings 0 ${files(list)}`,
    `prettier --write ${files(list)}`,
  ],
  "*.{css,json,md,mjs,yml}": (list) => `prettier --write ${files(list)}`,
};

export default config;
