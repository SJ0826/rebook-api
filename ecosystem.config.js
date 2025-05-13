module.exports = {
  apps: [
    {
      name: 'rebook-api', // 애플리케이션 이름
      script: './dist/src/main.js', // 실행할 파일
      instances: 1, // 싱글 인스턴스 실행 (다중 실행 시 cluster 모드 사용)
      autorestart: true, // 크래시 발생 시 자동 재시작
      watch: false, // 코드 변경 감지 비활성화 (개발 모드에서는 true 가능)
      max_memory_restart: '300M', // 메모리 초과 시 재시작
      env: {
        // 💡 기본값 (개발 환경)
        NODE_ENV: 'development',
      },
      env_production: {
        // 💡 --env production 사용 시 적용 (운영 환경)
        NODE_ENV: 'production',
      },
    },
  ],
};
