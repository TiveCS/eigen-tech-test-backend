import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '~lib/prisma/prisma.service';

@Injectable()
export class BooksV1Repository {
  constructor(private prisma: PrismaService) {}

  async findMany() {
    return this.prisma.book.findMany();
  }

  async findByCode(code: string) {
    return this.prisma.book.findUnique({ where: { code } });
  }

  async create(data: Prisma.BookCreateInput) {
    return this.prisma.book.create({ data });
  }
}
