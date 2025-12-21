---
title: "SorbetBroker"
date: 2025-12-20
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
<style>
  /* Solid sorbet background for the entire page */
  body {
    background-color: #f5429e !important;
    margin: 0;
    padding: 0;
  }
  
  /* Main container styling with solid sorbet */
  .post-sorbetbroker-project {
    --sorbet-main: #f5429e;
    --sorbet-light: #ff6bb5;
    --sorbet-dark: #d12d86;
    --sorbet-soft: #ff8ec9;
    
    background-color: #f5429e;
    color: white;
    min-height: 100vh;
    padding: 0;
    margin: 0;
  }
  
  /* Override any other backgrounds */
  .post-sorbetbroker-project * {
    background-color: transparent !important;
  }
  
  /* Content container with contrast */
  .post-sorbetbroker-project .post-content,
  .post-sorbetbroker-project article,
  .post-sorbetbroker-project .entry-content {
    background-color: rgba(255, 255, 255, 0.95) !important;
    color: #333;
    border-radius: 20px;
    padding: 2.5rem;
    margin: 2rem auto;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
    max-width: 1200px;
    border: 3px solid white;
    position: relative;
    overflow: hidden;
  }
  
  /* Add decorative corner accents */
  .post-sorbetbroker-project .post-content::before,
  .post-sorbetbroker-project .post-content::after {
    content: '🍧';
    position: absolute;
    font-size: 2.5rem;
    opacity: 0.3;
  }
  
  .post-sorbetbroker-project .post-content::before {
    top: 20px;
    left: 20px;
  }
  
  .post-sorbetbroker-project .post-content::after {
    bottom: 20px;
    right: 20px;
    transform: rotate(180deg);
  }
  
  /* Page title with solid sorbet background */
  .post-sorbetbroker-project h1.post-title {
    background-color: #f5429e !important;
    color: white;
    text-align: center;
    padding: 2rem;
    margin: -2.5rem -2.5rem 2rem -2.5rem;
    border-radius: 16px 16px 0 0;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
    font-size: 3rem;
    position: relative;
  }
  
  /* Add pattern overlay to title */
  .post-sorbetbroker-project h1.post-title::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%),
      radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 2px, transparent 3px),
      radial-gradient(circle at 70% 50%, rgba(255,255,255,0.1) 2px, transparent 3px);
    background-size: 200% 200%, 20px 20px, 20px 20px;
    border-radius: inherit;
  }
  
  /* Headers */
  .post-sorbetbroker-project h2,
  .post-sorbetbroker-project h3,
  .post-sorbetbroker-project h4 {
    color: #f5429e;
    padding: 1rem;
    margin: 2rem -1rem 1rem -1rem;
    background-color: rgba(245, 66, 158, 0.1) !important;
    border-left: 5px solid #f5429e;
    border-radius: 0 10px 10px 0;
  }
  
  /* Text and links */
  .post-sorbetbroker-project p {
    line-height: 1.8;
    margin-bottom: 1.5rem;
  }
  
  .post-sorbetbroker-project a {
    color: #f5429e;
    background: linear-gradient(120deg, rgba(245, 66, 158, 0.1) 0%, rgba(245, 66, 158, 0.1) 100%);
    background-repeat: no-repeat;
    background-size: 100% 0;
    background-position: 0 100%;
    text-decoration: none;
    padding: 2px 4px;
    border-radius: 4px;
    font-weight: bold;
    transition: all 0.3s ease;
  }
  
  .post-sorbetbroker-project a:hover {
    background-size: 100% 100%;
    color: #fff;
    background-color: #f5429e !important;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(245, 66, 158, 0.4);
  }
  
  /* Code blocks */
  .post-sorbetbroker-project pre {
    background-color: #2d2d2d !important;
    border-left: 5px solid #f5429e;
    border-radius: 10px;
    padding: 1.5rem;
    color: #f8f8f2;
    overflow-x: auto;
  }
  
  .post-sorbetbroker-project code {
    background-color: rgba(245, 66, 158, 0.15) !important;
    color: #f5429e;
    padding: 2px 8px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
  }
  
  /* Blockquotes */
  .post-sorbetbroker-project blockquote {
    background-color: rgba(245, 66, 158, 0.1) !important;
    border-left: 5px solid #f5429e;
    border-radius: 0 15px 15px 0;
    padding: 1.5rem 2rem;
    margin: 2rem 0;
    font-style: italic;
    position: relative;
  }
  
  .post-sorbetbroker-project blockquote::before {
    content: '❝';
    position: absolute;
    top: -20px;
    left: 10px;
    font-size: 3rem;
    color: rgba(245, 66, 158, 0.3);
  }
  
  /* Lists */
  .post-sorbetbroker-project ul,
  .post-sorbetbroker-project ol {
    padding-left: 2rem;
  }
  
  .post-sorbetbroker-project ul li {
    position: relative;
    padding-left: 2rem;
    margin: 0.75rem 0;
  }
  
  .post-sorbetbroker-project ul li::before {
    content: '●';
    position: absolute;
    left: 0;
    color: #f5429e;
    font-size: 1.2em;
  }
  
  .post-sorbetbroker-project ol {
    counter-reset: sorbet-counter;
  }
  
  .post-sorbetbroker-project ol li {
    counter-increment: sorbet-counter;
    padding-left: 2.5rem;
    position: relative;
    margin: 0.75rem 0;
  }
  
  .post-sorbetbroker-project ol li::before {
    content: counter(sorbet-counter);
    position: absolute;
    left: 0;
    background-color: #f5429e !important;
    color: white;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    text-align: center;
    line-height: 26px;
    font-size: 0.9em;
    font-weight: bold;
  }
  
  /* Tables */
  .post-sorbetbroker-project table {
    width: 100%;
    border-collapse: collapse;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
  
  .post-sorbetbroker-project table thead {
    background-color: #f5429e !important;
    color: white;
  }
  
  .post-sorbetbroker-project table th {
    padding: 1rem;
    text-align: left;
    font-weight: bold;
  }
  
  .post-sorbetbroker-project table td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }
  
  .post-sorbetbroker-project table tbody tr:hover {
    background-color: rgba(245, 66, 158, 0.05) !important;
  }
  
  /* Images */
  .post-sorbetbroker-project img {
    border: 5px solid white;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    max-width: 100%;
    height: auto;
    display: block;
    margin: 2rem auto;
  }
  
  /* Horizontal rule */
  .post-sorbetbroker-project hr {
    height: 3px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      #f5429e 20%, 
      #ff8ec9 50%, 
      #f5429e 80%, 
      transparent 100%);
    border: none;
    margin: 3rem 0;
  }
  
  /* Buttons */
  .post-sorbetbroker-project .btn,
  .post-sorbetbroker-project button {
    background-color: #f5429e !important;
    color: white;
    padding: 12px 28px;
    border: 2px solid white;
    border-radius: 30px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }
  
  .post-sorbetbroker-project .btn:hover,
  .post-sorbetbroker-project button:hover {
    background-color: white !important;
    color: #f5429e;
    border-color: #f5429e;
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  }
  
  /* Callout boxes */
  .sorbet-callout {
    background-color: rgba(245, 66, 158, 0.15) !important;
    border: 2px solid rgba(245, 66, 158, 0.4);
    border-radius: 15px;
    padding: 1.5rem;
    margin: 2rem 0;
    position: relative;
  }
  
  .sorbet-callout::before {
    content: '💡';
    position: absolute;
    top: -15px;
    left: 20px;
    background-color: white !important;
    padding: 0 10px;
    font-size: 1.5rem;
    color: #f5429e;
  }
  
  /* Footer or metadata */
  .post-sorbetbroker-project .post-meta {
    background-color: rgba(245, 66, 158, 0.1) !important;
    padding: 1rem;
    border-radius: 10px;
    border-left: 4px solid #f5429e;
    margin-top: 2rem;
  }
  
  /* Responsive design */
  @media (max-width: 768px) {
    .post-sorbetbroker-project .post-content {
      padding: 1.5rem;
      margin: 1rem;
      border-radius: 15px;
    }
    
    .post-sorbetbroker-project h1.post-title {
      padding: 1.5rem;
      margin: -1.5rem -1.5rem 1.5rem -1.5rem;
      font-size: 2rem;
    }
    
    body {
      padding: 0;
    }
  }
  
  /* Smooth transitions */
  .post-sorbetbroker-project * {
    transition: background-color 0.3s ease, color 0.3s ease;
  }
  
  /* Selection color */
  .post-sorbetbroker-project ::selection {
    background-color: rgba(245, 66, 158, 0.5);
    color: white;
  }
