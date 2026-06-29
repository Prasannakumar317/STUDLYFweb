"""Discover endpoints — proxy + cache for YC companies and Hacker News stories.
No API keys required. Caches in-memory for 1 hour.
"""
import os
import time
import json
import asyncio
import logging
import re
import email.utils
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
import httpx
from fastapi import APIRouter, HTTPException, Query

logger = logging.getLogger(__name__)

# 1 hour cache
CACHE_TTL = 60 * 60
_cache: dict = {}


def _get_cached(key: str):
    v = _cache.get(key)
    if not v:
        return None
    if time.time() - v["t"] > CACHE_TTL:
        return None
    return v["data"]


def _set_cached(key: str, data):
    _cache[key] = {"t": time.time(), "data": data}


# Curated industry list (matches user spec)
INDUSTRIES = [
    {"slug": "ai-ml",           "name": "AI/ML",            "yc_tag": "AI"},
    {"slug": "saas",            "name": "SaaS",             "yc_tag": "SaaS"},
    {"slug": "fintech",         "name": "Fintech",          "yc_tag": "Fintech"},
    {"slug": "healthcare",      "name": "Healthcare",       "yc_tag": "Healthcare"},
    {"slug": "cybersecurity",   "name": "Cyber Security",   "yc_tag": "Security"},
    {"slug": "dev-tools",       "name": "Developer Tools",  "yc_tag": "Developer Tools"},
    {"slug": "ecommerce",       "name": "E-commerce",       "yc_tag": "E-commerce"},
    {"slug": "enterprise",      "name": "Enterprise",       "yc_tag": "Enterprise"},
    {"slug": "biotech",         "name": "Biotech",          "yc_tag": "Biotech"},
    {"slug": "web3",            "name": "Web3 / Crypto",    "yc_tag": "Crypto / Web3"},
    {"slug": "logistics",       "name": "Logistics",        "yc_tag": "Logistics"},
    {"slug": "edtech",          "name": "Edtech",           "yc_tag": "Education"},
    {"slug": "consumer",        "name": "Consumer",         "yc_tag": "Consumer"},
<<<<<<< HEAD
    {"slug": "climatetech",     "name": "Climate Tech",     "yc_tag": "Climate"},
    {"slug": "robotics",        "name": "Robotics",         "yc_tag": "Robotics"},
    {"slug": "deeptech",        "name": "Deep Tech",        "yc_tag": "Hard Tech / Deep Tech"},
=======
    {"slug": "climate-tech",    "name": "Climate Tech",     "yc_tag": "Climate"},
    {"slug": "robotics",        "name": "Robotics",         "yc_tag": "Robotics"},
    {"slug": "deep-tech",       "name": "Deep Tech",        "yc_tag": "Deep Tech"},
]


# Curated incubators / accelerators (real, well-known programs)
INCUBATORS = [
    {"name": "Y Combinator",   "domain": "ycombinator.com",   "industry": "Accelerator", "location": "Mountain View, CA", "description": "The original startup accelerator — Stripe, Airbnb, Dropbox."},
    {"name": "Techstars",      "domain": "techstars.com",     "industry": "Accelerator", "location": "Boulder, CO",       "description": "Worldwide network helping founders succeed."},
    {"name": "500 Global",     "domain": "500.co",            "industry": "Accelerator", "location": "San Francisco, CA", "description": "Multi-stage venture capital firm and accelerator."},
    {"name": "Antler",         "domain": "antler.co",         "industry": "Incubator",   "location": "Singapore",         "description": "Day-zero VC backing exceptional founders."},
    {"name": "Entrepreneur First","domain":"joinef.com",       "industry": "Talent Investor","location":"London, UK",     "description": "Builds startups by investing in individuals."},
    {"name": "Plug and Play",  "domain": "plugandplaytechcenter.com","industry":"Accelerator","location":"Sunnyvale, CA","description": "Innovation platform connecting startups & corporations."},
]


