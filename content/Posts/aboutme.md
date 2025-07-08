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

Hi, I’m **Carlos Nunez**, a Computer Science & Computer Engineering major at Shippensburg University (’27).  
Below is an interactive timeline of my education, work, and skills—click each entry to learn more!


{{< rawhtml >}}
<style>
  /* background flocking canvas */
  #bgCanvas {
    position: fixed; top: 0; left: 0;
    width: 100vw; height: 100vh;
    pointer-events: none; z-index: -1;
  }
  /* timeline container */
  .timeline {
    position: relative; max-width: 800px;
    margin: 2rem auto; padding: 0 1rem;
  }
  .timeline::before {
    content: ''; position: absolute;
    left: 50%; top: 0; bottom: 0;
    width: 2px; background: currentColor;
    opacity: 0.2; transform: translateX(-50%);
  }
  /* each entry */
  .entry {
    position: relative; width: 50%;
    padding: 0.5rem 1rem; box-sizing: border-box;
  }
  .entry:nth-child(odd)  { left: 0; text-align: right; }
  .entry:nth-child(even) { left: 50%; }
  .entry::before {
    content: ''; position: absolute;
    top: 1rem; width: 8px; height: 8px;
    border-radius: 50%; background: currentColor;
  }
  .entry:nth-child(odd)::before  { right: -5px; }
  .entry:nth-child(even)::before { left: -5px; }

  /* header and date */
  .entry h3 {
    margin: 0 0 0.2rem; font-size: 1rem;
    display: inline-block;
  }
  .entry time {
    font-size: 0.8rem; color: #888;
    display: block; margin-bottom: 0.3rem;
  }
  /* always‑visible details */
  .entry p, .entry ul {
    margin: 0; padding: 0;
    font-size: 0.85rem; line-height: 1.3;
    list-style: none;
  }
  .entry ul li {
    margin-left: 1rem; position: relative;
  }
  .entry ul li::before {
    content: '•'; position: absolute;
    left: -1rem; font-size: 1rem; line-height: 1;
  }
  /* download link styling */
  .entry a {
    font-size: 0.85rem; text-decoration: underline;
    color: currentColor;
  }
</style>

<canvas id="bgCanvas"></canvas>

<div class="timeline">
  <div class="entry">
    <h3>Education</h3>
    <time>May 2027</time>
    <p><strong>Shippensburg University of Pennsylvania</strong><br>
    B.S. in Computer Science/Computer Engineering (ABET‑accredited)</p>
  </div>

  <div class="entry">
    <h3>Material Handler</h3>
    <time>Summer 2025</time>
    <ul>
      <li>Managed cart movement for production flow</li>
      <li>Streamlined logistics for efficiency</li>
    </ul>
  </div>

  <div class="entry">
    <h3>Material Handler</h3>
    <time>Summer 2024</time>
    <ul>
      <li>Managed cart movement for production flow</li>
      <li>Streamlined logistics for efficiency</li>
    </ul>
  </div>

  <div class="entry">
    <h3>Material Handler</h3>
    <time>Summer 2023</time>
    <ul>
      <li>Managed cart movement for production flow</li>
      <li>Streamlined logistics for efficiency</li>
    </ul>
  </div>

  <div class="entry">
    <h3>Storage Manager</h3>
    <time>Summer 2022</time>
    <ul>
      <li>Led supply‑chain & inventory turnover</li>
      <li>Coordinated client logistics & storage</li>
    </ul>
  </div>

  <div class="entry">
    <h3>Military Training</h3>
    <time>Winter/Spring 2024</time>
    <ul>
      <li>10 weeks Basic Combat Training</li>
      <li>6 weeks + 4 days Interior Electrician AIT</li>
    </ul>
  </div>

  <div class="entry">
    <h3>Skills & Certs</h3>
    <time>Ongoing</time>
    <p>
      Java · JavaScript · Python · C# · HTML/CSS · Kali · Ubuntu · Windows · Unity3D · Blender · MS 365 · Pen‑testing · EE Certified · Spanish (Native)
    </p>
  </div>

  <div class="entry">
    <h3>Download Resume</h3>
    <time>Now</time>
    <p><a href="/resume/Carlos_Nunez_Resume.pdf" target="_blank">📄 Get PDF</a></p>
  </div>
</div>

