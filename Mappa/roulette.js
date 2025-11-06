// roulette.js
// Wheel numbers in European order
const numbers = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];

function numberColor(n){
  if(n===0) return 'green';
  const reds = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
  return reds.has(n) ? 'red' : 'black';
}

// UI elements
let wheelEl, gridEl, spinBtnR, betAmountEl, resultEl, clearBetsBtn, betsListEl, betSummaryEl;
let currentBets = []; // {type, value, stake}

document.addEventListener('DOMContentLoaded', ()=>{
  wheelEl = document.getElementById('wheel');
  gridEl = document.getElementById('rouletteGrid');
  spinBtnR = document.getElementById('spinBtnR');
  betAmountEl = document.getElementById('betAmount');
  resultEl = document.getElementById('rouletteResult');
  clearBetsBtn = document.getElementById('clearBets');
  betsListEl = document.getElementById('betsList');
  betSummaryEl = document.getElementById('betSummary');

  buildGrid();
  addQuickBetListeners();
  spinBtnR.addEventListener('click', spinWheel);
  clearBetsBtn.addEventListener('click', ()=>{ currentBets=[]; renderBetsUI(); resultEl.textContent='Bets cleared.'; });
  window.addEventListener('storage', ()=>{ /* chip UI updated by shared.js */ });
});

function buildGrid(){
  for(let n=0;n<=36;n++){
    const cell = document.createElement('div');
    cell.className = 'number-cell ' + (numberColor(n));
    cell.textContent = n;
    cell.dataset.num = n;
    cell.addEventListener('click', ()=> onNumberClicked(n, cell));
    gridEl.appendChild(cell);
  }
  renderBetsUI();
}

function onNumberClicked(n, cell){
  const stake = Math.max(1, Math.floor(Number(betAmountEl.value) || 0));
  if(getChips() < stake){ resultEl.textContent = '❌ Nincs elég chip a téthez!'; return; }
  currentBets.push({type:'number', value:n, stake});
  changeChips(-stake);
  renderBetsUI();
  resultEl.textContent = `Tét rögzítve: ${n} - ${stake} chip.`;
}

function addQuickBetListeners(){
  const btns = document.querySelectorAll('.quick-bet');
  btns.forEach(b=>{
    b.addEventListener('click', ()=>{
      const type = b.dataset.type;
      const value = b.dataset.value;
      placeQuickBet(type, value);
    });
  });
}

function placeQuickBet(type, value){
  const stake = Math.max(1, Math.floor(Number(betAmountEl.value) || 0));
  if(getChips() < stake){ resultEl.textContent = '❌ Nincs elég chip a téthez!'; return; }
  // For clarity, store value as string for parity/color/range/dozen/column
  currentBets.push({type, value, stake});
  changeChips(-stake);
  renderBetsUI();
  resultEl.textContent = `Tét: ${type} ${value} - ${stake} chip.`;
}

function renderBetsUI(){
  // highlight number cells with bets
  const cells = gridEl.querySelectorAll('.number-cell');
  cells.forEach(c => c.style.outline = '');
  // Build bet summary
  if(currentBets.length===0){
    betSummaryEl.textContent = 'Aktuális fogadások: nincs';
    betsListEl.innerHTML = '';
    return;
  }
  betSummaryEl.textContent = `Aktuális fogadások: ${currentBets.length} tét`;
  // render detailed list
  betsListEl.innerHTML = currentBets.map((b,i)=> {
    if(b.type==='number') return `<div> #${i+1}: Number ${b.value} — ${b.stake} chip</div>`;
    return `<div> #${i+1}: ${b.type.toUpperCase()} ${b.value} — ${b.stake} chip</div>`;
  }).join('');
  // highlight numbered cells
  currentBets.forEach(b=>{
    if(b.type === 'number'){
      const el = gridEl.querySelector(`[data-num="${b.value}"]`);
      if(el) el.style.outline = '3px solid rgba(255,255,0,0.6)';
    }
  });
}

