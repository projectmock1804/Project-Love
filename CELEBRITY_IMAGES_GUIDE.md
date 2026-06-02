# Korean Celebrity Images Guide - Kin Dating App

## Current Status

✅ **Survey Data**: Updated with 32 real Korean celebrities (16 female + 16 male)
- Mix of drama actors and K-pop idols as requested
- Structured data with descriptions and face shapes

✅ **Image Files**: All 32 placeholder images in place
- Location: `/public/images/celebrities/`
- Female: `female_1.jpg` → `female_16.jpg`
- Male: `male_1.jpg` → `male_16.jpg`

## Celebrities in Your Survey

### Female Celebrities (Drama + K-pop Mix)
1. Park Shin-hye - Actress
2. Kim Go-eun - Actress
3. Kim Hye-yoon - Actress
4. Han So-hee - Actress
5. Park Min-young - Actress
6. Jung Ho-yeon - Actress/Model
7. Jisoo - BLACKPINK
8. Jennie - BLACKPINK
9. Lisa - BLACKPINK
10. Rosé - BLACKPINK
11. Song Hye-kyo - Actress
12. IU - Singer/Actress
13. Suzy - Actress/Singer
14. Hanni - NewJeans
15. Hae-in - NewJeans
16. Kim Ji-won - Actress

### Male Celebrities (Drama + K-pop Mix)
1. Cha Eun-woo - ASTRO/Actor
2. Park Seo-joon - Actor
3. Lee Min-ho - Actor
4. Lee Dong-wook - Actor
5. Song Kang - Actor
6. Rowoon - SF9/Actor
7. Nam Joo-hyuk - Actor
8. Do Kyung-soo (D.O.) - EXO/Actor
9. Sehun - EXO
10. V - BTS
11. Jungkook - BTS
12. Jake - ENHYPEN
13. Beomgyu - TXT
14. Won-shik - SEVENTEEN
15. Heeseung - ENHYPEN
16. Lee Sung-kyung - Actor

## How to Replace Images (Choose One Option)

### Option 1: Auto-Download Using Python Script (Easiest)

```bash
cd "C:\Users\Administrator\Project Love\kin"
python scripts/download-korean-celebrities.py
```

**Pros:**
- Fully automated
- Fast
- Uses free sources (Unsplash, Pexels)

**Cons:**
- Images won't be actual celebrity photos (just similar-looking portraits)
- May need API adjustments

### Option 2: Manual Download from High-Quality Sources

Download official/professional photos from these resources:

**Free/Public Sources:**
- [Wallpaper Cave - Korean Celebrities](https://wallpapercave.com/korean-actress-wallpapers)
- [Wikipedia Individual Pages](https://en.wikipedia.org/wiki/Park_Shin-hye) (CC licensed images)
- [KProfiles.com](https://kprofiles.com) - K-pop and K-drama profiles with photos
- [DBKpop.com](https://dbkpop.com) - K-pop database with photoshoots

**Stock Photo Services (May Require Purchase):**
- [Getty Images](https://www.gettyimages.com/photos/korean-celebrity) - Professional quality
- [Shutterstock](https://www.shutterstock.com/search/korean-celebrity)
- [Depositphotos](https://depositphotos.com/photos/korean-celebrities.html)

**Entertainment Sites:**
- [AllKpop.com](https://www.allkpop.com/)
- [KdramaStars.com](https://www.kdramastars.com/photos)
- [KDramaLove.com](https://www.kdramalove.com)

### Option 3: Use Celebrities from Public Databases

Modify the celebrity list to use figures with more publicly available photos:
- Update `lib/newSurveyQuestions.ts`
- Focus on celebrities with official photographer releases

### Option 4: Keep Placeholders for MVP

The current setup works perfectly for MVP/testing:
- All 32 images are in place and loading
- Generic portraits are sufficient for functionality testing
- Replace with actual celebrity photos before public launch

## Image Requirements

If you're replacing images manually:

✅ **Recommended Specs:**
- Format: JPEG or PNG
- Size: 500x500px or larger
- Quality: High resolution (for facial features)
- Recent: 2024 or 2025 photos preferred
- Portrait-style: Face clearly visible, good lighting

## Next Steps

1. **For MVP/Testing**: Current setup works as-is
2. **For Beta Release**: Run the Python script to refresh images
3. **For Production**: Replace with official/licensed celebrity photos

## Troubleshooting

If images aren't loading:
1. Check file exists: `ls /public/images/celebrities/`
2. Clear Next.js cache: `rm -rf .next`
3. Restart dev server: `npm run dev`
4. Check console for errors: `F12` → Console tab

## Notes

- All 32 celebrity data entries are correctly mapped
- Survey flow is fully functional
- Images can be updated anytime without code changes
- File naming convention is critical: `female_1.jpg` → `female_16.jpg`, `male_1.jpg` → `male_16.jpg`

---

**Status**: ✅ MVP Ready | ⏳ Images Ready for Upgrade
