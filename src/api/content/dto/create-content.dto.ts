import { Transform } from "class-transformer";
import {
  IsString,
  IsNumber,
  IsOptional,
  IsObject,
  IsBoolean,
} from "class-validator";
import { Users } from "src/api/user/entities/user.entity";
import { ProductImages } from "src/common/entities/productimage.entity";

export class CreateContentDto {
  @IsString()
  readonly title: string;

  @IsString()
  readonly body: string;

  @IsString()
  category: string;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  latitude: number;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  longitude: number;

  @IsString()
  location: string;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  university: string;

  @IsOptional()
  @IsBoolean()
  seller_completed: boolean = false;

  @IsOptional()
  @IsBoolean()
  buyer_completed: boolean = false;

  @IsOptional()
  @IsObject()
  seller: Users;
}
