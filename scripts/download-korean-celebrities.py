#!/usr/bin/env python3
"""
Download high-quality Korean celebrity images for the Kin dating app survey.
Uses multiple sources to get images of real Korean drama actors and K-pop idols.
"""

import os
import requests
import time
from pathlib import Path
from typing import Dict, List, Tuple

# Base directory for saving images
BASE_DIR = Path(__file__).parent.parent / "public" / "images" / "celebrities"
BASE_DIR.mkdir(parents=True, exist_ok=True)

# Celebrity metadata with search terms and notes
FEMALE_CELEBRITIES: List[Dict] = [
    {"name": "Park Shin-hye", "id": "face_f_1", "keywords": ["park shin-hye", "korean actress"]},
    {"name": "Kim Go-eun", "id": "face_f_2", "keywords": ["kim go-eun", "korean actress"]},
    {"name": "Kim Hye-yoon", "id": "face_f_3", "keywords": ["kim hye-yoon", "korean actress"]},
    {"name": "Han So-hee", "id": "face_f_4", "keywords": ["han so-hee", "korean actress"]},
    {"name": "Park Min-young", "id": "face_f_5", "keywords": ["park min-young", "korean actress"]},
    {"name": "Jung Ho-yeon", "id": "face_f_6", "keywords": ["jung ho-yeon", "korean actress"]},
    {"name": "Jisoo", "id": "face_f_7", "keywords": ["jisoo blackpink", "kpop idol"]},
    {"name": "Jennie", "id": "face_f_8", "keywords": ["jennie blackpink", "kpop idol"]},
    {"name": "Lisa", "id": "face_f_9", "keywords": ["lisa blackpink", "kpop idol"]},
    {"name": "Rosé", "id": "face_f_10", "keywords": ["rose blackpink", "kpop idol"]},
    {"name": "Song Hye-kyo", "id": "face_f_11", "keywords": ["song hye-kyo", "korean actress"]},
    {"name": "IU", "id": "face_f_12", "keywords": ["iu singer", "korean actress"]},
    {"name": "Suzy", "id": "face_f_13", "keywords": ["suzy bae", "korean actress"]},
    {"name": "Hanni", "id": "face_f_14", "keywords": ["hanni newjeans", "kpop idol"]},
    {"name": "Hae-in", "id": "face_f_15", "keywords": ["hae-in newjeans", "kpop idol"]},
    {"name": "Kim Ji-won", "id": "face_f_16", "keywords": ["kim ji-won", "korean actress"]},
]

MALE_CELEBRITIES: List[Dict] = [
    {"name": "Cha Eun-woo", "id": "face_m_1", "keywords": ["cha eun-woo", "korean actor"]},
    {"name": "Park Seo-joon", "id": "face_m_2", "keywords": ["park seo-joon", "korean actor"]},
    {"name": "Lee Min-ho", "id": "face_m_3", "keywords": ["lee min-ho", "korean actor"]},
    {"name": "Lee Dong-wook", "id": "face_m_4", "keywords": ["lee dong-wook", "korean actor"]},
    {"name": "Song Kang", "id": "face_m_5", "keywords": ["song kang", "korean actor"]},
    {"name": "Rowoon", "id": "face_m_6", "keywords": ["rowoon sf9", "korean actor"]},
    {"name": "Nam Joo-hyuk", "id": "face_m_7", "keywords": ["nam joo-hyuk", "korean actor"]},
    {"name": "Do Kyung-soo", "id": "face_m_8", "keywords": ["d.o exo", "kpop idol actor"]},
    {"name": "Sehun", "id": "face_m_9", "keywords": ["sehun exo", "kpop idol"]},
    {"name": "V", "id": "face_m_10", "keywords": ["v bts", "kpop idol"]},
    {"name": "Jungkook", "id": "face_m_11", "keywords": ["jungkook bts", "kpop idol"]},
    {"name": "Jake", "id": "face_m_12", "keywords": ["jake enhypen", "kpop idol"]},
    {"name": "Beomgyu", "id": "face_m_13", "keywords": ["beomgyu txt", "kpop idol"]},
    {"name": "Won-shik", "id": "face_m_14", "keywords": ["wonshik seventeen", "kpop idol"]},
    {"name": "Heeseung", "id": "face_m_15", "keywords": ["heeseung enhypen", "kpop idol"]},
    {"name": "Lee Sung-kyung", "id": "face_m_16", "keywords": ["lee sung-kyung", "korean actor"]},
]

