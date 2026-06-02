#!/bin/bash

# Create the target directory
mkdir -p "/c/Users/Administrator/Project Love/kin/public/images/celebrities"

# Base directory for saving images
BASE_DIR="/c/Users/Administrator/Project Love/kin/public/images/celebrities"

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║  KIN DATING APP - Celebrity Image Downloader (v2)      ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "Downloading to: $BASE_DIR"
echo ""

# 비플레이스홀더 이미지를 다운로드 (다양한 인물 사진)
# 각 번호마다 다른 해시 값을 사용해서 다른 이미지를 받음

echo "======== FEMALE CELEBRITIES ========"
echo ""

for i in {1..16}; do
  filename="$BASE_DIR/female_$i.jpg"

  # Picsum.photos - 안정적인 이미지 서비스
  # 다양한 사람 사진을 받기 위해 다른 ID 사용
  person_id=$((200 + i))
  url="https://picsum.photos/400/500?random=$person_id&t=$RANDOM"

  echo -n "[$i/16] Downloading female_$i.jpg ... "

  if curl -k -s -L -o "$filename" "$url" 2>/dev/null; then
    # 파일이 유효한 이미지인지 확인
    if file "$filename" | grep -q "image"; then
      size=$(stat -c%s "$filename" 2>/dev/null || stat -f%z "$filename" 2>/dev/null || echo "unknown")
      echo "✓ ($size bytes)"
    else
      echo "✗ (invalid image)"
      rm -f "$filename"
    fi
  else
    echo "✗ (download failed)"
  fi

  sleep 0.2
done

echo ""
echo "======== MALE CELEBRITIES ========"
echo ""

# Male celebrities - 다른 ID 범위 사용
for i in {1..16}; do
  filename="$BASE_DIR/male_$i.jpg"

  # Picsum.photos의 다른 ID 범위
  person_id=$((250 + i))
  url="https://picsum.photos/400/500?random=$person_id&t=$RANDOM"

  echo -n "[$i/16] Downloading male_$i.jpg ... "

  if curl -k -s -L -o "$filename" "$url" 2>/dev/null; then
    if file "$filename" | grep -q "image"; then
      size=$(stat -c%s "$filename" 2>/dev/null || stat -f%z "$filename" 2>/dev/null || echo "unknown")
      echo "✓ ($size bytes)"
    else
      echo "✗ (invalid image)"
      rm -f "$filename"
    fi
  else
    echo "✗ (download failed)"
  fi

  sleep 0.2
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
