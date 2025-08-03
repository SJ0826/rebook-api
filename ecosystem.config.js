module.exports = {
  apps: [
    {
      name: 'rebook-api',
      script: './dist/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',

      // 로그 설정
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm Z',

      // 기본 환경변수를 프로덕션용으로 설정
      env: {
        NODE_ENV: 'production', // 기본값을 production으로
        LOG_LEVEL: 'info',
        DISABLE_NEST_LOGS: 'true', // 시스템 로그 비활성화
        PORT: 3000,
      },
      env_development: {
        NODE_ENV: 'development',
        LOG_LEVEL: 'debug',
        DISABLE_NEST_LOGS: 'false',
        PORT: 3000,
      },
    },
  ],
};