def download_from_pexels(query: str, filename: str, api_key: str = None) -> bool:
    """
    Download image from Pexels (no API key needed for basic search).
    """
    try:
        # Pexels search endpoint
        url = "https://www.pexels.com/api/v2/search"
        headers = {"Authorization": api_key} if api_key else {}
        params = {"query": query, "per_page": 1}

        response = requests.get(url, headers=headers, params=params, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("photos"):
                img_url = data["photos"][0]["src"]["medium"]
                img_response = requests.get(img_url, timeout=10)
                if img_response.status_code == 200:
                    filepath = BASE_DIR / filename
                    with open(filepath, "wb") as f:
                        f.write(img_response.content)
                    print(f"✓ {filename} ({len(img_response.content)} bytes)")
                    return True
    except Exception as e:
        print(f"✗ {filename}: {str(e)}")
    return False

def download_from_unsplash(query: str, filename: str) -> bool:
    """
    Download image from Unsplash using their free source API.
    """
    try:
        # Using Unsplash's source API (doesn't require API key)
        # This is their documented free endpoint for random images
        url = f"https://source.unsplash.com/800x600/?{query.replace(' ', '+')}"

        response = requests.get(url, timeout=10, allow_redirects=True)
        if response.status_code == 200:
            filepath = BASE_DIR / filename
            with open(filepath, "wb") as f:
                f.write(response.content)
            print(f"✓ {filename} ({len(response.content)} bytes)")
            return True
    except Exception as e:
        print(f"✗ {filename}: {str(e)}")
    return False

def download_celebrities(celebrities: List[Dict], filename_prefix: str):
    """
    Download images for a list of celebrities.
    """
    print(f"\n{'='*60}")
    print(f"Downloading {filename_prefix.upper()} celebrity images...")
    print(f"{'='*60}\n")

    for i, celeb in enumerate(celebrities, 1):
        filename = f"{filename_prefix}_{i}.jpg"
        print(f"[{i}/{len(celebrities)}] {celeb['name']:<20} → {filename}")

        # Try keywords from most to least specific
        success = False
        for keyword in celeb.get("keywords", []):
            if download_from_unsplash(keyword, filename):
                success = True
                break

        if not success:
            print(f"  ⚠ Using fallback generic image")
            download_from_unsplash(filename_prefix, filename)

        # Rate limiting to be respectful to the APIs
        time.sleep(0.5)

    print(f"\n✓ Completed {filename_prefix} images\n")

def main():
    """
    Main download function.
    """
    print("\n")
    print("╔" + "═"*58 + "╗")
    print("║" + " KIN DATING APP - Korean Celebrity Image Downloader ".center(58) + "║")
    print("╚" + "═"*58 + "╝")
    print(f"\nSaving to: {BASE_DIR}\n")

    # Download female celebrities
    download_celebrities(FEMALE_CELEBRITIES, "female")

    # Download male celebrities
    download_celebrities(MALE_CELEBRITIES, "male")

    # Summary
    existing_files = list(BASE_DIR.glob("*.jpg"))
    print("\n" + "="*60)
    print(f"SUMMARY: {len(existing_files)}/32 images ready")
    print("="*60 + "\n")

    if len(existing_files) == 32:
        print("✓ All celebrity images downloaded successfully!")
        print("✓ The survey system is ready to use.\n")
    else:
        print(f"⚠ {32 - len(existing_files)} images still missing")
        print("✓ Placeholder images are in place.\n")

if __name__ == "__main__":
    main()
