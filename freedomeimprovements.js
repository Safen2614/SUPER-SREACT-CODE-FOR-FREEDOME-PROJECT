kaboom({
	background: [0],
})


loadSprite("bean", "peak.png")
loadSprite("ghosty", "safe.png")
loadSprite("spike", "spikes.png")
loadSprite("grass", "grass.jpeg")
loadSprite("portal", "portal.png")
loadSprite("coin", "coin.png")
loadSprite("fake", "portal.png")
loadSprite("star", "star.png")



setGravity(3200)


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





const JUMP_FORCE = 1320
const MOVE_SPEED = 480
const FALL_DEATH = 2400

const LEVELS = [
	[   "         *   ",
		"  *         ",
		"          ",
		"       $$   ",
		"     ===   ",
		"            ",
		"   ^^  > = @",
		"============",
	],
    [
                "                           $",
                "                            $",
                "                           $",
                "                       =    $",
                "                  =    =   $",
                "           $$     =    =    $",
                "       ====       ===    = $" ,
                "                       =    $",
                "                      =       ",
                "       ^^     =      =  >       =",
                "===========================     =",
                "=             =                 =  ",
                "=             =                 =",
                "=             =          =      =  ",
                "=             =          =      = ",
                "= @   >     =          =        =",
                "============    ================",
                "            $$$                       ",
                "            ====                   ",

            ],
	[
		"                $              = = =                =",
        "             $  =    =             =                =",
        "         $   =       =             =                =",
        "         =         = =   =   =    =                 = ",
        "      =^^ ^^ ^^     f=   >        =    ^^^          =",
        "===============================================     =",
        "=                                                   =",
        "=                                                   =  ",
        "=                                                   =  ",
        "=    ^     >   >    >    >     >    >    >   >    > =    ",
        "=    ================================================     ",
        "=                                                   =",
        "=                                                   =",
        "=  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$=    ",
        "=  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$f=     ",
        "=====================================================      ",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        " @",

	],
]

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
        "*": () => [
			sprite("star"),
			area(),
			body({ isStatic: true }),
			anchor("bot"),
			offscreen({ hide: true }),
			"platform",
		],
	},
}

scene("game", ({ levelId, coins } = { levelId: 0, coins: 0 }) => {

	const level = addLevel(LEVELS[levelId ?? 0], levelConf)

	const player = add([
		sprite("bean"),
		pos(0, 0),
		area(),
		scale(1),
		body(),
		anchor("bot"),
	])

	player.onUpdate(() => {
		camPos(player.pos)
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
		camPos(player.pos)
	})

	player.onCollide("danger", () => {
		go("lose")
	})

	player.onCollide("portal", () => {
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

		}
	})

	player.onCollide("enemy", (e, col) => {
		if (!col.isBottom()) {
			go("lose")
		}
	})










	player.onCollide("coin", (c) => {
		destroy(c)
	})



	function jump() {
		if (player.isGrounded()) {
			player.jump(JUMP_FORCE)
		}
	}

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
