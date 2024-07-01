document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const questionModal = document.getElementById('question-modal');
    const questionText = document.getElementById('question');
    const answerInput = document.getElementById('answer');
    const playerPointsDisplay = document.getElementById('player-points');
    const computerPointsDisplay = document.getElementById('computer-points');
    const turnIndicator = document.getElementById('turn-indicator');
    let selectedPiece = null;
    let playerTurn = true;
    let playerPoints = 0;
    let computerPoints = 0;

    const questions = [
        { question: '2 + 2', answer: 4 },
        { question: '3 + 5', answer: 8 },
        { question: '6 - 1', answer: 5 },
        { question: '7 + 2', answer: 9 },
        { question: '7 * 8', answer: 56 },
        { question: '8 * 8', answer: 64 },
        { question: '4 * 6', answer: 24 },
        { question: '9 * 3', answer: 27 },
        { question: '9 * 6', answer: 54 },
        // Add more questions here
    ];

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
        if (!playerTurn) return;
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
                    // Reset selection if the target square is not empty
                    selectedPiece.parentElement.classList.remove('selected');
                    selectedPiece = null;
                    onSquareClick(event); // Allow the player to select a new piece
                }
            } else {
                // If the movement is not diagonal, allow the player to select a new piece
                selectedPiece.parentElement.classList.remove('selected');
                selectedPiece = null;
                onSquareClick(event); // Allow the player to select a new piece
            }
        } else {
            const piece = square.querySelector('.red-piece');
            if (piece) {
                selectedPiece = piece;
                square.classList.add('selected');
            }
        }
    }

    function isValidMove(currentRow, targetRow) {
        return selectedPiece.classList.contains('king') || targetRow < currentRow;
    }

    function isValidCaptureMove(currentRow, currentCol, targetRow, targetCol) {
        const midRow = (currentRow + targetRow) / 2;
        const midCol = (currentCol + targetCol) / 2;
        const midSquare = document.querySelector(`[data-row='${midRow}'][data-col='${midCol}']`);
        const capturedPiece = midSquare.querySelector('.black-piece');
        return capturedPiece && (targetRow < currentRow || selectedPiece.classList.contains('king'));
    }

    function movePiece(piece, square) {
        const question = questions[Math.floor(Math.random() * questions.length)];
        questionText.textContent = question.question;
        questionModal.style.display = 'block';

        window.submitAnswer = function () {
            if (parseInt(answerInput.value) === question.answer) {
                const oldSquare = piece.parentElement;
                const oldRow = parseInt(oldSquare.dataset.row);
                const oldCol = parseInt(oldSquare.dataset.col);
                const newRow = parseInt(square.dataset.row);
                const newCol = parseInt(square.dataset.col);

                // Handle capture
                if (Math.abs(newRow - oldRow) === 2 && Math.abs(newCol - oldCol) === 2) {
                    const midRow = (oldRow + newRow) / 2;
                    const midCol = (oldCol + newCol) / 2;
                    const midSquare = document.querySelector(`[data-row='${midRow}'][data-col='${midCol}']`);
                    const capturedPiece = midSquare.querySelector('.black-piece');
                    if (capturedPiece) {
                        capturedPiece.remove();
                        playerPoints++;
                        updatePointsDisplay();
                    }
                }

                oldSquare.classList.remove('selected');
                questionModal.style.display = 'none';
                answerInput.value = '';

                piece.style.transition = 'transform 0.5s';
                piece.style.transform = `translate(${(newCol - oldCol) * 50}px, ${(newRow - oldRow) * 50}px)`;
                setTimeout(() => {
                    piece.style.transition = '';
                    piece.style.transform = '';
                    square.appendChild(piece);

                    if (newRow === 0) piece.classList.add('king');

                    selectedPiece = null;
                    playerTurn = false;
                    updateTurnIndicator(); // Update turn indicator after player's move
                    setTimeout(robotMove, 1000);
                }, 500);
            } else {
                alert('Wrong answer, try again!');
            }
        }
    }

    function robotMove() {
        playerTurn = false; // Set playerTurn to false before the computer's move
        updateTurnIndicator(); // Call updateTurnIndicator to update the UI

        const pieces = document.querySelectorAll('.black-piece');
        for (const piece of pieces) {
            const oldSquare = piece.parentElement;
            const row = parseInt(oldSquare.dataset.row);
            const col = parseInt(oldSquare.dataset.col);
            const directions = piece.classList.contains('king')
                ? [[1, -1], [1, 1], [-1, -1], [-1, 1]] // All four diagonal directions for kings
                : [[1, -1], [1, 1]]; // Only forward directions for regular pieces

                       for (const [dRow, dCol] of directions) {
                const newRow = row + dRow;
                const newCol = col + dCol;
                const captureRow = row + 2 * dRow;
                const captureCol = col + 2 * dCol;

                if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                    const newSquare = document.querySelector(`[data-row='${newRow}'][data-col='${newCol}']`);
                    const capturedPiece = newSquare?.querySelector('.red-piece');

                    if (capturedPiece) {
                        const captureSquare = document.querySelector(`[data-row='${captureRow}'][data-col='${captureCol}']`);
                        if (captureSquare && captureSquare.children.length === 0) {
                            // Capture move
                            capturedPiece.remove();
                            computerPoints++;
                            updatePointsDisplay();

                            piece.style.transition = 'transform 0.5s';
                            piece.style.transform = `translate(${(captureCol - col) * 50}px, ${(captureRow - row) * 50}px)`;
                            setTimeout(() => {
                                piece.style.transition = '';
                                piece.style.transform = '';
                                captureSquare.appendChild(piece);
                                if (captureRow === 7) piece.classList.add('king'); // Crown the piece as king if it reaches the last row
                                playerTurn = true;
                                updateTurnIndicator(); // Update turn indicator after computer's capture move
                            }, 500);
                            return;
                        }
                    }
                }
            }
        }

        // Regular move if no capture move is found
        for (const piece of pieces) {
            const oldSquare = piece.parentElement;
            const row = parseInt(oldSquare.dataset.row);
            const col = parseInt(oldSquare.dataset.col);
            const directions = piece.classList.contains('king')
                ? [[1, -1], [1, 1], [-1, -1], [-1, 1]] // All four diagonal directions for kings
                : [[1, -1], [1, 1]]; // Only forward directions for regular pieces

            for (const [dRow, dCol] of directions) {
                const newRow = row + dRow;
                const newCol = col + dCol;

                if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                    const newSquare = document.querySelector(`[data-row='${newRow}'][data-col='${newCol}']`);
                    if (newSquare && newSquare.children.length === 0) {
                        piece.style.transition = 'transform 0.5s';
                        piece.style.transform = `translate(${(newCol - col) * 50}px, ${(newRow - row) * 50}px)`;
                        setTimeout(() => {
                            piece.style.transition = '';
                            piece.style.transform = '';
                            newSquare.appendChild(piece);
                            if (newRow === 7) piece.classList.add('king'); // Crown the piece as king if it reaches the last row
                            playerTurn = true;
                            updateTurnIndicator(); // Update turn indicator after computer's regular move
                        }, 500);
                        return;
                    }
                }
            }
        }
    }

    // Function to update turn indicator
    function updateTurnIndicator() {
        turnIndicator.textContent = playerTurn ? "Player's Turn" : "Computer's Turn";
        turnIndicator.style.backgroundColor = playerTurn ? '#333' : '#666'; // Example color change based on turn
    }

    // Function to update points display
    function updatePointsDisplay() {
        playerPointsDisplay.textContent = `Player's Points: ${playerPoints}`;
        computerPointsDisplay.textContent = `Computer's Points: ${computerPoints}`;
    }

    // Initialize turn indicator and points display
    updateTurnIndicator();
    updatePointsDisplay();

    // Create the board
    createBoard();
});