kaboom({
	background: [141, 183, 255],
})

// load assets
loadSprite("bean", "peak.png")
loadSprite("ghosty", "safe.png")
loadSprite("spike", "spikes.png")
loadSprite("grass", "grass.jpeg")
loadSprite("portal", "portal.png")
loadSprite("coin", "coin.png")
loadSprite("fake", "portal.png")


setGravity(3200)

// custom component controlling enemy patrol movement
function patrol(speed = 300, dir = 1) {
	return {
		id: "patrol",
		require: [ "pos", "area" ],
		add() {
			this.on("collide", (obj, col) => {
				if (col.isLeft() || col.isRight()) {
					dir = -dir
				}
			})
		},
		update() {
			this.move(speed * dir, 0)
		},
	}
}




// define some constants
const JUMP_FORCE = 1320
const MOVE_SPEED = 480
const FALL_DEATH = 2400

const LEVELS = [
	[
		"           ",
		"          ",
		"       $$   ",
		"     ===   ",
		"            ",
		"   ^^  > = @",
		"============",
	],
    [
                "                           $",
                "                           $",
                "                           $",
                "                       =    $",
                "                  =    =    $",
                "           $$     =    =   $",
                "       ====       ===    =$" ,
                "                       =    $",
                "                      =     ",
                "       ^^     =      =  >      =",
                "===========================    =",
                "             =                 =  ",
                "             =                 =",
                "             =          =      =  ",
                "             =          =      = ",
                " @   >     =          =        =",
                "============    ================",
                "                                   ",
                "            ====                   ",

            ],
	[
		"                                               ",
        "               =    =         = = =               ",
        "            =       =             =                ",
        "         =         = =   =   =    =                ",
        "      =^^ ^^ ^^     f=   >        =               ",
        "===============================================",
        "                            ",
        "                             ",
        "                            ",
        "                             ",
        "                            ",
        "                             ",

	],
]

// define what each symbol means in the level graph
const levelConf = {
	tileWidth: 64,
	tileHeight: 64,
	tiles: {
		"=": () => [
			sprite("grass"),
			area(),
			body({ isStatic: true }),
			anchor("bot"),
			offscreen({ hide: true }),
			"platform",
		],


		"$": () => [
			sprite("coin"),
			area(),
			pos(0, -9),
			anchor("bot"),
			offscreen({ hide: true }),
			"coin",
		],

		"^": () => [
			sprite("spike"),
			area(),
			body({ isStatic: true }),
			anchor("bot"),
			offscreen({ hide: true }),
			"danger",
		],

		">": () => [
			sprite("ghosty"),
			area(),
			anchor("bot"),
			body(),
			patrol(),
			offscreen({ hide: true }),
			"enemy",
		],
		"@": () => [
			sprite("portal"),
			area({ scale: 0.5 }),
			anchor("bot"),
			pos(0, -12),
			offscreen({ hide: true }),
			"portal",
		],
        "f": () => [
			sprite("fake"),
			area(),
			body({ isStatic: true }),
			anchor("bot"),
			offscreen({ hide: true }),
			"danger",
		],
	},
}

scene("game", ({ levelId, coins } = { levelId: 0, coins: 0 }) => {

	// add level to scene
	const level = addLevel(LEVELS[levelId ?? 0], levelConf)

	// define player object
	const player = add([
		sprite("bean"),
		pos(0, 0),
		area(),
		scale(1),
		// makes it fall to gravity and jumpable
		body(),
		// the custom component we defined above

		anchor("bot"),
	])

	// action() runs every frame
	player.onUpdate(() => {
		// center camera to player
		camPos(player.pos)
		// check fall death
		if (player.pos.y >= FALL_DEATH) {
			go("lose")
		}
	})

	player.onBeforePhysicsResolve((collision) => {
		if (collision.target.is(["platform", "soft"]) && player.isJumping()) {
			collision.preventResolution()
		}
	})

	player.onPhysicsResolve(() => {
		// Set the viewport center to player.pos
		camPos(player.pos)
	})

	// if player onCollide with any obj with "danger" tag, lose
	player.onCollide("danger", () => {
		go("lose")
		// play("hit")
	})

	player.onCollide("portal", () => {
		// play("portal")
		if (levelId + 1 < LEVELS.length) {
			go("game", {
				levelId: levelId + 1,
				coins: coins,
			})
		} else {
			go("win")
		}
	})

	player.onGround((l) => {
		if (l.is("enemy")) {
			player.jump(JUMP_FORCE * 0.5)
			destroy(l)

			// play("powerup")
		}
	})

	player.onCollide("enemy", (e, col) => {
		// if it's not from the top, die
		if (!col.isBottom()) {
			go("lose")
			// play("hit")
		}
	})










	player.onCollide("coin", (c) => {
		destroy(c)
		// play("coin", {
		// 	detune: coinPitch,
		// })

	})



	function jump() {
		// these 2 functions are provided by body() component
		if (player.isGrounded()) {
			player.jump(JUMP_FORCE)
		}
	}

	// jump with space
	onKeyPress("space", jump)

	onKeyDown("left", () => {
		player.move(-MOVE_SPEED, 0)
	})

	onKeyDown("right", () => {
		player.move(MOVE_SPEED, 0)
	})

	onKeyPress("down", () => {
		player.weight = 3
	})

	onKeyRelease("down", () => {
		player.weight = 1
	})

	onGamepadButtonPress("south", jump)

	onGamepadStick("left", (v) => {
		player.move(v.x * MOVE_SPEED, 0)
	})

	onKeyPress("f", () => {
		setFullscreen(!isFullscreen())
	})

})

scene("lose", () => {
	add([
		text("You Lose"),
	])
	onMousePress(() => go("game"))
})

scene("win", () => {
	add([
		text("You Win"),
	])
	onMousePress(() => go("game"))
})

go("game")
