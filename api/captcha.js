import { createCanvas } from "canvas";

// Rastgele harf üretme
function randomWord(length = 5) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let word = "";
  for (let i = 0; i < length; i++) {
    word += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return word;
}

// Rastgele renk
function randomColor(min = 0, max = 255) {
  const r = Math.floor(Math.random() * (max - min) + min);
  const g = Math.floor(Math.random() * (max - min) + min);
  const b = Math.floor(Math.random() * (max - min) + min);
  return `rgb(${r},${g},${b})`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const captchaText = randomWord(5); // 5 karakterli captcha

  const width = 200;
  const height = 70;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Arka plan
  ctx.fillStyle = "#f0f0f0";
  ctx.fillRect(0, 0, width, height);

  // Karışık çizgiler
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = randomColor();
    ctx.beginPath();
    ctx.moveTo(Math.random() * width, Math.random() * height);
    ctx.lineTo(Math.random() * width, Math.random() * height);
    ctx.stroke();
  }

  // Noktalar
  for (let i = 0; i < 100; i++) {
    ctx.fillStyle = randomColor();
    ctx.fillRect(Math.random() * width, Math.random() * height, 1, 1);
  }

  // Harfleri karışık çiz
  for (let i = 0; i < captchaText.length; i++) {
    const x = 20 + i * 30;
    const y = 35 + Math.random() * 20;
    const angle = (Math.random() - 0.5) * 0.7;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.font = "30px Arial";
    ctx.fillStyle = randomColor(50, 160);
    ctx.fillText(captchaText[i], 0, 0);
    ctx.restore();
  }

  const captchaImage = canvas.toDataURL(); // Base64 format

  res.status(200).json({
    gorsel_url: captchaImage,
    captcha_word: captchaText
  });
}
