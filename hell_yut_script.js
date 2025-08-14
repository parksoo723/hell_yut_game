class HellYutGame {
    constructor() {
        this.currentPlayer = 1;
        this.players = {
            1: { pieces: [0, 0, 0, 0], inHell: [false, false, false, false], finished: 0 },
            2: { pieces: [0, 0, 0, 0], inHell: [false, false, false, false], finished: 0 }
        };
        this.selectedPiece = null;
        this.lastYutResult = null;
        this.hellPositions = [5, 10, 15];
        this.gameWon = false;
        this.gameStarted = false;
        this.isAIMode = true; // 기본값은 AI 모드
        this.aiThinking = false;
        
        this.initializeGame();
    }

    initializeGame() {
        this.setupModalEventListeners();
        this.showGameModal();
        this.updateDisplay();
        this.setupEventListeners();
        this.updateMessage("게임 설명을 확인하고 시작하세요!");
    }

    setupModalEventListeners() {
        const modal = document.getElementById('gameModal');
        const closeBtn = document.querySelector('.close');
        const singlePlayerBtn = document.getElementById('singlePlayerMode');
        const twoPlayerBtn = document.getElementById('twoPlayerMode');
        const rulesBtn = document.getElementById('showRulesBtn');

        // 게임 모드 선택 버튼들
        singlePlayerBtn.addEventListener('click', () => {
            this.selectGameMode(true);
        });

        twoPlayerBtn.addEventListener('click', () => {
            this.selectGameMode(false);
        });

        // 규칙 보기 버튼 (게임 중에도 볼 수 있도록)
        rulesBtn.addEventListener('click', () => {
            this.showGameModal();
        });

        // 모달 닫기 버튼
        closeBtn.addEventListener('click', () => {
            if (this.gameStarted) {
                this.hideGameModal();
            }
        });

        // 모달 외부 클릭시 닫기 (게임이 시작된 후에만)
        window.addEventListener('click', (event) => {
            if (event.target === modal && this.gameStarted) {
                this.hideGameModal();
            }
        });

        // ESC 키로 모달 닫기 (게임이 시작된 후에만)
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.gameStarted) {
                this.hideGameModal();
            }
        });
    }

    selectGameMode(isAI) {
        this.isAIMode = isAI;
        
        // 버튼 스타일 업데이트
        document.getElementById('singlePlayerMode').classList.toggle('selected', isAI);
        document.getElementById('twoPlayerMode').classList.toggle('selected', !isAI);
        
        // 플레이어 이름 업데이트
        document.getElementById('player1Name').textContent = '당신 (🔴)';
        document.getElementById('player2Name').textContent = isAI ? 'AI (🔵)' : '플레이어 2 (🔵)';
        
        // AI 플레이어 섹션 스타일 업데이트
        const player2Section = document.querySelector('.player-section:nth-child(2)');
        if (isAI) {
            player2Section.classList.add('ai-player');
        } else {
            player2Section.classList.remove('ai-player');
        }
        
        this.startGame();
    }

    showGameModal() {
        const modal = document.getElementById('gameModal');
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
    }

    hideGameModal() {
        const modal = document.getElementById('gameModal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // 스크롤 복원
    }

    startGame() {
        this.gameStarted = true;
        this.hideGameModal();
        this.updateMessage("게임 시작! 플레이어 1이 윷을 던지세요!");
        
        // 게임 시작 효과
        const gameContainer = document.querySelector('.game-container');
        gameContainer.style.animation = 'gameStart 0.5s ease-out';
        
        setTimeout(() => {
            gameContainer.style.animation = '';
        }, 500);
    }

    setupEventListeners() {
        document.getElementById('throwYut').addEventListener('click', () => this.throwYut());
        document.getElementById('skipTurn').addEventListener('click', () => this.skipTurn());
        
        // 말 선택 이벤트
        document.querySelectorAll('.piece').forEach(piece => {
            piece.addEventListener('click', (e) => this.selectPiece(e));
        });
    }

    throwYut() {
        if (this.gameWon) return;
        
        // 윷 결과와 막대기 상태 생성
        const yutData = this.generateYutResult();
        const result = yutData.result;
        const stickStates = yutData.stickStates;
        
        this.lastYutResult = result;
        document.getElementById('yutResult').textContent = result;
        
        // 윷 던지기 애니메이션과 막대기 시각화
        this.animateYutThrow(stickStates, result);
        
        setTimeout(() => {
            this.handleYutResult(result);
        }, 1500);
    }

    generateYutResult() {
        // 윷 막대기 4개의 상태를 랜덤하게 생성 (true: 뒤, false: 앞)
        const stickStates = [
            Math.random() < 0.5,
            Math.random() < 0.5,
            Math.random() < 0.5,
            Math.random() < 0.5
        ];
        
        // 뒤가 나온 개수에 따라 결과 결정
        const backCount = stickStates.filter(state => state).length;
        
        let result;
        switch (backCount) {
            case 0: result = '모'; break;  // 모두 앞
            case 1: result = '도'; break;  // 뒤 1개
            case 2: result = '개'; break;  // 뒤 2개
            case 3: result = '걸'; break;  // 뒤 3개
            case 4: result = '윷'; break;  // 모두 뒤
        }
        
        return { result, stickStates };
    }

    animateYutThrow(stickStates, result) {
        const yutResultElement = document.getElementById('yutResult');
        const yutSticks = document.querySelectorAll('.yut-stick');
        const yutExplanation = document.getElementById('yutExplanation');
        
        // 결과 텍스트 애니메이션
        yutResultElement.style.transform = 'scale(1.5) rotate(360deg)';
        yutResultElement.style.transition = 'all 0.5s ease';
        
        // 윷 막대기 던지기 애니메이션
        yutSticks.forEach((stick, index) => {
            stick.classList.add('throwing');
            
            setTimeout(() => {
                stick.classList.remove('throwing');
                // 막대기 상태 설정 (true: 뒤/round, false: 앞/flat)
                if (stickStates[index]) {
                    stick.classList.remove('flat');
                    stick.classList.add('round');
                } else {
                    stick.classList.remove('round');
                    stick.classList.add('flat');
                }
            }, 800);
        });
        
        // 설명 텍스트 업데이트
        setTimeout(() => {
            const explanations = {
                '도': '뒤 1개, 앞 3개 = 도 (1칸)',
                '개': '뒤 2개, 앞 2개 = 개 (2칸)',
                '걸': '뒤 3개, 앞 1개 = 걸 (3칸)',
                '윷': '뒤 4개, 앞 0개 = 윷 (4칸)',
                '모': '뒤 0개, 앞 4개 = 모 (5칸)'
            };
            yutExplanation.textContent = explanations[result];
        }, 800);
        
        setTimeout(() => {
            yutResultElement.style.transform = 'scale(1) rotate(0deg)';
        }, 500);
    }

    handleYutResult(result) {
        const moves = { '도': 1, '개': 2, '걸': 3, '윷': 4, '모': 5 };
        const moveCount = moves[result];
        
        // 지옥에 있는 말들 체크
        const playerData = this.players[this.currentPlayer];
        const hellPieces = [];
        
        for (let i = 0; i < 4; i++) {
            if (playerData.inHell[i]) {
                hellPieces.push(i);
            }
        }
        
        // 지옥에 있는 말이 있고 "모"가 아닌 경우
        if (hellPieces.length > 0 && result !== '모') {
            this.updateMessage(`🔥 지옥에 갇힌 말이 있습니다! "모"가 나와야 탈출할 수 있어요! (현재: ${result})`);
            this.switchPlayer();
            return;
        }
        
        // 지옥에서 "모"로 탈출하는 경우
        if (hellPieces.length > 0 && result === '모') {
            this.updateMessage(`🎉 "모"가 나왔습니다! 지옥에서 탈출할 말을 선택하세요!`);
            this.showMovablePieces(hellPieces, moveCount);
            return;
        }
        
        // 일반적인 경우 - 움직일 수 있는 말 표시
        const movablePieces = this.getMovablePieces(moveCount);
        
        if (movablePieces.length === 0) {
            this.updateMessage(`움직일 수 있는 말이 없습니다. (${result})`);
            this.switchPlayer();
        } else {
            if (this.currentPlayer === 2 && this.isAIMode) {
                this.updateMessage(`AI가 ${result}를 던졌습니다! AI가 말을 선택 중...`);
            } else {
                this.updateMessage(`${result}가 나왔습니다! 움직일 말을 선택하세요. (${moveCount}칸 이동)`);
            }
            this.showMovablePieces(movablePieces, moveCount);
        }
    }

    getMovablePieces(moveCount) {
        const playerData = this.players[this.currentPlayer];
        const movablePieces = [];
        
        for (let i = 0; i < 4; i++) {
            // 지옥에 있는 말은 제외
            if (playerData.inHell[i]) continue;
            
            const currentPos = playerData.pieces[i];
            const newPos = currentPos + moveCount;
            
            // 시작점에서 나갈 수 있거나, 골인하지 않은 범위에서 움직일 수 있는 말
            if (currentPos === 0 || (currentPos > 0 && newPos <= 20)) {
                movablePieces.push(i);
            }
        }
        
        return movablePieces;
    }

    showMovablePieces(pieces, moveCount) {
        // 모든 말의 선택 상태 초기화
        document.querySelectorAll('.piece').forEach(piece => {
            piece.classList.remove('selected');
        });
        
        // 움직일 수 있는 말들 하이라이트
        pieces.forEach(pieceIndex => {
            const pieceElement = document.querySelector(`.player${this.currentPlayer}[data-piece="${pieceIndex}"]`);
            if (pieceElement) {
                pieceElement.classList.add('selected');
            }
        });
        
        this.movablePieces = pieces;
        this.currentMoveCount = moveCount;
        
        // AI 모드이고 AI 차례일 때 자동으로 말 선택
        if (this.currentPlayer === 2 && this.isAIMode) {
            this.aiSelectPiece();
        } else {
            document.getElementById('throwYut').style.display = 'none';
            document.getElementById('skipTurn').style.display = 'inline-block';
        }
    }

    selectPiece(event) {
        if (!this.movablePieces || this.gameWon) return;
        
        const piece = event.target;
        const pieceIndex = parseInt(piece.dataset.piece);
        const playerClass = piece.classList.contains('player1') ? 1 : 2;
        
        if (playerClass !== this.currentPlayer) return;
        if (!this.movablePieces.includes(pieceIndex)) return;
        
        this.movePiece(pieceIndex, this.currentMoveCount);
    }

    movePiece(pieceIndex, moveCount) {
        const playerData = this.players[this.currentPlayer];
        const currentPos = playerData.pieces[pieceIndex];
        let newPos;
        
        // 지옥에서 탈출하는 경우
        if (playerData.inHell[pieceIndex]) {
            playerData.inHell[pieceIndex] = false;
            newPos = currentPos + moveCount;
            this.updateMessage(`🎉 말이 지옥에서 탈출했습니다!`);
        } else {
            newPos = currentPos + moveCount;
        }
        
        // 골인 처리
        if (newPos >= 20) {
            playerData.finished++;
            playerData.pieces[pieceIndex] = 20;
            this.updateMessage(`🎯 말이 골인했습니다! (${playerData.finished}/4)`);
            
            // 승리 조건 체크
            if (playerData.finished === 4) {
                this.gameWon = true;
                const winnerName = this.isAIMode ? 
                    (this.currentPlayer === 1 ? "🎉 당신이 승리했습니다!" : "😅 AI가 승리했습니다!") : 
                    `🏆 플레이어 ${this.currentPlayer} 승리!`;
                this.updateMessage(winnerName);
                this.resetControls();
                
                // AI 생각 중 애니메이션 제거
                if (this.isAIMode) {
                    const player2Section = document.querySelector('.player-section:nth-child(2)');
                    player2Section.classList.remove('ai-thinking');
                }
                return;
            }
        } else {
            // 다른 말 잡기 체크
            this.checkCapture(newPos, pieceIndex);
            
            // 지옥 구간 체크
            if (this.hellPositions.includes(newPos)) {
                playerData.inHell[pieceIndex] = true;
                this.updateMessage(`🔥 말이 지옥에 빠졌습니다! "모"가 나와야 탈출할 수 있어요!`);
            }
            
            playerData.pieces[pieceIndex] = newPos;
        }
        
        this.updateDisplay();
        this.resetControls();
        
        // 윷이나 모가 나온 경우 한 번 더
        if (this.lastYutResult === '윷' || this.lastYutResult === '모') {
            this.updateMessage(`${this.lastYutResult}가 나와서 한 번 더 던지세요!`);
        } else {
            this.switchPlayer();
        }
    }

    checkCapture(newPos, movingPieceIndex) {
        const otherPlayer = this.currentPlayer === 1 ? 2 : 1;
        const otherPlayerData = this.players[otherPlayer];
        
        for (let i = 0; i < 4; i++) {
            if (otherPlayerData.pieces[i] === newPos && otherPlayerData.pieces[i] > 0 && otherPlayerData.pieces[i] < 20) {
                // 상대방 말을 시작점으로 되돌림
                otherPlayerData.pieces[i] = 0;
                otherPlayerData.inHell[i] = false;
                this.updateMessage(`💥 상대방 말을 잡았습니다! 한 번 더 던지세요!`);
                
                // 잡았을 때도 한 번 더
                this.lastYutResult = '모'; // 한 번 더 던지기 위해
                break;
            }
        }
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        this.updateDisplay();
        
        if (this.currentPlayer === 2 && this.isAIMode) {
            this.updateMessage("AI가 생각 중입니다...");
            this.startAITurn();
        } else {
            const playerName = this.isAIMode ? (this.currentPlayer === 1 ? "당신" : "AI") : `플레이어 ${this.currentPlayer}`;
            this.updateMessage(`${playerName}의 차례입니다!`);
        }
    }

    startAITurn() {
        if (!this.isAIMode || this.currentPlayer !== 2 || this.gameWon) return;
        
        this.aiThinking = true;
        const player2Section = document.querySelector('.player-section:nth-child(2)');
        player2Section.classList.add('ai-thinking');
        
        // AI가 윷을 던지는 시간 지연 (1-2초)
        const thinkingTime = 1000 + Math.random() * 1000;
        
        setTimeout(() => {
            this.aiThrowYut();
        }, thinkingTime);
    }

    aiThrowYut() {
        if (!this.isAIMode || this.currentPlayer !== 2) return;
        
        // AI도 같은 확률로 윷 던지기
        this.throwYut();
    }

    aiSelectPiece() {
        if (!this.isAIMode || this.currentPlayer !== 2 || !this.movablePieces) return;
        
        const bestPiece = this.getAIBestMove();
        
        // AI 선택에 약간의 지연 추가
        setTimeout(() => {
            this.movePiece(bestPiece, this.currentMoveCount);
            this.aiThinking = false;
            const player2Section = document.querySelector('.player-section:nth-child(2)');
            player2Section.classList.remove('ai-thinking');
        }, 800);
    }

    getAIBestMove() {
        if (!this.movablePieces || this.movablePieces.length === 0) return 0;
        
        const playerData = this.players[2];
        const opponentData = this.players[1];
        let bestPiece = this.movablePieces[0];
        let bestScore = -1000;
        
        for (const pieceIndex of this.movablePieces) {
            let score = 0;
            const currentPos = playerData.pieces[pieceIndex];
            const newPos = currentPos + this.currentMoveCount;
            
            // 지옥에서 탈출하는 경우 높은 점수
            if (playerData.inHell[pieceIndex]) {
                score += 100;
            }
            
            // 골인에 가까울수록 높은 점수
            if (newPos >= 20) {
                score += 200; // 골인하면 최고 점수
            } else {
                score += newPos * 5; // 앞으로 갈수록 점수 증가
            }
            
            // 상대방 말을 잡을 수 있는 경우 높은 점수
            for (let i = 0; i < 4; i++) {
                if (opponentData.pieces[i] === newPos && opponentData.pieces[i] > 0 && opponentData.pieces[i] < 20) {
                    score += 150;
                    break;
                }
            }
            
            // 지옥 구간을 피하려고 시도 (하지만 완전히 피하지는 않음)
            if (this.hellPositions.includes(newPos)) {
                score -= 30;
            }
            
            // 상대방이 잡을 수 있는 위치 피하기
            for (let i = 0; i < 4; i++) {
                const opponentPos = opponentData.pieces[i];
                if (opponentPos > 0 && opponentPos < 20) {
                    // 상대방이 1-5칸 움직여서 잡을 수 있는 위치인지 확인
                    for (let move = 1; move <= 5; move++) {
                        if (opponentPos + move === newPos) {
                            score -= 20;
                            break;
                        }
                    }
                }
            }
            
            // 약간의 랜덤성 추가 (AI가 너무 예측 가능하지 않도록)
            score += Math.random() * 10;
            
            if (score > bestScore) {
                bestScore = score;
                bestPiece = pieceIndex;
            }
        }
        
        return bestPiece;
    }

    skipTurn() {
        this.resetControls();
        this.switchPlayer();
    }

    resetControls() {
        this.movablePieces = null;
        this.currentMoveCount = null;
        document.getElementById('throwYut').style.display = 'inline-block';
        document.getElementById('skipTurn').style.display = 'none';
        
        // 모든 말의 선택 상태 초기화
        document.querySelectorAll('.piece').forEach(piece => {
            piece.classList.remove('selected');
        });
    }

    updateDisplay() {
        // 현재 플레이어 표시 업데이트
        if (this.isAIMode) {
            const playerName = this.currentPlayer === 1 ? "당신" : "AI";
            document.getElementById('currentPlayer').textContent = playerName;
        } else {
            document.getElementById('currentPlayer').textContent = `플레이어 ${this.currentPlayer}`;
        }
        
        // 말들의 위치 업데이트
        this.updatePiecePositions();
        this.updatePieceStates();
    }

    updatePiecePositions() {
        // 기존 말들 제거
        document.querySelectorAll('.position .piece').forEach(piece => {
            piece.remove();
        });
        
        // 새로운 위치에 말들 배치
        for (let player = 1; player <= 2; player++) {
            const playerData = this.players[player];
            for (let i = 0; i < 4; i++) {
                const pos = playerData.pieces[i];
                if (pos > 0 && pos <= 20) {
                    const positionElement = document.querySelector(`[data-pos="${pos}"]`);
                    if (positionElement) {
                        const pieceElement = document.createElement('div');
                        pieceElement.className = `piece player${player} board-piece`;
                        pieceElement.textContent = player === 1 ? '🔴' : '🔵';
                        pieceElement.dataset.piece = i;
                        pieceElement.addEventListener('click', (e) => this.selectPiece(e));
                        positionElement.appendChild(pieceElement);
                    }
                }
            }
        }
    }

    updatePieceStates() {
        // 지옥에 있는 말들 표시
        for (let player = 1; player <= 2; player++) {
            const playerData = this.players[player];
            for (let i = 0; i < 4; i++) {
                const pieceElement = document.querySelector(`.player${player}[data-piece="${i}"]`);
                if (pieceElement) {
                    if (playerData.inHell[i]) {
                        pieceElement.classList.add('in-hell');
                    } else {
                        pieceElement.classList.remove('in-hell');
                    }
                }
            }
        }
    }

    updateMessage(message) {
        document.getElementById('gameMessage').textContent = message;
    }
}

// 게임 시작
document.addEventListener('DOMContentLoaded', () => {
    new HellYutGame();
});
