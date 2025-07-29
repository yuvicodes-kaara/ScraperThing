const categories = require("./keyword.json");

function segregator(articles) {
  const matched = [];
  const unmatched = [];

  for (const article of articles) {
    const content = article.content?.toLowerCase() || '';
    let matchedCategories = [];

    if (article.status === 'restricted') {
      matchedCategories = [];
    } else {
      for (const [category, { keywords }] of Object.entries(categories)) {
        for (const keyword of keywords) {
          if (content.includes(keyword.toLowerCase())) {
            matchedCategories.push(category);
            break; // stop checking other keywords for this category
          }
        }
      }
    }

    if (matchedCategories.length > 0) {
      matched.push({ ...article, matchedCategories });
    } else {
      unmatched.push({ ...article, matchedCategories: [] });
    }
  }

  return { matched, unmatched };
}

module.exports = { segregator };
