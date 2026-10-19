# Football 101: Explain American Football

**▶ Watch it here: https://otterholte.github.io/Explain-American-Football/**

An animated, narrated crash course that teaches complete beginners the basics of NFL football. It's in the style of a Crash Course video, but you can pause, scrub and click along.

## What's inside
- **The Crash Course (18 steps):** the goal, the field, offense and defense, positions, how a play works, downs, 4th-down choices, scoring, changing possession, the game clock, and reading a TV scoreboard.
- **Rules & Penalties:** catches, false starts, offside, holding, pass interference, roughing the passer and kicker, and face masks.
- **Football Smarts:** formations, defensive fronts, motion, reading the defense, play-action and other tricks.
- **Quizzes:** quick checks in every step, a final quiz for each course, and a 10-question bonus quiz.
- **Flashcards:** every football word from all three courses, plus all the quiz questions.
- **Watch a Game:** a narrated TV-style broadcast of the Thunder vs. the Titans, from kickoff to the final whistle.
  - **Two announcers:** Mike calls each play as it happens, and Dana adds color, quick reminders and a few jokes, like a good sports podcast.
  - **Real game flow:** the offense huddles (the defense doesn't), walks to the line under the play clock, snaps, and heads back to the huddle. Special teams jog on and off for punts and field goals, and kickoffs follow the newer rule where nobody moves until the catch.
  - **3D replays:** slow-motion replays of a catch, a big tackle, a toe-tap sideline catch, the touchdown, an interception and a fumble (`replay3d.js`, built on three.js in `vendor/`).
  - **Two lengths:** the basics (about 11 minutes) or, after Rules & Penalties and Football Smarts, a longer cut (about 13 minutes) that adds a false start, holding, motion, man and zone coverage, the nickel defense, play-action and timeouts.
- **Ask Coach:** Coach Sam Lite, a chat helper built into the page (`coachlite.js`). It matches questions against about 100 beginner-friendly answers plus every flashcard.
  - **Speed:** instant, and it works offline.
  - **Cost:** no AI model, download, API key or server.

## Controls
- **Moving around:** Next and Back (or the arrow keys) step through the course. Space pauses, and you can drag the scrubber.
- **Buttons:** **CC** turns captions on or off, **🔊** mutes, **⛶** (or F) goes full screen, and **☰ Menu** jumps anywhere at any time.

## Run it locally
- **Basic:** run `node serve.js` and open http://localhost:8101.

## Regenerating narration
- **`node gen3.js` / `node gen_raw.js`:** read `narration.json` and write clips to `audio/`. Set `TTS_MODEL` to pick the Gemini TTS model, and `VOICE` / `STYLE` to change the voice.
