import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { reverse } from "dns";
import { Reviews } from "src/api/review/entities/review.entity";
import { Repository } from "typeorm";
import { Users } from "../user/entities/user.entity";
import { CreateReviewDto } from "./dto/create-review.dto";

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Reviews) private ReviewRepository: Repository<Reviews>,
    @InjectRepository(Users) private UserRepository: Repository<Users>
  ) {}

  async insertFakerData(fakerdata: Reviews): Promise<Reviews> {
    const res = await this.ReviewRepository.save(fakerdata);
    return res;
  }

  // 특정 회원 리뷰 조회
  async getlist(sellerId: number): Promise<Reviews[]> {

    console.log(sellerId)
    const reviews = await this.ReviewRepository
    .createQueryBuilder('reviews')
    .leftJoinAndSelect('reviews.buyer', 'buyer')
    .leftJoinAndSelect('reviews.seller', 'seller')
    .where('reviews.seller_id = :sellerId', { sellerId })
    .getMany();

    return reviews
  }

  async create(createReviewDto: CreateReviewDto, sellerId: number, buyer: Users): Promise<Reviews> {

    console.log("buyer: ", buyer)
    const seller: Users = await this.UserRepository.createQueryBuilder("users")
    .where({ id: sellerId })
    .getOne();

    const review = new Reviews()

    review.review = createReviewDto.review,
    review.seller = seller,
    review.buyer = buyer

    const res = await this.ReviewRepository.save(review);
    return res;
  }
}