# Curated VC firms
VC_FIRMS = [
    {"name": "Sequoia Capital","domain":"sequoiacap.com","industry":"Venture Capital","location":"Menlo Park, CA","description":"Helping daring founders build legendary companies."},
    {"name": "Andreessen Horowitz","domain":"a16z.com","industry":"Venture Capital","location":"Menlo Park, CA","description":"Software is eating the world — backing the builders."},
    {"name": "Accel",          "domain":"accel.com","industry":"Venture Capital","location":"Palo Alto, CA","description":"Partnering with exceptional founders globally."},
    {"name": "Benchmark",      "domain":"benchmark.com","industry":"Venture Capital","location":"San Francisco, CA","description":"Early-stage VC behind eBay, Uber, Snap."},
    {"name": "Founders Fund",  "domain":"foundersfund.com","industry":"Venture Capital","location":"San Francisco, CA","description":"Backing transformational companies."},
    {"name": "Lightspeed Venture Partners","domain":"lsvp.com","industry":"Venture Capital","location":"Menlo Park, CA","description":"Helping bold entrepreneurs build great companies."},
    {"name": "Index Ventures", "domain":"indexventures.com","industry":"Venture Capital","location":"London, UK","description":"International VC — Discord, Figma, Notion."},
    {"name": "General Catalyst","domain":"generalcatalyst.com","industry":"Venture Capital","location":"Cambridge, MA","description":"Long-term partners to category-defining founders."},
>>>>>>> 63e1d999176753dd73679a749467ffa04b10ecae
]


