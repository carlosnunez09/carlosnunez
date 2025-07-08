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
{{< rawhtml >}}
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Carlos Nunez — Resume</title>
  <style>
    body {
      margin: 0;
      font-family: 'Segoe UI', sans-serif;
      background: #1a1a1a;
      color: #eee;
      line-height: 1.6;
    }
    .resume-container {
      max-width: 900px;
      margin: 2rem auto;
      padding: 0 1rem;
    }
    h1, h2 {
      color: #00ffc8;
      margin-bottom: 0.5rem;
      border-bottom: 2px solid #333;
      padding-bottom: 0.2rem;
    }
    a { color: #00ffd0; text-decoration: none; }
    .section { margin-bottom: 2rem; }
    .skills .bar {
      background: #333;
      border-radius: 4px;
      margin: 0.5rem 0;
      overflow: hidden;
    }
    .skills .bar > div {
      height: 1rem;
      width: 0;
      background: #00ffc8;
      transition: width 1.5s ease;
    }
    .job, .mil {
      margin-top: 1rem;
      padding-left: 1rem;
      border-left: 3px solid #00ffc8;
    }
    #downloadBtn {
      display: inline-block;
      padding: 0.6rem 1.2rem;
      background: #00ffc8;
      color: #000;
      border: none;
      border-radius: 4px;
      font-weight: bold;
      cursor: pointer;
    }
    #downloadBtn:hover { background: #00d4aa; }
  </style>
</head>
<body>
  <div class="resume-container">
    <header class="section">
      <h1>Carlos L. Nunez</h1>
      <p>Hanover, PA | <a href="mailto:Carlosnunez01010@gmail.com">Carlosnunez01010@gmail.com</a> | (717) 479‑6887 | <a href="https://andmecarlos.com">andmecarlos.com</a></p>
    </header>

    <section id="summary" class="section">
      <h2>Summary</h2>
      <p>Dedicated Computer Science &amp; Engineering student with hands‑on experience in logistics operations, electrical systems, and software development. Adept at problem‑solving, teamwork, and lifelong learning.</p>
    </section>

    <section id="education" class="section">
      <h2>Education</h2>
      <p><strong>Shippensburg University of Pennsylvania</strong><br>
      B.S. in Computer Science/Computer Engineering<br>
      Expected Graduation: May 2027 (ABET‑accredited)</p>
    </section>

    <section id="skills" class="section skills">
      <h2>Skills</h2>
      <ul>
        <li>Languages: Java, JavaScript, Python, C#, HTML, CSS</li>
        <li>OS: Kali Linux, Ubuntu, Windows</li>
        <li>Tools: Unity3D, Blender, Microsoft 365</li>
        <li>Networking: Pen‑testing & vulnerability assessment</li>
        <li>Hardware: Spec & compatibility analysis</li>
        <li>Languages: Spanish (Native)</li>
      </ul>
      <div class="bar"><div data-pct="90%"></div></div>
      <div class="bar"><div data-pct="80%"></div></div>
      <div class="bar"><div data-pct="70%"></div></div>
    </section>

    <section id="certs" class="section">
      <h2>Certifications</h2>
      <p>Electrical Engineer, Electronics</p>
    </section>

    <section id="experience" class="section">
      <h2>Relevant Experience</h2>
      <div class="job">
        <h3>Material Handler — Utz Quality Foods (Summer 2023)</h3>
        <ul>
          <li>Managed cart movement to ensure uninterrupted production flow.</li>
          <li>Handled labor‑intensive tasks while maintaining precision.</li>
          <li>Optimized material logistics for peak efficiency.</li>
        </ul>
      </div>
      <div class="job">
        <h3>Storage Manager — Winter Gardens (Summer 2022)</h3>
        <ul>
          <li>Orchestrated supply chain logistics and inventory turnover.</li>
          <li>Coordinated with major clients (Newford, Winter Gardens, Quality Foods).</li>
          <li>Implemented strategic storage practices for security and space optimization.</li>
        </ul>
      </div>
    </section>

    <section id="military" class="section">
      <h2>Military Experience</h2>
      <div class="mil">
        <h3>Basic Combat & Electrician Training — Fort Leonard Wood, MO (Winter/Spring 2024)</h3>
        <ul>
          <li>10 weeks Basic Combat Training</li>
          <li>6 weeks + 4 days Advanced Interior Electrician training</li>
          <li>Classroom &amp; on‑the‑job electrical wiring and safety procedures</li>
        </ul>
      </div>
    </section>

    <footer class="section">
      <button id="downloadBtn">📄 Download PDF Resume</button>
    </footer>
  </div>

  <script>
    // Animate skill bars on load
    window.addEventListener('load', () => {
      document.querySelectorAll('.skills .bar > div').forEach(el => {
        el.style.width = el.getAttribute('data-pct');
      });
    });
    // Download handler
    document.getElementById('downloadBtn').addEventListener('click', () => {
      window.open('/resume/Carlos_Nunez_Resume.pdf', '_blank');
    });
  </script>
</body>
</html>
{{< /rawhtml >}}
