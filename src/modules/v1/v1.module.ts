import { Module } from '@nestjs/common';
import { MembersV1Module } from './members/members.v1.module';

@Module({
  imports: [MembersV1Module],
})
export class V1Module {}