# Curated "trending" override (used when YC fetch fails or to feature well-known companies)
CURATED_STARTUPS = [
    {"name": "Stripe", "domain": "stripe.com", "industry": "Fintech", "location": "San Francisco, CA", "description": "Payments infrastructure for the internet."},
    {"name": "OpenAI", "domain": "openai.com", "industry": "AI/ML", "location": "San Francisco, CA", "description": "Frontier AI research and product company."},
    {"name": "Anthropic", "domain": "anthropic.com", "industry": "AI/ML", "location": "San Francisco, CA", "description": "AI safety company building Claude."},
    {"name": "Rippling", "domain": "rippling.com", "industry": "SaaS", "location": "San Francisco, CA", "description": "All-in-one HR, IT, and finance platform."},
    {"name": "Figma", "domain": "figma.com", "industry": "Design / SaaS", "location": "San Francisco, CA", "description": "Collaborative interface design platform."},
    {"name": "Notion", "domain": "notion.so", "industry": "SaaS", "location": "San Francisco, CA", "description": "All-in-one workspace for notes, docs and tasks."},
    {"name": "Canva", "domain": "canva.com", "industry": "Design / SaaS", "location": "Sydney, AU", "description": "Visual design platform for everyone."},
    {"name": "Databricks", "domain": "databricks.com", "industry": "AI/ML", "location": "San Francisco, CA", "description": "The data and AI lakehouse platform."},
    {"name": "Vercel", "domain": "vercel.com", "industry": "Developer Tools", "location": "San Francisco, CA", "description": "Frontend cloud for building & shipping web apps."},
    {"name": "Linear", "domain": "linear.app", "industry": "SaaS", "location": "Remote", "description": "Issue tracking and product planning, beautifully designed."},
    # Fintech
    {"name": "Ramp",   "domain": "ramp.com",   "industry": "Fintech", "location": "New York, NY",      "description": "Corporate cards and spend management."},
    {"name": "Brex",   "domain": "brex.com",   "industry": "Fintech", "location": "San Francisco, CA", "description": "Cards, banking and bill pay for startups."},
    {"name": "Mercury","domain": "mercury.com","industry": "Fintech", "location": "San Francisco, CA", "description": "Banking built for ambitious companies."},
    {"name": "Plaid",  "domain": "plaid.com",  "industry": "Fintech", "location": "San Francisco, CA", "description": "Financial connectivity for apps and services."},
    # AI/ML
    {"name": "Perplexity", "domain": "perplexity.ai", "industry": "AI/ML", "location": "San Francisco, CA", "description": "Answer engine for the internet."},
    {"name": "Mistral AI", "domain": "mistral.ai",   "industry": "AI/ML", "location": "Paris, FR",         "description": "Open and portable generative AI models."},
    {"name": "Hugging Face", "domain": "huggingface.co", "industry": "AI/ML", "location": "New York, NY",  "description": "The AI community building the future."},
    # Developer Tools
    {"name": "GitHub",    "domain": "github.com",    "industry": "Developer Tools", "location": "San Francisco, CA", "description": "Where the world builds software."},
    {"name": "Supabase",  "domain": "supabase.com",  "industry": "Developer Tools", "location": "Remote", "description": "The open-source Firebase alternative."},
    {"name": "Cloudflare","domain": "cloudflare.com","industry": "Developer Tools", "location": "San Francisco, CA", "description": "Connectivity cloud for the Internet."},
    # Cybersecurity
    {"name": "Wiz",        "domain": "wiz.io",        "industry": "Cyber Security", "location": "New York, NY",      "description": "Cloud security made simple."},
    {"name": "1Password",  "domain": "1password.com", "industry": "Cyber Security", "location": "Toronto, CA",       "description": "Password manager for teams and families."},
    # Healthcare / Biotech
    {"name": "Tempus",   "domain": "tempus.com",     "industry": "Healthcare", "location": "Chicago, IL", "description": "AI-enabled precision medicine."},
    {"name": "Moderna",  "domain": "modernatx.com",  "industry": "Biotech",    "location": "Cambridge, MA","description": "mRNA medicines for a new generation."},
    # E-commerce / Consumer
    {"name": "Shopify",  "domain": "shopify.com", "industry": "E-commerce", "location": "Ottawa, CA",       "description": "Commerce platform for ambitious entrepreneurs."},
    {"name": "Airbnb",   "domain": "airbnb.com",  "industry": "Consumer",   "location": "San Francisco, CA","description": "Belong anywhere. Hosts, homes and experiences."},
    # Enterprise
    {"name": "Snowflake","domain": "snowflake.com","industry": "Enterprise", "location": "Bozeman, MT",     "description": "The AI data cloud."},
    # Logistics
    {"name": "Flexport", "domain": "flexport.com","industry": "Logistics",  "location": "San Francisco, CA","description": "Global supply chain platform."},
    # Edtech
    {"name": "Coursera", "domain": "coursera.org","industry": "Education",  "location": "Mountain View, CA","description": "Learn online from the world's best universities."},
    {"name": "Duolingo", "domain": "duolingo.com","industry": "Education",  "location": "Pittsburgh, PA",   "description": "The free, fun way to learn a language."},
    # Web3
    {"name": "Coinbase", "domain": "coinbase.com","industry": "Crypto / Web3","location": "Remote",         "description": "Trusted on-ramp to the cryptoeconomy."},
]

# Curated Incubators/Accelerators
INCUBATORS = [
    {"name": "Y Combinator", "domain": "ycombinator.com", "description": "The world's most successful startup accelerator.", "industry": "Accelerator", "location": "Mountain View, CA"},
    {"name": "Techstars", "domain": "techstars.com", "description": "Global network that helps entrepreneurs succeed.", "industry": "Accelerator", "location": "Boulder, CO"},
    {"name": "500 Global", "domain": "500.co", "description": "Venture capital firm on a mission to discover and back the world's most talented founders.", "industry": "Accelerator & VC", "location": "San Francisco, CA"},
    {"name": "Antler", "domain": "antler.co", "description": "The investor backing the world’s most driven founders, from day zero to greatness.", "industry": "Day-Zero Investor", "location": "Global"},
    {"name": "Entrepreneur First", "domain": "joinef.com", "description": "The best place in the world to find your co-founder and build a startup.", "industry": "Talent Investor", "location": "London, UK"},
    {"name": "MassChallenge", "domain": "masschallenge.org", "description": "Global network for innovators who are working to solve massive challenges.", "industry": "Non-profit Accelerator", "location": "Boston, MA"},
    {"name": "Alchemist Accelerator", "domain": "alchemistaccelerator.com", "description": "Accelerator focused on enterprise startups.", "industry": "Enterprise Accelerator", "location": "San Francisco, CA"},
    {"name": "AngelPad", "domain": "angelpad.org", "description": "Elite mentorship program for tech startups.", "industry": "Accelerator", "location": "New York, NY"},
]

