# JumpCastle-GameDemo

A castle-adventure game demo, written in TypeScript & BabylonJS.

[Game Link](https://marshallw906.github.io/JumpCastle-GameDemo/) (approx. 17MB)

The game won't give a "WIN" until the player collects >= 150 souls(the light blue balls up in the air, 10 souls each).

Note: I found that the game's **fullscreen UI** will **disappear** if a standard procedural texture (e. g. BrickProceduralTexture) from BabylonJS.ProceduralTexture  is instantiated.

## Instructions

Keyboard Control:

- A / D: Move to Left / Right
- J: Attack: Player shoots a bullet forward.
  - No Cost.
- K: Jump.
  - W+K: High jump
  - S+K+(A/D): Long jump
  - Player can perform one "air hike" (i.e. Player can double-jump).
  - Jump state is reset whenever player collides with a Map Block. (it's a bit troublesome to define a "foot" part since the player is a simple box)
- F: Purchase Item
  - Items are balls in the map.
  - Most of the items don't have prices. Player gets these items when collided with them.
  - Some items have a price. Go and collide with them, then press 'F' and pay 100G.
- Space: Shield.
  - Makes player invincible for 2s.
  - Cost 50SP.
- Q / E: Teleport to the previous / next teleport point (reached before)
  - Player can only use teleport at the teleport point.
  - The stable small block near the player's startup point is one of the teleport point.

Block Info:

- Yellow blocks: Normal block. Nothing special.
- Red blocks: Trap block. Player gets 5 damage each time it collides with a red block.
- Other random-colored blocks: Modifier.
  - Sorry I have not add a HUD to represent player's current buffs(modifiers).
  - Modifier includes: Subtract player's move speed / Recover HP but lose SP / Recover SP but lose HP / Attack UP

Item Info:

- Blue balls: Souls. 10 souls each.
- Red balls: HP Restored. The recover quantity varies.
- Green balls: SP Recover Speed UP.
- Other types: Attack UP / Move Speed UP / SP Restore

Enemy:

- An enemy patrols between the two edges of its current plane.
- Enemy drops gold once it is eliminated.
- A Boss (Bigger, more HP, more attack damage, etc) drops more gold...

After the player has collected 150 souls or more, a "GameWin" will show up as soon as the player enters the destination point (the big purple ball in the upper left corner).

## Implementation Design

### scene.ts : SceneController

Singleton class. This class handles the whole game.

It instantiate GUI, the player, items, enemies, bullets, map, etc. and saves references for them if necessary.

It also handles the logic of start(), restart().

### event_dispatcher.ts: EventDispatcher

Singleton class. This class serves to receive all of the user-generated events and dispatch each particular event (classified by `enum EventType{...}`) to different subscribers.

This class is also registered in SceneController. A number of EventType corresponding to this game is registered in `SceneController().getInstance().initEventDispatcher()`
