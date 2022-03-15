import { parseFile } from "./parser.ts";
import * as SC from "./scratchtypes.ts";
import "./asttypes.ts";
//const dist = "dist";
const src = "src";
const destination = "sb3";
//if (destination == "js") compileToJS();
if (destination == "sb3") compileToSB3();

// async function compileToJS() {
// 	const ast = await parse(src + "/Stage/Stage.mez");

// 	const index = {};
// 	index.imports = `import { Project } from "https://unpkg.com/leopard@^1/dist/index.esm.js";\n
// import Stage from "./Stage/Stage.js";
// 	`;
// 	const backdrops = await fs.readdir(src + "/Stage/backdrops");
// 	index.consts = `const stage = new Stage({ costumeNumber: ${
// 		ast.metadata.backdrop ?? backdrops[0]
// 	} });`;

// 	const stage = {};
// 	stage.imports = `/* eslint-disable require-yield, eqeqeq */

// import {
// 	Stage as StageBase,
// 	Trigger,
// 	Costume,
// 	Color,
// 	Sound
// } from "https://unpkg.com/leopard@^1/dist/index.esm.js";\n\n`;
// 	stage.classstart = `export default class Stage extends StageBase {
// 	constructor(...args) {
// 		super(...args);\n`;
// 	stage.costumes = "";
// 	for (let i of backdrops)
// 		stage.costumes += `\t\t\tnew Costume("${
// 			i.split(".")[0]
// 		}", "./Stage/costumes/${i}", {
// 		\t\tx: 240,\n\t\t\t\ty: 180,
// 	\t\t}),\n`;
// 	stage.costumes = `\n\t\tthis.costumes = [\n${stage.costumes}\t\t];\n`;
// 	const stage_sounds = await fs.readdir(src + "/Stage/sounds");
// 	stage.sounds = "";
// 	for (let i of stage_sounds)
// 		stage.sounds += `\t\t\tnew Sound("${
// 			i.split(".")[0]
// 		}", "./Stage/sounds/${i}")\n`;
// 	stage.sounds = `\n\t\tthis.sounds = [\n${stage.sounds}\t\t];\n`;
// 	stage.varstring = "";
// 	stage.vars = {};
// 	Object.keys(ast.metadata)
// 		.filter((a) => a != "backdrop" && a != "name")
// 		.forEach((i) => {
// 			let m = ast.metadata[i];
// 			if (isNaN(Number(m)) && !(m[0] == '"' && m.at(-1) == '"'))
// 				throw new Error(`Variable initialization can only be a string or a number.
// 		--Initializing "${i}" as ${m}
// 		-- ${src}/Stage/Stage.mez Metadata @Stage Line ${m.line}
// 	Maybe try surrounding your value in quotes, like: "${m}"`);
// 			stage.varstring += `\n\t\tthis.vars.${i} = ${m}\n`;
// 			stage.vars[i] = isNaN(Number(m)) ? "string" : "number";
// 		});
// 	genjs(ast.events); //do later

// 	await fs.rm(dist, { recursive: true });
// 	await fs.mkdir(dist);
// 	const basehtml = await fs.readFile("example/leopard/index.html", {
// 		encoding: "utf-8",
// 	});
// 	fs.writeFile(dist + "/index.html", basehtml);

// 	const spritesarr = (await fs.readdir(src)).filter(
// 		(a) => !["index.html", "index.js", "Stage"].includes(a)
// 	);
// 	const sprites = {};
// 	for (let spr of spritesarr) {
// 		const sast = await parse(`${src}/${spr}/${spr}.mez`);
// 		await fs.writeFile("result.ast", JSON.stringify(sast, "", "  "));

// 		sprites.meta = sast.metadata;
// 		sprites.meta.x = sprites.meta.x ?? 0;
// 		sprites.meta.y = sprites.meta.y ?? 0;
// 		sprites.meta.direction = sprites.meta.direction ?? 0;
// 		sprites.meta.visible = sprites.meta.show ?? "true";
// 	}

// 	const indexjs =
// 		index.imports +
// 		"\n" +
// 		index.consts +
// 		"\n" +
// 		`const project = new Project(stage, sprites);
// export default project;`;
// 	fs.writeFile(dist + "/index.js", indexjs);

// 	await fs.mkdir(dist + "/Stage");
// 	const stagejs =
// 		stage.imports +
// 		stage.classstart +
// 		stage.costumes +
// 		stage.sounds +
// 		stage.varstring +
// 		"\n\t}\n}\n";
// 	fs.writeFile(dist + "/Stage/Stage.js", stagejs);
// }

// function genjs(block, stage) {}

async function compileToSB3() {
	const project = new SC.Project();
	await compileStage(project);
	for await (const s of Deno.readDir(src))
		if (s.name != "Stage") await compileSprite(project, s.name);

	Deno.writeTextFile("compiled.json", JSON.stringify(project, null, "\t"));
}

async function compileStage(project: SC.Project) {
	const ast = (await parseFile(src + "/Stage/Stage.mez")) as AST;
	//fs.writeFile("result.ast", JSON.stringify(ast, "", "\t"));

	const stage = new SC.Target_Stage();
	project.targets.push(stage);

	if (ast.metadata.name.value != "Stage")
		throw new Error(
			" In Stage.mez the metadata object should be titled 'Stage'. It was found as: " +
				ast.metadata.name
		);

	//handle reserved
	Object.keys(ast.metadata.variables).forEach((k) => {
		const val = ast.metadata.variables[k];
		stage.variables[genHex(k)] = [k, val.value];
		if (!["number", "string"].includes(val.type))
			throw new Error(
				`In Stage.mez the variable "${k}" was not defined as a string or number. For a string, please wrap it in quotes. A number (0-9) should not be in quotes. (line ${val.line}; col ${val.col})`
			);
	});

	//lists, brodcasts, blocks, comments, costumes, sounds, currentcostume

	//monitors **
	//extensions
	//meta ??
}

async function compileSprite(project: SC.Project, name: string) {
	const ast = await parseFile(src + `/${name}/${name}.mez`);
	Deno.writeTextFile("result.ast", JSON.stringify(ast, null, "\t"));

	const sprite = new SC.Target_Sprite(name);
	project.targets.push(sprite);

	//handle reserved
	Object.keys(ast.metadata.variables).forEach((k) => {
		const val = ast.metadata.variables[k];
		sprite.variables[genHex(k)] = [k, val.value];
		if (!["number", "string"].includes(val.type))
			throw new Error(
				`In ${name}.mez the variable "${k}" was not defined as a string or number. For a string, please wrap it in quotes. A number (0-9) should not be in quotes. (line ${val.line}; col ${val.col})`
			);
	});
}

function genHex(str: string, asString = true, seed?: number) {
	/*jshint bitwise:false */
	let i,
		l,
		hval = seed === undefined ? 0x811c9dc5 : seed;

	for (i = 0, l = str.length; i < l; i++) {
		hval ^= str.charCodeAt(i);
		//prettier-ignore
		hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
	}
	if (asString) {
		// Convert to 8 digit hex string
		return ("0000000" + (hval >>> 0).toString(16)).substr(-8);
	}
	return hval >>> 0;
}
