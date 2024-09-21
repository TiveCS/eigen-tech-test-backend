import { Book } from '@prisma/client';

export type BorrowBookV1Result = {
  id: string;
  borrowedAt: Date;
  dueDate: Date;
};

export type ReturnBookV1Result = {
  returnedAt: Date;
  penalizedUntil: Date | null;
};

export type GetBooksV1Result = Book[];

export type GetBookByCodeV1Result = Book;

export type CreateBookV1Result = { code: string };
