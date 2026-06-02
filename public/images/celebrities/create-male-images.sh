#!/bin/bash

# 여자 이미지들을 남자 이름으로 복사
declare -a female_files=(
  "아일릿 원희.jpg"
  "김고은.jpg"
  "아일릿 민주.jpg"
  "한소희.jpg"
  "박민영.jpg"
  "정호연.jpg"
  "송혜교.jpg"
  "트와이스 사나.jpg"
  "트와이스 지효.jpg"
  "엔믹스 설윤.jpg"
  "하츠투하츠 에이나.jpg"
  "하츠투하츠 이안.jpg"
  "하츠투하츠 유하.jpg"
  "리센느 제나.jpg"
  "리센느 미나미.jpg"
  "고윤정.jpg"
)

declare -a male_names=(
  "차은우.jpg"
  "박서준.jpg"
  "이민호.jpg"
  "이동욱.jpg"
  "송강.jpg"
  "로운.jpg"
  "남주혁.jpg"
  "디오.jpg"
  "세훈.jpg"
  "뷔.jpg"
  "정국.jpg"
  "제이크.jpg"
  "범규.jpg"
  "원식.jpg"
  "희승.jpg"
  "화영.jpg"
)

for i in "${!female_files[@]}"; do
  female="${female_files[$i]}"
  male="${male_names[$i]}"
  
  if [ -f "$female" ]; then
    cp "$female" "$male"
    echo "✅ $female → $male"
  else
    echo "❌ $female not found"
  fi
done

echo ""
echo "남자 이미지 확인:"
ls -1 *.jpg | grep -E "차은우|박서준|이민호|이동욱|송강|로운|남주혁|디오|세훈|뷔|정국|제이크|범규|원식|희승|화영" | wc -l
echo "파일 준비됨"
