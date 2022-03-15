const text = await Deno.readTextFile("./parser.ts");
const header = "// deno-lint-ignore-file no-explicit-any no-var ban-ts-comment no-extra-semi ban-types \n"
const footer = `import * as nearley from "https://deno.land/x/nearley@2.19.7-deno/mod.ts";
export async function parseFile(file: string) {
	const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
	parser.feed(await Deno.readTextFile(file));
	let allsame = false;
	const initial = JSON.stringify(parser.results[0]);
	allsame = parser.results.every((i) => JSON.stringify(i) == initial);
	if (parser.results.length > 1)
		console.warn(
			allsame
				? \`warning: whitespace ambiguity detected (\${parser.results.length})\`
				: \`warning: ambiguous grammar detected (\${parser.results.length})\`
		);
	return parser.results[0];
}`
await Deno.writeTextFile("./parser.ts", header + text + footer)