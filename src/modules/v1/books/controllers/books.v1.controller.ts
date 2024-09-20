import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BooksV1Service } from '../services';
import { CreateBookV1Dto } from '../dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('books')
@Controller({
  path: '/books',
  version: '1',
})
export class BooksV1Controller {
  constructor(private readonly booksService: BooksV1Service) {}

  @Get()
  async getBooks() {
    return this.booksService.getBooks();
  }

  @Get('/:code')
  @ApiResponse({ status: 200, description: 'Book found' })
  @ApiResponse({ status: 404, description: 'Book not found' })
  async getBookByCode(@Param('code') code: string) {
    return this.booksService.getBookByCode(code);
  }

  @Post()
  async createBook(@Body() dto: CreateBookV1Dto) {
    return this.booksService.createBook(dto);
  }
}