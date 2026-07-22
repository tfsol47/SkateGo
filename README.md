SKATE GO 

<img width="1920" height="934" alt="Screenshot 2026-07-21 at 6 47 01 PM" src="https://github.com/user-attachments/assets/95739c6b-931d-406e-8f67-53bc0b358e74" />

This is a browser-based endless skateboarding game that contains 2 different cities and different game modes. You pick your city and skate through it, and see how many points you're able to rack up. This was inspired by me last year playing the EA Skate game that came out, along with some hints of the offline dinosaur game and Subway Surfers. This was all built in Phaser. At first, I didn't expect myself to go so far with this project. I always planned to do this since last Christmas when I got my first computer, but never got any motivation to do so. Beest gave me motivation since I'm able to get something from it. Also, in my school they block every online game, so that was also a spark of motivation. (plus, after the 30 hour mark, I just decided to go for 40 hours). I plan to work on this more and hopefully have the chance to release on Steam in the future.

HOW TO PLAY:
- Space or the up arrow is to jump (hold for a higher jump)
- K: Kickflip
- H: Heelflip
- Down arrow: Slow down
- ESC: Pause game
- Controls are on the top right
- (FLIP TRICKS CAN ONLY BE DONE IN THE AIR)

  Land tricks, grind rails, and have consistent combos to multiply your score. Mixing the tricks gets bonuses, and failing a trick will force you to mash space to recover. Cones are instant fails, and trashcans are grindable along with the benches.
<img width="1920" height="930" alt="Screenshot 2026-07-21 at 6 47 52 PM" src="https://github.com/user-attachments/assets/17e4f252-4100-4566-aee7-27c5fa05a7ee" />
  MODES:
  Endless (normal)- Endless run and submit your score to the leaderboard
  Challenge- Survive as long as you can; obstacles will get faster over time
  Score Attack- You have 60s to reach the highest score possible

  Tech Stack:
  Phaser 3
  Supabase (for leaderboards)
  JavaScript
  Hosted on vercel/itch.io

  HOW IT WORKS:
  The game uses Phaser's arcade physics for the movement and collisions. The backgrounds use tileSprites with different scroll speeds to create a parallax. Music shuffles randomly from a catalog of Minecraft inspired music from KAIBB on itch.io. Scores are stored in Supabase and shown on the menu screen.

  Credits:
  Game, Sprites, art- VICENTE DELGADO (me)
  Board Sprites- SovietShuckums (itch.io)
  Music-KAIBB(itch.io)
  City Bg- Free game assets (itch.io)
