const scoreEl = document.getElementById('score')
const canvas = document.getElementById('canvas');
const c = canvas.getContext('2d');
const gameover = document.getElementById('gameover')

const SPEED_PLAYER = 1
const SCALE_IMAGE_PLAYER = 2

const SPEED_PROJECTILE = 3
const SCALE_IMAGE_PROJECTILE = 1.2

const SPEED_MONSTER = 0.5
const SCALE_IMAGE_MONSTER = 2

const playerImages = {
    back: new Image(),
    front: new Image(),
    left: new Image(),
    right: new Image()
};



const endGame = new Image();
endGame.src = './image/the-end.png'

const monsterParticles = new Image();
monsterParticles.src = './image/no.png'

const monsterSpawnImage = new Image()
monsterSpawnImage.src = './image/quai-lv1-spawn.png'

const playerDead = new Image()
playerDead.src = './image/nhanvat-chet.png'

const keys = {
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    w: {
        pressed: false
    },
    s: {
        pressed: false
    },
    space: {
        pressed: false
    }
}

const game = {
    over: false,
    active: true
}



let projectiles = [];
let monsters = []
let score = 0;
let projectilePosition = {}
let projectileVelocity = {}
let frames = 0;

const background = new Image();
background.src = './image/san.png'

playerImages.back.src = './image/nhanvat-sau.png';
playerImages.front.src = './image/nhanvat-truoc.png';
playerImages.left.src = './image/nhanvat-trai.png';
playerImages.right.src = './image/nhanvat-phai.png';

class Player {
    constructor() {
        this.velocity = {
            x: 0,
            y: 0
        }

        // Gán hình ảnh nhân vật vào this để sử dụng về sau
        this.currentPlayerImage = playerImages.front;

        this.currentPlayerImage.onload = () => {
            const scale = SCALE_IMAGE_PLAYER;
            this.width = this.currentPlayerImage.width * scale;
            this.height = this.currentPlayerImage.height * scale;

            this.position = {
                x: (canvas.width / 2 - this.width / 2),
                y: (canvas.height / 2 - this.height / 2)
            }
        }
    }

    draw() {
        if (this.currentPlayerImage && this.position) {
            c.drawImage(
                this.currentPlayerImage,
                this.position.x,
                this.position.y,
                this.width,
                this.height
            );
        }
    }

    update() {
        if (this.currentPlayerImage && this.position) {

            this.draw();
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;
        }
    }
}

class Projectile {
    constructor({ position, velocity }) {
        this.position = position;
        this.velocity = velocity;
        const image = new Image();
        image.src = './image/dan.png';

        image.onload = () => {
            const scale = SCALE_IMAGE_PROJECTILE;
            this.image = image;
            this.width = image.width * scale;
            this.height = image.height * scale;
        };
    }

    draw() {
        if (this.image && this.position && this.velocity) {
            c.drawImage(
                this.image,
                this.position.x,
                this.position.y,
                this.width,
                this.height
            );
        }
    }

    update() {
        if (this.image && this.position && this.velocity) {
            this.draw();
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;
        }
    }
}

class Monsters {
    constructor() {
        this.velocity = {
            x: 0,
            y: 0
        }

        this.particled = false
        this.spawn = false
        const monsterImage = new Image();
        monsterImage.src = './image/quai-lv1-1.png'

        monsterImage.onload = () => {
            this.image = monsterSpawnImage
            setTimeout(() => {
                this.image = monsterImage
                this.spawn = true
            }, 1000)
            this.width = monsterImage.width * SCALE_IMAGE_MONSTER
            this.height = monsterImage.height * SCALE_IMAGE_MONSTER

            this.position = {
                x: Math.random() * (canvas.width - this.width),
                y: Math.random() * (canvas.height - this.height)
            }
        }
    }


    draw() {
        c.drawImage(
            this.image,
            this.position.x,
            this.position.y,
            this.width,
            this.height
        )
    }

    update({ velocity }) {
        if (this.image && !this.particled) {
            this.draw()
            this.position.x += velocity.x
            this.position.y += velocity.y
        } else if (this.image && this.particled) {
            this.draw()
            this.position.x += 0
            this.position.y += 0
        }
    }
}

const player = new Player()

let lastMonsterSpawnTime = 0;
const spawnInterval = 1000; // Thời gian giữa mỗi lần sinh ra quái vật

function spawnMonster() {
    const now = Date.now();
    if (now - lastMonsterSpawnTime > spawnInterval && !game.over) {
        monsters.push(new Monsters());
        lastMonsterSpawnTime = now;
    }
}

let lastFired = 0;
const fireRate = 200; // 200ms giữa mỗi lần bắn

