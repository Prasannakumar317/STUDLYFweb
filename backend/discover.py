"""Discover endpoints — proxy + cache for YC companies and Hacker News stories.
No API keys required. Caches in-memory for 1 hour.
"""
import os
import time
import json
import asyncio
import logging
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
            items.append(_enrich({
                "name": h.get("name"),
                "description": h.get("one_liner"),
                "industry": (h.get("industries") or [None])[0],
                "location": h.get("all_locations") or (h.get("regions") or [""])[0],
                "domain": (h.get("website") or "").replace("https://", "").replace("http://", "").split("/")[0],
                "website": h.get("website"),
            }))
        if items:
            _set_cached(cache_key, items)
            return items
    except Exception as e:
        logger.warning(f"YC fetch failed: {e}")

    # fallback to curated when fetch fails or returns empty
    items = [_enrich(s) for s in CURATED_STARTUPS[:limit]]
    _set_cached(cache_key, items)
    return items


async def _fetch_hn_top(limit: int = 5):
    cache_key = f"hn:top:{limit}"
    cached = _get_cached(cache_key)
    if cached is not None:
        return cached

    try:
        async with httpx.AsyncClient(timeout=8.0) as cli:
            ids = (await cli.get("https://hacker-news.firebaseio.com/v0/topstories.json")).json() or []
            ids = ids[: limit * 3]  # over-fetch then filter
            tasks = [cli.get(f"https://hacker-news.firebaseio.com/v0/item/{i}.json") for i in ids]
            results = await asyncio.gather(*tasks, return_exceptions=True)
        items = []
        for r in results:
            if isinstance(r, Exception):
                continue
            it = r.json() or {}
            if not it.get("url") or not it.get("title"):
                continue
            host = it.get("url", "").replace("https://", "").replace("http://", "").split("/")[0]
            items.append({
                "title": it.get("title"),
                "url": it.get("url"),
                "source": host,
                "time": datetime.fromtimestamp(it.get("time", 0), tz=timezone.utc).isoformat(),
                "score": it.get("score"),
            })
            if len(items) >= limit:
                break
        _set_cached(cache_key, items)
        return items
    except Exception as e:
        logger.warning(f"HN fetch failed: {e}")
        return []


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

    @router.get("/stories")
    async def stories(limit: int = 5):
        items = await _fetch_hn_top(limit=limit)
        return {"items": items, "source": "Hacker News", "cached_for_seconds": CACHE_TTL}

    @router.get("/industries")
    async def industries():
        return {"items": INDUSTRIES}

    @router.get("/search")
    async def search(q: str = Query(..., min_length=1), limit: int = 8):
        # Search via the same YC Algolia endpoint
        cache_key = f"search:{q.lower()}:{limit}"
        cached = _get_cached(cache_key)
        if cached is not None:
            return {"items": cached, "q": q}
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
                items.append(_enrich({
                    "name": h.get("name"),
                    "description": h.get("one_liner"),
                    "industry": (h.get("industries") or [None])[0],
                    "location": h.get("all_locations") or "",
                    "domain": (h.get("website") or "").replace("https://", "").replace("http://", "").split("/")[0],
                    "website": h.get("website"),
                }))
        except Exception as e:
            logger.warning(f"Search failed: {e}")
        # also fuzzy-match curated as fallback / merge
        ql = q.lower()
        curated_matches = [
            _enrich(s) for s in CURATED_STARTUPS
            if ql in s["name"].lower() or ql in s["industry"].lower() or ql in s["location"].lower()
        ]
        # merge unique by slug
        seen = set()
        merged = []
        for it in items + curated_matches:
            if it["slug"] in seen:
                continue
            seen.add(it["slug"])
            merged.append(it)
            if len(merged) >= limit:
                break
        _set_cached(cache_key, merged)
        return {"items": merged, "q": q}

    @router.get("/company/{slug}")
    async def company_detail(slug: str):
        # Try to find via search by slug-as-query
        all_curated = [_enrich(s) for s in CURATED_STARTUPS]
        for c in all_curated:
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
                return _enrich({
                    "name": h.get("name"),
                    "description": h.get("one_liner") or h.get("long_description"),
                    "industry": (h.get("industries") or [None])[0],
                    "location": h.get("all_locations") or "",
                    "domain": (h.get("website") or "").replace("https://", "").replace("http://", "").split("/")[0],
                    "website": h.get("website"),
                })
        except Exception as e:
            logger.warning(f"Company detail fetch failed: {e}")
        raise HTTPException(status_code=404, detail="Company not found")

    return router
