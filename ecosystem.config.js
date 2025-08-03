module.exports = {
  apps: [
    {
      name: 'rebook-api', // 애플리케이션 이름
      script: './dist/main.js', // 실행할 파일
      instances: 1, // 싱글 인스턴스 실행 (다중 실행 시 cluster 모드 사용)
      autorestart: true, // 크래시 발생 시 자동 재시작
      watch: false, // 코드 변경 감지 비활성화 (개발 모드에서는 true 가능)
      max_memory_restart: '300M', // 메모리 초과 시 재시작

      // 로그 설정 추가
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm Z',

      env: {
        // 기본값 (개발 환경)
        NODE_ENV: 'development',
        LOG_LEVEL: 'debug',
        DISABLE_NEST_LOGS: 'false',
        PORT: 3000,
      },
      env_production: {
        // 운영 환경 설정
        NODE_ENV: 'production',
        LOG_LEVEL: 'info',
        DISABLE_NEST_LOGS: 'true', //  NestJS 시스템 로그 비활성화
        PORT: 3000,
      },
    },
  ],
};
