---
title: "Contact Me"
layout: "contact"
url: "/contact/"
summary: "Get in touch with me"
ShowToc: false
ShowBreadCrumbs: false
---

{{< rawhtml >}}
<style>
  /* bezier curves canvas - same pattern as About Me flocking */
  #bgCanvas {
    position: fixed; top: 0; left: 0;
    width: 100vw; height: 100vh;
    pointer-events: none; z-index: -1;
  }
</style>

<canvas id="bgCanvas"></canvas>

<div class="contact-content">
  <h2>Get In Touch</h2>
  <p>I'd love to hear from you! Whether you have a question, want to collaborate, or just want to say hello, fill out the form below.</p>

  <form name="contact" method="POST" action="/contact/thanks/" data-netlify="true" netlify-honeypot="bot-field" class="contact-form">
    <p style="display:none;">
      <label>Don't fill this out: <input name="bot-field" /></label>
    </p>
    <p>
      <label>Your Name<br/>
        <input type="text" name="name" required placeholder="John Doe" />
      </label>
    </p>
    <p>
      <label>Your Email<br/>
        <input type="email" name="email" required placeholder="you@example.com" />
      </label>
    </p>
    <p>
      <label>Message<br/>
        <textarea name="message" rows="5" required placeholder="What's on your mind?"></textarea>
      </label>
    </p>
    <p>
      <button type="submit">Send Message</button>
    </p>
  </form>

  <hr/>
  <h3>Connect With Me</h3>
  <p>You can also find me on:</p>
  <ul>
    <li><a href="https://github.com/carlosnunez09">GitHub</a></li>
    <li><a href="https://www.instagram.com/andmecarlos/">Instagram</a></li>
    <li><a href="https://stackoverflow.com/users/18114507/carlos-nunez">Stack Overflow</a></li>
  </ul>
</div>

<script>
  // Bezier Curves Animation - Freya Holmér inspired
  // Subtle, mathematical grayscale curves
  const c = document.getElementById('bgCanvas'), ctx = c.getContext('2d');
  let W, H;
  function onResize(){ W=c.width=innerWidth; H=c.height=innerHeight; }
  window.addEventListener('resize', onResize);
  onResize();

  // Mouse interaction
  let mouse = { x: -1000, y: -1000 };
  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  // Detect dark mode
  function isDark() {
    return document.body.classList.contains('dark') || 
           window.matchMedia('(prefers-color-scheme: dark)').matches ||
           getComputedStyle(document.body).backgroundColor.match(/rgb\((\d+)/)?.[1] < 128;
  }

  // Bezier curve class - subtle flowing curves
  class BezierCurve {
    constructor(){
      this.gray = 0.3 + Math.random() * 0.4; // 30-70% gray
      this.speed = 0.0005 + Math.random() * 0.001; // slower, more subtle
      this.phase = Math.random() * Math.PI * 2;
      this.amp = 80 + Math.random() * 120; // smaller amplitude
      this.thickness = 0.5 + Math.random() * 1; // thinner lines
      this.alpha = 0.08 + Math.random() * 0.12; // much more subtle
      this.yOffset = (Math.random() - 0.5) * H * 0.6;
    }
    
    draw(t){
      const dark = isDark();
      // Animate control points with sine/cosine for flowing motion
      const cp1Y = H/2 + Math.sin(t * this.speed + this.phase) * this.amp + this.yOffset;
      const cp2Y = H/2 + Math.cos(t * this.speed * 1.2 + this.phase) * this.amp * 0.8 - this.yOffset * 0.5;
      const startY = H/2 + Math.sin(t * this.speed * 0.5 + this.phase) * 40 + this.yOffset;
      const endY = H/2 + Math.cos(t * this.speed * 0.7 + this.phase) * 40 - this.yOffset;
      
      ctx.beginPath();
      ctx.moveTo(-30, startY);
      ctx.bezierCurveTo(W * 0.33, cp1Y, W * 0.66, cp2Y, W + 30, endY);
      
      // Grayscale gradient - adapts to dark/light mode
      const grad = ctx.createLinearGradient(0, 0, W, 0);
      const baseColor = dark 
        ? `rgba(255, 255, 255, ` 
        : `rgba(0, 0, 0, `;
      
      grad.addColorStop(0, baseColor + `0)`);
      grad.addColorStop(0.2, baseColor + `${this.alpha})`);
      grad.addColorStop(0.5, baseColor + `${this.alpha * 1.2})`);
      grad.addColorStop(0.8, baseColor + `${this.alpha})`);
      grad.addColorStop(1, baseColor + `0)`);
      
      ctx.strokeStyle = grad;
      ctx.lineWidth = this.thickness;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
  }

  // Subtle particle that travels along bezier paths but reacts to mouse
  class Particle {
    constructor(){
      this.reset();
      this.vx = 0;
      this.vy = 0;
      this.friction = 0.94;
    }
    reset(){
      this.t = 0;
      this.speed = 0.001 + Math.random() * 0.002; // slower
      this.size = 1.5 + Math.random() * 1.5; // smaller
      // Random bezier path points
      this.y0 = Math.random() * H;
      this.y1 = Math.random() * H;
      this.y2 = Math.random() * H;
      this.y3 = Math.random() * H;
      this.vx = 0;
      this.vy = 0;
    }
    // Cubic bezier interpolation
    bezier(t, p0, p1, p2, p3){
      const mt = 1 - t;
      return mt*mt*mt*p0 + 3*mt*mt*t*p1 + 3*mt*t*t*p2 + t*t*t*p3;
    }
    update(){
      // Normal path movement
      this.t += this.speed;
      if(this.t > 1) this.reset();
      
      let targetX = this.bezier(this.t, -20, W*0.33, W*0.66, W+20);
      let targetY = this.bezier(this.t, this.y0, this.y1, this.y2, this.y3);
      
      // Mouse interaction (repel)
      let dx = targetX - mouse.x;
      let dy = targetY - mouse.y;
      let dist = Math.sqrt(dx*dx + dy*dy);
      let force = 0;
      
      if(dist < 150) {
        force = (150 - dist) / 150;
        this.vx += (dx / dist) * force * 2;
        this.vy += (dy / dist) * force * 2;
      }
      
      this.vx *= this.friction;
      this.vy *= this.friction;
      
      this.x = targetX + this.vx * 20;
      this.y = targetY + this.vy * 20;
    }
    draw(){
      const dark = isDark();
      
      // Subtle grayscale particle
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2.5);
      
      if (dark) {
        grad.addColorStop(0, `rgba(255, 255, 255, 0.5)`);
        grad.addColorStop(0.5, `rgba(200, 200, 200, 0.2)`);
        grad.addColorStop(1, `rgba(150, 150, 150, 0)`);
      } else {
        grad.addColorStop(0, `rgba(80, 80, 80, 0.4)`);
        grad.addColorStop(0.5, `rgba(100, 100, 100, 0.15)`);
        grad.addColorStop(1, `rgba(120, 120, 120, 0)`);
      }
      ctx.fillStyle = grad;
      ctx.fill();
    }
  }

  // Fewer curves and particles for subtlety
  const curves = Array.from({length: 8}, () => new BezierCurve());
  const particles = Array.from({length: 12}, () => new Particle());
  
  let startTime = performance.now();
  
  function anim(){
    const t = performance.now() - startTime;
    ctx.clearRect(0, 0, W, H);
    
    // Draw curves
    curves.forEach(curve => curve.draw(t));
    
    // Update and draw particles
    particles.forEach(p => { p.update(); p.draw(); });
    
    requestAnimationFrame(anim);
  }
  anim();
</script>
{{< /rawhtml >}}
