const puppeteer = require('puppeteer');

async function scrapeArticle(browser, url) {
  let page;
  try {
    page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 \
Chrome/114.0.0.0 Safari/537.36'
    );

    // Disable images & CSS
    await page.setRequestInterception(true);
    page.on('request', req => {
      if (['image','stylesheet'].includes(req.resourceType()))
        req.abort();
      else
        req.continue();
    });

    // 1) go to DOMContentLoaded
    const response = await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });

    // 2) wait for at least one <p> to appear (fallback to network idle if needed)
    try {
      await page.waitForSelector('p', { timeout: 5000 });
    } catch {
      await page.waitForNetworkIdle({ idleTime: 500, timeout: 10000 });
    }

    // 3) scrape paragraphs
    const content = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('p'))
        .map(p => p.innerText.trim())
        .filter(t => t.length > 0)
        .join('\n\n');
    });

    const status = content.length > 100 ? 'open' : 'restricted';
    return { status, content: content || 'No content found' };
  } catch (err) {
    return { status: 'restricted', content: `Error: ${err.message}` };
  } finally {
    if (page) await page.close();
  }
}

module.exports = { scrapeArticle };
