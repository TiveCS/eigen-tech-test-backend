import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { PrismaClientError } from '~lib/prisma/prisma.error';
import { PrismaModule } from '~lib/prisma/prisma.module';
import { PrismaService } from '~lib/prisma/prisma.service';
import { mockPrisma } from '~utils/tests/prisma-mock';
import { CreateBookV1Dto } from '../dto';
import { BooksV1Repository } from '../repositories';
import { BooksV1Service } from '../services';
import { CreateBookV1Result, GetBooksV1Result } from '../types';

describe('BooksV1Service', () => {
  let booksService: BooksV1Service;
  let booksRepository: BooksV1Repository;

  const mockBooks: Awaited<ReturnType<typeof booksRepository.findMany>> = [
    { code: 'BK-1', title: 'Book 1', stock: 2, author: 'Author 1' },
    { code: 'BK-2', title: 'Book 2', stock: 0, author: 'Author 2' },
  ];

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [BooksV1Service, BooksV1Repository, PrismaService],
      imports: [PrismaModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma())
      .compile();

    booksService = module.get(BooksV1Service);
    booksRepository = module.get(BooksV1Repository);
  });

  describe('getBooks', () => {
    it('should return all books with stock counts', async () => {
      const expectedResultt: GetBooksV1Result = [...mockBooks];

      jest.spyOn(booksRepository, 'findMany').mockResolvedValue(mockBooks);

      const result = await booksService.getBooks();

      expect(result).toHaveLength(2);
      expect(result).toEqual(expectedResultt);
    });

    it('should return empty array if no books stored', async () => {
      jest.spyOn(booksRepository, 'findMany').mockResolvedValue([]);

      const result = await booksService.getBooks();

      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });
  });

  describe('getBookByCode', () => {
    it('should return a book by code', async () => {
      const expectedResult = mockBooks[0];

      jest.spyOn(booksRepository, 'findByCode').mockResolvedValue(mockBooks[0]);

      const result = await booksService.getBookByCode(mockBooks[0].code);

      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if no book found', async () => {
      jest.spyOn(booksRepository, 'findByCode').mockResolvedValue(null);

      await expect(booksService.getBookByCode('BK-3')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createBook', () => {
    const dto: CreateBookV1Dto = {
      code: 'BK-3',
      title: 'Book 3',
      stock: 3,
      author: 'Author 3',
    };

    it('should create a new book', async () => {
      const expectedResult: CreateBookV1Result = {
        code: dto.code,
      };

      jest.spyOn(booksRepository, 'create').mockResolvedValue({
        code: dto.code,
        title: dto.title,
        stock: dto.stock,
        author: dto.author,
      });

      const result = await booksService.createBook(dto);

      expect(result).toEqual(expectedResult);
    });

    it('should throw ConflictException if book already exists', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('', {
        clientVersion: Prisma.prismaVersion.client,
        code: PrismaClientError.UniqueConstraintViolation,
      });

      jest.spyOn(booksRepository, 'create').mockRejectedValue(prismaError);

      await expect(booksService.createBook(dto)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
