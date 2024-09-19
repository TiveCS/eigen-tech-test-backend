import { Module } from '@nestjs/common';
import { MembersV1Service } from './members.v1.service';
import { MembersV1Controller } from './members.v1.controller';
import { MembersV1Repository } from './members.v1.repository';

@Module({
  providers: [MembersV1Service, MembersV1Repository],
  controllers: [MembersV1Controller],
  exports: [MembersV1Service, MembersV1Repository],
})
export class MembersV1Module {}
