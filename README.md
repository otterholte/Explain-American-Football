# Football 101: Explain American Football

**▶ Watch it here: https://otterholte.github.io/Explain-American-Football/**

An animated, narrated crash course that teaches complete beginners the basics of NFL football. It's in the style of a Crash Course video, but you can pause, scrub and click along.

## What's inside
- **The Crash Course (18 steps):** the goal, the field, offense and defense, positions, how a play works, downs, 4th-down choices, scoring, changing possession, the game clock, and reading a TV scoreboard.
- **Rules & Penalties:** catches, false starts, offside, holding, pass interference, roughing the passer and kicker, and face masks.
- **Football Smarts:** formations, defensive fronts, motion, reading the defense, play-action and other tricks.
- **Quizzes:** quick checks in every step, a final quiz for each course, and a 10-question bonus quiz.
- **Flashcards:** every football word from all three courses, plus all the quiz questions.
- **Game Day:** an arcade football game. Name your team, call the plays, steer your runner, pick your receiver. First to 2 touchdowns wins.
- **Ask Coach:** an AI chat helper (Coach Sam) that runs **entirely in your browser** with a small open model (Qwen 3.5 via [WebLLM](https://github.com/mlc-ai/web-llm)).
  - **Needs:** a browser with WebGPU (Chrome or Edge on a computer, or a recent phone browser).
  - **First use:** the model downloads once (about 0.6–2.5 GB, depending on the size you pick) and is then cached.
  - **Cost:** no API key or server, and nothing is sent anywhere.

## Controls
- **Moving around:** Next and Back (or the arrow keys) step through the course. Space pauses, and you can drag the scrubber.
- **Buttons:** **CC** turns captions on or off, **🔊** mutes, **⛶** (or F) goes full screen, and **☰ Menu** jumps anywhere at any time.

## Run it locally
- **Basic:** run `node serve.js` and open http://localhost:8101.
- **Server fallback for Coach Sam (optional):** put a Gemini API key in `gemini_key.txt`. The file is git-ignored and never served. This is only for browsers without WebGPU.

## Regenerating narration
- **`node gen3.js` / `node gen_raw.js`:** read `narration.json` and write clips to `audio/`. Set `TTS_MODEL` to pick the Gemini TTS model, and `VOICE` / `STYLE` to change the voice.
