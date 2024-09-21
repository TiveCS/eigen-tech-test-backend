import { getLocalTimeZone, now } from '@internationalized/date';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { BorrowedBook } from '@prisma/client';
import { PrismaModule } from '~lib/prisma/prisma.module';
import { PrismaService } from '~lib/prisma/prisma.service';
import { MembersV1Module } from '~modules/v1/members/members.v1.module';
import { MembersV1Repository } from '~modules/v1/members/repositories';
import { MembersV1Service } from '~modules/v1/members/services';
import { MemberWithBorrowedBooks } from '~modules/v1/members/types';
import { mockPrisma, PrismaMockProxy } from '~utils/tests/prisma-mock';
import { BorrowBookV1Dto } from '../dto';
import { BookBorrowsV1Repository } from '../repositories';
import { BookBorrowsV1Service } from '../services';
import { BorrowBookV1Result, ReturnBookV1Result } from '../types';

describe('BookBorrowsV1Service', () => {
  let bookBorrowsService: BookBorrowsV1Service;
  let bookBorrowsRepository: BookBorrowsV1Repository;
  let prisma: PrismaMockProxy;

  const penalizedUntil = now(getLocalTimeZone()).add({ days: 3 }).toDate();
  const mockMember: MemberWithBorrowedBooks = {
    code: 'MB-1',
    name: 'Member 1',
    penalizedUntil: null,
    borrowedBooks: [],
  };

  const mockPenalizedMember: MemberWithBorrowedBooks = {
    code: 'MB-1',
    name: 'Member 1',
    penalizedUntil,
    borrowedBooks: [],
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        BookBorrowsV1Service,
        BookBorrowsV1Repository,
        MembersV1Service,
        MembersV1Repository,
        PrismaService,
      ],
      imports: [PrismaModule, MembersV1Module],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma())
      .compile();

    bookBorrowsService = module.get(BookBorrowsV1Service);
    bookBorrowsRepository = module.get(BookBorrowsV1Repository);
    prisma = module.get(PrismaService);
  });

  describe('borrowBook', () => {
    const dto: BorrowBookV1Dto = {
      memberCode: 'MB-1',
      bookCode: 'BK-1',
    };

    it('should borrow book successfully', async () => {
      const expectedResult: BorrowBookV1Result = {
        id: 'BR-1',
        borrowedAt: expect.any(Date),
        dueDate: expect.any(Date),
      };

      prisma.member.findUnique.mockResolvedValue(mockMember);

      jest.spyOn(bookBorrowsRepository, 'createBorrow').mockResolvedValue([
        { id: 'BR-1', borrowedAt: new Date(), dueDate: new Date() },
        { author: 'Author', code: 'BK-1', stock: 1, title: 'Book 1' },
      ]);

      jest
        .spyOn(bookBorrowsRepository, 'findByMemberAndBookCode')
        .mockResolvedValue(null);

      const result = await bookBorrowsService.borrowBook(dto);

      expect(result).toEqual(expectedResult);
    });

    it('should throw ForbiddenException when member is penalized', async () => {
      prisma.member.findUnique.mockResolvedValue(mockPenalizedMember);

      await expect(bookBorrowsService.borrowBook(dto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ConflictException when book is already borrowed', async () => {
      prisma.member.findUnique.mockResolvedValue(mockMember);

      jest
        .spyOn(bookBorrowsRepository, 'findByMemberAndBookCode')
        .mockResolvedValue({ id: 'BR-1' } as BorrowedBook);

      await expect(bookBorrowsService.borrowBook(dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw NotFoundException when member or book not found', async () => {
      prisma.member.findUnique.mockResolvedValue(null);

      await expect(bookBorrowsService.borrowBook(dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('returnBook', () => {
    const dueDate = now(getLocalTimeZone()).add({ days: 7 }).toDate();
    const mockBorrowData: BorrowedBook = {
      id: '1',
      bookCode: 'BK-1',
      memberCode: 'MB-1',
      borrowedAt: new Date(),
      dueDate,
      returnedAt: null,
    };

    it('should return book successfully when dueDate is bigger than returnedAt', async () => {
      const returnedAt = new Date();
      const expectedResult: ReturnBookV1Result = {
        returnedAt,
        penalizedUntil: null,
      };
      const mockReturnedBorrowData: BorrowedBook = {
        ...mockBorrowData,
        returnedAt,
      };

      jest
        .spyOn(bookBorrowsRepository, 'findById')
        .mockResolvedValue(mockBorrowData);

      jest
        .spyOn(bookBorrowsRepository, 'updateReturnedAt')
        .mockResolvedValue(mockReturnedBorrowData);

      const result = await bookBorrowsService.returnBook(
        mockBorrowData.id,
        returnedAt,
      );

      expect(result).toEqual(expectedResult);
    });

    it('should return book successfully with penalty, if dueDate is less than returnedAt', async () => {
      const returnedAt = now(getLocalTimeZone()).add({ years: 1 });
      const expectedResult: ReturnBookV1Result = {
        returnedAt: returnedAt.toDate(),
        penalizedUntil,
      };
      const mockReturnedBorrowData: BorrowedBook = {
        ...mockBorrowData,
        returnedAt: returnedAt.toDate(),
      };

      jest
        .spyOn(bookBorrowsRepository, 'findById')
        .mockResolvedValue(mockBorrowData);

      jest
        .spyOn(bookBorrowsRepository, 'updateReturnedAt')
        .mockResolvedValue(mockReturnedBorrowData);

      prisma.member.update.mockResolvedValue(mockPenalizedMember);

      const result = await bookBorrowsService.returnBook(
        mockBorrowData.id,
        returnedAt.toDate(),
      );

      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException when borrow data not found', async () => {
      jest.spyOn(bookBorrowsRepository, 'findById').mockResolvedValue(null);

      await expect(
        bookBorrowsService.returnBook('123', new Date()),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when book is already returned', async () => {
      const mockReturnedBorrowData: BorrowedBook = {
        ...mockBorrowData,
        returnedAt: new Date(),
      };

      jest
        .spyOn(bookBorrowsRepository, 'findById')
        .mockResolvedValue(mockReturnedBorrowData);

      await expect(
        bookBorrowsService.returnBook(mockReturnedBorrowData.id, new Date()),
      ).rejects.toThrow(ConflictException);
    });
  });
});
