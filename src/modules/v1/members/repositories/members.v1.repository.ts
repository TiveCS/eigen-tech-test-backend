import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '~lib/prisma/prisma.service';

@Injectable()
export class MembersV1Repository {
  constructor(private prisma: PrismaService) {}

  async findMany(includeBorrowedBooks = false) {
    return this.prisma.member.findMany({
      include: includeBorrowedBooks
        ? {
            _count: {
              select: { borrowedBooks: { where: { returnedAt: null } } },
            },
          }
        : undefined,
    });
  }

  async findByCode(code: string) {
    return this.prisma.member.findUnique({ where: { code } });
  }

  async create(data: Prisma.MemberCreateInput) {
    return this.prisma.member.create({ data, select: { code: true } });
  }
}
