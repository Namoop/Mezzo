export class Project {
	targets: Target[] = [];
	monitors: Monitor[] = [];
	extensions: string[] = [];
	meta: Meta | Record<never, never> = {};
}

interface Meta {
	semver: string;
	vm: string;
	agent: string;
}

abstract class Target {
	abstract name: string;
	variables: { [varName: string]: [string, string | number] } = {};
	lists: { [listName: string]: string | number } = {};
	broadcasts = {};
	blocks: { [blockId: string]: Block } = {};
	comments = {};
	currentCostume = 0;
	costumes = []; //type CostumeObj
	sounds = []; //type SoundObj
	volume = 100;
	layerOrder = 1;
}

export class Target_Stage extends Target {
	isStage = true;
	tempo = 60;
	videoTransparency = 50;
	videoState = "on";
	textToSpeechLanguage = null;
	name = "Stage";
}

export class Target_Sprite extends Target {
	isStage = false;
	visible = true;
	x = 0;
	y = 0;
	size = 100;
	direction = 90;
	draggable = false;
	rotateionStyle = "all around";
	name: string;
	constructor(name: string) {
		super();
		this.name = name;
	}
}

export class Block {
	opcode: string;
	next: string;
	parent: string | null;
	inputs = []; // inputs
	fields = []; //fields
	shadow = false;
	topLevel = false;
	x: undefined | number;
	y: undefined | number;
	constructor() {
		this.opcode = "";
		this.next = "";
		this.parent = null;
	}
}

export class Monitor {
	//
}