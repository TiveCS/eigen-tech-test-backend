import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateMemberV1Dto } from '../dto';
import { MembersV1Service } from '../services';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('members')
@Controller({
  path: '/members',
  version: '1',
})
export class MembersV1Controller {
  constructor(private readonly membersService: MembersV1Service) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Members found' })
  async getMembers() {
    return this.membersService.getMembers();
  }

  @Get('/:code')
  @ApiResponse({
    status: 200,
    description: 'Member with list of borrowed books',
  })
  @ApiResponse({ status: 404, description: 'Member not found' })
  async getMemberByCode(@Param('code') code: string) {
    return this.membersService.getMemberByCode(code);
  }

  @Post()
  @ApiResponse({ status: 201, description: 'Member successfully created' })
  @ApiResponse({ status: 400, description: 'Member with code already exists' })
  async createMember(@Body() dto: CreateMemberV1Dto) {
    return this.membersService.createMember(dto);
  }
}
