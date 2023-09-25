---
title: Cool writing exmple
date: 2023-09-25
---

{{< rawhtml >}}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Handwriting Animation</title>
    
</head>
<body>
    <div class="handwriting-container">
        <div class="handwriting-text"></div>
    </div>
    <script>
        const sentences = [
    "Hello (English)",
    "Bonjour (French)",
    "Hola (Spanish)",
    "Ciao (Italian)",
    "Guten Tag (German)",
    "Olá (Portuguese)",
    "Konnichiwa (Japanese)",
    "Namaste (Hindi)",
    "Salam (Arabic)",
    "Zdravo (Serbian)",
    "Aloha (Hawaiian)",
    "Hej (Swedish)",
    "Merhaba (Turkish)",
    "Saluton (Esperanto)",
    "Kamusta (Filipino)",
    "Nǐ hǎo (Chinese)",
    "你好 (Chinese Simplified)",
    "Annyeonghaseyo (Korean)",
    "Ahoj (Czech)",
    "Halo (Indonesian)",
    "Sawubona (Zulu)",
    "Բարև (Armenian)",
    "გამარჯობა (Georgian)",
    "Γειά σας (Greek)",
    "שלום (Hebrew)",
    "नमस्ते (Nepali)",
    "Привет (Russian)",
    "مرحبا (Urdu)",
    "வணக்கம் (Tamil)",
    "ಹಲೋ (Kannada)",
    "สวัสดี (Thai)",
    "ਹੈਲੋ (Punjabi)",
    "ជំរាបសួរ (Khmer)"
];

        const textElement = document.querySelector(".handwriting-text");

        let currentSentenceIndex = 0;

        function writeSentence() {
            const currentSentence = sentences[currentSentenceIndex];
            let characterIndex = 0;

            function typeCharacter() {
                textElement.textContent += currentSentence[characterIndex];
                characterIndex++;

                if (characterIndex < currentSentence.length) {
                    setTimeout(typeCharacter, 50);
                } else {
                    setTimeout(deleteSentence, 2000);
                }
            }

            typeCharacter();
        }

        function deleteSentence() {
            let text = textElement.textContent;
            textElement.textContent = text.slice(0, -1);

            if (text.length > 0) {
                setTimeout(deleteSentence, 30);
            } else {
                currentSentenceIndex = (currentSentenceIndex + 1) % sentences.length;
                setTimeout(writeSentence, 500);
            }
        }

        writeSentence();
    </script>

</form>
</body>



</html>

{{< /rawhtml >}}
