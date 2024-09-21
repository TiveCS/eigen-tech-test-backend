import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateBookV1Dto } from '../dto';
import { BooksV1Service } from '../services';

@ApiTags('books')
@Controller({
  path: '/books',
  version: '1',
})
export class BooksV1Controller {
  constructor(private readonly booksService: BooksV1Service) {}

  @Get()
  @ApiOkResponse({ description: 'Books found' })
  async getBooks() {
    return this.booksService.getBooks();
  }

  @Get('/:code')
  @ApiOkResponse({ description: 'Book found' })
  @ApiNotFoundResponse({ description: 'Book not found' })
  async getBookByCode(@Param('code') code: string) {
    return this.booksService.getBookByCode(code);
  }

  @Post()
  @ApiCreatedResponse({ description: 'Book successfully created' })
  @ApiConflictResponse({ description: 'Book with code already exists' })
  async createBook(@Body() dto: CreateBookV1Dto) {
    return this.booksService.createBook(dto);
  }
}
