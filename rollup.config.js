import pkg from "./package.json";
import typescript from "@rollup/plugin-typescript";

const EXTERNAL = [
  "react",
  "react-dom",
  ...Object.keys(pkg.peerDependencies || {}),
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.devDependencies || {}),
];

const extSet = new Set(EXTERNAL);

console.log(extSet);

const extensions = [".js", ".jsx", ".ts", ".tsx"];

export default [
  {
    input: "src/index.ts",
    external: ['react', "react-dom"],
    output: [
      // { file: pkg.main, format: "cjs", sourcemap: true },
      { file: "rollup-bundle.js", format: "esm", sourcemap: true },
    ],
    plugins: [
      typescript({
        module: "esnext",
      }),
    ],
  },
];
