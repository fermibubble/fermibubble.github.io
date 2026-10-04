(() => {
 const slider=document.getElementById('citation-weight');
 if (!slider) return;
 const weight=document.getElementById('weight-value');
 const a=document.getElementById('score-a'), b=document.getElementById('score-b');
 const barA=document.getElementById('bar-a'), barB=document.getElementById('bar-b');
 const result=document.getElementById('metric-explanation');
 function update(){
   const w=Number(slider.value)/100;
   const x=90*(1-w)+20*w, y=70*(1-w)+95*w;
   weight.textContent=`${slider.value}%`;
   a.textContent=x.toFixed(2); b.textContent=y.toFixed(2);
   barA.style.width=`${x}%`; barB.style.width=`${y}%`;
   const delta=Math.abs(x-y);
   result.textContent=delta<0.005 ? 'The versions tie under this scoring rule.' : `Atlas ${x>y?'A':'B'} leads by ${delta.toFixed(2)} points under this scoring rule.`;
 }
 slider.addEventListener('input',update); update();
})();
