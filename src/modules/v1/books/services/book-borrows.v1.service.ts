import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaClientError } from '~lib/prisma/prisma.error';
import { MembersV1Service } from '~modules/v1/members/services';
import { BorrowBookV1Dto } from '../dto';
import { BookBorrowsV1Repository } from '../repositories';
import { BorrowBookV1Result, ReturnBookV1Result } from '../types';

@Injectable()
export class BookBorrowsV1Service {
  constructor(
    private readonly bookBorrowsRepository: BookBorrowsV1Repository,
    private readonly membersService: MembersV1Service,
  ) {}

  async borrowBook(dto: BorrowBookV1Dto): Promise<BorrowBookV1Result> {
    const isMemberPenalized = await this.membersService.checkPenalized(
      dto.memberCode,
    );

    if (isMemberPenalized) {
      throw new ForbiddenException('Cannot borrow book. Member is penalized');
    } else {
      await this.membersService.forgiveMember(dto.memberCode);
    }

    const foundBorrowData =
      await this.bookBorrowsRepository.findByMemberAndBookCode(dto);

    if (foundBorrowData)
      throw new ConflictException('Book already borrowed by this member');

    try {
      const [borrowData] = await this.bookBorrowsRepository.createBorrow(dto);
      return borrowData;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === PrismaClientError.ForeignKeyViolation) {
          throw new NotFoundException('Member or book not found');
        }
      }
      throw error;
    }
  }

  async returnBook(
    borrowId: string,
    returnedAt: Date,
  ): Promise<ReturnBookV1Result> {
    const foundBorrowData = await this.bookBorrowsRepository.findById(borrowId);

    if (!foundBorrowData) throw new NotFoundException('Borrow data not found');

    if (foundBorrowData.returnedAt)
      throw new ConflictException('Book already returned');

    let penalizedUntil: Date | null = null;
    const isShouldPenalized = foundBorrowData.dueDate < returnedAt;

    if (isShouldPenalized) {
      const penalizedMember = await this.membersService.penalizeMember(
        foundBorrowData.memberCode,
      );

      penalizedUntil = penalizedMember.penalizedUntil;
    }

    const updatedBorrowData =
      await this.bookBorrowsRepository.updateReturnedAt(borrowId);

    return {
      returnedAt: updatedBorrowData.returnedAt,
      penalizedUntil,
    };
  }
}
