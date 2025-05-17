(() => {
  const gameBoard = document.getElementById('gameBoard');
  const scoreBoard = document.getElementById('scoreBoard');
  const levelIndicator = document.getElementById('levelIndicator');
  const levelUpMessage = document.getElementById('levelUpMessage');
  const restartBtn = document.getElementById('restartBtn');

  const emojiPairsPool = ['🐶','🐱','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐸','🐵','🦄','🐔','🐢','🐧','🐙'];

  let level = 1;
  let score = 0;
  let matchedPairs = 0;
  let lockBoard = false;
  let firstCard = null;
  let secondCard = null;
  let maxLevel = 5;

  function cardsCountForLevel(lvl) {
    return Math.min(emojiPairsPool.length, 2 * lvl) * 2;
  }

  function setupBoard() {
    const cardsCount = cardsCountForLevel(level);
    const pairsCount = cardsCount / 2;
    matchedPairs = 0;
    score = 0;
    updateScore();
    updateLevel();
    levelUpMessage.style.visibility = 'hidden';
    lockBoard = false;
    firstCard = null;
    secondCard = null;

    const selectedEmojis = emojiPairsPool.slice(0, pairsCount);
    const cards = shuffleArray([...selectedEmojis, ...selectedEmojis]);

    gameBoard.innerHTML = '';
    const gridCols = Math.min(6, Math.ceil(Math.sqrt(cardsCount)));
    gameBoard.style.gridTemplateColumns = `repeat(${gridCols}, 1fr)`;

    cards.forEach((emoji, index) => {
      const card = createCardElement(emoji, index);
      gameBoard.appendChild(card);
    });
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function createCardElement(emoji, idx) {
    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('role', 'gridcell');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', 'Memory card, face down');
    card.dataset.emoji = emoji;
    card.dataset.index = idx;

    const cardInner = document.createElement('div');
    cardInner.className = 'card-inner';

    const frontFace = document.createElement('div');
    frontFace.className = 'card-front';
    frontFace.textContent = '❓';

    const backFace = document.createElement('div');
    backFace.className = 'card-back';
    backFace.textContent = emoji;

    cardInner.appendChild(frontFace);
    cardInner.appendChild(backFace);
    card.appendChild(cardInner);

    card.addEventListener('click', () => flipCard(card));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        flipCard(card);
      }
    });

    return card;
  }

  function flipCard(card) {
    if (lockBoard || card === firstCard || card.classList.contains('flipped')) return;

    card.classList.add('flipped');
    card.setAttribute('aria-label', `Memory card, face up showing ${card.dataset.emoji}`);

    if (!firstCard) {
      firstCard = card;
      return;
    }

    secondCard = card;
    lockBoard = true;

    checkMatch();
  }

  function checkMatch() {
    const isMatch = firstCard.dataset.emoji === secondCard.dataset.emoji;

    if (isMatch) {
      matchedPairs++;
      updateScore();
      disableCards();
      if (matchedPairs === cardsCountForLevel(level) / 2) {
        levelUp();
      } else {
        resetFlip();
      }
    } else {
      unflipCards();
    }
  }

  function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    firstCard.onkeydown = null;
    secondCard.onkeydown = null;
    score += 10;
    updateScore();
  }

  function unflipCards() {
    setTimeout(() => {
      firstCard.classList.remove('flipped');
      secondCard.classList.remove('flipped');
      firstCard.setAttribute('aria-label', 'Memory card, face down');
      secondCard.setAttribute('aria-label', 'Memory card, face down');
      resetFlip();
    }, 1100);
  }

  function resetFlip() {
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
  }

  function updateScore() {
    scoreBoard.textContent = `Score: ${score}`;
  }

  function updateLevel() {
    levelIndicator.textContent = `Level: ${level}`;
  }

  function levelUp() {
    levelUpMessage.style.visibility = 'visible';
    levelUpMessage.textContent = `🎉 Level ${level} completed! Moving to level ${level + 1}...`;
    score += 20;
    updateScore();

    setTimeout(() => {
      levelUpMessage.style.visibility = 'hidden';
      level++;
      if (level > maxLevel) {
        alert(`🏆 Congratulations! You've completed all ${maxLevel} levels! Your final score is ${score}.`);
        level = 1;
        score = 0;
        updateScore();
        updateLevel();
        setupBoard();
      } else {
        updateLevel();
        setupBoard();
      }
    }, 2200);
  }

  restartBtn.addEventListener('click', () => {
    level = 1;
    score = 0;
    updateScore();
    updateLevel();
    levelUpMessage.style.visibility = 'hidden';
    setupBoard();
  });

  setupBoard();
})();
