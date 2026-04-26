import { Global, Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'

@Global()
@Module({
  imports: [
    HttpModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        timeout: config.get<number>('HTTP_TIMEOUT', 5000),
        maxRedirects: config.get<number>('HTTP_MAX_REDIRECTS', 5),
      }),
    }),
  ],
  exports: [HttpModule],
})
export class GlobalHttpModule {}