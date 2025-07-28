document.addEventListener("DOMContentLoaded", () => {
    const attempts = document.querySelectorAll(".attempt"); 
    attempts.forEach((row, rowIndex) => {
        const cells = row.querySelectorAll(".cell");
        setupInputEvents(cells, rowIndex);
        if (rowIndex === 0) { 
            cells[0].focus();
        } else {
            disableCells(cells);
        }
    });


    function setupInputEvents(cells, rowIndex) {
        cells.forEach((cell, colIndex) => {
            cell.dataset.row = rowIndex;
            cell.dataset.col = colIndex;

            cell.addEventListener("input", (e) => onInput(e, cells));
            cell.addEventListener("keydown", (e) => onKeyDown(e, cells, rowIndex));
        });
    }

    function onInput(e, cells) {
        const input = e.target;
        const value = input.value;
        if (!/^[1-9]$/.test(value)) {
            input.value = "";
            return;
        }
        const currentIndex = [...cells].indexOf(input);
        if (currentIndex < cells.length - 1) {
            cells[currentIndex + 1].focus();
        }
    }

    function onKeyDown(e, cells, rowIndex) {
        const input = e.target;
        const key = e.key;
        const currentIndex = [...cells].indexOf(input);
        switch (key) {
            case "Backspace":
                if (input.value === "" && currentIndex > 0) {
                    cells[currentIndex - 1].focus();
                }
                break;
            case "ArrowLeft":
                if (currentIndex > 0) cells[currentIndex - 1].focus();
                break;
            case "ArrowRight":
                if (currentIndex < cells.length - 1) cells[currentIndex + 1].focus();
                break;
            case "Enter":
                handleGuessAttempt(cells, rowIndex);
                break;
            }
        }

    function handleGuessAttempt(cells, rowIndex) {
        const guess = [...cells].map(cell => cell.value);
        const isComplete = guess.every(val => val !== "");
        
        const bullsCell = cells[cells.length - 2];
        const cowsCell = cells[cells.length - 1];

        const replayButton = document.getElementById("replayButton");
        const secretCodeText = document.getElementById("secretCode");

        if (!isComplete) {
            alert("Your guess is not complete.");
            return;
        }

        fetch("/game", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ guess })
        })
        .then(response => response.json())
        .then(result => {
            if (bullsCell && cowsCell) {
                bullsCell.textContent = result.bulls;
                cowsCell.textContent = result.cows;
                
            }if(!result.gameOver){
                disableCells(cells);
                const nextRow = document.querySelector(`.attempt:nth-child(${rowIndex + 2})`);
                if (nextRow) {
                    const nextCells = nextRow.querySelectorAll(".cell");
                    enableCells(nextCells);
                    nextCells[0].focus();
                }
            }else {
                if(result.win){
                    document.getElementById("gameResult").textContent = "You won";
                    disableCells(cells);
                } else {
                    document.getElementById("gameResult").textContent = "You LOST";
                    secretCodeText.classList.remove('hidden');
                    disableCells(cells);
                }
                replayButton.classList.remove('hidden');        
            }
            });
    }


    function disableCells(cells) {
        cells.forEach(cell => {
            cell.disabled = true;
            cell.classList.add("disabled");
        });
    }

    function enableCells(cells) {
        cells.forEach(cell => {
            cell.disabled = false;
            cell.classList.remove("disabled");
        });
    }
});