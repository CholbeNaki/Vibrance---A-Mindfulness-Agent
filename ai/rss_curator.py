import re
from datetime import datetime

import feedparser
from pymongo import MongoClient
from transformers import pipeline
import trafilatura

# ---------- 1. CONFIG ----------

MONGO_URI = "mongodb://localhost:27017/"
DB_NAME = "vibrance"
COLLECTION_NAME = "articles"

RSS_FEEDS = [
    {"name": "Mindful.org", "url": "https://www.mindful.org/feed/"},
    {"name": "PositivePsychology.com", "url": "https://positivepsychology.com/feed/"},
    {"name": "Dynomight.com", "url": "https://dynomight.net/feed.xml"},
    {"name": "Marginalrevolution.com", "url": "https://marginalrevolution.com/feed"},
    {"name": "Ribbonfarm.com", "url": "https://www.ribbonfarm.com/feed/"},
    {"name": "Astralcodexten.substack.com", "url": "https://astralcodexten.substack.com/feed"},
    {"name": "Notboring.com", "url": "https://www.notboring.co/feed"},
    {"name": "Quantamagazine.org", "url": "https://api.quantamagazine.org/feed/"},
    {"name": "Every.to/superorganizers", "url": "https://every.to/superorganizers/feed"},
]

MIN_SENTIMENT_SCORE = 0.85

# Set this to True ONCE to wipe old docs, then set back to False
RESET_COLLECTION = True


# ---------- 2. CONNECT TO MONGO ----------

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
articles_col = db[COLLECTION_NAME]


# ---------- 3. LOAD MODELS ----------

print("Loading models... this may take a bit the first time.")

sentiment_classifier = pipeline(
    "sentiment-analysis",
    model="distilbert/distilbert-base-uncased-finetuned-sst-2-english"
)

emotion_classifier = pipeline(
    "text-classification",
    model="SamLowe/roberta-base-go_emotions",
    top_k=None
)


# ---------- 4. HELPERS ----------
def pick_hero_image_from_html(html):
    """
    Try to pick a 'hero' image from the article HTML itself.
    We skip obvious logo/branding filenames if possible.
    """
    if not html:
        return None

    # Find all <img src="..."> URLs
    candidates = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', html, flags=re.IGNORECASE)
    if not candidates:
        return None

    for url in candidates:
        lower = url.lower()
        # Heuristic: skip tiny branding stuff if the URL suggests 'logo', 'icon', etc.
        if any(bad in lower for bad in ["logo", "icon", "avatar", "sprite"]):
            continue
        return url  # first non-logo-like image

    # Fallback: if all look logo-ish, just return the first one
    return candidates[0]


def clean_html(raw_html):
    if not raw_html:
        return ""
    return re.sub(r"<.*?>", "", raw_html).strip()


def extract_image_url_from_entry(entry, summary_html, content_html):
    if hasattr(entry, "media_content"):
        media = getattr(entry, "media_content", None) or []
        if media:
            url = media[0].get("url")
            if url:
                return url

    if hasattr(entry, "media_thumbnail"):
        thumbs = getattr(entry, "media_thumbnail", None) or []
        if thumbs:
            url = thumbs[0].get("url")
            if url:
                return url

    links = getattr(entry, "links", None) or []
    for link in links:
        if str(link.get("type", "")).startswith("image/"):
            return link.get("href")

    html = summary_html or content_html or ""
    match = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', html)
    if match:
        return match.group(1)

    return None


def analyze_text(text):
    if not text:
        text = ""

    snippet = text[:1000]

    s = sentiment_classifier(snippet)[0]
    sentiment_label = s["label"]
    sentiment_score = float(s["score"])

    emo_raw = emotion_classifier(snippet)[0]
    emo_sorted = sorted(emo_raw, key=lambda e: e["score"], reverse=True)
    top_emotions = [e["label"] for e in emo_sorted[:2]]

    positivity_score = sentiment_score if sentiment_label == "POSITIVE" else 1.0 - sentiment_score

    return {
        "sentimentLabel": sentiment_label,
        "sentimentScore": sentiment_score,
        "topEmotions": top_emotions,
        "positivityScore": positivity_score,
    }


def article_exists(url):
    if not url:
        return False
    return articles_col.count_documents({"url": url}, limit=1) > 0


