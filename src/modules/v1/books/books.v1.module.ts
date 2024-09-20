import { Module } from '@nestjs/common';
import { BooksV1Controller } from './controllers';
import { BooksV1Service } from './services';
import { BooksV1Repository } from './repositories';

@Module({
  controllers: [BooksV1Controller],
  providers: [BooksV1Service, BooksV1Repository],
  exports: [BooksV1Service, BooksV1Repository],
})
export class BooksV1Module {}
