# token-usage-monitor

A Claude Code statusline that shows, continuously while you work:

- **Context window fill**, as a color-coded percentage — green (0–20%),
  yellow (21–60%), orange (61–80%), red (81–100%) — so it's obvious at
  a glance when to run `/clear` or `/compact`.
- **Cumulative session cost** in dollars, taken directly from Claude
  Code's own cost tracking (this plugin does no cost estimation of its
  own).

Example output:

```
45.2k/200k tokens (23%) ~$0.34
```

## Requirements

- Node.js >= 18 (only used to run the script; no npm install needed —
  there are no dependencies). If you don't have it, install with
  `brew install node` (or download from [nodejs.org](https://nodejs.org)).

## Setup

Claude Code plugins can't register a statusline for themselves —
`statusLine` is a top-level key in your `settings.json`, so this is a
one-time manual step:

1. Find the absolute path to `scripts/statusline.js` in this project.
   For example, if you cloned this repo to
   `/Users/you/token-usage-monitor`, the path is
   `/Users/you/token-usage-monitor/scripts/statusline.js`. (Run `pwd`
   inside the project folder if you're not sure.)

2. Open your Claude Code `settings.json` (in your user config
   directory, `~/.claude/settings.json`) and merge in the
   `statusLine` key shown below. If you already have a `settings.json`
   with other keys, add `statusLine` alongside them rather than
   overwriting the file — the snippet below shows the full object
   shape for a from-scratch `settings.json`:

   ```json
   {
     "statusLine": {
       "type": "command",
       "command": "node \"/Users/you/token-usage-monitor/scripts/statusline.js\""
     }
   }
   ```

   Replace the path with your actual path from step 1.

3. Restart Claude Code (or start a new session). The statusline should
   appear at the bottom of the terminal and update after each
   assistant turn.

If you move or rename this project folder later, update the `command`
path in `settings.json` to match.

## Testing

```bash
npm test
```

Runs the unit tests (`test/statusline.test.js`) and the CLI/subprocess
tests (`test/cli.test.js`) via Node's built-in te