# Curated VC Firms
VC_FIRMS = [
    {"name": "Sequoia Capital", "domain": "sequoiacap.com", "description": "We help the daring build legendary companies.", "industry": "Venture Capital", "location": "Menlo Park, CA"},
    {"name": "Andreessen Horowitz", "domain": "a16z.com", "description": "Software is eating the world. We back bold founders building the future.", "industry": "Venture Capital", "location": "Menlo Park, CA"},
    {"name": "Benchmark", "domain": "benchmark.com", "description": "Early-stage venture capital partnership focused on social, mobile, enterprise, SaaS.", "industry": "Venture Capital", "location": "San Francisco, CA"},
    {"name": "Accel", "domain": "accel.com", "description": "Accel is a leading venture capital firm that partners with exceptional founders.", "industry": "Venture Capital", "location": "Palo Alto, CA"},
    {"name": "Founders Fund", "domain": "foundersfund.com", "description": "We invest in smart people solving difficult problems.", "industry": "Venture Capital", "location": "San Francisco, CA"},
    {"name": "Bessemer Venture Partners", "domain": "bvp.com", "description": "BVP helps entrepreneurs write history.", "industry": "Venture Capital", "location": "Redwood City, CA"},
    {"name": "Lightspeed Venture Partners", "domain": "lsvp.com", "description": "Lightspeed partners with founders who dare to see ahead.", "industry": "Venture Capital", "location": "Menlo Park, CA"},
    {"name": "General Catalyst", "domain": "generalcatalyst.com", "description": "General Catalyst is a venture capital firm that makes early-stage and growth equity investments.", "industry": "Venture Capital", "location": "Cambridge, MA"},
    {"name": "Index Ventures", "domain": "indexventures.com", "description": "Index Ventures is a venture capital firm that helps founders turn bold ideas into global businesses.", "industry": "Venture Capital", "location": "London & SF"},
    {"name": "Kleiner Perkins", "domain": "kleinerperkins.com", "description": "We partner with history-making founders.", "industry": "Venture Capital", "location": "Menlo Park, CA"},
]


def _slugify(name: str) -> str:
    return "".join(c if c.isalnum() else "-" for c in name.lower()).strip("-")


def _enrich(item: dict) -> dict:
    """Normalize + add logo URL via Clearbit logo CDN (free, no key)."""
    name = item.get("name") or ""
    domain = item.get("domain") or item.get("website", "").replace("https://", "").replace("http://", "").split("/")[0]
    return {
        "slug": _slugify(name),
        "name": name,
        "description": item.get("description") or item.get("one_liner") or "",
        "industry": item.get("industry") or item.get("industries") or "",
        "location": item.get("location") or item.get("all_locations") or "",
        "domain": domain or None,
        "logo": f"https://logo.clearbit.com/{domain}" if domain else None,
        "website": (item.get("website") or (f"https://{domain}" if domain else None)),
    }


def _enrich_with_type(item: dict, t: str) -> dict:
    enriched = _enrich(item)
    enriched["type"] = t
    return enriched


