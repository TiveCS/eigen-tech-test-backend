import { getLocalTimeZone, now } from '@internationalized/date';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MembersV1Service } from '~modules/v1/members/services';
import { BorrowBookV1Dto } from '../dto';
import { BookBorrowsV1Repository } from '../repositories';
import { Prisma } from '@prisma/client';
import { PrismaClientError } from '~lib/prisma/prisma.error';

@Injectable()
export class BookBorrowsV1Service {
  constructor(
    private readonly bookBorrowsRepository: BookBorrowsV1Repository,
    private readonly membersService: MembersV1Service,
  ) {}

  async borrowBook(dto: BorrowBookV1Dto) {
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
      throw new BadRequestException('Book already borrowed by this member');

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

  async returnBook(borrowId: string) {
    const foundBorrowData = await this.bookBorrowsRepository.findById(borrowId);

    if (!foundBorrowData) throw new NotFoundException('Borrow data not found');

    if (foundBorrowData.returnedAt)
      throw new BadRequestException('Book already returned');

    const nowTime = now(getLocalTimeZone());

    let penalizedUntil: Date | null = null;
    if (foundBorrowData.dueDate < nowTime.toDate()) {
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
