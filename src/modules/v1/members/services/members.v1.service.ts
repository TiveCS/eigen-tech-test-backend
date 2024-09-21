import { getLocalTimeZone, now } from '@internationalized/date';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaClientError } from '~lib/prisma/prisma.error';
import { CreateMemberV1Dto } from '../dto';
import { MembersV1Repository } from '../repositories';
import {
  CheckMemberPenalizedV1Result,
  CreateMemberV1Result,
  ForgiveMemberV1Result,
  GetMemberByCodeV1Result,
  GetMembersV1Result,
  PenalizeMemberV1Result,
} from '../types';

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
          throw new ConflictException(
            `Member with code: ${data.code} already exists`,
          );
        }
      }
      throw error;
    }
  }

  async penalizeMember(code: string): Promise<PenalizeMemberV1Result> {
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

  async forgiveMember(code: string): Promise<ForgiveMemberV1Result> {
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

  async checkPenalized(code: string): Promise<CheckMemberPenalizedV1Result> {
    const member = await this.membersRepository.findByCode(code);

    if (!member) throw new NotFoundException('Member not found');

    const nowTime = now(getLocalTimeZone());

    const result =
      member.penalizedUntil !== null &&
      member.penalizedUntil > nowTime.toDate();

    return result;
  }
}
