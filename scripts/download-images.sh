#!/bin/bash

# Create the target directory
mkdir -p "/c/Users/Administrator/Project Love/kin/public/images/celebrities"

# Base directory for saving images
BASE_DIR="/c/Users/Administrator/Project Love/kin/public/images/celebrities"

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║  KIN DATING APP - Celebrity Image Downloader           ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "Downloading to: $BASE_DIR"
echo ""

# Female celebrities with Unsplash search terms
declare -a FEMALE_CELEBS=(
  "park shin-hye korean actress"
  "kim go-eun korean actress"
  "kim hye-yoon korean actress"
  "han so-hee korean actress"
  "park min-young korean actress"
  "jung ho-yeon korean actress"
  "jisoo blackpink"
  "jennie blackpink"
  "lisa blackpink"
  "rose blackpink"
  "song hye-kyo korean actress"
  "iu singer"
  "suzy korean actress"
  "hanni newjeans"
  "hae-in newjeans"
  "kim ji-won korean actress"
)

# Male celebrities with Unsplash search terms
declare -a MALE_CELEBS=(
  "cha eun-woo korean actor"
  "park seo-joon korean actor"
  "lee min-ho korean actor"
  "lee dong-wook korean actor"
  "song kang korean actor"
  "rowoon sf9"
  "nam joo-hyuk korean actor"
  "d.o exo"
  "sehun exo"
  "v bts"
  "jungkook bts"
  "jake enhypen"
  "beomgyu txt"
  "wonshik seventeen"
  "heeseung enhypen"
  "lee sung-kyung korean actress"
)

# Download female celebrities
echo "======== FEMALE CELEBRITIES ========"
echo ""

for i in "${!FEMALE_CELEBS[@]}"; do
  num=$((i + 1))
  celeb="${FEMALE_CELEBS[$i]}"
  filename="$BASE_DIR/female_$num.jpg"

  # Convert search term to URL format
  search_query=$(echo "$celeb" | sed 's/ /+/g')
  url="https://source.unsplash.com/800x600/?$search_query"

  echo -n "[$num/16] $celeb ... "

  if curl -k -s -L -o "$filename" "$url" 2>/dev/null; then
    if [ -s "$filename" ]; then
      size=$(stat -c%s "$filename" 2>/dev/null || stat -f%z "$filename" 2>/dev/null || echo "unknown")
      echo "✓ ($size bytes)"
    else
      echo "✗ (empty file)"
      rm -f "$filename"
    fi
  else
    echo "✗ (download failed)"
  fi

  # Rate limiting
  sleep 0.3
done

echo ""
echo "======== MALE CELEBRITIES ========"
echo ""

# Download male celebrities
for i in "${!MALE_CELEBS[@]}"; do
  num=$((i + 1))
  celeb="${MALE_CELEBS[$i]}"
  filename="$BASE_DIR/male_$num.jpg"

  # Convert search term to URL format
  search_query=$(echo "$celeb" | sed 's/ /+/g')
  url="https://source.unsplash.com/800x600/?$search_query"

  echo -n "[$num/16] $celeb ... "

  if curl -k -s -L -o "$filename" "$url" 2>/dev/null; then
    if [ -s "$filename" ]; then
      size=$(stat -c%s "$filename" 2>/dev/null || stat -f%z "$filename" 2>/dev/null || echo "unknown")
      echo "✓ ($size bytes)"
    else
      echo "✗ (empty file)"
      rm -f "$filename"
    fi
  else
    echo "✗ (download failed)"
  fi

  # Rate limiting
  sleep 0.3
done

echo ""
echo "======== SUMMARY ========"

# Count downloaded files
total=$(find "$BASE_DIR" -name "*.jpg" | wc -l)
echo "Downloaded: $total/32 images"
echo "Location: $BASE_DIR"
echo ""

if [ "$total" -eq 32 ]; then
  echo "✓ All celebrity images downloaded successfully!"
else
  echo "⚠ Some images may be missing or failed to download"
fi

echo ""
