
kaboom({
	background: [255,205,50],
})

		// Load assets
loadSprite("peak", "peak.png")
loadSprite("block", "grass.jpeg")
loadSprite("spike", "spikes.png")
loadSprite("coin", "coin.png")

// Define player movement speed (pixels per second)
const SPEED = 320

// // Add player game object
// const player = add([
// 	sprite("peak"),
// 	pos(center()),
// 	area(),
// 	// body() component gives the ability to respond to gravity
// 	body(),
// ])

// onKeyDown() registers an event that runs every frame as long as user is holding a certain key
onKeyDown("left", () => {
	// .move() is provided by pos() component, move by pixels per second
	player.move(-MOVE_SPEED, 0)
})

onKeyDown("right", () => {
	player.move(MOVE_SPEED, 0)
})

// onKeyDown("up", () => {
// 	player.move(0, -SPEED)
// })

onKeyDown("down", () => {
	player.move(0, MOVE_SPEED)
})



setGravity(3000)

onKeyPress("space", () => {
	// .isGrounded() is provided by body()
	if (player.isGrounded()) {
		// .jump() is provided by body()
		player.jump(JUMP_FORCE)
	}
})
onKeyPress("space", () => {

})


// Add a platform to hold the player
add([
	rect(width(), 48),
	outline(4),
	area(),
	pos(0, height() - 48),
	// Give objects a body() component if you don't want other solid objects pass through
	body({ isStatic: true }),
	color(	255, 253, 208)
])

var lvl = addLevel([
	// Design the level layout with symbols
	"@  ^ $$",
	"===========",
	" ",
	"     ","============"

], {
	// The size of each grid
	tileWidth: 64,
	tileHeight: 64,
	// The position of the top left block
	pos: vec2(100, 200),
	// Define what each symbol means (in components)
	tiles: {
		"@": () => [
			sprite("peak"),
			area(),
			body(),
			anchor("bot"),
			"player",
		],
		"=": () => [
			sprite("block"),
			area(),
			body({ isStatic: true }),
			anchor("bot"),
		],
		"$": () => [
			sprite("coin"),
			area(),
			anchor("bot"),
			"coin",
		],
		"^": () => [
			sprite("spike"),
			area(),
			anchor("bot"),
			"danger",
		],
	},
})
// Get the player object from tag
const player = lvl.get("player")[0]
//Back to the original position if hit a "danger" item
player.onCollide("danger", () => {
	player.pos = lvl.tile2Pos(0, 0)
})

// Eat the coin!
player.onCollide("coin", (coin) => {
	destroy(coin)
	// play("score")
})
const JUMP_FORCE = 1320
const MOVE_SPEED = 480
const FALL_DEATH = 2400

player.onUpdate(() => {
		// center camera to player
		camPos(player.pos)
		// chteck fall death
		if (player.pos.y >= FALL_DEATH) {
			// go("lose")
			player.pos = lvl.tile2Pos(0, 0)
		}
	})
