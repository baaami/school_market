import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "../user/user.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Users } from "../user/entities/user.entity";
import * as ormconfig from "../../../ormconfig";
import * as faker from "faker";
import { Contents } from "../content/entities/content.entity";
import { ContentService } from "../content/content.service";
import { ProfileImages } from "src/common/entities/profileimage.entity";
import { Favorites } from "src/common/entities/favorite.entity";
import { Reviews } from "../review/entities/review.entity";
import { user_cnt } from "./insert.common.types";
import { AuthSharedService } from "../auth/auth.shared.service";

describe("Insert User", () => {
  let service: UserService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forFeature([
          Users,
          Contents,
          ProfileImages,
          Favorites,
          Reviews,
        ]),
        TypeOrmModule.forRoot(ormconfig),
      ],
      providers: [UserService, AuthSharedService],
    }).compile();
    service = module.get<UserService>(UserService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("Insert Faker User", () => {
    for (let i = 0; i < user_cnt; i++) {
      it("create a User " + i.toString(), async () => {
        // given : 테스트를 하기 위한 환경 구성

        // 1. image 데이터 생성
        const fakeUser: Users = new Users();
        fakeUser.name = faker.name.firstName();
        fakeUser.birth = faker.date.past();
        fakeUser.nickname = faker.internet.userName(10);
        fakeUser.email = faker.internet.email();
        fakeUser.password = faker.internet.password();
        fakeUser.university = faker.company.companyName();
        fakeUser.gender = faker.datatype.number(1);
        fakeUser.latitude = faker.address.latitude();
        fakeUser.longitude = faker.address.longitude();
        fakeUser.location = faker.address.city();
        fakeUser.grade = faker.datatype.number(4);
        fakeUser.profileImage = await service.getDefaultImage();

        // 2. 글 생성
        const user: Users = await service.insertFakerData(fakeUser);

        // then : 테스트 함수 결과
        expect(user).toBeDefined();
        expect(user.name).toEqual(fakeUser.name);
        expect(user.birth).toEqual(fakeUser.birth);
        expect(user.nickname).toEqual(fakeUser.nickname);
        expect(user.email).toEqual(fakeUser.email);
        expect(user.password).toEqual(fakeUser.password);
        expect(user.university).toEqual(fakeUser.university);
        expect(user.gender).toEqual(fakeUser.gender);
        expect(user.latitude).toEqual(fakeUser.latitude);
        expect(user.longitude).toEqual(fakeUser.longitude);
        expect(user.location).toEqual(fakeUser.location);
        expect(user.grade).toEqual(fakeUser.grade);
        expect(user.profileImage).toEqual(fakeUser.profileImage);
      });
    }
  });
});
