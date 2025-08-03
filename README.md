# 리북(Re-Book)

## ◾ 프로젝트 개요

**Re-Book**은 중고 책 거래 플랫폼입니다.  
사용자는 중고 책을 등록하고 판매하거나, 다른 사용자의 책을 구매할 수 있으며,  
거래 중에는 **실시간 채팅**을 통해 판매자와 소통할 수 있습니다.

- 중고책 등록 및 수정/삭제
- 찜하기(즐겨찾기)
- 거래 요청(Order) 및 진행 상태 관리
- 실시간 채팅 (Socket.IO)
- 이메일 인증 기반 회원가입
- AWS S3 이미지 업로드
- 관리자용 Swagger API 문서 자동 생성

## 🧱 기술 스택

**백엔드 프레임워크**: NestJS (v11)  
**러닝타임 & 언어**: Node.js, TypeScript  
**데이터베이스**: PostgreSQL + Prisma ORM  
**인증**: JWT, Passport  
**파일 업로드**: AWS S3, multer, sharp  
**실시간 기능**: WebSocket (Socket.IO) 기반 채팅  
**배포**: EC2 (Backend), Amplify (Frontend), S3, CloudFront  
**기타 도구**: dotenv, cookie-parser, cors, nodemailer 등  
**스타일링 및 린팅**: ESLint, Prettier

## 🔗 데모 링크

📦 [👉 ReBook 중고책 거래 서비스 바로가기](https://rebook-v2.d2nh4o8zioz2s8.amplifyapp.com/)

## ◾ DataBase ERD

![img_3.png](/src/public/images/erd.png)

## 📁 주요 폴더 구조

```shell
src/
├── auth/                # 로그인, 회원가입, JWT 토큰 관리
├── user/                # 유저 프로필, 찜하기 관리
├── book/                # 책 등록, 조회, 수정, 삭제
├── order/               # 거래(주문) 생성 및 관리
├── chat/                # 채팅방, 메시지 송수신
├── common/              # 공통 DTO, 필터, 인터셉터, 유틸
├── prisma/              # Prisma Client, 시드 데이터
├── config/              # 환경 변수 및 설정 파일
└── main.ts              # 애플리케이션 진입점
```

## 📚 블로그 포스팅

* [📝 [NestJS] 내가 EC2서버에서 CORS 에러지옥에 갇혔던 이유(는 NGINX) + EC2/NextJS/PM2 배포 가이드](https://sj0826.github.io/nestjs/nestjs-%EB%82%B4%EA%B0%80-EC2%EC%84%9C%EB%B2%84%EC%97%90%EC%84%9C-CORS-%EC%97%90%EB%9F%AC%EC%A7%80%EC%98%A5%EC%97%90-%EA%B0%87%ED%98%94%EB%8D%98-%EC%9D%B4%EC%9C%A0(%EB%8A%94-NginX)/)
* [📝 [NestJS] NestJS에서 Socket.IO 연결 시 404 에러가 발생하는 이유](https://sj0826.github.io/nestjs/nestjs-NestJS%EC%97%90%EC%84%9C-Socket.IO-%EC%97%B0%EA%B2%B0-%EC%8B%9C-404-%EC%97%90%EB%9F%AC%EA%B0%80-%EB%B0%9C%EC%83%9D%ED%95%9C-%EC%9D%B4%EC%9C%A0/)
* [📝 RefreshToken을 왜 쿠키에 저장해야할까?](https://sj0826.github.io/network/network-RefreshToken%EC%9D%84-%EC%99%9C-%EC%BF%A0%ED%82%A4%EC%97%90-%EC%A0%80%EC%9E%A5%ED%95%B4%EC%95%BC%ED%95%A0%EA%B9%8C/)