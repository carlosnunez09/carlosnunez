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
  /* Main page styling */
  .post-sorbetbroker-project {
    --sorbet-pink: #f5429e;
    --sorbet-pink-light: #f9a0cd;
    --sorbet-pink-lighter: #fde1f0;
  }
  
  /* Page header styling */
  .post-sorbetbroker-project h1.post-title {
    color: #f5429e;
    text-shadow: 2px 2px 0 rgba(245, 66, 158, 0.1);
    border-bottom: 3px solid #f5429e;
    padding-bottom: 1rem;
  }
  
  /* Headers with gradient effect */
  .post-sorbetbroker-project h2,
  .post-sorbetbroker-project h3,
  .post-sorbetbroker-project h4 {
    color: #333;
    padding-left: 10px;
    border-left: 4px solid #f5429e;
    margin-top: 2rem;
  }
  
  /* Links */
  .post-sorbetbroker-project a {
    color: #f5429e;
    text-decoration: none;
    border-bottom: 1px dashed #f5429e;
    transition: all 0.2s ease;
  }
  
  .post-sorbetbroker-project a:hover {
    color: #fff;
    background-color: #f5429e;
    border-bottom: 1px solid #f5429e;
    text-decoration: none;
    padding: 2px 4px;
    margin: -2px -4px;
    border-radius: 3px;
  }
  
  /* Code blocks */
  .post-sorbetbroker-project pre,
  .post-sorbetbroker-project code {
    border: 1px solid rgba(245, 66, 158, 0.2);
    background-color: rgba(245, 66, 158, 0.05);
  }
  
  .post-sorbetbroker-project pre {
    border-left: 3px solid #f5429e;
  }
  
  /* Blockquotes */
  .post-sorbetbroker-project blockquote {
    border-left: 4px solid #f5429e;
    background: linear-gradient(to right, rgba(245, 66, 158, 0.05), transparent);
    padding: 1rem 1.5rem;
    font-style: italic;
  }
  
  /* Lists */
  .post-sorbetbroker-project ul li::before {
    color: #f5429e;
    content: "▸";
    font-weight: bold;
    margin-right: 8px;
  }
  
  .post-sorbetbroker-project ol {
    counter-reset: item;
  }
  
  .post-sorbetbroker-project ol li::before {
    color: #f5429e;
    content: counter(item) ".";
    counter-increment: item;
    font-weight: bold;
    margin-right: 8px;
  }
  
  /* Tables */
  .post-sorbetbroker-project table {
    border: 1px solid rgba(245, 66, 158, 0.3);
  }
  
  .post-sorbetbroker-project table th {
    background-color: rgba(245, 66, 158, 0.1);
    border-bottom: 2px solid #f5429e;
  }
  
  .post-sorbetbroker-project table td {
    border-bottom: 1px solid rgba(245, 66, 158, 0.1);
  }
  
  /* Custom accent boxes */
  .sorbet-note {
    background-color: rgba(245, 66, 158, 0.1);
    border-left: 4px solid #f5429e;
    padding: 1rem;
    margin: 1.5rem 0;
    border-radius: 0 4px 4px 0;
  }
  
  .sorbet-note::before {
    content: "💡 ";
    color: #f5429e;
    font-weight: bold;
  }
  
  /* Button-like elements */
  .post-sorbetbroker-project .btn,
  .post-sorbetbroker-project button {
    background-color: #f5429e;
    color: white;
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .post-sorbetbroker-project .btn:hover,
  .post-sorbetbroker-project button:hover {
    background-color: #e0308a;
  }
  
  /* Images with accent border */
  .post-sorbetbroker-project img {
    border: 2px solid rgba(245, 66, 158, 0.2);
    border-radius: 4px;
    transition: border-color 0.3s ease;
  }
  
  .post-sorbetbroker-project img:hover {
    border-color: #f5429e;
  }
  
  /* Horizontal rule */
  .post-sorbetbroker-project hr {
    height: 2px;
    background: linear-gradient(to right, transparent, #f5429e, transparent);
    border: none;
    margin: 3rem 0;
  }
  
  /* Metadata styling */
  .post-sorbetbroker-project .post-meta {
    color: #666;
    border-top: 1px dashed rgba(245, 66, 158, 0.3);
    border-bottom: 1px dashed rgba(245, 66, 158, 0.3);
    padding: 0.5rem 0;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .post-sorbetbroker-project {
      padding: 0 1rem;
    }
    
    .post-sorbetbroker-project h1.post-title {
      font-size: 2rem;
    }
  }
</style>

<!-- Optional: Add a custom banner/header for the project -->
<div class="sorbet-banner" style="
  background: linear-gradient(135deg, rgba(245, 66, 158, 0.1) 0%, rgba(245, 66, 158, 0.05) 100%);
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  border-left: 4px solid #f5429e;
">
  <h2 style="margin-top: 0; color: #f5429e;">✨ SorbetBroker Project</h2>
  <p style="margin-bottom: 0;">A sweet solution for modern web development</p>
</div>
{{< /rawhtml >}}
