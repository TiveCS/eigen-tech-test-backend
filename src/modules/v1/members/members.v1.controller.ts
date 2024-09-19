import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateMemberV1Dto } from './dto';
import { MembersV1Service } from './members.v1.service';

@Controller({
  path: '/members',
  version: '1',
})
export class MembersV1Controller {
  constructor(private readonly membersService: MembersV1Service) {}

  @Get()
  async getMembers() {
    return this.membersService.getMembers();
  }

  @Get('/:code')
  async getMemberByCode(@Param('code') code: string) {
    return this.membersService.getMemberByCode(code);
  }

  @Post()
  async createMember(@Body() dto: CreateMemberV1Dto) {
    return this.membersService.createMember(dto);
  }
}
