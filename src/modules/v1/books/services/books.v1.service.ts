import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaClientError } from '~lib/prisma/prisma.error';
import { CreateBookV1Dto } from '../dto';
import { BooksV1Repository } from '../repositories';
import {
  CreateBookV1Result,
  GetBookByCodeV1Result,
  GetBooksV1Result,
} from '../types';

@Injectable()
export class BooksV1Service {
  constructor(private readonly booksRepository: BooksV1Repository) {}

  async getBooks(): Promise<GetBooksV1Result> {
    return this.booksRepository.findMany();
  }

  async getBookByCode(code: string): Promise<GetBookByCodeV1Result> {
    const book = await this.booksRepository.findByCode(code);

    if (!book) throw new NotFoundException('Book not found');

    return book;
  }

  async createBook(dto: CreateBookV1Dto): Promise<CreateBookV1Result> {
    try {
      const result = await this.booksRepository.create(dto);
      return { code: result.code };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === PrismaClientError.UniqueConstraintViolation) {
          throw new ConflictException('Book already exists');
        }
      }
      throw error;
    }
  }
}
