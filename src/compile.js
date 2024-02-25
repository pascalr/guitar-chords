import esbuild from "esbuild";
import sveltePlugin from "esbuild-svelte";

export function compileSvelte() {
  esbuild
    .build({
      entryPoints: ["src/svelte/index.js"],
      mainFields: ["svelte", "browser", "module", "main"],
      bundle: true,
      outfile: "docs/build/bundle.js",
      plugins: [sveltePlugin()],
      sourcemap: true,
      logLevel: "info",
    })
    .catch(() => process.exit(1));
}
