export interface DatabaseConfig {
  url: string;
}

export interface JwtConfig {
  secret: string;
  accessTokenExpiry: string;
  refreshTokenExpiry: string;
}

export interface AwsConfig {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  s3Bucket: string;
  cloudFontDomain: string;
}

export interface MailConfig {
  user: string;
  pass: string;
  from: string;
  tokenExpiry: number;
}

export interface AppConfig {
  nodeEnv: string;
  enableSwagger: boolean;
  port: number;
}

export interface Config {
  database: DatabaseConfig;
  jwt: JwtConfig;
  aws: AwsConfig;
  mail: MailConfig;
  app: AppConfig;
}
