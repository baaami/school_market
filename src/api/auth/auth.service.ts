import { HttpException, HttpStatus, Injectable, Res } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Users } from "src/api/user/entities/user.entity";
import { ProfileImages } from "src/common/entities/profileimage.entity";
import { Repository } from "typeorm";
import * as qs from "qs";
import * as crypto from "crypto";
import axios, { AxiosResponse } from "axios";
import {
  KakaoServerData,
  KakaoServerUserData,
} from "src/common/entities/common.entity";
import { CreateUserDto } from "src/api/user/dto/create-user.dto";
import { UpdateUserDto } from "src/api/user/dto/update-user.dto";
import {
  CreateAuthLocalDto,
  CreateSignInLocalDto,
} from "./dto/create-auth.dto";
import { Response } from "express";
import { AuthSharedService } from "./auth.shared.service";

async function GetAccessToken(
  permissionCode: string
): Promise<[boolean, string]> {
  let bRtn = true;
  let kakaoServerData: KakaoServerData;
  const kakaoServerTotalData: AxiosResponse<any, any> = await axios({
    method: "POST",
    url: "https://kauth.kakao.com/oauth/token",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: qs.stringify({
      grant_type: "authorization_code",
      client_id: process.env.KAKAO_ID,
      redirect_uri: process.env.KAKAO_CALLBACK_URL,
      code: permissionCode,
    }),
  });

  if (!kakaoServerTotalData.data) bRtn = false;
  else kakaoServerData = kakaoServerTotalData.data;

  const access_token: string = kakaoServerData.access_token;

  return [bRtn, access_token];
}

