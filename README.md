# Football 101: Explain American Football

**▶ Watch it here: https://otterholte.github.io/Explain-American-Football/**

An animated, narrated crash course that teaches complete beginners the basics of NFL football. It's in the style of a Crash Course video, but you can pause, scrub and click along.

## What's inside
- **The Crash Course (18 steps):** the goal, the field, offense and defense, positions, how a play works, downs, 4th-down choices, scoring, changing possession, the game clock, and reading a TV scoreboard.
- **Rules & Penalties:** catches, false starts, offside, holding, pass interference, roughing the passer and kicker, and face masks.
- **Football Smarts:** formations, defensive fronts, motion, reading the defense, play-action and other tricks.
- **Quizzes:** quick checks in every step, a final quiz for each course, and a 10-question bonus quiz.
- **Flashcards:** every football word from all three courses, plus all the quiz questions.
- **Game Day:** an arcade football game with 4 one-minute quarters.
  - **Offense:** pick Run, Pass or Trick, then one of 4 plays (12 total, including a reverse, flea flicker and halfback pass). A coach card shows the plan on the field, the keys to press, and why it works.
  - **Passing:** your QB checks receivers one at a time; press Enter (or tap Throw) when one turns green.
  - **Defense:** a simple scouting report, then steer your player to the ball.
  - **Kicking:** power and accuracy meters with a behind-the-kicker view, aim-where-it-lands punts, and real kickoff returns.
  - **Help:** first-time tip cards for each part of the game, plus a Help button that pauses and talks you through the screen.
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
