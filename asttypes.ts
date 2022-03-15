type AST = {
	metadata: StageMeta | SpriteMeta;
	events: EventObj[];
};
type EventObj = {
	event: Value | null;
	identifier: Value | null;
	block: Command[];
};

interface Command {
	command: Value | null;
}

interface CommandCall extends Command {
	values: (Value | null)[];
	identifiers: (Value | null)[];
}

interface CommandRepeat extends Command {
	until: string; // boolean
	value: Value | null;
	block: Command[];
}

type SpriteMeta = {
	name: Value;
	x: Value | null;
	y: Value | null;
	size: Value | null;
	direction: Value | null;
	show: Value | null;
	costume: Value | null;
	variables: {
		[variable: string]: Value;
	};
};

type StageMeta = {
	name: Value;
	backdrop: Value | null;
	variables: {
		[variable: string]: Value;
	};
};

type Value = {
	type: string;
	value: string;
	text: string;
	offset: number;
	linebreaks: number;
	line: number;
	col: number;
}
