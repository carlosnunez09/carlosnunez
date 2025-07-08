---
title: "About Me"
date: 2023-09-24
showToc: false
TocOpen: false
draft: false
hidemeta: false
comments: false
author: "Carlos Nunez"
searchHidden: false
disableShare: true
---

<p>
  Hello! I’m <strong>Carlos Nunez</strong>, currently enrolled at Shippensburg University majoring in
  Computer Science & Engineering. Welcome to my corner of the web.
</p>

{{< rawhtml >}}
<style>
  #bubbleCanvas {
    position: fixed; top:0; left:0;
    width:100%; height:100%;
    pointer-events:none; z-index:-1;
  }
</style>

<canvas id="bubbleCanvas"></canvas>

<script>
  const canvas = document.getElementById('bubbleCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = innerWidth; canvas.height = innerHeight;

  class Bubble {
    constructor(x,y){
      this.x=x; this.y=y;
      this.size=Math.random()*20+10;
      this.speedX=Math.random()*2-1;
      this.speedY=Math.random()*-2-1;
      this.opacity=1;
    }
    update(){
      this.x+=this.speedX; this.y+=this.speedY;
      this.opacity-=0.01;
    }
    draw(){
      ctx.beginPath();
      ctx.arc(this.x,this.y,this.size,0,2*Math.PI);
      ctx.fillStyle=`rgba(0,150,255,${this.opacity})`;
      ctx.fill();
    }
  }

  const bubbles=[];
  window.addEventListener('click',e=>{
    for(let i=0;i<5;i++) bubbles.push(new Bubble(e.clientX,e.clientY));
  });

  function animate(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    bubbles.forEach((b,i)=>{
      b.update(); b.draw();
      if(b.opacity<=0) bubbles.splice(i,1);
    });
    requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener('resize',()=>{
    canvas.width=innerWidth; canvas.height=innerHeight;
  });
</script>
{{< /rawhtml >}}
