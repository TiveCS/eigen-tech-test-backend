import { Book } from '@prisma/client';

export type GetBooksV1Result = Book[];

export type GetBookByCodeV1Result = Book;

export type CreateBookV1Result = { code: string };