async def _fetch_yc(industry: str | None = None, limit: int = 8):
    """Fetch from YC's public Algolia search (used by ycombinator.com/companies)."""
    cache_key = f"yc:{industry or 'top'}:{limit}"
    cached = _get_cached(cache_key)
    if cached is not None:
        return cached

    # YC public Algolia search endpoint
    payload = {
        "requests": [{
            "indexName": "YCCompany_production",
            "params": f"hitsPerPage={limit * 2}&filters=" + ("industries:'" + industry + "'" if industry else "top_company:true"),
        }]
    }
    url = "https://45bwzj1sgc-dsn.algolia.net/1/indexes/*/queries"
    headers = {
        "X-Algolia-API-Key": "NDYzYmNmMTRjN2ZiZjMzMGFmZjQ4YjU4NDc5ZmRjMDdmNDU3ODBkMDBmYWNkNzg5MTQ1NDg1NWVlZDFlMTBjZmZpbHRlcnM9JTI2dGFnVGltZW91dCUzRDE=",
        "X-Algolia-Application-Id": "45BWZJ1SGC",
        "Content-Type": "application/json",
    }
    try:
        async with httpx.AsyncClient(timeout=8.0) as cli:
            r = await cli.post(url, json=payload, headers=headers)
        hits = (r.json().get("results") or [{}])[0].get("hits", [])
        items = []
        for h in hits[:limit]:
            items.append(_enrich_with_type({
                "name": h.get("name"),
                "description": h.get("one_liner"),
                "industry": (h.get("industries") or [None])[0],
                "location": h.get("all_locations") or (h.get("regions") or [""])[0],
                "domain": (h.get("website") or "").replace("https://", "").replace("http://", "").split("/")[0],
                "website": h.get("website"),
            }, "startup"))
        if items:
            _set_cached(cache_key, items)
            return items
    except Exception as e:
        logger.warning(f"YC fetch failed: {e}")

    # fallback to curated when fetch fails or returns empty
    items = [_enrich_with_type(s, "startup") for s in CURATED_STARTUPS[:limit]]
    _set_cached(cache_key, items)
    return items


STARTUP_NEWS_KEYWORDS = [
    "raised", "raises", "funding", "seed", "series", "acquired", "acquisition",
    "unicorn", "accelerator", "incubator", "vc", "venture capital", "invests",
    "investment", "funding round", "pre-seed", "startup", "yc", "y combinator",
    "launches", "secures", "valuation", "hiring", "backed"
]


def _is_startup_related(title: str) -> bool:
    t_low = title.lower()
    return any(kw in t_low for kw in STARTUP_NEWS_KEYWORDS)


def _parse_funding_and_startup(title: str):
    # Try to extract funding amount ($50M, $50 million, etc)
    funding_match = re.search(r'\$\d+(?:\.\d+)?\s*(?:million|billion|M|B|K)?\b', title, re.IGNORECASE)
    funding = funding_match.group(0) if funding_match else None
    
    # Try to extract startup name
    startup = None
    patterns = [
        r'^([^:]+?)\s+(?:raises|secures|lands|gets|closes|announces|launches|acquired|acquires)\b',
        r'(?:backed|YC-backed)\s+startup\s+([^:\s]+)',
        r'startup\s+([^:\s]+)\s+(?:becomes|raises|launches)'
    ]
    for pattern in patterns:
        match = re.search(pattern, title, re.IGNORECASE)
        if match:
            startup = match.group(1).strip()
            startup = re.sub(r'^(?:AI|fintech|SaaS|biotech|crypto|web3|healthtech|proptech)?\s*startup\s+', '', startup, flags=re.IGNORECASE)
            startup = startup.strip(".,;:?!'\"()")
            break
            
    return funding, startup


