// let chips = 100;
// const symbols = ['🍒', '🍋', '🍊', '⭐', '🔔'];

// const chipDisplay = document.getElementById('chipCount');
// const spinBtn = document.getElementById('spinBtn');
// const resetBtn = document.getElementById('resetBtn');
// const result = document.getElementById('result');

// function updateChips(amount) {
//   chips += amount;
//   chipDisplay.textContent = chips;
// }

// function spinReels() {
//   if (chips < 10) {
//     result.textContent = '❌ Nincs elég chip a pörgetéshez!';
//     return;
//   }

//   updateChips(-10);

//   const s1 = symbols[Math.floor(Math.random() * symbols.length)];
//   const s2 = symbols[Math.floor(Math.random() * symbols.length)];
//   const s3 = symbols[Math.floor(Math.random() * symbols.length)];

//   document.getElementById('reel1').textContent = s1;
//   document.getElementById('reel2').textContent = s2;
//   document.getElementById('reel3').textContent = s3;

//   if (s1 === s2 && s2 === s3) {
//     updateChips(500);
//     result.textContent = '🎉 Jackpot! +500 chip!';
//   } else if (s1 === s2 || s2 === s3 || s1 === s3) {
//     updateChips(100);
//     result.textContent = '👍 Szép! +100 chip!';
//   } else {
//     result.textContent = '😢 Próbáld újra!';
//   }
// }

// function resetChips() {
//   chips = 100;
//   chipDisplay.textContent = chips;
//   result.textContent = '🔄 Chip nullázva!';
// }

// spinBtn.addEventListener('click', spinReels);
// resetBtn.addEventListener('click', resetChips);
