const app = {
    sizeX: 10,
    sizeY: 6,
    playerLives: 3,
    playerScore: 0,
    playerBest: 0,
    asteroidInterval: undefined,
    gameStarted: false,
    createBoard: () => {
        const rockHopping = document.querySelector('#rockHopping');
        rockHopping.innerHTML = "";

        const board = document.createElement("div");
        board.setAttribute("id", "board");
        board.classList.toggle("blurry");
        rockHopping.appendChild(board);

        document.body.addEventListener('keydown', app.gameStart);

        const startMessage = document.createElement("p");
        startMessage.className = "startMessage"
        startMessage.textContent = "Press any key to start.";
        rockHopping.appendChild(startMessage);

        for (let y = 0; y < app.sizeY; y++) {
            let row = document.createElement("div");
            row.setAttribute("id", `row${y}`);
            row.className = "row";
            board.appendChild(row);
            for (let x = 0; x < app.sizeX; x++) {
                let cell = document.createElement("div");
                cell.setAttribute("id", `${x}-${y}`);
                cell.dataset.x = x;
                cell.dataset.y = y;
                cell.className = "cell";
                document.querySelector(`#row${y}`).appendChild(cell);
            }
        }
        app.updateScore(app.playerScore);
        app.updateBest(app.playerBest)
        document.querySelector('rock')

        app.updateLives(app.playerLives);
    },
    createPlayer: () => {
        const player = document.createElement("span");
        player.setAttribute('id', 'player');
        document.querySelector(`[data-x='0'][data-y='${Math.round(app.sizeY/2)}']`).appendChild(player);
    },
    createModal: () => {
        const modal = document.createElement("div");
        const modalExit = document.createElement("p");
        modalExit.textContent = "x";
        modalExit.className = "modal-exit";
        const modalText = document.createElement("p");
        modalText.textContent = "Use the arrow keys to move around, try to dodge the asteroids. You have 3 lives, survive as long as you can."
        modal.className = "modal modal--hidden";
        modal.appendChild(modalExit);
        modal.appendChild(modalText);
        document.querySelector("#rockHopping").appendChild(modal);
        const toggleModal = () => {
            modal.classList.toggle("modal--hidden");
        }
        document.querySelector(".question-mark").addEventListener("click", toggleModal);
        document.querySelector(".modal-exit").addEventListener("click", toggleModal);
    },
    getPlayerPosition: () => {
        const player = document.querySelector("#player");
        const x = player.closest("div").dataset.x;
        const y = player.closest("div").dataset.y;
        return ({
            x,
            y
        });
    },
    movePlayerTo: (x, y) => {
        const player = document.querySelector("#player");
        const newCell = document.querySelector(`[data-x='${x}'][data-y='${y}']`)
        if (newCell.querySelectorAll(".asteroid").length > 0) {
            app.handleImpact();
        } else {
            newCell.appendChild(player);
        }
    },
    moveUp: () => {
        const {
            x,
            y
        } = app.getPlayerPosition();
        if (y > 0) {
            app.movePlayerTo(x, `${parseInt(y, 10)-1}`)
        }
    },
    moveDown: () => {
        const {
            x,
            y
        } = app.getPlayerPosition();
        if (y < app.sizeY - 1) {
            app.movePlayerTo(x, `${parseInt(y, 10)+1}`)
        }
    },
    moveRight: () => {
        const {
            x,
            y
        } = app.getPlayerPosition();
        if (x < app.sizeX - 1) {
            app.movePlayerTo(`${parseInt(x, 10)+1}`, y)
        }
    },
    moveLeft: () => {
        const {
            x,
            y
        } = app.getPlayerPosition();
        if (x > 0) {
            app.movePlayerTo(`${parseInt(x, 10)-1}`, y)
        }
    },
    handlePlayerMovement: () => {
        const movePlayer = (event) => {
            switch (event.code) {
                case 'ArrowUp':
                    app.moveUp();
                    break;
                case 'ArrowRight':
                    app.moveRight();
                    break;
                case 'ArrowDown':
                    app.moveDown();
                    break;
                case 'ArrowLeft':
                    app.moveLeft();
                    break
                default:
                    break;
            }
        }
        document.addEventListener('keydown', movePlayer);
    },
    createAsteroids: () => {
        app.asteroidInterval = setInterval(function () {
            if (document.querySelectorAll(".asteroid").length > 0) {
                app.moveAsteroids();
            }
            for (let i = 0; i < (Math.round(app.sizeY / 3)); i++) {
                const newAsteroids = document.createElement("span");
                newAsteroids.className = "asteroid";
                const randomCell = document.querySelector(`[data-x='${app.sizeX-1}'][data-y='${Math.floor(Math.random() * app.sizeY)}']`);
                if (randomCell.querySelectorAll("#player").length > 0) {
                    app.handleImpact();
                    newAsteroids.remove();
                } else if (randomCell.querySelectorAll(".asteroid").length < 1) {
                    randomCell.appendChild(newAsteroids);
                }
            }
        }, 300);
    },
    moveAsteroids: () => {
        document.querySelectorAll('.asteroid').forEach((elem) => {
            const x = elem.closest("div").dataset.x;
            const y = elem.closest("div").dataset.y;
            if (x < 1) {
                elem.remove();
            } else {
                const newCell = document.querySelector(`[data-x='${x-1}'][data-y='${y}']`);
                if (newCell.querySelectorAll('#player').length > 0) {
                    app.handleImpact();
                    elem.remove();
                } else {
                    newCell.appendChild(elem);
                }
            }

        })
        app.updateScore(app.playerScore++);
    },
    toggleStartMessage: () => {
        document.querySelector(".startMessage").classList.toggle("startMessage--hidden");
    },
    clearBoard: () => {
        document.querySelectorAll(".asteroid").forEach((elem) => {
            elem.remove();
        })
    },
    handleImpact: () => {
        if (app.playerLives < 1) {
            app.gameOver();
        } else {
            app.playerLives--;
            app.updateLives(app.playerLives);
        }
    },
    gameStart: () => {
        if (!app.gameStarted) {
            app.createAsteroids();
            app.gameStarted = true;
            app.playerLives = 3;
            app.playerScore = 0;
            app.updateLives(app.playerLives);
            app.toggleStartMessage();
            document.querySelector('#board').classList.toggle("blurry");
            document.querySelector(".startMessage").textContent = "Press any key to start again.";
        }
    },
    gameOver: () => {
        app.clearBoard();
        window.clearInterval(app.asteroidInterval);
        if (app.playerScore > app.playerBest) {
            app.playerBest = app.playerScore - 1;
            document.querySelector(".startMessage").textContent = `New personnal best: ${app.playerBest}! Press any key to play again.` 
        }
        app.updateBest(app.playerBest);
        app.gameStarted = false;
        app.movePlayerTo(0, Math.round(app.sizeY / 2))
        app.toggleStartMessage();
        document.querySelector('#board').classList.toggle("blurry");
    },
    updateScore: (score) => {
        document.querySelector('#playerScore').textContent = score;
    },
    updateBest: (score) => {
        document.querySelector('#playerBest').textContent = score;
    },
    updateLives: (lives) => {
        document.querySelector('#playerLives').innerHTML = "";
        for (let i = 0; i < lives; i++) {
            const shipLives = document.createElement("img");
            shipLives.setAttribute("src", "medias/ship.svg");
            document.querySelector('#playerLives').appendChild(shipLives);
        }
    },
    init: () => {
        app.createBoard();
        app.createPlayer();
        app.createModal();
        app.handlePlayerMovement();
    }
}


app.init()