import feedparser
import datetime
import calendar
import time
import json
import sys

# Read arguments
query = sys.argv[1] if len(sys.argv) > 1 else "Real Madrid"
start_date = datetime.date.fromisoformat(sys.argv[2]) if len(sys.argv) > 2 else datetime.date(2023, 1, 1)
end_date = datetime.date.fromisoformat(sys.argv[3]) if len(sys.argv) > 3 else datetime.date(2023, 12, 31)

articles = []

start_year, start_month = start_date.year, start_date.month
end_year, end_month = end_date.year, end_date.month
current_year, current_month = start_year, start_month

while (current_year, current_month) <= (end_year, end_month):
    first_day = datetime.date(current_year, current_month, 1)
    after = max(first_day, start_date)
    last_day = datetime.date(current_year, current_month, calendar.monthrange(current_year, current_month)[1])
    before = min(last_day, end_date)

    url = f"https://news.google.com/rss/search?q={query.replace(' ', '+')}+after:{after}+before:{before}&hl=en-US&gl=US&ceid=US:en"
    feed = feedparser.parse(url)

    for entry in feed.entries:
        title = entry.title
        link = entry.link
        date = entry.published
        source = entry.get('source', {}).get('title', '')

        if not source:
            parts = title.rsplit(' - ', 1)
            if len(parts) == 2:
                title, source = parts

        articles.append({
            'title': title,
            'url': link,
            'date': date,
            'source': source
        })

    # Next month
    current_month += 1
    if current_month > 12:
        current_month = 1
        current_year += 1

    time.sleep(0.5)

print(json.dumps(articles))
