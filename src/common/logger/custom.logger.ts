import { Injectable, LoggerService } from '@nestjs/common';
import { createLogger, format, transports } from 'winston';

@Injectable()
export class CustomLogger implements LoggerService {
  private logger = createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.errors({ stack: true }),
      format.printf(({ timestamp, level, message, context, ...meta }) => {
        const contextStr = context ? `[${context}]` : '';
        const metaStr = Object.keys(meta).length
          ? ` ${JSON.stringify(meta)}`
          : '';
        return `${timestamp} [${level.toUpperCase()}] ${contextStr} ${message}${metaStr}`;
      }),
    ),
    transports: [
      new transports.Console({
        format: format.combine(format.colorize(), format.simple()),
      }),
      new transports.File({
        filename: 'logs/app.log',
      }),
    ],
  });

  log(message: string, context?: string) {
    if (this.shouldSkipLog(message, context)) return;
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { context, trace });
  }

  warn(message: string, context?: string) {
    if (this.shouldSkipLog(message, context)) return;
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    if (this.shouldSkipLog(message, context)) return;
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    if (this.shouldSkipLog(message, context)) return;
    this.logger.verbose(message, { context });
  }

  // 라우트 매핑 로그 필터링 강화
  private shouldSkipLog(message: string, context?: string): boolean {
    // 시스템 로그 패턴들
    const skipPatterns = [
      'Mapped {', // 라우트 매핑
      'RoutesResolver', // 컨트롤러 등록
      'RouterExplorer', // 라우트 탐색
      'route +', // 라우트 시간
      'Controller {', // 컨트롤러 정보
    ];

    // context로도 필터링
    const skipContexts = [
      'RouterExplorer',
      'RoutesResolver',
      'InstanceLoader',
      'RoutesResolver',
    ];

    // 메시지나 컨텍스트가 스킵 대상인지 확인
    const shouldSkipByMessage = skipPatterns.some((pattern) =>
      message.includes(pattern),
    );

    const shouldSkipByContext = context && skipContexts.includes(context);

    if (!shouldSkipByContext) return true;
    return shouldSkipByMessage || shouldSkipByContext;
  }
}