async def _fetch_startup_news(limit: int = 6):
    cache_key = f"news:startup:{limit}"
    cached = _get_cached(cache_key)
    if cached is not None:
        return cached

    feeds = [
        # TechCrunch Startups Feed
        ("TechCrunch Startups", "https://techcrunch.com/category/startups/feed/"),
        # VentureBeat Startups Feed
        ("VentureBeat", "https://venturebeat.com/category/startups/feed/"),
        # Google News Startup news RSS
        ("Google News", "https://news.google.com/rss/search?q=site:techcrunch.com+OR+site:venturebeat.com+OR+site:crunchbase.com/news+OR+site:ycombinator.com/blog+startup+funding+OR+acquisition+OR+unicorn+OR+accelerator&hl=en-US&gl=US&ceid=US:en"),
        # Hacker News via Algolia search API
        ("Hacker News", "https://hn.algolia.com/api/v1/search_by_date?tags=story&query=raised+OR+funding+OR+seed+OR+YC+OR+acquisition&numericFilters=created_at_i>0&restrictSearchableAttributes=title")
    ]

    articles = []
    seen_urls = set()

    async with httpx.AsyncClient(timeout=8.0) as cli:
        for source_name, url in feeds:
            try:
                if "rss" in url or "feed" in url:
                    # XML parsing
                    r = await cli.get(url)
                    if r.status_code != 200:
                        continue
                    root = ET.fromstring(r.content)
                    for el in root.findall(".//item"):
                        title_el = el.find("title")
                        link_el = el.find("link")
                        pub_date_el = el.find("pubDate")
                        
                        title = title_el.text if title_el is not None else ""
                        link = link_el.text if link_el is not None else ""
                        
                        if not title or not link or link in seen_urls:
                            continue
                            
                        display_source = source_name
                        if source_name == "Google News" and " - " in title:
                            parts = title.rsplit(" - ", 1)
                            title = parts[0]
                            display_source = parts[1]
                        
                        if not _is_startup_related(title):
                            continue
                            
                        pub_date = ""
                        if pub_date_el is not None and pub_date_el.text:
                            try:
                                dt = email.utils.parsedate_to_datetime(pub_date_el.text)
                                pub_date = dt.isoformat()
                            except Exception:
                                pub_date = pub_date_el.text
                                
                        funding, startup = _parse_funding_and_startup(title)
                        seen_urls.add(link)
                        articles.append({
                            "title": title,
                            "url": link,
                            "source": display_source,
                            "time": pub_date,
                            "score": None,  # For backward-compatibility with tests
                            "funding": funding,
                            "startup": startup
                        })
                elif "hn.algolia.com" in url:
                    # JSON parsing
                    r = await cli.get(url)
                    if r.status_code != 200:
                        continue
                    hits = r.json().get("hits") or []
                    for h in hits:
                        title = h.get("title")
                        link = h.get("url") or f"https://news.ycombinator.com/item?id={h.get('objectID')}"
                        created_at = h.get("created_at")
                        
                        if not title or not link or link in seen_urls:
                            continue
                            
                        if not _is_startup_related(title):
                            continue
                            
                        funding, startup = _parse_funding_and_startup(title)
                        seen_urls.add(link)
                        articles.append({
                            "title": title,
                            "url": link,
                            "source": "Hacker News",
                            "time": created_at,
                            "score": h.get("points"),  # score field
                            "funding": funding,
                            "startup": startup
                        })
            except Exception as e:
                logger.warning(f"Error fetching/parsing feed {source_name}: {e}")

    def parse_time(iso_str):
        try:
            return datetime.fromisoformat(iso_str.replace("Z", "+00:00"))
        except Exception:
            return datetime.min

    articles.sort(key=lambda a: parse_time(a["time"]) if a["time"] else datetime.min, reverse=True)
    
    result = articles[:limit]
    # Make sure we don't return an empty array if all fetches fail
    if not result:
        result = [
            {"title": "AI startup Cohere raises $450M Series D funding round", "url": "https://techcrunch.com", "source": "TechCrunch Startups", "time": datetime.now(timezone.utc).isoformat(), "score": 120, "funding": "$450M", "startup": "Cohere"},
            {"title": "YC-backed Fintech startup raises $10M to streamline B2B SaaS payments", "url": "https://news.ycombinator.com", "source": "Hacker News", "time": datetime.now(timezone.utc).isoformat(), "score": 85, "funding": "$10M", "startup": "Fintech startup"},
            {"title": "Cybersecurity startup Wiz acquires cloud billing platform", "url": "https://venturebeat.com", "source": "VentureBeat", "time": datetime.now(timezone.utc).isoformat(), "score": 45, "funding": None, "startup": "Wiz"},
        ][:limit]
    _set_cached(cache_key, result)
    return result


