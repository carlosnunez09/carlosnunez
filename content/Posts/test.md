---
title: "test"
date: 2025-01-21

author: "me"
tag: "hacking"
draft: false
---

{{<rawhtml >}} 





<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bubble Pop Fun</title>
    <style>
        canvas {
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: transparent;
            pointer-events: none;
        }
    </style>
</head>
<body>
    <canvas id="bubbleCanvas"></canvas>

    <script>
        const canvas = document.getElementById('bubbleCanvas');
        const ctx = canvas.getContext('2d');

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const mouse = {
            x: null,
            y: null
        };

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        window.addEventListener('click', (e) => {
            for (let i = 0; i < 5; i++) {
                bubbles.push(new Bubble(e.clientX, e.clientY));
            }
        });

        class Bubble {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 20 + 10;
                this.speedX = Math.random() * 2 - 1;
                this.speedY = Math.random() * -2 - 1;
                this.opacity = 1;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.opacity -= 0.01;
                if (this.opacity <= 0) {
                    this.opacity = 0;
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 150, 255, ${this.opacity})`;
                ctx.fill();
                ctx.closePath();
            }
        }

        const bubbles = [];

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < bubbles.length; i++) {
                bubbles[i].update();
                bubbles[i].draw();

                if (bubbles[i].opacity <= 0) {
                    bubbles.splice(i, 1);
                    i--;
                }
            }
            requestAnimationFrame(animate);
        }

        animate();

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    </script>
</body>
</html>





{{< /rawhtml >}}
