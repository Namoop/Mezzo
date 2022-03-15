# To build:

install nearleyc CLI

run to test (you should obviously use a hotkey or make command idk)

```
nearleyc grammar.ne -o parser.ts && deno run --allow-read --allow-write fixParserFile.ts && deno run --allow-read --allow-write compiler.ts
```