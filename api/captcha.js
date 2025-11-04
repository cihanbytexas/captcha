// api/captcha.js

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
  const width = 400; // biraz geniş tutuyorum, netlik için
  const height = 120;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`;

  // Arka plan
  svg += `<rect width="100%" height="100%" fill="#f6f6f6"/>`;

  // Karışık çizgiler
  for (let i = 0; i < 7; i++) {
    const x1 = Math.random() * width;
    const y1 = Math.random() * height;
    const x2 = Math.random() * width;
    const y2 = Math.random() * height;
    svg += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${randomColor()}" stroke-width="${(1 + Math.random()*2).toFixed(1)}" stroke-opacity="0.7"/>`;
  }

  // Noktalar (noise)
  for (let i = 0; i < 200; i++) {
    const cx = Math.random() * width;
    const cy = Math.random() * height;
    svg += `<rect x="${cx.toFixed(1)}" y="${cy.toFixed(1)}" width="1" height="1" fill="${randomColor(100,230)}" />`;
  }

  // Harfleri rastgele büyük ölçüde çiz (daha okunaksız ama doğrulanabilir)
  for (let i = 0; i < word.length; i++) {
    const x = 40 + i * ( (width - 80) / word.length );
    const baselineJitter = (Math.random() - 0.5) * 30; // vertical jitter
    const y = 70 + baselineJitter;
    const rotate = (Math.random() - 0.5) * 30; // -15 .. 15 derece
    const fontSize = 40 + Math.round(Math.random() * 20);
    const color = randomColor(20, 160);
    // Slight letter-spacing transform to vary positions:
    svg += `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-family="Verdana,Arial,sans-serif" font-size="${fontSize}" fill="${color}" transform="rotate(${rotate.toFixed(2)} ${x.toFixed(1)} ${y.toFixed(1)})" style="letter-spacing:3px">${word[i]}</text>`;
  }

  svg += `</svg>`;
  return svg;
}

// SVG -> base64 (raw svg content)
function svgToBase64Raw(svg) {
  return Buffer.from(svg).toString("base64"); // return raw base64 (no data: prefix)
}

// CommonJS handler
module.exports = async function handler(req, res) {
  // only POST
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const IMGBB_KEY = process.env.IMGBB_KEY;
    if (!IMGBB_KEY) {
      return res.status(500).json({ error: "Server misconfigured: IMGBB_KEY not set in env." });
    }

    // Üret
    const captchaText = randomWord(6); // istersen 5 yap
    const svg = generateSVG(captchaText);
    const svgBase64 = svgToBase64Raw(svg);

    // imgBB'ye yükle
    // imgBB expects form data: key + image (base64)
    const params = new URLSearchParams();
    params.append("key", IMGBB_KEY);
    params.append("image", svgBase64);
    // optional: name, expiration etc
    // params.append("name", "captcha-" + Date.now());

    // global fetch kullanıyoruz (Node 18+ / Vercel supports it)
    const uploadRes = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params.toString()
    });

    if (!uploadRes.ok) {
      const txt = await uploadRes.text();
      return res.status(502).json({ error: "Failed to upload to imgBB", status: uploadRes.status, body: txt });
    }

    const uploadJson = await uploadRes.json();
    // imgBB response shape may be: { data: { display_url, url, ... }, success: true, status: 200 }
    const imageUrl = (uploadJson && uploadJson.data && (uploadJson.data.display_url || uploadJson.data.url || uploadJson.data.image?.url)) || null;

    if (!imageUrl) {
      return res.status(502).json({ error: "imgBB did not return an image URL", raw: uploadJson });
    }

    // Return JSON without exposing the API key
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json({
      gorsel_url: imageUrl,
      captcha_word: captchaText
    });
  } catch (err) {
    console.error("captcha error:", err);
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({ error: "Internal server error", details: String(err) });
  }
};  const captchaImage = svgToBase64(svg);

  res.status(200).json({
    gorsel_url: captchaImage,
    captcha_word: captchaText
  });
};