function fireProjectile() {
    const now = Date.now();
    if (now - lastFired >= fireRate) {
        // Tạo đạn mới
        projectiles.push(
            new Projectile({
                position: projectilePosition,
                velocity: projectileVelocity
            })
        )
        lastFired = now;
    }
}

function animate() {
    if (game.over) return
    requestAnimationFrame(animate);

    c.clearRect(0, 0, canvas.width, canvas.height);
    c.drawImage(background, 0, 0, canvas.width, canvas.height)

    // Xóa đạn khi rời khỏi màn hình
    projectiles.forEach((projectile, index) => {
        if (projectile.position.y <= 0 ||
            projectile.position.y >= canvas.height ||
            projectile.position.x <= 0 ||
            projectile.position.x >= canvas.width
        ) {
            projectiles.splice(index, 1);
        } else {
            projectile.update()
        }
    });


    // Xử lý quái vật di chuyển
    monsters.forEach((monster, i) => {
        const deltaX = player.position.x - monster.position.x;
        const deltaY = player.position.y - monster.position.y;

        const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
        const normalizedX = deltaX / distance;
        const normalizedY = deltaY / distance;
        if (monster.spawn) {
            monster.update({
                velocity: {
                    x: normalizedX * SPEED_MONSTER,
                    y: normalizedY * SPEED_MONSTER
                }
            });
        } else if (!monster.spawn) {
            monster.update({
                velocity: {
                    x: 0,
                    y: 0
                }
            });
        }


        projectiles.forEach((projectile, j) => {

            // Xử lý khi quái vật trúng đạn
            if (!monster.particled &&
                projectile.position.x + projectile.width >= monster.position.x &&
                projectile.position.x <= monster.position.x + monster.width &&
                projectile.position.y + projectile.height >= monster.position.y &&
                projectile.position.y <= monster.position.y + monster.height &&
                monster.spawn
            ) {
                projectiles.splice(j, 1);
                monster.image = monsterParticles
                monster.particled = true


                setTimeout(() => {
                    monsters.splice(i, 1);
                }, 500)
                score += 100
                scoreEl.innerHTML = score
            }
        })

        // Khi người chơi chạm vào quái vật
        if (player.position.x + player.width >= monster.position.x &&
            player.position.x <= monster.position.x + monster.width &&
            player.position.y + player.height >= monster.position.y &&
            player.position.y <= monster.position.y + monster.height &&
            monster.spawn) {
            player.currentPlayerImage = playerDead
            player.velocity = {
                x: 0,
                y: 0
            }
            game.over = true


            setTimeout(() => {
                monsters.splice(0, monsters.length)
                projectiles.splice(0, projectiles.length)
                gameover.classList.remove('hide-image')
                gameover.classList.add('block-image')
                game.active = false
            }, 2000)
        }
    });

    spawnMonster();

    player.update();

    // Xử lý điều khiển người chơi
    if (keys.a.pressed && player.position.x >= 0) {
        player.velocity.x = -SPEED_PLAYER
        player.currentPlayerImage = playerImages.left
    } else if (keys.d.pressed && player.position.x + player.width <= canvas.width) {
        player.velocity.x = SPEED_PLAYER
        player.currentPlayerImage = playerImages.right
    } else {
        player.velocity.x = 0
    }

    if (keys.w.pressed && player.position.y >= 0) {
        player.velocity.y = -SPEED_PLAYER
        player.currentPlayerImage = playerImages.back
    } else if (keys.s.pressed && player.position.y + player.height <= canvas.height) {
        player.velocity.y = SPEED_PLAYER
        player.currentPlayerImage = playerImages.front
    } else {
        player.velocity.y = 0
    }

    frames++
}

animate();
function resetGame() {

    // Khôi phục trạng thái trò chơi
    game.over = false
    game.active = true
    keys.a.pressed = false
    keys.d.pressed = false
    keys.s.pressed = false
    keys.w.pressed = false

    // Đặt lại hình ảnh người chơi
    player.currentPlayerImage = playerImages.front;

    player.width = player.currentPlayerImage.width * SCALE_IMAGE_PLAYER
    player.height = player.currentPlayerImage.height * SCALE_IMAGE_PLAYER


    player.velocity = { x: 0, y: 0 };

    player.position = {
        x: (canvas.width / 2) - (player.width / 2),
        y: (canvas.height / 2) - (player.height / 2)
    };

    projectiles = [];
    monsters = [];

    score = 0;
    scoreEl.innerHTML = score

    frames = 0;

    gameover.classList.remove('block-image')
    gameover.classList.add('hide-image')

    animate()

}


