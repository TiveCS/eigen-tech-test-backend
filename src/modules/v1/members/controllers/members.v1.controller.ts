import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateMemberV1Dto } from '../dto';
import { MembersV1Service } from '../services';

@ApiTags('members')
@Controller({
  path: '/members',
  version: '1',
})
export class MembersV1Controller {
  constructor(private readonly membersService: MembersV1Service) {}

  @Get()
  @ApiOkResponse({ description: 'Members found' })
  async getMembers() {
    return this.membersService.getMembers();
  }

  @Get('/:code')
  @ApiOkResponse({ description: 'Member with list of borrowed books' })
  @ApiNotFoundResponse({ description: 'Member not found' })
  async getMemberByCode(@Param('code') code: string) {
    return this.membersService.getMemberByCode(code);
  }

  @Post()
  @ApiCreatedResponse({ description: 'Member successfully created' })
  @ApiConflictResponse({ description: 'Member with code already exists' })
  async createMember(@Body() dto: CreateMemberV1Dto) {
    return this.membersService.createMember(dto);
  }
}
