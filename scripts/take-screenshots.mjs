import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');
const screenshotsDir = path.resolve(__dirname, '../screenshots');

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Simple static file server
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  let filePath = path.join(distDir, reqPath);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(distDir, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Error loading file');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

const PORT = 4175;
server.listen(PORT, async () => {
  console.log(`Static preview server listening on port ${PORT}...`);

  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    console.log(`Navigating to http://localhost:${PORT}...`);
    await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);

    // 1. Desktop Command View (Dark Mode)
    await page.screenshot({ path: path.join(screenshotsDir, '01-command-dark-1440.png'), fullPage: false });
    console.log('Captured: 01-command-dark-1440.png');

    // 2. High-res 1920x1080
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(screenshotsDir, '02-command-dark-1920.png'), fullPage: false });
    console.log('Captured: 02-command-dark-1920.png');

    // Reset to 1440
    await page.setViewportSize({ width: 1440, height: 900 });

    // 3. Marathi language toggle on Command tab
    // Specifically target the language button in header
    const langBtn = await page.$('header button:has-text("मराठी")');
    if (langBtn) {
      await langBtn.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(screenshotsDir, '03-marathi-command.png') });
      console.log('Captured: 03-marathi-command.png');
      // toggle back to English
      const enBtn = await page.$('header button:has-text("English")');
      if (enBtn) await enBtn.click();
      await page.waitForTimeout(500);
    }

    // 4. Light theme toggle
    const themeBtn = await page.$('header button[title*="theme"], header button:has(svg.lucide-sun), header button:has(svg.lucide-moon)');
    if (themeBtn) {
      await themeBtn.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(screenshotsDir, '04-command-light.png') });
      console.log('Captured: 04-command-light.png');
      // toggle back to dark
      await themeBtn.click();
      await page.waitForTimeout(500);
    }

    // 5. Expand Ward Details (e.g. Kasba Peth)
    const kasbaCard = await page.$('text=Kasba Peth');
    if (kasbaCard) {
      await kasbaCard.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(screenshotsDir, '05-ward-expanded-checklist.png') });
      console.log('Captured: 05-ward-expanded-checklist.png');
    }

    // 6. Incidents tab
    const incidentsTab = await page.$('nav button:has-text("Incidents")');
    if (incidentsTab) {
      await incidentsTab.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(screenshotsDir, '06-incidents-view.png') });
      console.log('Captured: 06-incidents-view.png');
    }

    // 7. Units tab
    const unitsTab = await page.$('nav button:has-text("Units")');
    if (unitsTab) {
      await unitsTab.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(screenshotsDir, '07-units-view.png') });
      console.log('Captured: 07-units-view.png');
    }

    // 8. NuGen Tactical Advisor Modal
    const nugenBtn = await page.$('header button:has-text("NuGen")');
    if (nugenBtn) {
      await nugenBtn.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(screenshotsDir, '08-nugen-advisor-modal.png') });
      console.log('Captured: 08-nugen-advisor-modal.png');
      // close modal with Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
    }

    // 9. Shortcuts modal
    const shortcutsBtn = await page.$('header button[title*="shortcuts"]');
    if (shortcutsBtn) {
      await shortcutsBtn.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(screenshotsDir, '09-shortcuts-modal.png') });
      console.log('Captured: 09-shortcuts-modal.png');
    }

    console.log('All screenshots captured successfully!');
  } catch (err) {
    console.error('Screenshot error:', err);
  } finally {
    if (browser) await browser.close();
    server.close();
    process.exit(0);
  }
});
