import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '~lib/prisma/prisma.module';
import { V1Module } from '~modules/v1/v1.module';

@Module({
  imports: [
    V1Module,
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
