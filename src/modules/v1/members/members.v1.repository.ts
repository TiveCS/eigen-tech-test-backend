import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '~lib/prisma/prisma.service';

@Injectable()
export class MembersV1Repository {
  constructor(private prisma: PrismaService) {}

  async findMany() {
    return this.prisma.member.findMany();
  }

  async findByCode(code: string) {
    return this.prisma.member.findUnique({ where: { code } });
  }

  async create(data: Prisma.MemberCreateInput) {
    return this.prisma.member.create({ data });
  }
}
