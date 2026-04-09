---
title: "Contact Me"
layout: "contact"
url: "/contact/"
summary: "Get in touch with me"
ShowToc: false
ShowBreadCrumbs: false
---

{{< rawhtml >}}

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

{{< /rawhtml >}}
