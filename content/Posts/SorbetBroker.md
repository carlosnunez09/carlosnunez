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
  /* Remove all previous decorative styles */
  .post-sorbetbroker-project::before,
  .post-sorbetbroker-project::after,
  .sorbet-callout::before,
  .post-sorbetbroker-project blockquote::before,
  .post-sorbetbroker-project .post-content::before,
  .post-sorbetbroker-project .post-content::after,
  .post-sorbetbroker-project h1.post-title::after {
    display: none !important;
    content: none !important;
  }
  
  /* Clean minimal split background */
  body {
    margin: 0;
    padding: 0;
    min-height: 100vh;
    background: linear-gradient(to bottom, #f5429e 50%, #000000 50%);
    background-attachment: fixed;
  }
  
  /* Optional: Smooth gradient transition */
  body {
    background: linear-gradient(to bottom, #f5429e 0%, #f5429e 50%, #000000 50%, #000000 100%);
  }
  
  /* Remove all decorative emojis and icons */
  .post-sorbetbroker-project ul li::before {
    content: "•" !important;
  }
  
  .post-sorbetbroker-project ul li::before,
  .post-sorbetbroker-project ol li::before,
  .post-sorbetbroker-project pre::before,
  .post-sorbetbroker-project .btn::before {
    content: "" !important;
  }
  
  /* Clean content container */
  .post-sorbetbroker-project .post-content,
  .post-sorbetbroker-project article,
  .post-sorbetbroker-project .entry-content {
    background-color: rgba(255, 255, 255, 0.95) !important;
    color: #333;
    border-radius: 12px;
    padding: 2rem;
    margin: 2rem auto;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    max-width: 1000px;
    border: 1px solid rgba(0, 0, 0, 0.1);
  }
  
  /* Minimal headers */
  .post-sorbetbroker-project h1.post-title {
    background: transparent !important;
    color: #333;
    text-align: left;
    padding: 0;
    margin: 0 0 1.5rem 0;
    font-size: 2.5rem;
    font-weight: 600;
    border: none;
  }
  
  .post-sorbetbroker-project h2,
  .post-sorbetbroker-project h3,
  .post-sorbetbroker-project h4 {
    color: #333;
    padding: 0;
    margin: 1.5rem 0 1rem 0;
    background: transparent !important;
    border: none;
    border-left: none;
    font-weight: 600;
  }
  
  /* Clean links */
  .post-sorbetbroker-project a {
    color: #f5429e;
    background: transparent !important;
    text-decoration: underline;
    text-decoration-color: rgba(245, 66, 158, 0.3);
    text-underline-offset: 3px;
    padding: 0;
    border-radius: 0;
  }
  
  .post-sorbetbroker-project a:hover {
    color: #d12d86;
    text-decoration-color: #f5429e;
    background: transparent !important;
    transform: none;
    box-shadow: none;
  }
  
  /* Clean code blocks */
  .post-sorbetbroker-project pre {
    background-color: #f5f5f5 !important;
    border: 1px solid #e0e0e0;
    border-left: 3px solid #f5429e;
    border-radius: 6px;
    padding: 1rem;
    color: #333;
  }
  
  .post-sorbetbroker-project code {
    background-color: #f5f5f5 !important;
    color: #d12d86;
    padding: 2px 6px;
    border-radius: 3px;
    border: 1px solid #e8e8e8;
  }
  
  /* Clean blockquotes */
  .post-sorbetbroker-project blockquote {
    background-color: #f9f9f9 !important;
    border-left: 4px solid #f5429e;
    border-radius: 0;
    padding: 1rem 1.5rem;
    margin: 1.5rem 0;
    font-style: normal;
  }
  
  /* Clean lists */
  .post-sorbetbroker-project ul,
  .post-sorbetbroker-project ol {
    padding-left: 1.5rem;
  }
  
  .post-sorbetbroker-project ul li {
    padding-left: 0.5rem;
    margin: 0.5rem 0;
  }
  
  .post-sorbetbroker-project ul li::before {
    content: "•" !important;
    color: #f5429e;
    margin-right: 8px;
  }
  
  .post-sorbetbroker-project ol li {
    padding-left: 0;
    margin: 0.5rem 0;
  }
  
  .post-sorbetbroker-project ol li::before {
    display: none;
  }
  
  /* Clean tables */
  .post-sorbetbroker-project table {
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    box-shadow: none;
  }
  
  .post-sorbetbroker-project table thead {
    background-color: #f9f9f9 !important;
    color: #333;
  }
  
  .post-sorbetbroker-project table th {
    border-bottom: 2px solid #e0e0e0;
  }
  
  .post-sorbetbroker-project table td {
    border-bottom: 1px solid #f0f0f0;
  }
  
  /* Clean images */
  .post-sorbetbroker-project img {
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    box-shadow: none;
  }
  
  .post-sorbetbroker-project img:hover {
    transform: none;
    box-shadow: none;
  }
  
  /* Clean buttons */
  .post-sorbetbroker-project .btn,
  .post-sorbetbroker-project button {
    background-color: #f5429e !important;
    color: white;
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    font-weight: normal;
    text-transform: none;
    letter-spacing: normal;
    box-shadow: none;
  }
  
  .post-sorbetbroker-project .btn:hover,
  .post-sorbetbroker-project button:hover {
    background-color: #d12d86 !important;
    color: white;
    transform: none;
    box-shadow: none;
  }
  
  /* Clean horizontal rule */
  .post-sorbetbroker-project hr {
    height: 1px;
    background: #e0e0e0;
    margin: 2rem 0;
  }
  
  /* Clean callout boxes */
  .sorbet-callout {
    background-color: #f9f9f9 !important;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    padding: 1rem;
    margin: 1.5rem 0;
  }
  
  /* Responsive design */
  @media (max-width: 768px) {
    .post-sorbetbroker-project .post-content {
      padding: 1.5rem;
      margin: 1rem;
    }
  }
  
  /* Selection color */
  ::selection {
    background-color: rgba(245, 66, 158, 0.2);
  }
</style>

<!-- Remove all decorative background elements -->
{{< /rawhtml >}}