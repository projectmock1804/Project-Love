#!/bin/bash

# 여자 연예인: female_1 ~ female_16
declare -A female_mapping=(
  ["아일릿 원희.jpg"]="female_1.jpg"
  ["김고은.jpg"]="female_2.jpg"
  ["아일릿 민주.jpg"]="female_3.jpg"
  ["한소희.jpg"]="female_4.jpg"
  ["박민영.jpg"]="female_5.jpg"
  ["정호연.jpg"]="female_6.jpg"
  ["송혜교.jpg"]="female_7.jpg"
  ["트와이스 사나.jpg"]="female_8.jpg"
  ["트와이스 지효.jpg"]="female_9.jpg"
  ["엔믹스 설윤.jpg"]="female_10.jpg"
  ["하츠투하츠 에이나.jpg"]="female_11.jpg"
  ["하츠투하츠 이안.jpg"]="female_12.jpg"
  ["하츠투하츠 유하.jpg"]="female_13.jpg"
  ["리센느 제나.jpg"]="female_14.jpg"
  ["리센느 미나미.jpg"]="female_15.jpg"
  ["고윤정.jpg"]="female_16.jpg"
)

# 남자 연예인: male_1 ~ male_16
declare -A male_mapping=(
  ["차은우.jpg"]="male_1.jpg"
  ["박서준.jpg"]="male_2.jpg"
  ["이민호.jpg"]="male_3.jpg"
  ["이동욱.jpg"]="male_4.jpg"
  ["송강.jpg"]="male_5.jpg"
  ["로운.jpg"]="male_6.jpg"
  ["남주혁.jpg"]="male_7.jpg"
  ["디오.jpg"]="male_8.jpg"
  ["세훈.jpg"]="male_9.jpg"
  ["뷔.jpg"]="male_10.jpg"
  ["정국.jpg"]="male_11.jpg"
  ["제이크.jpg"]="male_12.jpg"
  ["범규.jpg"]="male_13.jpg"
  ["원식.jpg"]="male_14.jpg"
  ["희승.jpg"]="male_15.jpg"
  ["화영.jpg"]="male_16.jpg"
)

echo "여자 연예인 리네이밍..."
for old in "${!female_mapping[@]}"; do
  new="${female_mapping[$old]}"
  if [ -f "$old" ]; then
    mv "$old" "$new"
    echo "  ✅ $old → $new"
  fi
done

echo ""
echo "남자 연예인 리네이밍..."
for old in "${!male_mapping[@]}"; do
  new="${male_mapping[$old]}"
  if [ -f "$old" ]; then
    mv "$old" "$new"
    echo "  ✅ $old → $new"
  fi
done

echo ""
echo "final 파일 목록:"
ls -1 *.jpg | grep -E "^(female|male)_" | sort