<script>
  // flocking with visually improved boids
  const c = document.getElementById('bgCanvas'), ctx = c.getContext('2d');
  let W, H;
  function onResize(){ W=c.width=innerWidth; H=c.height=innerHeight; }
  window.addEventListener('resize', onResize);
  onResize();

  class Boid {
    constructor(){
      this.x = Math.random()*W; this.y = Math.random()*H;
      let a = Math.random()*2*Math.PI;
      this.vx = Math.cos(a); this.vy = Math.sin(a);
      this.ax = 0; this.ay = 0;
      this.s = 6 + Math.random()*2;
      this.color = `hsl(${Math.floor(Math.random()*60+200)},70%,60%)`;
    }
    limit(vec, max) {
      let mag = Math.hypot(vec.x, vec.y);
      if(mag > max) { vec.x = vec.x/mag*max; vec.y = vec.y/mag*max; }
    }
    applyForce(fx, fy) {
      this.ax += fx;
      this.ay += fy;
    }
    update(bs){
      let sep = {x:0, y:0}, ali = {x:0, y:0}, coh = {x:0, y:0};
      let sepCount=0, aliCount=0, cohCount=0;
      for(let o of bs){
        if(o===this) continue;
        let dx=o.x-this.x, dy=o.y-this.y, d=Math.hypot(dx,dy);
        // Separation (short range, strong)
        if(d<28 && d>0.01){
          sep.x -= (dx/d) / d; sep.y -= (dy/d) / d;
          sepCount++;
        }
        // Alignment (medium range)
        if(d<60){
          ali.x += o.vx; ali.y += o.vy;
          aliCount++;
        }
        // Cohesion (longer range)
        if(d<110){
          coh.x += o.x; coh.y += o.y;
          cohCount++;
        }
      }
      // Separation
      if(sepCount){
        sep.x/=sepCount; sep.y/=sepCount;
        this.limit(sep, 0.18);
        this.applyForce(sep.x*1.8, sep.y*1.8);
      }
      // Alignment
      if(aliCount){
        ali.x/=aliCount; ali.y/=aliCount;
        let mag = Math.hypot(ali.x, ali.y);
        if(mag>0){ ali.x/=mag; ali.y/=mag; }
        ali.x -= this.vx; ali.y -= this.vy;
        this.limit(ali, 0.07);
        this.applyForce(ali.x*1.2, ali.y*1.2);
      }
      // Cohesion
      if(cohCount){
        coh.x = coh.x/cohCount - this.x;
        coh.y = coh.y/cohCount - this.y;
        this.limit(coh, 0.06);
        this.applyForce(coh.x, coh.y);
      }
      // Subtle randomness for natural look
      if(Math.random()<0.04) this.applyForce((Math.random()-0.5)*0.04, (Math.random()-0.5)*0.04);
      // Update velocity and position
      this.vx += this.ax; this.vy += this.ay;
      this.limit({x:this.vx, y:this.vy}, 2.2);
      this.x += this.vx; this.y += this.vy;
      this.ax = 0; this.ay = 0;
      // Wrap
      if(this.x< -20) this.x=W+19; if(this.x>W+20) this.x=-19;
      if(this.y< -20) this.y=H+19; if(this.y>H+20) this.y=-19;
    }
    draw(){
      let ang = Math.atan2(this.vy,this.vx);
      ctx.save(); ctx.translate(this.x,this.y); ctx.rotate(ang);
      // Duller color: lower saturation, higher lightness
      let dullColor = this.color.replace(/(\d+),(\d+)%?,(\d+)%?\)/, (m, h, s, l) => `${h},35%,75%)`);
      let grad = ctx.createLinearGradient(this.s,0,-this.s,0);
      grad.addColorStop(0, dullColor);
      grad.addColorStop(1, 'rgba(255,255,255,0.10)');
      ctx.beginPath();
      ctx.moveTo(this.s,0);
      ctx.lineTo(-this.s,this.s/2);
      ctx.lineTo(-this.s,-this.s/2);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.globalAlpha = 0.7;
      ctx.shadowColor = dullColor;
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      ctx.restore();
    }
  }
  const flock = Array.from({length:48},_=>new Boid());
  function anim(){
    // Remove background fill to prevent smearing/trails
    ctx.clearRect(0,0,W,H);
    flock.forEach(b=>{ b.update(flock); b.draw(); });
    requestAnimationFrame(anim);
  }
  anim();
</script>
{{< /rawhtml >}}
