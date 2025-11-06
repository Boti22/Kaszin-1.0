// shared.js
const CHIP_KEY = 'funcasino_chips_v1';

function initChips(){
  if (!localStorage.getItem(CHIP_KEY)) localStorage.setItem(CHIP_KEY, '100');
}
function getChips(){
  initChips();
  return parseInt(localStorage.getItem(CHIP_KEY),10);
}
function setChips(val){
  localStorage.setItem(CHIP_KEY, String(Math.max(0, Math.floor(val))));
  updateChipUI();
  window.dispatchEvent(new Event('storage'));
}
function changeChips(delta){
  const next = getChips() + delta;
  setChips(next);
  return getChips();
}
function updateChipUI(){
  const ids = ['chipDisplay','chipDisplaySlot','chipDisplayRoulette','chipDisplayBJ','chipCount'];
  ids.forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.textContent = getChips();
  });
}
function resetChips(){
  setChips(100);
  alert('🔄 Chipek visszaállítva 100-ra.');
}
document.addEventListener('DOMContentLoaded', updateChipUI);
window.addEventListener('storage', updateChipUI);

window.getChips = getChips;
window.setChips = setChips;
window.changeChips = changeChips;
window.resetChips = resetChips;