async function GetUserData(access_token: string): Promise<[boolean, string]> {
  let bRtn = true;
  let kakaoServerData: KakaoServerUserData;
  const kakaoServerTotalData: AxiosResponse<any, any> = await axios({
    method: "get",
    url: "https://kapi.kakao.com/v2/user/me",
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
    params: {
      property_keys: ["kakao_account.profile"],
    },
  });

  if (!kakaoServerTotalData.data) bRtn = false;
  else kakaoServerData = kakaoServerTotalData.data;

  return [bRtn, kakaoServerData.kakao_account.email];
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(Users) private UserRepository: Repository<Users>,
    @InjectRepository(ProfileImages)
    private ProfileImageRepository: Repository<ProfileImages>,
    private readonly authSharedService: AuthSharedService
  ) {}

  async validateToken(access_token: string) {
    const email = this.jwtService.verify(access_token);

    // email이 db에 존재하는지 확인
    const UserWithRepository = await this.UserRepository.findOneBy({
      email: email,
    });
    if (UserWithRepository) {
      return "Login Success";
    } else {
      throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
    }
  }

  /**
   * @brief                   카카오 로그인 API
   *
   * @param permissionCode    카카오 인가 코드
   * @param res               응답 시 사용할 객체
   * @returns
   */
  async kakaoLogin(permissionCode: string, @Res() res: Response) {
    // 1. 인가 코드 유효성 검사 (카카오에 전달 후 access_token 확인)
    const [ok, token] = await GetAccessToken(permissionCode);
    if (!ok) {
      throw new HttpException(
        "Get Access Token Error",
        HttpStatus.UNAUTHORIZED
      );
    }

    // 2. access_token 유저 확인
    const [ret, user_email] = await GetUserData(token);
    if (!ret) {
      throw new HttpException("Get User Data Error", HttpStatus.UNAUTHORIZED);
    }

    let user: CreateUserDto | UpdateUserDto = { email: user_email };

    // 3.1 회원, 비회원 확인
    // email이 db에 존재하는지 확인
    const UserWithRepository = await this.UserRepository.findOneBy({
      email: user_email,
    });
    if (UserWithRepository) {
      // 존재할 경우, 존재하는 user data로 전송
      console.log("UserWithRepository: ", UserWithRepository);
      user = UserWithRepository;
    } else {
      // 존재하지 않을 경우, db 저장
      const c_user = await this.UserRepository.save(user);
    }

    res.cookie(
      "access_token",
      this.jwtService.sign({ user }, { secret: process.env.JWT_SECRET_KEY }),
      { httpOnly: true }
    );

    // 4. user email을 기반으로 토큰 생성
    return res.status(200).json({ user });
  }

  async kakaoSignUp(updateUserDto: UpdateUserDto, @Res() res: Response) {
    const user = this.authSharedService.getUser();

    // 기본 이미지 설정
    const defaultImage = await this.ProfileImageRepository.findOneBy({
      path: "upload/default.svg",
    });

    // 기본이미지가 DB에 존재할 경우, 기본 이미지 그대로 사용
    if (defaultImage) {
      updateUserDto.profileImage = defaultImage;
    } else {
      // 기본이미지가 DB에 존재하지 않을 경우, 기본 이미지 save 후 사용
      // 반드시 upload 폴더에는 default.svg가 존재해야함
      const saveDefaultImage = await this.ProfileImageRepository.save({
        path: "upload/default.svg",
      });

      updateUserDto.profileImage = saveDefaultImage;
    }

    const rep = await this.UserRepository.update(
      { id: user.id },
      updateUserDto
    );

    const updateUser = await this.UserRepository.createQueryBuilder("users")
      .leftJoinAndSelect("users.contents", "contents")
      .leftJoinAndSelect("users.profileImage", "images")
      .where({ id: user.id })
      .getOne();

    res.cookie(
      "access_token",
      this.jwtService.sign({ user }, { secret: process.env.JWT_SECRET_KEY }),
      { httpOnly: true }
    );

    return res.status(200).json({ updateUser });
  }

  /**
   * 회원이 기존에 존재할 경우 : 사용 중인 이메일이라는 response를 줘야함
   * 존재하지 않을 경우 : DB 저장 및 회원가입 완료
   * @param createAuthLocalDto: local 회원가입 데이터 형식
   * @returns response 데이터
   */
  async localSignUp(
    createAuthLocalDto: CreateAuthLocalDto,
    @Res() res: Response
  ) {
    // 1 회원, 비회원 확인
    // email이 db에 존재하는지 확인
    const UserWithRepository = await this.UserRepository.findOneBy({
      email: createAuthLocalDto.email,
    });

    if (UserWithRepository) {
      // 존재할 경우, 사용 중인 이메일이라는 response를 줘야함
      throw new HttpException("Duplicated Email", HttpStatus.CONFLICT);
    }

    // 2. 존재하지 않을 경우 회원가입을 진행함

    // 2.1. 기본 이미지 설정
    const defaultImage = await this.ProfileImageRepository.findOneBy({
      path: "upload/default.svg",
    });

    // 기본이미지가 DB에 존재할 경우, 기본 이미지 그대로 사용
    if (defaultImage) {
      createAuthLocalDto.profileImage = defaultImage;
    } else {
      // 기본이미지가 DB에 존재하지 않을 경우, 기본 이미지 save 후 사용
      // 반드시 upload 폴더에는 default.svg가 존재해야함
      const saveDefaultImage = await this.ProfileImageRepository.save({
        path: "upload/default.svg",
      });

      createAuthLocalDto.profileImage = saveDefaultImage;
    }

    const user: Users = await this.UserRepository.save(createAuthLocalDto);

    res.cookie(
      "access_token",
      this.jwtService.sign({ user }, { secret: process.env.JWT_SECRET_KEY }),
      { httpOnly: true }
    );

    return res.status(200).json({ user });
  }

  async localSignIn(
    createSignInDto: CreateSignInLocalDto,
    @Res() res: Response
  ) {
    // email이 db에 존재하는지 확인
    const user: Users = await this.UserRepository.findOneBy({
      email: createSignInDto.email,
    });

    // case: 존재하지 않는 아이디
    if (!user) {
      throw new HttpException("Not Exist Email", HttpStatus.UNAUTHORIZED);
    }

    // case: 존재하는 아이디

    if (
      crypto
        .createHash("sha256")
        .update(createSignInDto.password)
        .digest("hex") !== user.password
    ) {
      throw new HttpException("Invalid Password", HttpStatus.UNAUTHORIZED);
    }

    res.cookie(
      "access_token",
      this.jwtService.sign({ user }, { secret: process.env.JWT_SECRET_KEY }),
      { httpOnly: true }
    );

    return res.status(200).json({ user });
  }

  async logout(@Res() res: Response) {
    res.clearCookie("access_token");
    res.sendStatus(200);
  }
}
