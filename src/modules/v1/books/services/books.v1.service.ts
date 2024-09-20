import { Injectable } from '@nestjs/common';
import { BooksV1Repository } from '../repositories';
import { CreateBookV1Dto } from '../dto';

@Injectable()
export class BooksV1Service {
  constructor(private readonly booksRepository: BooksV1Repository) {}

  async getBooks() {
    return this.booksRepository.findMany();
  }

  async getBookByCode(code: string) {
    return this.booksRepository.findByCode(code);
  }

  async createBook(dto: CreateBookV1Dto) {
    return this.booksRepository.create(dto);
  }
}
