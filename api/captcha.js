// Rastgele harf üretme
function randomWord(length = 5) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let word = "";
  for (let i = 0; i < length; i++) {
    word += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return word;
}

// Rastgele renk üret
function randomColor(min = 0, max = 255) {
  const r = Math.floor(Math.random() * (max - min) + min);
  const g = Math.floor(Math.random() * (max - min) + min);
  const b = Math.floor(Math.random() * (max - min) + min);
  return `rgb(${r},${g},${b})`;
}

// SVG tabanlı Captcha üret
function generateSVG(word) {
  const width = 200;
  const height = 70;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`;

  // Arka plan
  svg += `<rect width="100%" height="100%" fill="#f0f0f0"/>`;

  // Karışık çizgiler
  for (let i = 0; i < 5; i++) {
    const x1 = Math.random() * width;
    const y1 = Math.random() * height;
    const x2 = Math.random() * width;
    const y2 = Math.random() * height;
    svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${randomColor()}" stroke-width="2"/>`;
  }

  // Harfleri rastgele çiz
  for (let i = 0; i < word.length; i++) {
    const x = 20 + i * 30;
    const y = 35 + Math.random() * 20;
    const rotate = (Math.random() - 0.5) * 30;
    const color = randomColor(50, 160);
    svg += `<text x="${x}" y="${y}" font-size="30" fill="${color}" transform="rotate(${rotate} ${x} ${y})">${word[i]}</text>`;
  }

  svg += `</svg>`;
  return svg;
}

// Base64 encode
function svgToBase64(svg) {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

// CommonJS handler
module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const captchaText = randomWord(5);
  const svg = generateSVG(captchaText);
  const captchaImage = svgToBase64(svg);

  res.status(200).json({
    gorsel_url: captchaImage,
    captcha_word: captchaText
  });
};
