document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const timerDisplay = document.getElementById('timer');
    const turnIndicator = document.getElementById('turn-indicator');
    const messageDisplay = document.getElementById('message');
    const player1PointsDisplay = document.getElementById('player1-points');
    const player2PointsDisplay = document.getElementById('player2-points');
    const startButton = document.getElementById('start-button');
    const boardContainer = document.getElementById('board-container');

    let selectedPiece = null;
    let playerTurn = 1; // 1 for Player 1, 2 for Player 2
    let player1Points = 0;
    let player2Points = 0;
    let timer;
    let timeLeft = 8;
    let gameStarted = false;
    let isSwitchingTurn = false; // Flag to prevent overlapping turn switches
    let isDebouncing = false; // Flag to debounce clicks

    function createBoard() {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.classList.add((row + col) % 2 === 0 ? 'white' : 'black');
                square.dataset.row = row;
                square.dataset.col = col;
                if (row < 3 && (row + col) % 2 !== 0) {
                    const piece = document.createElement('div');
                    piece.classList.add('black-piece');
                    square.appendChild(piece);
                } else if (row > 4 && (row + col) % 2 !== 0) {
                    const piece = document.createElement('div');
                    piece.classList.add('red-piece');
                    square.appendChild(piece);
                }
                square.addEventListener('click', onSquareClick);
                board.appendChild(square);
            }
        }
    }

    function onSquareClick(event) {
        if (!gameStarted || isSwitchingTurn || isDebouncing) return; // Prevent actions during turn switch and debounce clicks

        isDebouncing = true;
        setTimeout(() => { isDebouncing = false; }, 300); // Debounce delay

        const square = event.currentTarget;

        if (selectedPiece) {
            const currentRow = parseInt(selectedPiece.parentElement.dataset.row);
            const currentCol = parseInt(selectedPiece.parentElement.dataset.col);
            const targetRow = parseInt(square.dataset.row);
            const targetCol = parseInt(square.dataset.col);

            const rowDiff = Math.abs(targetRow - currentRow);
            const colDiff = Math.abs(targetCol - currentCol);

            if ((rowDiff === 1 && colDiff === 1 && isValidMove(currentRow, targetRow)) ||
                (rowDiff === 2 && colDiff === 2 && isValidCaptureMove(currentRow, currentCol, targetRow, targetCol))) {
                if (square.children.length === 0) {
                    movePiece(selectedPiece, square);
                } else {
                    selectedPiece.parentElement.classList.remove('selected');
                    selectedPiece = null;
                    onSquareClick(event);
                }
            } else {
                selectedPiece.parentElement.classList.remove('selected');
                selectedPiece = null;
                onSquareClick(event);
            }
        } else {
            const piece = square.querySelector(playerTurn === 1 ? '.red-piece' : '.black-piece');
            if (piece) {
                selectedPiece = piece;
                square.classList.add('selected');
            }
        }
    }

    function isValidMove(currentRow, targetRow) {
        return selectedPiece.classList.contains('king') || (playerTurn === 1 ? targetRow < currentRow : targetRow > currentRow);
    }

    function isValidCaptureMove(currentRow, currentCol, targetRow, targetCol) {
        const midRow = (currentRow + targetRow) / 2;
        const midCol = (currentCol + targetCol) / 2;
        const midSquare = document.querySelector(`[data-row='${midRow}'][data-col='${midCol}']`);
        const capturedPiece = midSquare.querySelector(playerTurn === 1 ? '.black-piece' : '.red-piece');
        return capturedPiece && (targetRow < currentRow || targetRow > currentRow || selectedPiece.classList.contains('king'));
    }

    function movePiece(piece, square) {
        const oldSquare = piece.parentElement;
        const oldRow = parseInt(oldSquare.dataset.row);
        const oldCol = parseInt(oldSquare.dataset.col);
        const newRow = parseInt(square.dataset.row);
        const newCol = parseInt(square.dataset.col);

        if (Math.abs(newRow - oldRow) === 2 && Math.abs(newCol - oldCol) === 2) {
            const midRow = (oldRow + newRow) / 2;
            const midCol = (oldCol + newCol) / 2;
            const midSquare = document.querySelector(`[data-row='${midRow}'][data-col='${midCol}']`);
            const capturedPiece = midSquare.querySelector(playerTurn === 1 ? '.black-piece' : '.red-piece');
            if (capturedPiece) {
                capturedPiece.remove();
                if (playerTurn === 1) {
                    player1Points++;
                    player1PointsDisplay.textContent = `Player 1's Points: ${player1Points}`;
                } else {
                    player2Points++;
                    player2PointsDisplay.textContent = `Player 2's Points: ${player2Points}`;
                }
            }
        }

        oldSquare.classList.remove('selected');
        piece.style.transition = 'transform 0.5s';
        piece.style.transform = `translate(${(newCol - oldCol) * 50}px, ${(newRow - oldRow) * 50}px)`;
        setTimeout(() => {
            piece.style.transition = '';
            piece.style.transform = '';
            square.appendChild(piece);

            if (newRow === 0 || newRow === 7) piece.classList.add('king');

            selectedPiece = null;
            switchTurn();
        }, 500);
    }

    function switchTurn() {
        clearInterval(timer);
        playerTurn = playerTurn === 1 ? 2 : 1;
        turnIndicator.textContent = `Player ${playerTurn}'s Turn: ${timeLeft} Seconds Left`;
        messageDisplay.textContent = "Time expired, switching turns..";
        isSwitchingTurn = true;
        setTimeout(() => {
            messageDisplay.textContent = "";
            isSwitchingTurn = false;
            startTimer();
        }, 500); // Reduced delay to 500 milliseconds
    }

    function startTimer() {
        timeLeft = 8;
        timer = setInterval(() => {
            timeLeft--;
            turnIndicator.textContent = `Player ${playerTurn}'s Turn: ${timeLeft} Seconds Left`;
            if (timeLeft <= 0) {
                clearInterval(timer);
                switchTurn();
            }
        }, 1000);
    }

    function startGame() {
        gameStarted = true;
        startButton.style.display = 'none';
        board.classList.remove('blur'); // Remove the blur class to make the board interactive
        board.style.pointerEvents = 'auto'; // Ensure pointer events are enabled
        turnIndicator.textContent = `Player 1's Turn: ${timeLeft} Seconds Left`;
        startTimer();
    }

    window.startGame = startGame; // Make startGame function accessible in the global scope
    createBoard();
});