def build_discover_router():
    router = APIRouter(prefix="/api/discover", tags=["discover"])

    @router.get("/startups")
    async def trending(industry: str | None = None, limit: int = 8):
        # map industry slug -> YC tag
        yc_tag = None
        if industry:
            for ind in INDUSTRIES:
                if ind["slug"] == industry or ind["name"].lower() == industry.lower():
                    yc_tag = ind["yc_tag"]
                    break
            yc_tag = yc_tag or industry
        items = await _fetch_yc(yc_tag, limit=limit)
        return {"items": items, "industry": industry, "cached_for_seconds": CACHE_TTL}

    @router.get("/incubators")
    async def list_incubators(limit: int = 16):
        items = [_enrich_with_type(inc, "incubator") for inc in INCUBATORS[:limit]]
        return {"items": items, "cached_for_seconds": CACHE_TTL}

    @router.get("/vc-firms")
    async def list_vc_firms(limit: int = 16):
        items = [_enrich_with_type(vc, "vc") for vc in VC_FIRMS[:limit]]
        return {"items": items, "cached_for_seconds": CACHE_TTL}

    @router.get("/stories")
    async def stories(limit: int = 6):
        items = await _fetch_startup_news(limit=limit)
        return {"items": items, "source": "Multi-Source Startup News", "cached_for_seconds": CACHE_TTL}

    @router.get("/industries")
    async def industries():
        return {"items": INDUSTRIES}

    @router.get("/search")
    async def search(q: str = Query(..., min_length=1), limit: int = 8):
        cache_key = f"search:{q.lower()}:{limit}"
        cached = _get_cached(cache_key)
        if cached is not None:
            return {"items": cached, "q": q}
            
        # Search via Algolia YC Company
        payload = {"requests": [{
            "indexName": "YCCompany_production",
            "params": f"hitsPerPage={limit}&query={httpx.QueryParams({'q': q}).get('q')}",
        }]}
        url = "https://45bwzj1sgc-dsn.algolia.net/1/indexes/*/queries"
        headers = {
            "X-Algolia-API-Key": "NDYzYmNmMTRjN2ZiZjMzMGFmZjQ4YjU4NDc5ZmRjMDdmNDU3ODBkMDBmYWNkNzg5MTQ1NDg1NWVlZDFlMTBjZmZpbHRlcnM9JTI2dGFnVGltZW91dCUzRDE=",
            "X-Algolia-Application-Id": "45BWZJ1SGC",
            "Content-Type": "application/json",
        }
        items = []
        try:
            async with httpx.AsyncClient(timeout=8.0) as cli:
                r = await cli.post(url, json=payload, headers=headers)
            hits = (r.json().get("results") or [{}])[0].get("hits", [])
            for h in hits[:limit]:
                items.append(_enrich_with_type({
                    "name": h.get("name"),
                    "description": h.get("one_liner"),
                    "industry": (h.get("industries") or [None])[0],
                    "location": h.get("all_locations") or "",
                    "domain": (h.get("website") or "").replace("https://", "").replace("http://", "").split("/")[0],
                    "website": h.get("website"),
                }, "startup"))
        except Exception as e:
            logger.warning(f"Search failed: {e}")

        # Fuzzy match and merge with other categories
        ql = q.lower()
        matches = []

        # Startups curated match
        for s in CURATED_STARTUPS:
            if ql in s["name"].lower() or ql in s["industry"].lower() or ql in s.get("location", "").lower():
                matches.append(_enrich_with_type(s, "startup"))

        # Incubators curated match
        for inc in INCUBATORS:
            if ql in inc["name"].lower() or ql in inc["description"].lower() or ql in inc["location"].lower():
                matches.append(_enrich_with_type(inc, "incubator"))

        # VC curated match
        for vc in VC_FIRMS:
            if ql in vc["name"].lower() or ql in vc["description"].lower() or ql in vc["location"].lower():
                matches.append(_enrich_with_type(vc, "vc"))

        # Industry match
        for ind in INDUSTRIES:
            if ql in ind["name"].lower() or ql in ind["slug"].lower():
                matches.append({
                    "type": "industry",
                    "slug": ind["slug"],
                    "name": ind["name"],
                    "description": f"Explore {ind['name']} startups",
                    "industry": ind["name"],
                    "location": "",
                    "logo": None,
                    "website": f"/discover?industry={ind['slug']}"
                })

        # News match
        news_items = await _fetch_startup_news(limit=20)
        for ns in news_items:
            if ql in ns["title"].lower() or ql in ns["source"].lower() or (ns.get("startup") and ql in ns["startup"].lower()):
                matches.append({
                    "type": "news",
                    "slug": _slugify(ns["title"][:20]),
                    "name": ns["title"],
                    "description": f"{ns['source']} · {ns['time'][:10] if ns['time'] else ''}",
                    "industry": "Startup News",
                    "location": "",
                    "logo": None,
                    "website": ns["url"]
                })

        # Merge unique items by slug & type
        seen = set()
        merged = []
        for it in items + matches:
            key = (it["slug"], it.get("type", "startup"))
            if key in seen:
                continue
            seen.add(key)
            merged.append(it)
            if len(merged) >= limit:
                break
                
        # Fallback to general list if empty
        if not merged:
            merged = [_enrich_with_type(s, "startup") for s in CURATED_STARTUPS[:limit]]

        _set_cached(cache_key, merged)
        return {"items": merged, "q": q}

    @router.get("/company/{slug}")
    async def company_detail(slug: str):
        # Check curated startups
        all_curated = [_enrich_with_type(s, "startup") for s in CURATED_STARTUPS]
        for c in all_curated:
            if c["slug"] == slug:
                return c

        # Check incubators
        all_inc = [_enrich_with_type(inc, "incubator") for inc in INCUBATORS]
        for c in all_inc:
            if c["slug"] == slug:
                return c

        # Check VC firms
        all_vcs = [_enrich_with_type(vc, "vc") for vc in VC_FIRMS]
        for c in all_vcs:
            if c["slug"] == slug:
                return c

        # try YC search
        try:
            payload = {"requests": [{"indexName": "YCCompany_production", "params": f"hitsPerPage=1&query={slug.replace('-', ' ')}"}]}
            url = "https://45bwzj1sgc-dsn.algolia.net/1/indexes/*/queries"
            headers = {
                "X-Algolia-API-Key": "NDYzYmNmMTRjN2ZiZjMzMGFmZjQ4YjU4NDc5ZmRjMDdmNDU3ODBkMDBmYWNkNzg5MTQ1NDg1NWVlZDFlMTBjZmZpbHRlcnM9JTI2dGFnVGltZW91dCUzRDE=",
                "X-Algolia-Application-Id": "45BWZJ1SGC",
                "Content-Type": "application/json",
            }
            async with httpx.AsyncClient(timeout=8.0) as cli:
                r = await cli.post(url, json=payload, headers=headers)
            hits = (r.json().get("results") or [{}])[0].get("hits", [])
            if hits:
                h = hits[0]
                return _enrich_with_type({
                    "name": h.get("name"),
                    "description": h.get("one_liner") or h.get("long_description"),
                    "industry": (h.get("industries") or [None])[0],
                    "location": h.get("all_locations") or "",
                    "domain": (h.get("website") or "").replace("https://", "").replace("http://", "").split("/")[0],
                    "website": h.get("website"),
                }, "startup")
        except Exception as e:
            logger.warning(f"Company detail fetch failed: {e}")
        raise HTTPException(status_code=404, detail="Company not found")

    return router
