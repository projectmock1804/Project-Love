#!/bin/bash

cd public/images/celebrities

# 매핑 배열
declare -A names=(
  ["female_1.jpg"]="아일릿 원희.jpg"
  ["female_2.jpg"]="김고은.jpg"
  ["female_3.jpg"]="아일릿 민주.jpg"
  ["female_4.jpg"]="한소희.jpg"
  ["female_5.jpg"]="박민영.jpg"
  ["female_6.jpg"]="정호연.jpg"
  ["female_7.jpg"]="송혜교.jpg"
  ["female_8.jpg"]="트와이스 사나.jpg"
  ["female_9.jpg"]="트와이스 지효.jpg"
  ["female_10.jpg"]="엔믹스 설윤.jpg"
  ["female_11.jpg"]="하츠투하츠 에이나.jpg"
  ["female_12.jpg"]="하츠투하츠 이안.jpg"
  ["female_13.jpg"]="하츠투하츠 유하.jpg"
  ["female_14.jpg"]="리센느 제나.jpg"
  ["female_15.jpg"]="리센느 미나미.jpg"
  ["female_16.jpg"]="고윤정.jpg"
)

# 리네이밍
for old_name in "${!names[@]}"; do
  new_name="${names[$old_name]}"
  if [ -f "$old_name" ]; then
    mv "$old_name" "$new_name"
    echo "✅ $old_name → $new_name"
  else
    echo "❌ $old_name not found"
  fi
done

echo ""
echo "파일 이름 확인:"
ls -1 *.jpg
