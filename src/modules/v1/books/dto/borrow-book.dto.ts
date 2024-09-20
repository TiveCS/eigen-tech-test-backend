import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class BorrowBookV1Dto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  memberCode: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bookCode: string;
}
