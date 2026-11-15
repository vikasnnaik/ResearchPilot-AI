const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function run() {
  const screenshotsDir = path.resolve(__dirname, '../../screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  console.log('Launching Chrome from:', chromePath);

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1380,1200'],
    defaultViewport: { width: 1380, height: 1200 }
  });

  try {
    const page = await browser.newPage();
    console.log('Navigating to http://127.0.0.1:3000...');
    await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle0', timeout: 30000 });

    // 1. Landing and Dashboard Screenshot
    const p1 = path.join(screenshotsDir, '01_landing_dashboard.png');
    await page.screenshot({ path: p1, fullPage: false });
    console.log('Saved 01_landing_dashboard.png');

    // 2. Click an example prompt
    const exampleBtn = await page.$('button[type="button"] span.text-xs.font-semibold');
    if (exampleBtn) {
      await exampleBtn.click();
      await new Promise(r => setTimeout(r, 600));
    }
    const p2 = path.join(screenshotsDir, '02_prompt_selected.png');
    await page.screenshot({ path: p2, fullPage: false });
    console.log('Saved 02_prompt_selected.png');

    // 3. Click Launch Research Workflow to capture execution view
    const buttons = await page.$$('button');
    for (const b of buttons) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text && text.includes('Launch Research Workflow')) {
        await b.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 2200));
    const p3 = path.join(screenshotsDir, '03_execution_view.png');
    await page.screenshot({ path: p3, fullPage: false });
    console.log('Saved 03_execution_view.png');

    // 4. Return to home and Click "Explore Sample Dossier"
    await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle0' });
    const allBtns = await page.$$('button');
    for (const b of allBtns) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text && text.includes('Explore Sample Dossier')) {
        await b.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1200));

    // Results View: Tab 1 - Executive Dossier
    const p4 = path.join(screenshotsDir, '04_results_dossier.png');
    await page.screenshot({ path: p4, fullPage: false });
    console.log('Saved 04_results_dossier.png');

    // Results View: Tab 2 - Audited Claims
    const tabBtns = await page.$$('button');
    for (const b of tabBtns) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text && text.includes('Audited Claims')) {
        await b.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 800));
    const p5 = path.join(screenshotsDir, '05_claims_verification.png');
    await page.screenshot({ path: p5, fullPage: false });
    console.log('Saved 05_claims_verification.png');

    // Results View: Tab 3 - Contradictions
    for (const b of await page.$$('button')) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text && text.includes('Contradictions Comparison')) {
        await b.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 800));
    const p6 = path.join(screenshotsDir, '06_contradictions_comparison.png');
    await page.screenshot({ path: p6, fullPage: false });
    console.log('Saved 06_contradictions_comparison.png');

    // Results View: Tab 4 - Sources
    for (const b of await page.$$('button')) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text && text.includes('Sources & Quality')) {
        await b.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 800));
    const p7 = path.join(screenshotsDir, '07_sources_quality.png');
    await page.screenshot({ path: p7, fullPage: false });
    console.log('Saved 07_sources_quality.png');

    console.log('All 7 application view screenshots captured successfully!');
  } catch (err) {
    console.error('Screenshot capture error:', err);
  } finally {
    await browser.close();
  }
}

run();
