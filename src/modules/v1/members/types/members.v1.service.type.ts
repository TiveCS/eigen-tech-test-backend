import { BorrowedBook, Member } from '@prisma/client';
import { MemberOverview } from './members.v1.type';

export type GetMembersV1Result = MemberOverview[];

export type GetMemberByCodeV1Result = Member & {
  borrowedBooks: BorrowedBook[];
};

export type CreateMemberV1Result = { code: string };
