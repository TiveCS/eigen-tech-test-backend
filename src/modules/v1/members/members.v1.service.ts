import { Injectable, NotFoundException } from '@nestjs/common';
import { MembersV1Repository } from './members.v1.repository';
import { CreateMemberV1Dto } from './dto';

@Injectable()
export class MembersV1Service {
  constructor(private readonly membersRepository: MembersV1Repository) {}

  async getMembers() {
    return this.membersRepository.findMany();
  }

  async getMemberByCode(code: string) {
    const member = this.membersRepository.findByCode(code);

    if (!member) throw new NotFoundException('Member not found');

    return member;
  }

  async createMember(data: CreateMemberV1Dto) {
    this.membersRepository.create(data);
  }
}
