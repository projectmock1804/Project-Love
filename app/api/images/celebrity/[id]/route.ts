export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F',
    '#BB8FCE', '#85C1E2', '#F8B88B', '#A8E6CF', '#FFD3B6', '#FFAAA5',
    '#FF8B94', '#A8D8EA', '#AA96DA', '#FCBAD3'
  ];

  const names = [
    'Park Shin-hye', 'Kim Go-eun', 'Kim Hye-yoon', 'Han So-hee',
    'Park Min-young', 'Jung Ho-yeon', 'Jisoo', 'Jennie',
    'Lisa', 'Rosé', 'Song Hye-kyo', 'IU',
    'Suzy', 'Hanni', 'Hae-in', 'Kim Ji-won'
  ];

  // Parse id like "female_1"
  const [_type, numStr] = id.split('_');
  const num = parseInt(numStr) - 1;

  if (num < 0 || num >= 16) {
    return new Response('Not found', { status: 404 });
  }

  const color1 = colors[num];
  const color2 = colors[(num + 1) % 16];
  const name = names[num];

  const svg = `
    <svg width="400" height="500" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="400" height="500" fill="url(#grad)"/>
      <circle cx="200" cy="150" r="60" fill="rgba(255,255,255,0.3)"/>
      <circle cx="200" cy="150" r="50" fill="rgba(255,255,255,0.5)"/>
      <text x="200" y="400" font-size="18" text-anchor="middle" fill="white" font-weight="bold" font-family="Arial">${name}</text>
    </svg>
  `;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
