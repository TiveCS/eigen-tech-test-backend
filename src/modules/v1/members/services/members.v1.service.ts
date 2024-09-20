import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MembersV1Repository } from '../repositories';
import { CreateMemberV1Dto } from '../dto';
import {
  CreateMemberV1Result,
  GetMemberByCodeV1Result,
  GetMembersV1Result,
} from '../types';
import { Prisma } from '@prisma/client';
import { PrismaClientError } from '~lib/prisma/prisma.error';
import { getLocalTimeZone, now } from '@internationalized/date';

@Injectable()
export class MembersV1Service {
  constructor(private readonly membersRepository: MembersV1Repository) {}

  async getMembers(): Promise<GetMembersV1Result> {
    const members = await this.membersRepository.findMany(true);

    return members.map((member) => ({
      code: member.code,
      name: member.name,
      borrowedBooks: member._count.borrowedBooks,
    }));
  }

  async getMemberByCode(code: string): Promise<GetMemberByCodeV1Result> {
    const member = await this.membersRepository.findByCode(code, {
      includeBorrowedBooks: true,
    });

    if (!member) throw new NotFoundException('Member not found');

    return member;
  }

  async createMember(data: CreateMemberV1Dto): Promise<CreateMemberV1Result> {
    try {
      return await this.membersRepository.create(data);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === PrismaClientError.UniqueConstraintViolation) {
          throw new BadRequestException(
            `Member with code: ${data.code} already exists`,
          );
        }
      }
      throw error;
    }
  }

  async penalizeMember(code: string) {
    try {
      return await this.membersRepository.updateByCode(code, {
        penalizedUntil: now(getLocalTimeZone()).add({ days: 3 }).toDate(),
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === PrismaClientError.RecordNotFound) {
          throw new NotFoundException('Member not found');
        }
      }
      throw error;
    }
  }

  async forgiveMember(code: string) {
    try {
      return await this.membersRepository.updateByCode(code, {
        penalizedUntil: null,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === PrismaClientError.RecordNotFound) {
          throw new NotFoundException('Member not found');
        }
      }
      throw error;
    }
  }

  async checkPenalized(code: string): Promise<boolean> {
    const member = await this.membersRepository.findByCode(code);

    if (!member) throw new NotFoundException('Member not found');

    const nowTime = now(getLocalTimeZone());

    return member.penalizedUntil && member.penalizedUntil > nowTime.toDate();
  }
}
