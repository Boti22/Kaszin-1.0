// blackjack.js
const dealerHandDiv = document.getElementById('dealerHand');
const playerHandDiv = document.getElementById('playerHand');
const dealerValueSpan = document.getElementById('dealerValue');
const playerValueSpan = document.getElementById('playerValue');

const bjBetInput = document.getElementById('bjBet');
const dealBtn = document.getElementById('dealBtn');
const hitBtn = document.getElementById('hitBtn');
const standBtn = document.getElementById('standBtn');
const surrenderBtn = document.getElementById('surrenderBtn');
const restartBtn = document.getElementById('restartBtn');
const bjResult = document.getElementById('bjResult');
const chipDisplayBJ = document.getElementById('chipDisplayBJ');

let deck = [];
let playerHand = [];
let dealerHand = [];
let currentBet = 0;
let inRound = false;

function buildDeck(){
  const suits = ['♠','♥','♦','♣'];
  const ranks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  const d = [];
  for(const s of suits) for(const r of ranks) d.push({rank:r,suit:s});
  return d;
}
function shuffle(array){
  for(let i=array.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
function cardToStr(c){ return `${c.rank}${c.suit}`; }
function cardValue(c){ if(c.rank==='A') return 11; if(['K','Q','J'].includes(c.rank)) return 10; return parseInt(c.rank,10); }
function handValue(hand){
  let total=0, aces=0;
  for(const c of hand){ total += cardValue(c); if(c.rank==='A') aces++; }
  while(total>21 && aces>0){ total -= 10; aces--; }
  return total;
}
function renderHands(){
  dealerHandDiv.innerHTML=''; playerHandDiv.innerHTML='';
  dealerHand.forEach((c,idx)=>{
    const el = document.createElement('div'); el.className='card';
    if(inRound && idx===0) el.textContent = '🂠';
    else el.textContent = cardToStr(c);
    dealerHandDiv.appendChild(el);
  });
  playerHand.forEach(c=>{
    const el = document.createElement('div'); el.className='card';
    el.textContent = cardToStr(c);
    playerHandDiv.appendChild(el);
  });
  playerValueSpan.textContent = handValue(playerHand);
  dealerValueSpan.textContent = inRound ? '??' : handValue(dealerHand);
}

function resetRoundUI(){
  playerHand = []; dealerHand = []; currentBet = 0; inRound=false;
  hitBtn.disabled = standBtn.disabled = surrenderBtn.disabled = true;
  bjResult.textContent = '';
  renderHands();
  updateChipUI();
}

document.addEventListener('DOMContentLoaded', ()=>{
  dealBtn.addEventListener('click', startRound);
  hitBtn.addEventListener('click', playerHit);
  standBtn.addEventListener('click', playerStand);
  surrenderBtn.addEventListener('click', playerSurrender);
  restartBtn.addEventListener('click', ()=>{
    setChips(100); resetRoundUI();
  });
  resetRoundUI();
  window.addEventListener('storage', ()=>{ if(chipDisplayBJ) chipDisplayBJ.textContent = getChips(); });
});

function startRound(){
  const bet = Math.max(1, Math.floor(Number(bjBetInput.value) || 0));
  if(getChips() < bet){ bjResult.textContent='❌ Nincs elég chip a téthez!'; return; }
  deck = shuffle(buildDeck());
  playerHand = [deck.pop(), deck.pop()];
  dealerHand = [deck.pop(), deck.pop()];
  currentBet = bet;
  inRound = true;
  changeChips(-currentBet);
  hitBtn.disabled = false; standBtn.disabled = false; surrenderBtn.disabled = false;
  bjResult.textContent = '';
  renderHands();

  const pVal = handValue(playerHand);
  const dVal = handValue(dealerHand);
  if(pVal===21 && dVal===21){ endRound('push'); }
  else if(pVal===21){ endRound('blackjack'); }
  else if(dVal===21){ endRound('dealer_blackjack'); }
}

function revealDealer(){ inRound = false; renderHands(); }

function dealerPlay(){
  revealDealer();
  let dv = handValue(dealerHand);
  while(dv < 17){
    dealerHand.push(deck.pop());
    dv = handValue(dealerHand);
  }
  return dv;
}

function playerHit(){
  if(!inRound) return;
  playerHand.push(deck.pop());
  renderHands();
  const pv = handValue(playerHand);
  if(pv > 21) endRound('player_bust');
}

function playerStand(){
  if(!inRound) return;
  const dealerVal = dealerPlay();
  const playerVal = handValue(playerHand);
  if(dealerVal > 21) endRound('dealer_bust');
  else if(dealerVal > playerVal) endRound('dealer_win');
  else if(dealerVal < playerVal) endRound('player_win');
  else endRound('push');
}

function playerSurrender(){
  if(!inRound) return;
  const ret = Math.ceil(currentBet/2);
  changeChips(ret);
  bjResult.textContent = `🛑 Surrender — vissza: ${ret} chip.`;
  resetRoundUI();
}

function endRound(code){
  inRound = false;
  renderHands();
  hitBtn.disabled = standBtn.disabled = surrenderBtn.disabled = true;

  switch(code){
    case 'blackjack': {
      const payout = Math.floor(currentBet * 2.5);
      changeChips(payout);
      bjResult.innerHTML = `🃏 Blackjack! Nyeremény: +${payout} chip.`;
      break;
    }
    case 'dealer_blackjack':
      bjResult.textContent = '💥 Dealer Blackjack — vesztettél.';
      break;
    case 'player_bust':
      bjResult.textContent = '💥 Bust! Túllépted a 21-et — vesztettél.';
      break;
    case 'dealer_bust':
      changeChips(currentBet * 2);
      bjResult.textContent = `🎉 Dealer bust — nyertél +${currentBet*2} chip.`;
      break;
    case 'player_win':
      changeChips(currentBet * 2);
      bjResult.textContent = `🎉 Nyertél! +${currentBet*2} chip.`;
      break;
    case 'dealer_win':
      bjResult.textContent = '😢 Dealer nyert.';
      break;
    case 'push':
      changeChips(currentBet);
      bjResult.textContent = '🤝 Push — a tét visszakerül.';
      break;
    default:
      bjResult.textContent = 'Eredmény: ' + code;
  }
  currentBet = 0;
  updateChipUI();
}
