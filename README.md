# Football 101: Explain American Football

**▶ Watch it here: https://otterholte.github.io/Explain-American-Football/**

An animated, narrated crash course that teaches a complete beginner the basics of NFL football, one short step at a time. It's in the style of a Crash Course video, but you can pause, scrub and click along.

## What's inside
- **18 short steps:** the goal, the field, offense vs. defense, how a play works, downs, 4th-down choices, scoring, player positions, changing possession, the game clock and reading a TV scoreboard.
- **Narration and animation:** every step is voiced (Gemini text-to-speech, voice "Achird") and timed to animated 11-on-11 plays.
- **Quick checks:** questions throughout, plus a 5-question final quiz.
- **Meet the Players:** an explore mode where you can rotate, zoom and click any player.
- **Ask Coach:** an AI chat helper. It only works when the site runs locally with `serve.js`, because it needs a private API key.

## Controls
- **Next / Back:** move between steps. You can also use the arrow keys.
- **Play/pause and scrubber:** pause with the button or the Space key, and drag the scrubber to move through a step.
- **CC:** shows or hides captions (off by default).
- **🔊:** mutes or unmutes sound.

## Run it locally (with Ask Coach)
1. Put a Gemini API key in `gemini_key.txt`. This file is git-ignored and never served.
2. Run `node serve.js`.
3. Open http://localhost:8101.

## Regenerating narration
`node gen3.js` reads `narration.json` and writes the clips to `audio/`. Set `TTS_MODEL` to pick the Gemini TTS model, and set `SINGLE=1` to make one request per line.
