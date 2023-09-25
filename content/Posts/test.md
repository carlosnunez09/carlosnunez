---
title: Cool Button Example
date: 2023-09-25
---

{{< rawhtml >}}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cool Button</title>
    <style>
        .cool-button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #3498db;
            color: #fff;
            border: none;
            border-radius: 5px;
            font-size: 18px;
            cursor: pointer;
            transition: background-color 0.3s, transform 0.2s;
        }

        .cool-button:hover {
            background-color: #e74c3c;
            transform: scale(1.1);
        }
    </style>
</head>
<body>
    <button class="cool-button">Hover Me</button>
</body>
</html>
{{< /rawhtml >}}
