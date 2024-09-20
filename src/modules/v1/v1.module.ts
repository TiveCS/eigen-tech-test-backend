import { Module } from '@nestjs/common';
import { MembersV1Module } from './members/members.v1.module';
import { BooksV1Module } from './books/books.v1.module';

@Module({
  imports: [MembersV1Module, BooksV1Module],
})
export class V1Module {}
