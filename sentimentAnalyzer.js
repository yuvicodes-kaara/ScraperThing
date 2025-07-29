// sentimentAnalyzer.js
const Sentiment = require('sentiment');
const sentiment = new Sentiment();

function analyzeSentiment(articles) {
  return articles.map(article => {
    if(article.status == "restricted") return { sentiment : ""}

    const analysis = sentiment.analyze(article.content || "");

    let label = 'neutral';
    if (analysis.score > 1) label = 'positive';
    else if (analysis.score < -1) label = 'negative';


    return {
      sentiment : label
      
    };
  });
}

module.exports = { analyzeSentiment };
