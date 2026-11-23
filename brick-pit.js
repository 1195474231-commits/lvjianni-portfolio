(() => {
  const canvas = document.querySelector('.brick-pit');
  const ctx = canvas?.getContext('2d');
  if (!ctx) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const palette = [
    ['#ff9f8e','#ff5448','#9d292e'],['#a4b7ff','#536bfa','#28328e'],
    ['#ffe987','#ffbd30','#a56513'],['#9ef5b0','#33cc79','#117c51'],
    ['#ffa9e5','#eb62bf','#8c367a'],['#b69cff','#8f5ff1','#523197']
  ];
  let bricks = [], width = 0, height = 0, frame = 0;
  let visible = false, grabbed, pointerId;
  const rand = (a,b) => a + Math.random() * (b-a);
  function draw() {
    ctx.clearRect(0,0,width,height);
    function face(color, points) {
      ctx.fillStyle=color;
      ctx.beginPath();
      points.forEach(([x,y],i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
      ctx.closePath();
      ctx.fill();
    }
    for (const b of bricks) {
      const [light,mid,deep]=b.colors;
      ctx.save();
      ctx.translate(b.x,b.y);
      ctx.rotate(b.angle);
      const x=b.w/2, y=b.h/2, dx=b.h*.42, dy=b.h*.38;
      face(mid,[[-x,-y],[x,-y],[x,y],[-x,y]]);
      face(deep,[[x,-y],[x+dx,-y-dy],[x+dx,y-dy],[x,y]]);
      face(light,[[-x,-y],[-x+dx,-y-dy],[x+dx,-y-dy],[x,-y]]);
      for(let i=0;i<b.studs;i++){
        const sx=-x+(i+.5)*b.w/b.studs+dx*.5, sy=-y-dy*.5;
        const radius=Math.min(b.h*.17,b.w/b.studs*.29);
        ctx.fillStyle=deep;
        ctx.beginPath();
        ctx.ellipse(sx,sy,radius,radius*.48,0,0,Math.PI*2);
        ctx.fill();
        ctx.fillStyle=mid;
        ctx.beginPath();
        ctx.ellipse(sx,sy-b.h*.07,radius,radius*.48,0,0,Math.PI*2);
        ctx.fill();
        ctx.strokeStyle=light;
        ctx.lineWidth=1;
        ctx.stroke();
      }
      ctx.restore();
    }
  }
  function simulate() {
    for (const b of bricks) {
      if (b===grabbed) continue;
      b.vx += (b.homeX - b.x) * .0015;
      b.vy += (b.homeY + Math.sin(performance.now() * .0014 + b.phase) * 10 - b.y) * .003;
      b.x+=b.vx;
      b.y+=b.vy;
      b.angle+=b.spin;
      b.vx*=.94; b.vy*=.94;
      b.spin*=.98;
    }
    for(let i=0;i<bricks.length;i++) for(let j=i+1;j<bricks.length;j++){
      const a=bricks[i], b=bricks[j];
      const dx=b.x-a.x, dy=b.y-a.y;
      const d=Math.hypot(dx,dy)||.01, overlap=a.r+b.r-d;
      if(overlap<=0) continue;
      const nx=dx/d, ny=dy/d;
      const aa=a===grabbed?0:b===grabbed?1:.5, bb=1-aa;
      a.x-=nx*overlap*aa; a.y-=ny*overlap*aa;
      b.x+=nx*overlap*bb; b.y+=ny*overlap*bb;
      const speed=(a.vx-b.vx)*nx+(a.vy-b.vy)*ny;
      if(speed<=0) continue;
      const impulse=speed*.72;
      a.vx-=nx*impulse*aa; a.vy-=ny*impulse*aa;
      b.vx+=nx*impulse*bb; b.vy+=ny*impulse*bb;
    }
  }
  let lastTick = 0;
  function tick(timestamp = 0) {
    frame=0;
    if (!visible || document.hidden || reducedMotion.matches) return;
    if (timestamp - lastTick < 32) { frame=requestAnimationFrame(tick); return; }
    lastTick=timestamp;
    simulate();
    draw();
    frame=requestAnimationFrame(tick);
  }
  function wake() {

    if (visible && !document.hidden && !reducedMotion.matches && !frame) frame=requestAnimationFrame(tick);
  }
  function resize() {
    const rect=canvas.getBoundingClientRect();
    width=rect.width; height=rect.height;
    if(!width || !height) return;
    const dpr=Math.min(devicePixelRatio || 1,2);
    canvas.width=Math.round(width*dpr);
    canvas.height=Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const positions=[[-.015,.13],[.78,.075],[1.005,.35],[.02,.59],[.16,.97],[.68,.94],[.98,.88]];
    grabbed=undefined;
    bricks=positions.map(([px,py],i)=>{
      const h=Math.min(126,Math.max(42,width*.1))*rand(.72,1.2), w=h*rand(1.35,2.05);
      const r=(w+h)*.29;
      const x=width*px;
      const y=height*py;
      return {x, homeX:x, homeY:y, phase:rand(0,6.28),
        y,w,h,r,vx:rand(-.7,.7),vy:0,angle:rand(-.6,.6),spin:rand(-.02,.02),
        studs:w/h>2.1?3:2,colors:palette[i%palette.length]};
    });

    draw();
  }
  function point(event){
    const rect=canvas.getBoundingClientRect();
    return {x:event.clientX-rect.left,y:event.clientY-rect.top};
  }
  canvas.addEventListener('pointerdown',event=>{
    if(!event.isPrimary || event.button!==0 || reducedMotion.matches) return;
    const {x,y}=point(event);
    grabbed=bricks.findLast(b=>Math.abs(b.x-x)<b.w*.6 && Math.abs(b.y-y)<b.r+4);
    if(!grabbed) return;
    pointerId=event.pointerId;
    canvas.setPointerCapture(pointerId);
    wake();
  });
  canvas.addEventListener('pointermove',event=>{
    if(reducedMotion.matches || !event.isPrimary) return;
    const {x,y}=point(event);
    if(grabbed && event.pointerId===pointerId){
      grabbed.vx=Math.max(-15,Math.min(15,x-grabbed.x));
      grabbed.vy=Math.max(-15,Math.min(15,y-grabbed.y));
      grabbed.x=x; grabbed.y=y;
      grabbed.angle+=grabbed.vx*.008;
      wake();
    } else if(event.pointerType==='mouse'){
      for(const b of bricks){
        const dx=b.x-x, dy=b.y-y, distance=Math.hypot(dx,dy);
        if(distance>62 || distance<1) continue;
        b.vx+=dx/distance*1.8;
        b.vy-=1.75;
        b.spin+=dx*.001;
        wake();
      }
    }
  });
  function release(event){
    if(event.pointerId!==pointerId || !grabbed) return;
    grabbed.spin=grabbed.vx*.018;
    grabbed=undefined;
    wake();
  }
  canvas.addEventListener('pointerup',release);
  canvas.addEventListener('pointercancel',release);
  canvas.addEventListener('lostpointercapture',release);
  document.addEventListener('visibilitychange',wake);
  reducedMotion.addEventListener('change',wake);
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([entry])=>{
    visible=entry.isIntersecting;
    if(visible) wake();
  }).observe(canvas);
})();