addEventListener('keydown', ({ key }) => {
    if (!game.active) return
    switch (key) {
        case 'a':
            keys.a.pressed = true
            break;
        case 'ArrowLeft':
            keys.a.pressed = true
            break;
        case 'd':
            keys.d.pressed = true
            break;
        case 'ArrowRight':
            keys.d.pressed = true
            break;
        case 'w':
            keys.w.pressed = true
            break;
        case 'ArrowUp':
            keys.w.pressed = true
            break;
        case 's':
            keys.s.pressed = true
            break;
        case 'ArrowDown':
            keys.s.pressed = true
            break;
        case ' ':
            break;
    }
})

addEventListener('keyup', ({ key }) => {
    if (!game.over) return;
    if (!game.active) {
        switch (key) {
            case ' ':
                this.resetGame()
                break;
        }
    }
})


addEventListener('keyup', ({ key }) => {
    if (!game.active) return
    switch (key) {
        case 'a':
            keys.a.pressed = false
            break;
        case 'ArrowLeft':
            keys.a.pressed = false
            break;
        case 'd':
            keys.d.pressed = false
            break;
        case 'ArrowRight':
            keys.d.pressed = false
            break;
        case 'w':
            keys.w.pressed = false
            break;
        case 'ArrowUp':
            keys.w.pressed = false
            break;
        case 's':
            keys.s.pressed = false
            break;
        case 'ArrowDown':
            keys.s.pressed = false
            break;
        case ' ':
            if (keys.a.pressed && keys.w.pressed) {
                projectilePosition = {
                    x: player.position.x,
                    y: player.position.y
                };
                projectileVelocity = {
                    x: -Math.sqrt(SPEED_PROJECTILE),
                    y: -Math.sqrt(SPEED_PROJECTILE)
                };
            } else if (keys.a.pressed && keys.s.pressed) {
                projectilePosition = {
                    x: player.position.x,
                    y: player.position.y + player.height
                };
                projectileVelocity = {
                    x: -Math.sqrt(SPEED_PROJECTILE),
                    y: Math.sqrt(SPEED_PROJECTILE)
                };
            } else if (keys.d.pressed && keys.w.pressed) {
                projectilePosition = {
                    x: player.position.x + player.width,
                    y: player.position.y
                };
                projectileVelocity = {
                    x: Math.sqrt(SPEED_PROJECTILE),
                    y: -Math.sqrt(SPEED_PROJECTILE)
                };
            } else if (keys.d.pressed && keys.s.pressed) {
                projectilePosition = {
                    x: player.position.x + player.width,
                    y: player.position.y + player.height
                };
                projectileVelocity = {
                    x: Math.sqrt(SPEED_PROJECTILE),
                    y: Math.sqrt(SPEED_PROJECTILE)
                };
            } else if (keys.a.pressed) {
                projectilePosition = {
                    x: player.position.x,
                    y: player.position.y + player.height / 2
                };
                projectileVelocity = {
                    x: -SPEED_PROJECTILE,
                    y: 0
                };
            } else if (keys.d.pressed) {
                projectilePosition = {
                    x: player.position.x + player.width,
                    y: player.position.y + player.height / 2
                };
                projectileVelocity = {
                    x: SPEED_PROJECTILE,
                    y: 0
                };
            } else if (keys.w.pressed) {
                projectilePosition = {
                    x: player.position.x + player.width / 2,
                    y: player.position.y
                };
                projectileVelocity = {
                    x: 0,
                    y: -SPEED_PROJECTILE
                };
            } else if (keys.s.pressed) {
                projectilePosition = {
                    x: player.position.x + player.width / 2,
                    y: player.position.y + player.height
                };
                projectileVelocity = {
                    x: 0,
                    y: SPEED_PROJECTILE
                };
            } else {
                // Nếu không có phím nào được nhấn, sử dụng hình ảnh hiện tại của nhân vật
                if (player.currentPlayerImage === playerImages.back) {
                    projectilePosition = {
                        x: player.position.x + player.width / 2,
                        y: player.position.y
                    };
                    projectileVelocity = {
                        x: 0,
                        y: -SPEED_PROJECTILE
                    };
                } else if (player.currentPlayerImage === playerImages.front) {
                    projectilePosition = {
                        x: player.position.x + player.width / 2,
                        y: player.position.y + player.height
                    };
                    projectileVelocity = {
                        x: 0,
                        y: SPEED_PROJECTILE
                    };
                } else if (player.currentPlayerImage === playerImages.left) {
                    projectilePosition = {
                        x: player.position.x,
                        y: player.position.y + player.height / 2
                    };
                    projectileVelocity = {
                        x: -SPEED_PROJECTILE,
                        y: 0
                    };
                } else if (player.currentPlayerImage === playerImages.right) {
                    projectilePosition = {
                        x: player.position.x + player.width,
                        y: player.position.y + player.height / 2
                    };
                    projectileVelocity = {
                        x: SPEED_PROJECTILE,
                        y: 0
                    };
                }
            }

            fireProjectile()

            break;
    }
})




