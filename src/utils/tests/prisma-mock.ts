import { PrismaClient } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

export type PrismaMockProxy = DeepMockProxy<{
  [K in keyof PrismaClient]: Omit<PrismaClient[K], 'groupBy'>;
}>;

export const mockPrisma = () =>
  mockDeep<PrismaClient>() as unknown as PrismaMockProxy;