function spinWheel(){
  if(currentBets.length===0){ resultEl.textContent = '🔔 Nincs téted! Tedd meg a fogadásokat a gridre vagy a gyorsgombokkal.'; return; }

  const idx = Math.floor(Math.random()*numbers.length);
  const chosenNumber = numbers[idx];
  const sectorAngle = 360 / numbers.length;
  const randomSpins = 4 + Math.floor(Math.random()*3);
  const targetAngle = 360 * randomSpins + (idx * sectorAngle) + (sectorAngle/2);
  wheelEl.style.transition = 'transform 3s cubic-bezier(.2,.9,.2,1)';
  wheelEl.style.transform = `rotate(${targetAngle}deg)`;

  resultEl.textContent = 'Pörgetés...';

  setTimeout(()=>{
    wheelEl.style.transition = 'none';
    const normalized = (idx * sectorAngle) % 360;
    wheelEl.style.transform = `rotate(${normalized}deg)`;
    evaluateBets(chosenNumber);
    currentBets = [];
    renderBetsUI();
  }, 3200);
}

function evaluateBets(chosenNumber){
  const col = numberColor(chosenNumber);
  let totalWon = 0, totalLost = 0;
  const messages = [`Nyertes szám: ${chosenNumber} (${col})`];

  currentBets.forEach(b=>{
    if(b.type === 'number'){
      if(Number(b.value) === chosenNumber){
        const payout = b.stake * 35;
        totalWon += payout;
        messages.push(`Szám ${b.value} eltalálva! +${payout} chip`);
      } else {
        totalLost += b.stake;
      }
    } else if(b.type === 'color'){
      if(chosenNumber !== 0 && b.value === col){
        const payout = b.stake * 2;
        totalWon += payout;
        messages.push(`Szín ${b.value} eltalálva! +${payout} chip`);
      } else totalLost += b.stake;
    } else if(b.type === 'parity'){
      if(chosenNumber !== 0){
        const isEven = chosenNumber % 2 === 0;
        if((b.value === 'even' && isEven) || (b.value === 'odd' && !isEven)){
          const payout = b.stake * 2;
          totalWon += payout;
          messages.push(`Párosság (${b.value}) eltalálva! +${payout} chip`);
        } else totalLost += b.stake;
      } else totalLost += b.stake;
    } else if(b.type === 'range'){
      if(b.value === '1-18' && chosenNumber>=1 && chosenNumber<=18){
        const payout = b.stake * 2;
        totalWon += payout;
        messages.push(`Range 1-18 eltalálva! +${payout} chip`);
      } else if(b.value === '19-36' && chosenNumber>=19 && chosenNumber<=36){
        const payout = b.stake * 2;
        totalWon += payout;
        messages.push(`Range 19-36 eltalálva! +${payout} chip`);
      } else totalLost += b.stake;
    } else if(b.type === 'dozen'){
      // 1 => 1-12, 2 => 13-24, 3 =>25-36
      const val = Number(b.value);
      let hit=false;
      if(val===1 && chosenNumber>=1 && chosenNumber<=12) hit=true;
      if(val===2 && chosenNumber>=13 && chosenNumber<=24) hit=true;
      if(val===3 && chosenNumber>=25 && chosenNumber<=36) hit=true;
      if(hit){
        const payout = b.stake * 3;
        totalWon += payout;
        messages.push(`Dozen ${b.value} eltalálva! +${payout} chip`);
      } else totalLost += b.stake;
    } else if(b.type === 'column'){
      // Columns: column 1 = numbers 1,4,7,...34 ; column 2 = 2,5,8,...35 ; column 3 = 3,6,9,...36
      const colNum = Number(b.value);
      if(chosenNumber === 0){ totalLost += b.stake; return; }
      let hit = false;
      for(let i=1;i<=36;i++){
        // compute column: (i-1) % 3 -> 0 -> col1, 1 -> col2, 2 -> col3
        const cidx = ((i-1) % 3) + 1;
        if(cidx === colNum && i === chosenNumber) hit = true;
      }
      if(hit){
        const payout = b.stake * 3;
        totalWon += payout;
        messages.push(`Column ${b.value} eltalálva! +${payout} chip`);
      } else totalLost += b.stake;
    } else {
      totalLost += b.stake;
    }
  });

  if(totalWon > 0){
    changeChips(totalWon);
    messages.push(`Összes nyeremény: +${totalWon} chip`);
  } else {
    messages.push('Sajnos nem nyertél.');
  }
  resultEl.innerHTML = messages.join('<br>');
}
