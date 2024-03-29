import { Transform } from "class-transformer";
import { IsString, IsNumber, IsOptional, IsObject } from "class-validator";
import { Users } from "src/api/user/entities/user.entity";
import { ProductImages } from "src/common/entities/productimage.entity";

export class CreateReviewDto {
  @IsString()
  readonly review: string;

  @IsNumber()
  readonly grade: number;
}
