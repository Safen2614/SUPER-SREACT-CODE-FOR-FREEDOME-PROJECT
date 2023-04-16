kaboom({
    background: [141, 183, 255],
})

// load assets
loadSprite("peak", "peak.png")
loadSprite("spike", "spikes.png")
loadSprite("grass", "grass.jpeg")
loadSprite("portal", "portal.png")
loadSprite("coin", "coin.png")

setGravity(3200)

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
        "   ^^  > = P",
        "============",
    ],
    [
        "                          $",
        "                          $",
        "                          $",
        "                          $",
        "                          $",
        "           $$         =   $",
        "       ====         =   $",
        "                      =   $",
        "                      =    ",
        "       ^^      =     =   P",
        "===========================",
    ],
    [
        "     $    $    $    $     $",
        "     $    $    $    $     $",
        "                           ",
        "                           ",
        "                           ",
        "                           ",
        "                           ",
        " ^^^^^^^^^^^^^^^^^^^^^P",
        "===========================",
    ],
]

// define what each symbol means in the level graph
const levelConf = {
    tileWidth: 64,
    tileHeight: 64,
    tiles: {
        "@": () => [
            sprite("peak"),
            area(),
            body(),
            anchor("bot"),
            "player",
        ],
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
        "P": () => [
            sprite("portal"),
            area({ scale: 0.5 }),
            anchor("bot"),
            pos(0, -12),
            offscreen({ hide: true }),
            "portal",
        ],
    },
}

scene("game", ({ levelId, coins } = { levelId: 0, coins: 0 }) => {

    // add level to scene
    const level = addLevel(LEVELS[levelId ?? 0], levelConf)

    // define player object
    const player = add([
        sprite("peak"),
        pos(0, 0),
        area(),
        scale(1),
        // makes it fall to gravity and jumpable
        body(),
        // the custom component we defined above

        anchor("bot"),
    ])
    player.onUpdate(() => {
        // center camera to player
        camPos(player.pos)
        // chteck fall death
        if (player.pos.y >= FALL_DEATH) {
            // go("lose")
            player.pos = lvl.tile2Pos(0, 0)
        }
    })
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

    player.onCollide("coin", (coin) => {
        destroy(coin)

        
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


    onKeyPress("f", () => {
        setFullscreen(!isFullscreen())
    })

})


scene("lose", () => {
    add([
        text("You Lose"),
    ])
    onKeyPress(() => go("game"))
})

scene("win", () => {
    add([
        text("You Win"),
    ])
    onKeyPress(() => go("game"))
})

go("game")