def fetch_full_article_html_and_image(url, existing_image_url=None):
    """
    Use trafilatura to fetch the page and extract:
      - cleaned article HTML
      - a better main image (hero) if available
    """
    # 1) Fetch raw page
    try:
        downloaded = trafilatura.fetch_url(url)
        if not downloaded:
            return None, existing_image_url
    except Exception as e:
        print(f"    (trafilatura fetch_url failed for {url}: {e})")
        return None, existing_image_url

    # 2) Extract full HTML content
    full_html = None
    try:
        # newer versions
        full_html = trafilatura.extract(downloaded, output_format="html")
    except TypeError:
        # older versions without output_format arg
        try:
            full_html = trafilatura.extract(downloaded)
        except Exception as e:
            print(f"    (trafilatura extract failed for {url}: {e})")
    except Exception as e:
        print(f"    (trafilatura extract failed for {url}: {e})")

    # Start with any existing image (from RSS)
    image_url = existing_image_url

    # 3) Prefer an image from the article HTML itself (hero image)
    hero_from_html = pick_hero_image_from_html(full_html or "")
    if hero_from_html:
        image_url = hero_from_html

    # 4) Try metadata image ONLY if we still have nothing
    try:
        try:
            meta = trafilatura.extract_metadata(downloaded, url=url)
        except TypeError:
            meta = trafilatura.extract_metadata(downloaded)

        if meta is not None and not image_url:
            img = getattr(meta, "image", None) or getattr(meta, "image_url", None)
            if isinstance(meta, dict):
                img = img or meta.get("image") or meta.get("image_url")
            if img:
                image_url = img
    except Exception as e:
        print(f"    (trafilatura metadata failed for {url}: {e})")

    return full_html or None, image_url



# ---------- 5. MAIN CURATION LOGIC ----------

def process_feed(feed_config):
    name = feed_config["name"]
    url = feed_config["url"]
    print(f"\nFetching feed: {name} -> {url}")

    parsed = feedparser.parse(url)

    if parsed.bozo:
        print(f"  !! Error parsing feed {name}")
        return

    new_docs = []

    for entry in parsed.entries:
        link = getattr(entry, "link", None)
        title = getattr(entry, "title", "").strip()
        summary_html = getattr(entry, "summary", "") or getattr(entry, "description", "")

        if hasattr(entry, "content") and entry.content:
            try:
                content_html = entry.content[0].value
            except Exception:
                content_html = summary_html
        else:
            content_html = summary_html

        summary_text = clean_html(summary_html)

        if not title or not link:
            continue

        if article_exists(link):
            print(f"  Skipping existing: {title}")
            continue

        ai = analyze_text(summary_text or title)
        if ai["sentimentLabel"] != "POSITIVE" or ai["sentimentScore"] < MIN_SENTIMENT_SCORE:
            print(f"  Skipping (not positive enough): {title}")
            continue

        if hasattr(entry, "published_parsed") and entry.published_parsed:
            published_at = datetime(*entry.published_parsed[:6])
        else:
            published_at = datetime.utcnow()

        image_url = extract_image_url_from_entry(entry, summary_html, content_html)

        full_html, better_image = fetch_full_article_html_and_image(link, image_url)
        if full_html:
            content_html = full_html
        if better_image:
            image_url = better_image

        doc = {
            "title": title,
            "author": getattr(entry, "author", None),
            "source": name,
            "url": link,
            "summary": summary_text,
            "contentHtml": content_html,
            "imageUrl": image_url,
            "sentimentLabel": ai["sentimentLabel"],
            "sentimentScore": ai["sentimentScore"],
            "topEmotions": ai["topEmotions"],
            "positivityScore": ai["positivityScore"],
            "tags": [],
            "publishedAt": published_at,
            "published": True,
        }

        new_docs.append(doc)

    if new_docs:
        result = articles_col.insert_many(new_docs)
        print(f"  Inserted {len(result.inserted_ids)} positive articles from {name}.")
    else:
        print(f"  No new positive articles found for {name}.")


def main():
    if RESET_COLLECTION:
        print("RESET_COLLECTION is True – clearing existing articles...")
        articles_col.delete_many({})

    for feed in RSS_FEEDS:
        try:
            process_feed(feed)
        except Exception as e:
            print(f"Error processing feed {feed['name']}: {e}")

    print("\nDone.")


if __name__ == "__main__":
    main()
