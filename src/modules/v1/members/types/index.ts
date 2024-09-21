import { BorrowedBook, Member } from '@prisma/client';

export type MemberOverview = {
  code: string;
  name: string;
  borrowedBooks: number;
};

export type MemberWithBorrowedBooks = Member & {
  borrowedBooks: BorrowedBook[];
};

export type GetMembersV1Result = MemberOverview[];

export type GetMemberByCodeV1Result = MemberWithBorrowedBooks;

export type CreateMemberV1Result = { code: string };

export type PenalizeMemberV1Result = Member;

export type ForgiveMemberV1Result = Member;

export type CheckMemberPenalizedV1Result = boolean;
