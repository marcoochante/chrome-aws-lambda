const express = require('express');
const puppeteer = require('puppeteer-core');
const chromium = require('chrome-aws-lambda');
const app = express();
app.use(express.json());

app.post('/', async (req, res) => {
  const { url, comment } = req.body;

  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    await page.goto('https://www.linkedin.com/login');
    await page.type('#username', 'TU_CORREO');
    await page.type('#password', 'TU_CONTRASEÑA');
    await page.click('[type="submit"]');
    await page.waitForNavigation();

    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.waitForSelector('button[aria-label="Comentar"]');
    await page.click('button[aria-label="Comentar"]');
    await page.waitForSelector('div[role="textbox"]');
    await page.type('div[role="textbox"]', comment);
    await page.keyboard.press('Enter');

    await browser.close();

    res.status(200).json({ success: true, message: 'Comentario publicado' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bot corriendo en el puerto ${PORT}`);
});
