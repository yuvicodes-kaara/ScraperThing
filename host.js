const express = require('express');
const { spawn } = require('child_process');
const puppeteer = require('puppeteer');
const { scrapeArticle } = require('./articlescrape');
const { log } = require('console');
const app = express();
const PORT = 3000;

app.use(express.json());

app.post('/articles', async (req, res) => {
  const query = req.body.q;
  const start = req.body.start;
  const end = req.body.end;

  console.log(`Query: ${query}, Start: ${start}, End: ${end}`);

  const py = spawn('python3', ['scrap2.py', query, start, end]);
  let data = '';

  py.stdout.on('data', (chunk) => {
    data += chunk.toString();
  });

  py.stderr.on('data', (err) => {
    console.error('Python error:', err.toString());
  });

  py.on('close', async (code) => {
    if (code !== 0) {
      return res.status(500).json({ error: 'Python script failed.' });
    }

    try {
      const articles = JSON.parse(data);
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const results = [];
      const urlSet = new Set();
      const duplicateArticle = 0;
    
      for (const article of articles) {
        if (urlSet.has(article.url)) {
          duplicateArticle++;
          console.log(`Skipping duplicate URL: ${article.url}`);
          continue; // Skip duplicate
        }

        urlSet.add(article.url);

        console.log(`Scraping: ${article.title}`);
        const scraped = await scrapeArticle(browser, article.url);
        results.push({
          ...article,
          content: scraped.content,
          status: scraped.status
        });
      }

      await browser.close();
      console.log("No. of articles scrapped = ",results.length)
      log("Duplicates articles that got ignored = ",duplicateArticle)
      res.json(results);
    } catch (err) {
      console.error('Error:', err.message);
      res.status(500).json({ error: 'Processing failed.' });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});