</style>

<!-- Solid sorbet background with no additional elements -->
<div style="
  background-color: #f5429e;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -2;
"></div>

<!-- Optional: Add subtle pattern overlay to background -->
<div style="
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(circle at 20% 80%, rgba(255,255,255,0.05) 2px, transparent 3px),
    radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 2px, transparent 3px);
  background-size: 60px 60px;
  z-index: -1;
  pointer-events: none;
"></div>

<!-- Main content container -->
<div style="
  background-color: white;
  border-radius: 20px;
  padding: 2.5rem;
  margin: 2rem auto;
  max-width: 1200px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  border: 3px solid white;
  position: relative;
">

<!-- Title banner with solid sorbet color -->
<div style="
  background-color: #f5429e;
  color: white;
  text-align: center;
  padding: 2.5rem;
  margin: -2.5rem -2.5rem 2.5rem -2.5rem;
  border-radius: 16px 16px 0 0;
  position: relative;
  overflow: hidden;
">
  <div style="
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%),
      repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px);
  "></div>
  
  <h1 style="
    margin: 0;
    font-size: 3.5rem;
    text-shadow: 3px 3px 6px rgba(0,0,0,0.2);
    position: relative;
    z-index: 1;
  ">
    🍧 SorbetBroker Project
  </h1>
  
  <p style="
    margin: 1rem 0 0 0;
    font-size: 1.3rem;
    opacity: 0.9;
    position: relative;
    z-index: 1;
    max-width: 600px;
    margin: 1rem auto 0 auto;
    background-color: rgba(255,255,255,0.15);
    padding: 0.75rem 1.5rem;
    border-radius: 50px;
    backdrop-filter: blur(5px);
  ">
    Your content will appear here with beautiful sorbet styling
  </p>
</div>

<!-- Your markdown content will render here -->
{{< /rawhtml >}}
