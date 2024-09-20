import { Module } from '@nestjs/common';
import { BookBorrowsV1Controller, BooksV1Controller } from './controllers';
import { BookBorrowsV1Service, BooksV1Service } from './services';
import { BookBorrowsV1Repository, BooksV1Repository } from './repositories';
import { MembersV1Module } from '../members/members.v1.module';

@Module({
  imports: [MembersV1Module],
  controllers: [BooksV1Controller, BookBorrowsV1Controller],
  providers: [
    BooksV1Service,
    BooksV1Repository,
    BookBorrowsV1Service,
    BookBorrowsV1Repository,
  ],
})
export class BooksV1Module {}
