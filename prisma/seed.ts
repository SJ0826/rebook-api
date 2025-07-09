import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

const prisma = new PrismaClient();
dotenv.config();

async function main() {
  const tagNames = [
    // 🧑‍💻 언어
    'JavaScript',
    'TypeScript',
    'Python',
    'Java',
    'Kotlin',
    'Swift',
    'Go',
    'C',
    'C++',
    'Rust',

    // 🏗 프레임워크 & 라이브러리
    'React',
    'Next.js',
    'Vue.js',
    'Nuxt',
    'NestJS',
    'Express',
    'Spring',
    'Django',
    'Flask',
    'FastAPI',
    'TailwindCSS',
    'Styled-components',

    // 🧠 CS 기초
    '자료구조',
    '알고리즘',
    '컴퓨터 구조',
    '운영체제',
    '네트워크',
    '데이터베이스',

    // ☁️ 인프라 & 백엔드
    'AWS',
    'Docker',
    'Kubernetes',
    'Linux',
    'Nginx',
    'MySQL',
    'PostgreSQL',
    'MongoDB',
    'Redis',
    'Kafka',
    'GraphQL',
    'REST API',

    // 🛠 개발 도구
    'Git',
    'CI/CD',
    'VSCode',
    'Jest',
    'Playwright',
    'Cypress',

    // 🎨 디자인 & UX
    'HTML/CSS',
    'Figma',
    'UI/UX',
    'Accessibility',

    // 📘 실용/기초
    '코딩인터뷰',
    '클린코드',
    '디자인패턴',
    'DDD',
    'TDD',
    '리팩토링',
    '애자일',
    'PM',
    '스타트업',
    '초보자 추천',
    '실전 프로젝트',

    // 🧩 기타
    '한국어',
    '영문판',
    '절판',
    '베스트셀러',
    '시험준비',
  ];

  for (const name of tagNames) {
    await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log(`🌱 총 ${tagNames.length}개의 태그가 등록되었습니다.`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
