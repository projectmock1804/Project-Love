#!/bin/bash

mkdir -p "/c/Users/Administrator/Project Love/kin/public/images/celebrities"
BASE_DIR="/c/Users/Administrator/Project Love/kin/public/images/celebrities"

echo "다운로드 중..."

# 실제 위키피디아 연예인 이미지 직접 링크들
# Female celebrities
declare -a FEMALE_URLS=(
  "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Park_Shin-hye_from_acrofan.jpg/440px-Park_Shin-hye_from_acrofan.jpg"
  "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Kim_Go-eun_2019_by_Cha_Kyung-soo.jpg/440px-Kim_Go-eun_2019_by_Cha_Kyung-soo.jpg"
  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Kim_Hye-yoon_at_Dream_Concert_2019.jpg/440px-Kim_Hye-yoon_at_Dream_Concert_2019.jpg"
  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Han_So-hee_%283%29.jpg/440px-Han_So-hee_%283%29.jpg"
  "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Park_Min-young_in_2019.jpg/440px-Park_Min-young_in_2019.jpg"
  "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Jung_Ho-yeon_2021.jpg/440px-Jung_Ho-yeon_2021.jpg"
  "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Jisoo_2023_04.jpg/440px-Jisoo_2023_04.jpg"
  "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Jennie_2022.jpg/440px-Jennie_2022.jpg"
  "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Lisa_2022.jpg/440px-Lisa_2022.jpg"
  "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Rose_2021.jpg/440px-Rose_2021.jpg"
  "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Song_Hye-kyo_2018.jpg/440px-Song_Hye-kyo_2018.jpg"
  "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/IU_in_2019.jpg/440px-IU_in_2019.jpg"
  "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Suzy_2019.jpg/440px-Suzy_2019.jpg"
  "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Hanni_2023.jpg/440px-Hanni_2023.jpg"
  "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Hae-in_2023.jpg/440px-Hae-in_2023.jpg"
  "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Kim_Ji-won_2019.jpg/440px-Kim_Ji-won_2019.jpg"
)

# Male celebrities
declare -a MALE_URLS=(
  "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Cha_Eun-woo_2021.jpg/440px-Cha_Eun-woo_2021.jpg"
  "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Park_Seo-joon_in_2021.jpg/440px-Park_Seo-joon_in_2021.jpg"
  "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Lee_Min-ho_in_2020.jpg/440px-Lee_Min-ho_in_2020.jpg"
  "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Lee_Dong-wook_in_2017.jpg/440px-Lee_Dong-wook_in_2017.jpg"
  "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Song_Kang_2021.jpg/440px-Song_Kang_2021.jpg"
  "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Rowoon_2023.jpg/440px-Rowoon_2023.jpg"
  "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Nam_Joo-hyuk_2023.jpg/440px-Nam_Joo-hyuk_2023.jpg"
  "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/D.O_2022.jpg/440px-D.O_2022.jpg"
  "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Sehun_2023.jpg/440px-Sehun_2023.jpg"
  "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/V_BTS_2023.jpg/440px-V_BTS_2023.jpg"
  "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Jungkook_2023.jpg/440px-Jungkook_2023.jpg"
  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Jake_ENHYPEN_2023.jpg/440px-Jake_ENHYPEN_2023.jpg"
  "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Beomgyu_2023.jpg/440px-Beomgyu_2023.jpg"
  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Wonshik_SEVENTEEN_2023.jpg/440px-Wonshik_SEVENTEEN_2023.jpg"
  "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Heeseung_ENHYPEN_2023.jpg/440px-Heeseung_ENHYPEN_2023.jpg"
  "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Lee_Sung-kyung_2019.jpg/440px-Lee_Sung-kyung_2019.jpg"
)

# Download females
for i in "${!FEMALE_URLS[@]}"; do
  idx=$((i + 1))
  url="${FEMALE_URLS[$i]}"
  filename="$BASE_DIR/female_$idx.jpg"

  echo -n "[$idx/16] female_$idx.jpg ... "
  if curl -k -s -L -o "$filename" "$url" 2>/dev/null && file "$filename" | grep -q "image"; then
    size=$(stat -f%z "$filename" 2>/dev/null || stat -c%s "$filename" 2>/dev/null)
    echo "✓"
  else
    echo "✗"
  fi
done

# Download males
for i in "${!MALE_URLS[@]}"; do
  idx=$((i + 1))
  url="${MALE_URLS[$i]}"
  filename="$BASE_DIR/male_$idx.jpg"

  echo -n "[$idx/16] male_$idx.jpg ... "
  if curl -k -s -L -o "$filename" "$url" 2>/dev/null && file "$filename" | grep -q "image"; then
    size=$(stat -f%z "$filename" 2>/dev/null || stat -c%s "$filename" 2>/dev/null)
    echo "✓"
  else
    echo "✗"
  fi
done

echo ""
total=$(find "$BASE_DIR" -name "*.jpg" | wc -l)
echo "완료: $total/32 이미지"
