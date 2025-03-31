import * as sharp from 'sharp';

const pastelColors = [
  '#FACC15', // amber-400
  '#60A5FA', // blue-400
  '#34D399', // green-400
  '#FB7185', // rose-400
  '#A78BFA', // violet-400
  '#F472B6', // pink-400
  '#FCD34D', // yellow-300
  '#38BDF8', // sky-400
  '#FCA5A5', // red-300
];

function getRandomColor(): string {
  const index = Math.floor(Math.random() * pastelColors.length);
  return pastelColors[index];
}

export async function generateProfileImage(nickname: string): Promise<Buffer> {
  const firstChar = nickname[0] || '?';
  const backgroundColor = getRandomColor();

  const svg = `
  <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
    <circle cx="128" cy="128" r="128" fill="${backgroundColor}"/>
    <text x="50%" y="68%" font-size="128" font-family="sans-serif"
      fill="#fff" text-anchor="middle" dominant-baseline="middle">
      ${firstChar}
    </text>
  </svg>
`;

  // SVG → PNG 변환
  return sharp(Buffer.from(svg)).png().toBuffer();
}
