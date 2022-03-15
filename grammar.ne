@preprocessor typescript
@{%
	// deno-lint-ignore-file no-explicit-any no-var ban-ts-comment no-extra-semi

	import * as moo from "https://deno.land/x/moo@0.5.1-deno.2/mod.ts"

    const lexer = moo.compile({
	  WS: 		{ match: /[ \t\n\v\f]+/, lineBreaks: true },
      comment:	/\/\/.*?$/,
      number:	/0|[1-9][0-9]*/,
      string:	/"(?:\\["\\]|[^\n"\\])*"/,
      lparen:	'(',
      rparen:	')',
	  lcurly:	'{',
      rcurly:	'}',
	  semi:		';',
	  colon:	':',
	  at:		'@',
      identifier: {match: /[a-zA-Z_][a-zA-Z_0-9]*/, type: moo.keywords({
        keyword: ['when', 'if', 'else', 'move', 'turn', 'repeat', 'say', 'change', 'set', 'forever'],
      })},
    })
%}

@lexer lexer

program -> metadata _ eventblock:*
	{%
		(data) => {
			return {
				metadata: data[0],
				events: data[2],
			}
		}
	%}

metadata -> "@" _ %identifier _ dictionary
	{%
		(data) => {
			const res:{[reservedValue: string]: NearleyToken} = {name: data[2]}
			const variables:{[reservedValue: string]: NearleyToken} = {}
			for (const i of Object.keys(data[4]))
				data[4][i].reserved
					? res[i] = data[4][i]
					: variables[i] = data[4][i]
			//@ts-ignore
			res.variables = variables
			return res
		}
	%}

eventblock
	-> "when" _ expression _ %identifier _ codeblock _
	{%
		(data) => {
			return {
				event: data[2],
				identifier: data[4],
				block: data[6],
			}
		}
	%}

codeblock
	-> "{" wsStatement:* _ "}" {%(d)=>d[1]%}


wsStatement -> _ statement ___ {%(d)=>d[1]%}
statement
	-> %comment [\n] {%()=>{return}%}
	|  command {%id%}
	|  repeatblock {%id%}

command # command call (say "hi") (move 10 steps) (change bar by 10)
	-> %keyword __ expression (__ %identifier (__ expression (__ %identifier):?):?):?
	{%
		(data) => {
			return {
				command: data[0],
				values: [data[2], data[3]?.[2]?.[1]],
				identifiers: [data[3]?.[1], data[3]?.[2]?.[2]?.[1]],
			}
		}
	%}

repeatblock #executes the code block multiple times
	-> "repeat" (__ "until"):? __ expression _ codeblock
	{%
		(data) => {
			return {
				command: "repeat",
				until: data[1] ? "true" : "false",
				value: data[3],
				block: data[5],
			}
		}
	%}


#TODO: add math equations
expression
	-> %string {%id%}
	|  %number {%id%}
	|  %identifier {%id%}
	|  dictionary {%id%}
	| "(" _ expression _ ")" {%(d)=>d[2]%}

dictionary -> "{" _ (dictproperty ___ ):* _ "}"
	{%
		(data) => {
			const dict:{[prop: string]: NearleyToken} = {}
			for (const i of data[2]) dict[i[0][0]] = {...i[0][1], reserved: i[0][2]}
			return dict
		}
	%}
dictproperty -> ":":? %identifier _ ":" _ expression
	{%
		(data) => [data[1], data[5], data[0] ? 1 : 0]
	%}

#whitespace
_ -> %WS:* {% function() {return null } %}
__ -> %WS:+ {% function() {return null } %}
___ -> _ %comment:? [\n] {%() => {return} %} 
	|  _ ";" %comment:?  {%() => {return} %}