/* =========================================================
   Coach Sam Lite: a tiny built-in answer finder. No AI download, no server, works offline.
   It matches the question against hand-written football answers plus every flashcard on the site.
   ========================================================= */
(function(){
// [id, example questions (|), extra keywords, answer, related ids]
const KB=[
// ---------- the basics ----------
['goal',"what's the point of football|how do you win|what is the goal|object of the game|how does football work|explain football|what are the rules of football|how do you play football","win objective basics point aim rules work",
 "Each team tries to carry or throw the ball into the other team's **end zone** to score. You get 4 tries (downs) to move the ball 10 yards; make it and you get 4 more. The team with more points when time runs out wins.",['downs','scoring','endzone']],
['length',"how long is a football game|how many quarters|how long is a quarter|game length|how much time","minutes duration quarter long time clock 60",
 "An NFL game has **60 minutes** of playing time, split into four 15-minute quarters. Because the clock stops a lot, a real game takes about 3 hours.",['halftime','overtime','clockstop']],
['halftime',"what is halftime|how long is halftime|when is halftime","half break intermission",
 "**Halftime** is the break after the 2nd quarter, about 13 minutes in the NFL (longer at the Super Bowl for the show). Teams rest, make adjustments, and the second half starts with a kickoff.",['length','kickoff']],
['overtime',"what happens if it's tied|is there overtime|how does overtime work|can a game end in a tie","tie tied ot extra time draw",
 "If the score is tied after 4 quarters, they play **overtime**. In the regular season it's 10 minutes, both teams get a chance with the ball, and if it's still tied, the game ends in a tie. In the playoffs, they keep playing until someone wins.",['length','superbowl']],
['players',"how many players are on the field|how many players on a team|how many players per side","11 eleven roster number players",
 "Each team has **11 players** on the field at a time. Teams have about 53 players in total, because different groups come in for offense, defense and kicking plays.",['offense','defense','specialteams']],
['field',"how big is a football field|how long is the field|how wide is the field|field size","yards length width dimensions 100 120",
 "The field is **100 yards** long from goal line to goal line, plus a 10-yard **end zone** at each end, so 120 yards in all. It's about 53 yards wide. The **50-yard line** is right in the middle.",['yardlines','endzone','hash']],
['yardlines',"what do the numbers on the field mean|what are the yard lines|why do the numbers go down|what is the 50 yard line|midfield","numbers lines 10 20 30 40 50 midfield own",
 "The white lines mark every 5 yards, with numbers every 10. The numbers count up from each goal line to the **50** in the middle, then back down. So \"Red's 30\" means 30 yards from Red's own end zone.",['field','endzone']],
['endzone',"what is the end zone|where do you score","end zone scoring area colored",
 "The **end zone** is the colored area at each end of the field. Get the ball into the *other* team's end zone and you score a touchdown. Each team defends its own end zone, like a soccer goal.",['touchdown','safety']],
['downs',"what is a down|what are downs|how do downs work|why do they get 4 tries|what does 3rd and 4 mean|what does 1st and 10 mean|down and distance","down tries attempts 1st 2nd 3rd 4th first second third fourth and to go distance",
 "A **down** is one try, or play. The offense gets **4 downs** to move the ball 10 yards. \"3rd and 4\" means it's their 3rd try and they need 4 more yards. If they make the 10 yards, they get a fresh set of 4 downs.",['firstdown','fourthdown','yellowline']],
['firstdown',"what is a first down|how do you get a first down|what does first down mean","first down fresh set chains new",
 "A **first down** happens when the offense gains 10 yards within its 4 tries. The count starts over: \"1st and 10\" again, with 4 brand-new tries. Stringing first downs together is how teams march down the field.",['downs','yellowline','chains']],
['fourthdown',"what happens on 4th down|why do teams punt on 4th down|should they go for it|what is going for it","fourth 4th decision go for it",
 "On **4th down**, a team has 3 choices: **punt** the ball away, kick a **field goal** if they're close enough, or **go for it**. If they go for it and fall short, the other team gets the ball right there (a turnover on downs).",['punt','fieldgoal','tod']],
['scrimmage',"what is the line of scrimmage|where does the play start|what is the blue line on tv","line scrimmage start blue los",
 "The **line of scrimmage** is the imaginary line where the ball sits before a play. The offense and defense line up on opposite sides of it. On TV it's often drawn as a **blue line**.",['yellowline','offside','snap']],
['yellowline',"what is the yellow line on tv|why is there a yellow line|first down line","yellow line tv marker first down line",
 "The **yellow line** on TV isn't really on the field. It's drawn by computer to show where the offense needs to reach for a **first down**.",['firstdown','scrimmage','chains']],
['snap',"what is the snap|what is a hike|how does a play start|why does the center pass the ball back","snap hike center start play",
 "Every play starts with the **snap**: the center passes the ball back between his legs to the quarterback (or to the punter or holder on kicks). Nobody can move forward across the line before the snap.",['center','qb','falsestart']],
['play',"how does a play work|what happens during a play|when does a play end","play ends whistle tackle dead",
 "A play starts with the snap and ends when the ball carrier is **tackled**, runs **out of bounds**, scores, or a pass hits the ground. Then the ball is placed where the play ended and the teams line up again.",['snap','tackle','incomplete']],
['tackle',"what is a tackle|how do you tackle|what counts as tackled|when is a player down","tackle down tackled ground knee",
 "A **tackle** is bringing the ball carrier to the ground. In the NFL, once his knee or body (not hands or feet) touches the ground because a defender made contact, he's down and the play is over.",['play','fumble','sack']],
['oob',"what happens when you go out of bounds|out of bounds|sideline","out bounds sideline boundary stops clock",
 "If the ball carrier steps on or over the sideline, he's **out of bounds** and the play ends. The ball is placed where he went out, and the clock usually stops for a moment.",['clockstop','hash']],
['hash',"what are hash marks|why does the ball move to the middle|why is the ball moved after going out of bounds","hash marks middle center inbounds lines",
 "**Hash marks** are the two rows of short lines near the middle of the field. If a play ends near the sideline, the ball is moved in to the nearest hash mark so both teams have room to line up on both sides.",['oob','field']],
['possession',"what does possession mean|who has the ball|how does the other team get the ball","possession ball change switch get",
 "The team with the ball is on **offense**. The other team gets the ball after a score (on the kickoff), after a punt, after a turnover, or if the offense fails on 4th down.",['turnover','punt','kickoff']],
['kickoff',"what is a kickoff|why do they kick off|when do they kick off|how does a kickoff work","kickoff kick start half after score",
 "A **kickoff** starts each half, and comes after every score. One team kicks the ball deep and the other team catches it and tries to run it back. If it's kicked into the end zone and not run out, it's a **touchback**.",['touchback','onside','returner']],
['onside',"what is an onside kick|why would a team kick it short","onside short kick recover surprise",
 "An **onside kick** is a short, tricky kickoff the kicking team tries to get back. It has to go at least 10 yards. Teams usually only try it when they're losing late in the game, because it rarely works.",['kickoff']],
['punt',"what is a punt|why do teams punt|what does punting mean|who punts","punt punter kick away 4th",
 "A **punt** is when the offense kicks the ball far down the field on 4th down. They give up the ball, but the other team has to start much farther away from scoring. It's like saying, \"we didn't make it, so let's make your trip long.\"",['fourthdown','touchback','faircatch']],
['touchback',"what is a touchback|why does the ball come out to the 20|ball kicked into the end zone","touchback 20 35 end zone",
 "A **touchback** happens when a kick goes into the end zone and isn't run out, or a punt bounces in. The receiving team just takes the ball: at the **20** after a punt, or farther out (the 35) after a kickoff under the newest rules.",['punt','kickoff','faircatch']],
['faircatch',"what is a fair catch|why do they wave their hand|why did he raise his arm","fair catch wave hand arm",
 "A **fair catch** is when the returner waves one arm over his head before catching a kick. He promises not to run, and in return nobody can hit him. The offense starts right where he caught it.",['punt','returner','touchback']],
// ---------- scoring ----------
['scoring',"how do you score|how many points|how does scoring work|ways to score|points","score points scoring 6 3 2 1 7",
 "There are 4 main ways to score: a **touchdown** (6 points), the try after it (1 for a kick or 2 for a play), a **field goal** (3), and a **safety** (2 points for the defense).",['touchdown','fieldgoal','safety']],
['touchdown',"what is a touchdown|how many points is a touchdown|how do you get a touchdown|td","touchdown td six 6 score",
 "A **touchdown** is worth **6 points**. You get it by running or catching the ball in the other team's end zone. Right after, the team tries for 1 or 2 bonus points.",['xp','twopoint','endzone']],
['xp',"what is an extra point|what is a pat|how many points is the extra point","extra point pat kick 1 one after",
 "The **extra point** is a short kick worth **1 point** right after a touchdown. It's basically a really short field goal, and NFL kickers make it almost every time.",['twopoint','touchdown','fieldgoal']],
['twopoint',"what is a two point conversion|why go for two|2 point try","two point conversion 2 go for two",
 "Instead of kicking, a team can try a **two-point conversion**: one play from the 2-yard line. Run or pass it into the end zone for **2 points**. It's harder than the kick, so teams usually only try it when they really need those points.",['xp','touchdown']],
['fieldgoal',"what is a field goal|how many points is a field goal|how far can kickers kick|when do they kick a field goal","field goal fg kick 3 three posts uprights",
 "A **field goal** is worth **3 points**. The kicker kicks the ball through the goal posts, above the crossbar. Teams usually try one on 4th down when they're close enough. Most kickers can make kicks of 50+ yards, and the best can reach the 60s.",['xp','goalposts','fourthdown']],
['goalposts',"what are the goal posts|how wide are the goal posts|what is the crossbar","goal posts uprights crossbar yellow",
 "The **goal posts** are the tall yellow posts at the back of each end zone. For a field goal or extra point, the ball must go between the two upright posts and above the crossbar, which is 10 feet high.",['fieldgoal','xp']],
['safety',"what is a safety|how do you get a safety|why is a safety 2 points","safety two 2 own end zone defense",
 "A **safety** is a rare play worth **2 points for the defense**. It happens when the offense's ball carrier is tackled in his *own* end zone. Then the team that gave up the safety also has to kick the ball away.",['endzone','scoring','safetypos']],
// ---------- changing possession ----------
['turnover',"what is a turnover|what does turnover mean","turnover takeaway lose ball giveaway",
 "A **turnover** is when the defense takes the ball away during a play, with an **interception** or a **fumble** recovery. When you hear \"turnover\" by itself, it means the ball was taken away.",['interception','fumble','tod']],
['interception',"what is an interception|what is a pick|int","interception intercepted pick picked off int",
 "An **interception** is when a defender catches a pass meant for the offense. His team gets the ball, and he can even run it back for a touchdown.",['turnover','fumble']],
['fumble',"what is a fumble|what happens if you drop the ball","fumble dropped loose ball",
 "A **fumble** is when a player with the ball drops it or has it knocked out before he's down. Anyone can grab it. If the defense recovers it, that's a turnover.",['turnover','interception']],
['tod',"what is a turnover on downs|what happens if they fail on 4th down","turnover on downs fail fourth short",
 "A **turnover on downs** happens when the offense goes for it on 4th down and comes up short. Nobody lost the ball; they just ran out of tries, so the other team takes over right there.",['fourthdown','turnover']],
// ---------- passing & running ----------
['run',"what is a running play|what is a run|rushing","run running rush rushing handoff carry",
 "On a **running play**, the quarterback usually hands the ball to a running back, who runs through gaps that his blockers open up. Runs are safer than passes but usually gain fewer yards.",['rb','pass','handoff']],
['handoff',"what is a handoff","handoff hand give",
 "A **handoff** is when the quarterback hands the ball directly to another player, usually the running back, to start a run.",['run','rb']],
['pass',"what is a pass|how does passing work|forward pass|how many passes can you throw","pass passing throw forward catch",
 "On a **passing play**, the quarterback throws the ball to a receiver. Only **one forward pass** is allowed per play, and it must be thrown from behind the line of scrimmage. If nobody catches it, it's **incomplete**.",['catch','incomplete','qb']],
['incomplete',"what is an incomplete pass|what happens if the pass hits the ground","incomplete incompletion dropped ground",
 "An **incomplete pass** is a pass that hits the ground before anyone catches it. The play is over, the ball goes back to where it started, and the offense uses up a down.",['pass','catch']],
['catch',"what counts as a catch|what is a catch|why wasn't that a catch|how many feet in bounds","catch completion feet bounds control",
 "In the NFL, a **catch** needs 3 things: the receiver **controls** the ball, gets **two feet** (or a knee or other body part) down in bounds, and holds on long enough to make a **football move**, like a step or reaching forward.",['pass','incomplete','oob']],
['lateral',"what is a lateral|can you throw backwards|backward pass","lateral pitch backward sideways toss",
 "A **lateral** is a toss sideways or backward. Unlike a forward pass, you can lateral as many times as you want on a play. But if it hits the ground, it's a live fumble.",['pass','fumble']],
['sack',"what is a sack|what does sacked mean","sack sacked tackled quarterback behind",
 "A **sack** is when the defense tackles the quarterback behind the line of scrimmage before he can throw. The offense loses yards, which makes the next down harder.",['qb','blitz','pocket']],
['screen',"what is a screen pass","screen short behind blockers",
 "A **screen pass** is a short throw to a player behind or near the line, with blockers set up in front of him. It's a trick to punish defenders who rush too hard.",['pass','blitz']],
['hailmary',"what is a hail mary|last second pass","hail mary desperate long heave",
 "A **Hail Mary** is a long, desperate pass thrown into the end zone at the very end of a half, with lots of players crowding around. It almost never works, which makes it exciting when it does.",['pass','clockstop']],
// ---------- clock ----------
['clockstop',"when does the clock stop|why does the clock stop|how does the clock work","clock stops stop running time",
 "The game clock **stops** after an incomplete pass, when a player runs out of bounds, after scores, for timeouts and for penalties. That's why the last two minutes can take a long time.",['timeout','twominute','playclock']],
['timeout',"what is a timeout|how many timeouts|why call a timeout","timeout timeouts three stop",
 "Each team gets **3 timeouts per half**. A timeout stops the clock, which helps a team that's trying to save time late in a game, or to avoid a penalty when the play clock is running out.",['clockstop','twominute']],
['twominute',"what is the two minute warning|two minute drill|hurry up offense","two minute warning drill hurry",
 "The **two-minute warning** is an automatic pause when 2 minutes are left in each half. After it, teams often run a **two-minute drill**: fast plays, passes toward the sideline, and timeouts to save time.",['clockstop','timeout']],
['playclock',"what is the play clock|why do they have 40 seconds","play clock 40 seconds delay",
 "The **play clock** gives the offense **40 seconds** between plays to snap the ball. If it hits zero first, it's a **delay of game** penalty (5 yards).",['delay','clockstop']],
['kneel',"why does the quarterback kneel|what is victory formation|why take a knee","kneel knee victory formation",
 "When a team is winning near the end, the quarterback might **take a knee** right after the snap. The play ends instantly, nobody can fumble, and the clock keeps running. It's often called the **victory formation**.",['clockstop','qb']],
// ---------- positions ----------
['offense',"who is on offense|what positions are on offense|offensive positions","offense offensive positions team",
 "The **offense** has the ball. Its 11 players are usually: a **quarterback**, a **center** and 4 other **offensive linemen**, a **running back**, **wide receivers**, and a **tight end**.",['qb','oline','wr']],
['defense',"who is on defense|what positions are on defense|defensive positions","defense defensive positions team",
 "The **defense** tries to stop the offense. Its 11 players are **defensive linemen** up front, **linebackers** behind them, and **cornerbacks** and **safeties** in the back (together called defensive backs).",['dline','lb','cb']],
['specialteams',"what are special teams|who plays on kicks","special teams kicking unit",
 "**Special teams** are the players on the field for kicking plays: kickoffs, punts, field goals and extra points. That includes the kicker, punter, long snapper, holder and returners.",['kicker','punter','returner']],
['qb',"what does the quarterback do|who is the quarterback|what is a qb","quarterback qb leader passer",
 "The **quarterback** (QB) is the leader of the offense. He takes the snap, then either hands the ball off, throws a pass, or runs with it himself. He's usually the most important player on the team.",['center','pass','pocket']],
['center',"what does the center do|who snaps the ball","center snapper snap middle",
 "The **center** is the offensive lineman in the very middle. He starts each play by snapping the ball back to the quarterback, then blocks.",['snap','oline','qb']],
['oline',"what does the offensive line do|what are linemen|what is a guard|what is a tackle position","offensive line linemen guard tackle blockers ol o-line",
 "The **offensive line** is the 5 big players in front: a center, two guards and two tackles. They **block**: making holes for runners and protecting the quarterback so he has time to throw.",['center','pocket','holding']],
['rb',"what does the running back do|what is a halfback|what is an rb","running back rb halfback tailback carrier",
 "The **running back** lines up behind or next to the quarterback. He mostly takes handoffs and runs, but he also catches short passes and helps block.",['run','fullback','handoff']],
['fullback',"what is a fullback|what does a fullback do","fullback fb lead blocker power",
 "A **fullback** is a strong blocker who lines up in front of the running back. On power runs, he crashes into the first defender to clear the way.",['rb','iform','run']],
['wr',"what does a wide receiver do|what is a receiver|what is a wr","wide receiver wr wideout catch routes",
 "**Wide receivers** line up near the sidelines. They run planned paths called **routes** to get open, then catch passes. They're usually some of the fastest players on the field.",['pass','route','te']],
['te',"what is a tight end|what does a tight end do","tight end te block catch",
 "A **tight end** lines up right next to the offensive line. He's a mix of blocker and receiver: big enough to block, and able to catch passes too.",['wr','oline']],
['route',"what is a route|what are routes","route path pattern",
 "A **route** is the planned path a receiver runs on a pass play, like going straight deep, cutting toward the middle, or turning back toward the QB. The QB knows the routes so he knows where to throw.",['wr','pass']],
['dline',"what does the defensive line do|what is a defensive end|what is a defensive tackle","defensive line dl d-line end tackle linemen",
 "The **defensive line** is the big players up front on defense (defensive tackles in the middle, defensive ends on the outside). They push past blockers to stop runs and chase the quarterback.",['sack','lb','fronts']],
['lb',"what does a linebacker do|what is a linebacker","linebacker lb backers middle",
 "**Linebackers** line up behind the defensive line. They do a bit of everything: tackle runners, cover short passes, and sometimes rush the quarterback (a blitz).",['dline','blitz','fronts']],
['cb',"what does a cornerback do|what is a cornerback|what is a corner","cornerback cb corner cover receivers",
 "**Cornerbacks** line up across from the wide receivers. Their main job is covering receivers so passes can't be caught, and making tackles.",['safetypos','man','zone']],
['safetypos',"What does a safety (the player) do?|what does a safety do|safety position|who plays safety","safeties deep last line free strong position player",
 "**Safeties** (the position) play deepest on defense, like the last line of protection. They help stop long passes and make tackles if a runner breaks free. Not to be confused with a safety the score, which is worth 2 points!",['cb','zone','safety']],
['db',"what is a defensive back|what is the secondary","defensive back db secondary",
 "**Defensive backs** are the cornerbacks and safeties together, also called the **secondary**. They cover receivers and defend passes.",['cb','safetypos','nickel']],
['kicker',"what does the kicker do","kicker k placekicker",
 "The **kicker** handles kickoffs, field goals and extra points. He might only play a few times a game, but his kicks often decide close games.",['fieldgoal','xp','kickoff']],
['punter',"what does the punter do","punter punt kick",
 "The **punter** kicks the ball away on 4th down. He catches the long snap, takes a couple of steps, and drops the ball onto his foot to send it high and far.",['punt','specialteams']],
['returner',"what does a returner do|what is a kick returner|punt returner","returner return kick punt",
 "The **returner** catches kickoffs and punts and tries to run them back as far as he can. He can also call a **fair catch** to safely catch a punt without being hit.",['kickoff','faircatch']],
['holder',"what is a holder|what is a long snapper","holder long snapper snap kick",
 "On field goals and extra points, the **long snapper** snaps the ball back about 7 yards to the **holder**, who sets it on the ground so the kicker can kick it.",['fieldgoal','kicker']],
// ---------- penalties ----------
['penalty',"what is a penalty|what is a flag|why do they throw a yellow flag|what happens on a penalty","penalty flag foul yellow yards",
 "When a player breaks a rule, an official throws a **yellow flag**. That's a **penalty**: the team that broke the rule usually loses yards (5, 10 or 15), or the other team gains them. Some penalties also give an automatic first down.",['accept','falsestart','holding']],
['accept',"what does declined mean|why decline a penalty|accept or decline","accept decline declined accepted choice",
 "The team that was fouled gets to choose: **accept** the penalty yards or **decline** them and keep the result of the play. They decline if the play itself turned out better for them.",['penalty']],
['falsestart',"what is a false start","false start early flinch moved",
 "A **false start** is when an offensive player moves before the snap, like a lineman flinching. It costs **5 yards** and the play never happens. Memory trick: the *offense* starts each play, so if the offense moves early, it's a false start.",['offside','penalty','snap']],
['offside',"what is offside|what is encroachment|what is neutral zone infraction","offside offsides encroachment neutral zone",
 "**Offside** is when a defender is across the line of scrimmage when the ball is snapped. It's **5 yards** for the offense. Memory trick: the defense has to stay on its own *side*, so being off your side is offside.",['falsestart','scrimmage']],
['delay',"what is delay of game","delay game late clock",
 "**Delay of game** is when the offense doesn't snap the ball before the play clock hits zero. It costs **5 yards**.",['playclock','penalty']],
['holding',"what is holding|offensive holding|defensive holding","holding hold grab jersey",
 "**Holding** is grabbing and pulling a player to stop him. Blockers usually do it when a defender gets past them; defenders do it to keep a receiver from getting open. Offensive holding costs 10 yards; defensive holding is 5 yards plus an automatic first down.",['penalty','oline','pi']],
['pi',"what is pass interference|what is pi|dpi","pass interference pi dpi opi",
 "**Pass interference** is illegally stopping a player from catching a pass (grabbing, pushing or tackling him before the ball arrives). Against the defense, the offense gets the ball where the foul happened plus a first down, so it can be huge. Both players are allowed to go for the ball.",['holding','penalty','catch']],
['roughpasser',"what is roughing the passer|why is the quarterback protected","roughing passer late hit quarterback",
 "**Roughing the passer** is hitting the quarterback too hard or too late after he throws. It costs **15 yards** and an automatic first down. QBs get extra protection because they're defenseless while throwing.",['qb','pocket','roughkicker']],
['roughkicker',"what is roughing the kicker|running into the kicker","roughing kicker running into punter",
 "**Roughing the kicker** is crashing into the kicker or punter after the kick: 15 yards and a first down. A lighter bump is **running into the kicker**, 5 yards. It usually happens when a defender dives to block the kick and misses.",['penalty','punter']],
['facemask',"what is a face mask penalty","face mask facemask cage helmet",
 "A **face mask** penalty is grabbing the metal cage on the front of a player's helmet. Pulling or twisting it can hurt someone's neck, so it costs **15 yards**.",['penalty','roughness']],
['roughness',"what is unnecessary roughness|what is a personal foul","unnecessary roughness personal foul late hit",
 "**Unnecessary roughness** is a dangerous or extra hit, like hitting a player after the whistle or out of bounds. It's a **personal foul**: 15 yards.",['penalty','facemask']],
['grounding',"what is intentional grounding","intentional grounding throw away",
 "**Intentional grounding** is when a quarterback in the pocket throws the ball away with no receiver nearby, just to avoid a sack. The offense loses the down and yards. If he's outside the pocket, he's allowed to throw it away past the line of scrimmage.",['pocket','sack']],
['pocket',"what is the pocket","pocket protection wall",
 "The **pocket** is the protected space the offensive line forms around the quarterback on pass plays, like a pocket on your jeans. Staying inside it keeps the QB safe while he looks for a receiver.",['oline','qb','sack']],
['challenge',"what is a challenge|what is instant replay|why throw a red flag|how does replay work","challenge replay review red flag",
 "A coach can throw a **red flag** to **challenge** a call, and officials watch the replay to check it. Coaches get 2 challenges (a 3rd if both are right). Scoring plays and turnovers are reviewed automatically.",['refs','penalty']],
['refs',"what do referees do|how many referees are there|who are the officials|what does the referee do","referee referees officials ref zebra stripes white hat",
 "There are **7 officials** on an NFL field, in black and white stripes. They watch for fouls, spot the ball, and signal scores. The head **referee** wears a white hat and announces penalties.",['penalty','challenge']],
['halfdistance',"what is half the distance to the goal","half distance goal",
 "If a penalty would move the ball more than halfway to the goal line, it's cut to **half the distance to the goal** instead. That way a penalty near the end zone can't push the ball past it.",['penalty']],
// ---------- strategy ----------
['formation',"what is a formation|what are formations|what is the shotgun","formation shotgun lineup set",
 "A **formation** is how the offense lines up before the snap. In the **shotgun**, the QB stands a few yards back to see better for passing. Other formations pack players in tight for running.",['iform','motion','offense']],
['iform',"what is the i formation","i formation fullback power",
 "In the **I-formation**, the quarterback, fullback and running back line up in a straight line, like the letter I. It's built for **power running**: the fullback leads the way.",['fullback','formation']],
['motion',"what is motion|why does a player run before the snap|what is pre snap motion","motion shift move before snap",
 "**Motion** is when one offensive player moves sideways before the snap. It helps the QB read the defense: if a defender follows him, it's probably **man** coverage; if not, probably **zone**.",['man','zone','formation']],
['playaction',"what is play action|what is a fake handoff","play action fake handoff trick",
 "**Play-action** is a fake handoff followed by a pass. Defenders step up to stop the run, and that leaves space behind them for a receiver.",['run','pass','lb']],
['blitz',"what is a blitz","blitz rush extra pressure",
 "A **blitz** is when the defense sends extra players, like linebackers, to rush the quarterback. It can cause sacks, but it leaves fewer players covering receivers, so it's risky.",['sack','lb','screen']],
['man',"what is man defense|what is man coverage|man to man","man coverage defense shadow",
 "In **man coverage**, each defender sticks with one specific player, like a shadow, wherever he goes.",['zone','cb','motion']],
['zone',"what is zone defense|what is zone coverage","zone coverage defense area",
 "In **zone coverage**, each defender guards an area of the field instead of one player, and covers whoever comes into it.",['man','safetypos','motion']],
['fronts',"what is a 4-3 defense|what is a 3-4 defense|what do the numbers mean","4-3 3-4 front alignment",
 "Defenses are named by how they line up: a **4-3** has 4 defensive linemen and 3 linebackers; a **3-4** has 3 linemen and 4 linebackers. The rest are defensive backs.",['nickel','dline','lb']],
['nickel',"what is a nickel defense|what is dime","nickel dime defensive backs 5 6",
 "A **nickel** defense uses **5 defensive backs** (like a nickel = 5 cents) to cover more receivers. **Dime** uses 6. Teams use them when they expect a pass.",['fronts','db']],
['audible',"what is an audible|why does the quarterback yell before the snap","audible change call omaha",
 "An **audible** is when the quarterback changes the play at the line after seeing how the defense lined up. That's what all the yelling and pointing before the snap is about.",['qb','huddle']],
['huddle',"what is a huddle","huddle circle call play",
 "The **huddle** is when the offense gathers in a circle before a play so the quarterback can tell everyone the play call.",['audible','qb']],
['redzone',"what is the red zone","red zone 20",
 "The **red zone** is the area inside the opponent's 20-yard line. Teams in the red zone are close to scoring, and the field gets crowded, so it's harder to move.",['touchdown','fieldgoal']],
['fieldpos',"what is field position|why does field position matter","field position pinned deep",
 "**Field position** is where on the field a team starts. Starting near your own end zone (\"pinned deep\") means a long trip to score; starting near midfield makes scoring much easier. That's why punts and returns matter.",['punt','touchback']],
// ---------- league & tv ----------
['nfl',"what is the nfl|how many teams are in the nfl|how many games in a season|how long is the season","nfl league teams 32 season 17 games weeks",
 "The **NFL** is the top pro football league in the US. It has **32 teams**, split into two conferences, the AFC and NFC. Each team plays **17** regular-season games, from September to early January.",['playoffs','superbowl']],
['playoffs',"how do the playoffs work|how many teams make the playoffs","playoffs postseason wildcard 14",
 "After the regular season, **14 teams** (7 from each conference) make the **playoffs**. It's single elimination: lose once and you're out. The two conference champions meet in the Super Bowl.",['superbowl','nfl']],
['superbowl',"what is the super bowl|when is the super bowl","super bowl championship final big game",
 "The **Super Bowl** is the NFL's championship game, played in February between the AFC and NFC champions. It's one of the most-watched events in the world, with the famous halftime show and commercials.",['playoffs','nfl']],
['scorebug',"how do i read the score on tv|what is the score bug|what does the box at the bottom mean","score bug tv box graphic",
 "The **score bug** is the box on screen. It shows each team's score, the quarter and game clock, the play clock, and the down and distance (like \"3rd & 4\"). Small marks show timeouts left.",['downs','yellowline']],
['chains',"what are the chains|what is the chain gang|why do they measure","chains measure measurement chain gang sticks",
 "The **chains** are two poles connected by a 10-yard chain on the sideline. They mark where the drive started and where a first down is. When it's close, officials bring them onto the field to measure.",['firstdown','yellowline']],
['helmet',"why do players wear helmets|why do they wear pads","helmet pads equipment gear",
 "Football is a full-contact sport, so players wear **helmets** and shoulder **pads** to protect themselves. The rules also ban dangerous hits, like hitting with the top of the helmet.",['facemask','roughness']],
// ---------- this site ----------
['site',"how do i use this site|what can i do here|help","help site app menu use lessons",
 "Use the **☰ Menu** to pick a lesson: the Crash Course, Rules & Penalties, Football Smarts, Flashcards, the Bonus Quiz, or **Watch a Game**. You can ask me a question any time!",['game']],
['game',"how do i play the game|watch a game|what is watch a game|game day|the game","watch game announcers broadcast thunder titans",
 "**Watch a Game** is a full Thunder vs. Titans broadcast. **Mike**, the play-by-play announcer, calls each play as it happens, and **Dana**, the color commentator, explains it for beginners. You see every huddle, the walk to the line, the play clock, the snap and the whistle. Pick **The basics** (about 13 min), or add Rules & Penalties and Football Smarts (about 15 min).",['site']],
];
const SYN={td:'touchdown',tds:'touchdown',qb:'quarterback',qbs:'quarterback',fg:'field goal',fgs:'field goal',pat:'extra point',rb:'running back',wr:'wide receiver',te:'tight end',cb:'cornerback',lb:'linebacker',
 db:'defensive back',ol:'offensive line',dl:'defensive line',pi:'pass interference',dpi:'pass interference',int:'interception',pick:'interception',ot:'overtime',refs:'referee',ref:'referee',zebras:'referee',
 hike:'snap',hiked:'snap',sacked:'sack',fumbled:'fumble',punted:'punt',punting:'punt',kicking:'kick',kicked:'kick',endzone:'end zone',
 offsides:'offside',ints:'interception',picks:'interception',superbowl:'super bowl',halfback:'running back',tailback:'running back',corner:'cornerback',secondary:'defensive back',
 'o-line':'offensive line','d-line':'defensive line','4th':'fourth','3rd':'third','2nd':'second','1st':'first',yds:'yards',yd:'yard',nfl:'nfl'};
const STOP=new Set('a an the is are was were be been do does did what whats what\'s how why when where who whom which can could would should will i you me my your it its it\'s of to in on at for and or but if so that this these those there their they them he she his her we us our with about from by as than then just like really mean means meaning called call explain tell please hey hi coach sam get gets got happen happens happened thing stuff football'.split(' '));
const stem=w=>w.length>4?w.replace(/(ing|ed|es|s)$/,''):w;
function toks(s){s=(s||'').toLowerCase().replace(/<[^>]+>/g,' ').replace(/&/g,' and ').replace(/[’']/g,"'");
 s=s.replace(/\b[\w'-]+\b/g,w=>SYN[w]||w);return s.replace(/[^a-z0-9\- ]/g,' ').split(/\s+/).map(w=>w.replace(/^-+|-+$/g,'')).filter(w=>w&&!STOP.has(w)).map(stem);}
// docs
const docs=[];const byId={};
for(const [id,qs,kw,a,rel] of KB){const q0=qs.split('|')[0];const nice=(q0[0].toUpperCase()+q0.slice(1)).replace(/\?*$/,'?');const d={id,a,rel:rel||[],q:nice,title:nice};d.tq=toks(qs+' '+kw);d.ta=toks(a.replace(/\*\*/g,''));d.phr=qs.split('|').map(x=>toks(x).join(' '));docs.push(d);byId[id]=d;}
function addDeck(){const D=window.F101_DECKS;if(!D)return;const have=new Set(docs.map(d=>d.tq.join(' ')));
 for(const k of Object.keys(D))for(const c of D[k].cards){const term=c.t.replace(/<[^>]+>/g,'');const tt=toks(term);if(!tt.length)continue;
  // skip if a hand-written answer is already about this term
  if(docs.some(d=>!d.deck&&tt.every(w=>d.tq.includes(w))&&d.tq.slice(0,6).some(w=>tt.includes(w))))continue;
  const d={id:'card_'+term,deck:true,a:`**${term}**: ${c.d}`,rel:[],q:`What is ${term}?`,title:`What is ${term}?`};d.tq=toks(term+' '+term);d.ta=toks(c.d);d.phr=[tt.join(' ')];d.term=tt.join(' ');docs.push(d);byId[d.id]=d;}}
let idf=null;
function build(){addDeck();const df={};for(const d of docs){for(const w of new Set([...d.tq,...d.ta]))df[w]=(df[w]||0)+1;}const N=docs.length;idf=w=>Math.log(1+(N-(df[w]||0)+.5)/((df[w]||0)+.5));}
function score(q,d){let s=0;const qs=new Set(q);for(const w of qs){const fq=d.tq.filter(x=>x===w).length,fa=d.ta.filter(x=>x===w).length;if(!fq&&!fa)continue;s+=idf(w)*(2.2*Math.min(fq,2)/(Math.min(fq,2)+.6)+.7*fa/(fa+1.2));}
 const qj=q.join(' ');let pb=0;for(const p of d.phr){if(p&&(qj===p))pb=Math.max(pb,6);else if(p&&p.split(' ').length>1&&qj.includes(p))pb=Math.max(pb,2.5);}s+=pb;
 if(d.term&&qj.includes(d.term))s+=2;return s;}
let last=null;
const NEWS=/\b(who won|who will win|who is winning|score of the|last night|this week|this season|tonight|standings|best team|best player|goat)\b/i,MONEY=/\b(salary|salaries|paid|money|contract|how much does .+ make|tickets?|cost)\b/i;
const POS=new Set(['qb','center','oline','rb','fullback','wr','te','dline','lb','cb','safetypos','db','kicker','punter','returner','holder']);
const GREET=/^(hi|hello|hey|yo|sup|howdy|good (morning|afternoon|evening))\b/i,THANKS=/\b(thanks|thank you|thx|ty|awesome|cool|got it|makes sense|great)\b/i,WHO=/\b(who are you|what are you|are you (an? )?(ai|robot|bot|real))\b/i;
function ask(text){if(!idf)build();const raw=(text||'').trim().replace(/\b(like|as if)\s+(i'?m|i am)\s+(\d+|five|a kid|a child|new|a beginner)\b/ig,'').replace(/\b(to me|for me|simply|in simple terms)\b/ig,'');
 if(WHO.test(raw))return{html:"I'm <b>Coach Sam Lite</b>: a little helper built right into this site. I match your question with answers written for beginners, so I'm instant and work offline. I'm not a full AI, so short, simple questions work best!",chips:["What's a first down?","How do you score?"]};
 if(GREET.test(raw)&&raw.split(/\s+/).length<=3)return{html:"Hey there! 👋 What football question can I help with?",chips:["What's a down?","What is a touchdown?","Why do teams punt?"]};
 if(NEWS.test(raw))return{html:"I don't follow live scores, news or rankings, so I can't tell you who's winning. A sports app or NFL.com has the latest. I can explain how any part of the game works, though!",chips:["How do the playoffs work?","What is the Super Bowl?"]};
 if(MONEY.test(raw))return{html:"I don't know about money things like salaries or ticket prices. I'm best at explaining how the game works!",chips:["What does a quarterback do?","How do you score?"]};
 let q=toks(raw);const doQ=/\bdoes?\b.+\bdo\b/i.test(raw);
 if(THANKS.test(raw)&&q.length<=2)return{html:"Anytime! Ask me something else whenever you want. 🏈",chips:last?last.rel.slice(0,3).map(r=>byId[r]&&byId[r].q).filter(Boolean):[]};
 // short follow-ups ("why?", "what about 2 points") lean on the last topic
 const follow=last&&q.length<=2&&/^(why|how|and|what about|so|then|really)\b/i.test(raw);
 let ranked=docs.map(d=>({d,s:score(q,d)+(follow&&d===last?1.5:0)+(doQ&&POS.has(d.id)?3:0)})).sort((a,b)=>b.s-a.s);
 const top=ranked[0];
 if(!q.length&&follow&&last)return{html:md2(last.a),chips:last.rel.map(r=>byId[r]&&byId[r].q).filter(Boolean).slice(0,3)};
 if(!top||top.s<2.2){const near=top&&top.s>=1.2?ranked.filter(r=>r.s>0).slice(0,3).map(r=>r.d.q):[];
  return{html:near.length?"Hmm, I'm not sure I understood. Did you mean one of these?":"I'm a simple helper, so I only know football basics, rules and strategy. Try asking about downs, scoring, positions or penalties!",chips:near.length?near:["What's a first down?","How do you score?","What does a quarterback do?"],miss:true};}
 last=top.d;let html=md2(top.d.a);
 // add a second answer if the question clearly asks about two things ("difference between X and Y")
 const two=ranked[1];if(two&&/\b(difference|vs\.?|versus|compare| or )\b/i.test(raw)&&two.s>top.s*.6&&two.s>3)html+='<br><br>'+md2(two.d.a);
 const chips=(top.d.rel.length?top.d.rel.map(r=>byId[r]&&byId[r].q):ranked.slice(1,4).map(r=>r.d.q)).filter(Boolean).slice(0,3);
 return{html,chips};}
function md2(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/\*(.+?)\*/g,'<i>$1</i>');}
window.coachLite={ask,_docs:docs};
})();
