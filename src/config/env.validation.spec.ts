import { validate } from './env.validation';

describe('환경 변수 검증', () => {
  it('올바른 환경 변수는 검증에 통과해야 한다', () => {
    const validConfig = {
      DATABASE_URL: 'postgresql://user:password@localhost:5432/db',
      JWT_SECRET: 'secret',
      AWS_REGION: 'ap-northeast-2',
      AWS_ACCESS_KEY_ID: 'access-key',
      AWS_SECRET_ACCESS_KEY: 'secret-key',
      AWS_S3_BUCKET_NAME: 'bucket-name ',
      AWS_CLOUDFRONT_DOMAIN: 'cloudfront-domain',
      MAIL_USER: 'mail-user',
      MAIL_PASS: 'mail-pass',
      MAIL_FROM: 'mail-from',
      MAIL_TOKEN_EXPIRY: 15,
      PORT: 4000,
    };

    expect(() => validate(validConfig)).not.toThrow();
  });

  it('필수 환경 변수가 빠지면 에러를 던져야 한다', () => {
    const invalidConfig = {
      // DATABASE_URL missing
      JWT_SECRET: 'secret',
      AWS_REGION: 'ap-northeast-2',
      // AWS_ACCESS_KEY_ID missing
      AWS_SECRET_ACCESS_KEY: 'secret-key',
      AWS_S3_BUCKET_NAME: 'bucket-name',
      AWS_CLOUDFRONT_DOMAIN: 'cloudfront-domain',
      MAIL_USER: 'mail-user',
      MAIL_PASS: 'mail-pass',
      MAIL_FROM: 'mail-from',
    };

    expect(() => validate(invalidConfig)).toThrow();
  });

  it('선택 환경 변수는 기본값이 적용되어야 한다', () => {
    const config = {
      DATABASE_URL: 'postgresql://user:password@localhost:5432/db',
      JWT_SECRET: 'secret',
      AWS_REGION: 'ap-northeast-2',
      AWS_ACCESS_KEY_ID: 'access-key',
      AWS_SECRET_ACCESS_KEY: 'secret-key',
      AWS_S3_BUCKET_NAME: 'bucket-name',
      AWS_CLOUDFRONT_DOMAIN: 'cloudfront-domain',
      MAIL_USER: 'mail-user',
      MAIL_PASS: 'mail-pass',
      MAIL_FROM: 'mail-from',
    };

    const validatedConfig = validate(config);
    expect(validatedConfig.NODE_ENV).toBe('development');
    expect(validatedConfig.ENABLE_SWAGGER).toBe(true);
    expect(validatedConfig.PORT).toBe(4000);
  });

  it('잘못된 타입의 환경 변수는 에러를 던져야 한다', () => {
    const invalidConfig = {
      DATABASE_URL: 'postgresql://user:password@localhost:5432/db',
      JWT_SECRET: 'secret',
      AWS_REGION: 'ap-northeast-2',
      AWS_ACCESS_KEY_ID: 'access-key',
      AWS_SECRET_ACCESS_KEY: 'secret-key',
      AWS_S3_BUCKET_NAME: 'bucket-name',
      AWS_CLOUDFRONT_DOMAIN: 'cloudfront-domain',
      MAIL_USER: 'mail-user',
      MAIL_PASS: 'mail-pass',
      MAIL_FROM: 'mail-from',
      PORT: 'not-a-number', // should be number
    };

    expect(() => validate(invalidConfig)).toThrow();
  });
});
