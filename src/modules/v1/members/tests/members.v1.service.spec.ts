import { Test } from '@nestjs/testing';
import { MembersV1Service } from '../members.v1.service';
import { MembersV1Repository } from '../members.v1.repository';
import { PrismaModule } from '~lib/prisma/prisma.module';
import { Member, Prisma } from '@prisma/client';
import { PrismaService } from '~lib/prisma/prisma.service';
import { mockPrisma } from '~utils/tests/prisma-mock';
import { CreateMemberV1Result, GetMembersV1Result } from '../types';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateMemberV1Dto } from '../dto';
import { PrismaClientError } from '~lib/prisma/prisma.error';

describe('MembersV1Service', () => {
  let membersService: MembersV1Service;
  let membersRepository: MembersV1Repository;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [MembersV1Service, MembersV1Repository, PrismaService],
      imports: [PrismaModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma())
      .compile();

    membersService = module.get(MembersV1Service);
    membersRepository = module.get(MembersV1Repository);
  });

  describe('getMembers', () => {
    it('should return all members with borrowedBooks count', async () => {
      const expectedResult: GetMembersV1Result = [
        { code: 'MB-1', name: 'Member 1', borrowedBooks: 2 },
        { code: 'MB-2', name: 'Member 2', borrowedBooks: 0 },
      ];

      jest.spyOn(membersRepository, 'findMany').mockResolvedValue([
        { code: 'MB-1', name: 'Member 1', _count: { borrowedBooks: 2 } },
        { code: 'MB-2', name: 'Member 2', _count: { borrowedBooks: 0 } },
      ]);

      const result = await membersService.getMembers();

      expect(result).toHaveLength(2);
      expect(result).toEqual(expectedResult);
    });

    it('should return an empty array', async () => {
      jest.spyOn(membersRepository, 'findMany').mockResolvedValue([]);

      const result = await membersService.getMembers();

      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });
  });

  describe('getMemberByCode', () => {
    it('should return a member by code', async () => {
      const expectedResult: Member = { code: 'MB-1', name: 'Member 1' };

      jest.spyOn(membersRepository, 'findByCode').mockResolvedValue({
        code: 'MB-1',
        name: 'Member 1',
      });

      const result = await membersService.getMemberByCode('MB-1');

      expect(result).toEqual(expectedResult);
    });

    it('should throw an NotFoundException if member not found', async () => {
      jest.spyOn(membersRepository, 'findByCode').mockResolvedValue(null);

      await expect(membersService.getMemberByCode('MB-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createMember', () => {
    const dto: CreateMemberV1Dto = {
      code: 'MB-3',
      name: 'Member 3',
    };

    it('should create a new member', async () => {
      const expectedResult: CreateMemberV1Result = { code: dto.code };

      jest.spyOn(membersRepository, 'create').mockResolvedValue({
        code: dto.code,
      });

      const result = await membersService.createMember(dto);

      expect(result).toEqual(expectedResult);
    });

    it('should throw an BadRequestException if member with same code already exists', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('', {
        code: PrismaClientError.UniqueConstraintViolation,
        clientVersion: Prisma.prismaVersion.client,
      });

      jest.spyOn(membersRepository, 'create').mockRejectedValue(prismaError);

      await expect(membersService.createMember(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});