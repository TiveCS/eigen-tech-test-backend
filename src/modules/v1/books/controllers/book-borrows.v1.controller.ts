import { getLocalTimeZone, now } from '@internationalized/date';
import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BorrowBookV1Dto } from '../dto';
import { BookBorrowsV1Service } from '../services';

@ApiTags('book-borrows')
@Controller({
  path: '/book-borrows',
  version: '1',
})
export class BookBorrowsV1Controller {
  constructor(private readonly bookBorrowsService: BookBorrowsV1Service) {}

  @Post()
  @ApiCreatedResponse({ description: 'Book successfully borrowed' })
  @ApiConflictResponse({ description: 'Book already borrowed by member' })
  @ApiForbiddenResponse({ description: 'Member is penalized' })
  @ApiNotFoundResponse({ description: 'Member or book not found' })
  async borrowBook(@Body() dto: BorrowBookV1Dto) {
    return this.bookBorrowsService.borrowBook(dto);
  }

  @Patch('/:borrowId')
  @ApiOkResponse({ description: 'Book successfully returned' })
  @ApiConflictResponse({ description: 'Book already returned' })
  @ApiNotFoundResponse({ description: 'Borrow data not found' })
  async returnBook(@Param('borrowId') borrowId: string) {
    return this.bookBorrowsService.returnBook(
      borrowId,
      now(getLocalTimeZone()).toDate(),
    );
  }
}
