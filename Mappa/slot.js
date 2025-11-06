// slot.js
const symbols = ['🍒','🍋','🍊','⭐','🔔'];
let spinBtn, resetBtn, resultEl;

document.addEventListener('DOMContentLoaded', () => {
  spinBtn = document.getElementById('spinBtn');
  resetBtn = document.getElementById('resetBtn');
  resultEl = document.getElementById('result');
  spinBtn.addEventListener('click', spinReels);
  resetBtn.addEventListener('click', ()=>{ setChips(100); resultEl.textContent='🔄 Chipek visszaállítva 100-ra.'; });
  window.addEventListener('storage', ()=>{ /* UI updated by shared.js */ });
});

function spinReels(){
  if(getChips() < 10){ resultEl.textContent = '❌ Nincs elég chip a pörgetéshez!'; return; }
  changeChips(-10);

  const r1 = document.getElementById('reel1');
  const r2 = document.getElementById('reel2');
  const r3 = document.getElementById('reel3');

  let cycles = 12;
  const iv = setInterval(()=>{
    r1.textContent = symbols[Math.floor(Math.random()*symbols.length)];
    r2.textContent = symbols[Math.floor(Math.random()*symbols.length)];
    r3.textContent = symbols[Math.floor(Math.random()*symbols.length)];
    cycles--;
    if(cycles<=0){
      clearInterval(iv);
      evaluateSlot(r1.textContent, r2.textContent, r3.textContent);
    }
  }, 80);
}

function evaluateSlot(s1,s2,s3){
  if(s1===s2 && s2===s3){
    changeChips(500);
    resultEl.textContent = '🎉 Jackpot! +500 chip!';
  } else if (s1===s2 || s2===s3 || s1===s3){
    changeChips(100);
    resultEl.textContent = '👍 Szép! +100 chip!';
  } else {
    resultEl.textContent = '😢 Próbáld újra!';
  }
}
