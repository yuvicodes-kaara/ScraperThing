const axios = require('axios');
const { spawn } = require('child_process');
const path = require('path');

let summarizerProcessStarted = false;

function startPythonSummarizer() {
  if (summarizerProcessStarted) return;

  summarizerProcessStarted = true;
  const pythonProcess = spawn('python3', ['summarizer.py'], {
    cwd: __dirname,
    detached: true,
    stdio: 'ignore',
  });

  pythonProcess.unref(); // Allow it to run independently
}

async function summarizeArticles(articles) {
  startPythonSummarizer();

  const summarized = [];

  for (const article of articles) {
    const content = article.content || '';

    if (article.status === 'restricted' || !content.trim()) {
      summarized.push({ ...article, summary: "" });
      continue;
    }

    try {
      const response = await axios.post('http://localhost:5197/summarize', {
        text: content,
      });

      console.log("[SUMMARY RESPONSE]", response.data);

      summarized.push({
        ...article,
        summary: response.data.summary || ""
      });
    } catch (error) {
      console.error("T5 summarization failed:", error.message);
      summarized.push({
        ...article,
        summary: "Summary unavailable (T5 error)"
      });
    }
  }

  return summarized;
}

module.exports = { summarizeArticles };
