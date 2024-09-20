import { getLocalTimeZone, now } from '@internationalized/date';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '~lib/prisma/prisma.service';
import { BorrowBookV1Dto } from '../dto';

@Injectable()
export class BookBorrowsV1Repository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.borrowedBook.findUnique({ where: { id } });
  }

  async findByMemberAndBookCode({
    memberCode,
    bookCode,
  }: {
    memberCode: string;
    bookCode: string;
  }) {
    return this.prisma.borrowedBook.findFirst({
      where: {
        memberCode,
        bookCode,
        returnedAt: { equals: null },
      },
    });
  }

  async createBorrow({ bookCode, memberCode }: BorrowBookV1Dto) {
    const nowTime = now(getLocalTimeZone());

    return this.prisma.$transaction([
      this.prisma.borrowedBook.create({
        data: {
          memberCode,
          bookCode,
          borrowedAt: nowTime.toDate(),
          dueDate: nowTime.add({ days: 7 }).toDate(),
        },
        select: { id: true, borrowedAt: true, dueDate: true },
      }),
      this.prisma.book.update({
        where: { code: bookCode },
        data: { stock: { decrement: 1 } },
      }),
    ]);
  }

  async updateReturnedAt(id: string) {
    return this.prisma.borrowedBook.update({
      where: { id },
      data: {
        returnedAt: now(getLocalTimeZone()).toDate(),
        book: { update: { stock: { increment: 1 } } },
      },
    });
  }
}
