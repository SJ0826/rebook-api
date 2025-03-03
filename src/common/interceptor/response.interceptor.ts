import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ResponseDto } from '../dto/response.dto';
import { map, Observable } from 'rxjs';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ResponseDto<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ResponseDto<T>> {
    const httpResponse = context.switchToHttp().getResponse();
    return next.handle().pipe(
      map((data) => {
        return new ResponseDto(true, '성공', data);
      }),
    );
  }
}
