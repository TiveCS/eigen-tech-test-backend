import { Module } from '@nestjs/common';
import { MembersV1Service } from './services';
import { MembersV1Controller } from './controllers';
import { MembersV1Repository } from './repositories';

@Module({
  providers: [MembersV1Service, MembersV1Repository],
  controllers: [MembersV1Controller],
  exports: [MembersV1Service, MembersV1Repository],
})
export class MembersV1Module {}
