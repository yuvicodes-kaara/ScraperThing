const express = require('express');
const { spawn } = require('child_process');
const puppeteer = require('puppeteer');
const { scrapeArticle } = require('./articlescrape');
const { segregator } = require("./keywordMatching");
const { analyzeSentiment } = require("./sentimentAnalyzer");
const { summarizeArticles } = require("./summary");
const cors = require("cors");
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

let clients = [];

app.get('/progress-stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  clients.push(res);

  req.on('close', () => {
    clients = clients.filter(client => client !== res);
  });
});

const sendProgress = (step, message) => {
  const payload = `data: ${step}${message}\n\n`;
  clients.forEach((client) => client.write(payload));
};

app.post('/articles', async (req, res) => {
  console.log(req.url)
  const results = [];
  const query = req.body.q;
  const start = req.body.start;
  const end = req.body.end;

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

      const urlSet = new Set();
      let duplicateArticle = 0;

      sendProgress("Scraping", `Starting to scrape ${articles.length} articles...`);

      for (let i = 0; i < articles.length; i++) {
        const article = articles[i];

        if (urlSet.has(article.url)) {
          duplicateArticle++;
          continue;
        }

        urlSet.add(article.url);

        sendProgress("Scraping : ",article.title);

        const scraped = await scrapeArticle(browser, article.url);
        results.push({
          ...article,
          content: scraped.content,
          status: scraped.status
        });
      }

      await browser.close();

      sendProgress("Keyword Matching", "Running keyword matching on articles...");
      let segResult = await segregator(results);

      sendProgress("Sentiment Analysis", "Analyzing sentiment of matched articles...");
      const sentMatchedResult = await analyzeSentiment(segResult.matched);
      const sentNotMatchedResult = await analyzeSentiment(segResult.unmatched);

      segResult.matched = segResult.matched.map((article, index) => ({
        ...article,
        ...sentMatchedResult[index]
      }));

      segResult.unmatched = segResult.unmatched.map((article, index) => ({
        ...article,
        ...sentNotMatchedResult[index]
      }));

      const allProcessed = [...segResult.matched, ...segResult.unmatched];

      sendProgress("Summarization", "Summarizing articles...");
      const summResult = await summarizeArticles(allProcessed);

      sendProgress("Complete", "All steps finished.");

      res.status(200).json(summResult);
    } catch (err) {
      console.error('Processing failed:', err.message);
      sendProgress("Error", "Something went wrong during processing.");
      res.status(500).json({ error: 'Processing failed.' });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
