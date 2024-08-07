import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { InjectModel } from '@nestjs/sequelize';
import { excludedUserAttributes, User } from 'src/user/user.model';
import { UserRefresh } from 'src/user/user-refresh.model';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { Error, ErrorType } from 'src/error.class';
import { Response } from 'express';
import { SmsService, SmsType } from '../sms/sms.service';
import { City } from '../city/city.model';
import { Education } from '../education/education.model';
import { Speciality } from '../speciality/speciality.model';
import { OrganisationType } from '../organisation-type/organisation.model';
import { FamilyPosition } from '../family-position/family-position.model';
import { Parents } from '../parents/parents.model';
import { Religion } from '../religion/religion.model';
import { PlaceWish } from '../place-wish/place-wish.model';
import { Interest } from '../interest/interest.model';
import { Language } from '../language/language.model';
import { Children } from '../children/children.model';

abstract class AuthData {
  readonly cities: City[];
  readonly educations: Education[];
  readonly specialities: Speciality[];
  readonly organisationTypes: OrganisationType[];
  readonly familyPositions: FamilyPosition[];
  readonly parents: Parents[];
  readonly religions: Religion[];
  readonly placeWishes: PlaceWish[];
  readonly interests: Interest[];
  readonly languages: Language[];
  readonly childrens: Children[];
}

export abstract class Tokens {
  readonly accessToken: string;
  readonly refreshToken: string;
}

export abstract class AuthResponse {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly user: User;
  readonly data: AuthData;
}

const userRegisterSmsTime = 600;

@Injectable()
export class AuthService {
  private async checkUnconfirmedUsers() {
    const users: User[] = await this.userRepository.findAll({
      attributes: ['id', 'createdAt'],
      where: { code_confirmed: false },
    });
    for (const user of users) {
      const today: number = Date.now();
      const registerTime: number = 600 - (today - user.createdAt);
      this.setUserDeleteTimeout(user, registerTime);
    }
  }

  constructor(
    @InjectModel(User) private userRepository: typeof User,
    @InjectModel(UserRefresh) private userRefreshRepository: typeof UserRefresh,
    private jwtService: JwtService,
    private smsService: SmsService,

    @InjectModel(City) private cityRepository: typeof City,
    @InjectModel(Education) private educationRepository: typeof Education,
    @InjectModel(Speciality) private specialityRepository: typeof Speciality,
    @InjectModel(OrganisationType)
    private organisationTypeRepository: typeof OrganisationType,
    @InjectModel(FamilyPosition)
    private familyPositionRepository: typeof FamilyPosition,
    @InjectModel(Parents) private parentsRepository: typeof Parents,
    @InjectModel(Religion) private religionRepository: typeof Religion,
    @InjectModel(PlaceWish) private placeWishRepository: typeof PlaceWish,
    @InjectModel(Interest) private interestRepository: typeof Interest,
    @InjectModel(Language) private languageRepository: typeof Language,
    @InjectModel(Children) private childrenRepository: typeof Children,
  ) {
    this.checkUnconfirmedUsers();
  }

  private async getDataItems(): Promise<AuthData> {
    const cities: City[] = await this.cityRepository.findAll();
    const educations: Education[] = await this.educationRepository.findAll();
    const specialities: Speciality[] =
      await this.specialityRepository.findAll();
    const organisationTypes: OrganisationType[] =
      await this.organisationTypeRepository.findAll();
    const familyPositions: FamilyPosition[] =
      await this.familyPositionRepository.findAll();
    const parents: Parents[] = await this.parentsRepository.findAll();
    const religions: Religion[] = await this.religionRepository.findAll();
    const placeWishes: PlaceWish[] = await this.placeWishRepository.findAll();
    const interests: Interest[] = await this.interestRepository.findAll();
    const languages: Language[] = await this.languageRepository.findAll();
    const childrens: Children[] = await this.childrenRepository.findAll();

    return {
      cities,
      educations,
      specialities,
      organisationTypes,
      familyPositions,
      parents,
      religions,
      placeWishes,
      interests,
      languages,
      childrens,
    };
  }

  async auth(user: User, ip: string, res: Response): Promise<AuthResponse> {
    return await this.authData(user, ip, res);
  }

  async register(
    registerDto: RegisterDto,
    ip: string,
    res: Response,
    user: User | null,
  ): Promise<AuthResponse> {
    let newUser: User | null = user;

    const hashPassword = await bcrypt.hash(registerDto.password, 5);

    if (newUser) {
      if (newUser.sex !== registerDto.sex) {
        await newUser.update({
          familyPositionId: null,
          organisationId: null,
        });
        await newUser.$set('placeWishes', []);
      }
      await newUser.update({
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        phone: registerDto.phone,
        birthdate: registerDto.birthdate,
        sex: registerDto.sex,
        password: hashPassword,
        platform: registerDto.platform,
        v: registerDto.v,
        device: registerDto.device,
      });
    } else {
      const userExist: User = await this.userRepository.findOne({
        include: { all: true },
        where: { phone: registerDto.phone },
      });
      if (userExist) {
        throw new HttpException(
          new Error(ErrorType.UserExist),
          HttpStatus.FORBIDDEN,
        );
      }

      newUser = await this.userRepository.create({
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        phone: registerDto.phone,
        birthdate: registerDto.birthdate,
        sex: registerDto.sex,
        password: hashPassword,
        platform: registerDto.platform,
        v: registerDto.v,
        device: registerDto.device,
      });
      this.setUserDeleteTimeout(newUser, userRegisterSmsTime);

      const smsCode: string = this.generateSmsCode();
      await newUser.update({ code: smsCode });
      this.smsService.sendSmsCode(newUser.phone, SmsType.auth, smsCode, 'ru');
    }

    return await this.authData(newUser, ip, res);
  }

  async login(
    loginDto: LoginDto,
    ip: string,
    res: Response,
  ): Promise<AuthResponse> {
    // Check that user exist
    const user: User = await this.userRepository.findOne({
      include: { all: true },
      where: { phone: loginDto.phone },
    });

    if (!user) {
      throw new HttpException(
        new Error(ErrorType.UserNotFound),
        HttpStatus.FORBIDDEN,
      );
    }

    // Check that password equals
    const passwordEquals = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!passwordEquals) {
      throw new HttpException(
        new Error(ErrorType.PasswordInvalid),
        HttpStatus.FORBIDDEN,
      );
    }

    return await this.authData(user, ip, res);
  }

  async userUpdateToken(request, ip: string): Promise<Tokens> {
    try {
      const refreshToken = request.headers?.cookie
        ?.toString()
        .split('refreshToken=')[1]
        .split(';')[0];

      const tokenExist: UserRefresh = await this.userRefreshRepository.findOne({
        where: { ip, refreshToken },
        include: [User],
      });

      if (!tokenExist) {
        throw new HttpException(
          new Error(ErrorType.TokenInvalid),
          HttpStatus.FORBIDDEN,
        );
      }

      return await this.updateToken(tokenExist.user, ip, refreshToken);
    } catch (e) {
      throw new HttpException(
        new Error(ErrorType.TokenInvalid),
        HttpStatus.FORBIDDEN,
      );
    }
  }

  private generateSmsCode(): string {
    // TODO: REMOVE TEST
    return '0000';
    let code = '';
    for (let i = 0; i < 4; i++) {
      const number = Math.round(Math.random() * 10);
      code += number >= 0 && number <= 9 ? number : 9;
    }
    if (code.length !== 4) {
      code = '4023';
    }
    return code;
  }

  private setUserDeleteTimeout(user: User, time: number) {
    setTimeout(async () => {
      const userCheck: User = await this.userRepository.findOne({
        where: { id: user.id },
      });

      if (!userCheck || !userCheck.code_confirmed) {
        try {
          await userCheck.destroy();
        } catch (e) {
          console.log(e);
        }
      }
    }, time * 1000);
  }

  private async authData(
    user: User,
    ip: string,
    res: Response,
  ): Promise<AuthResponse> {
    const tokens: Tokens = await this.updateToken(user, ip);

    res.cookie('refreshToken', tokens.refreshToken, {
      path: '/auth',
      domain: 'localhost',
      httpOnly: true,
    });

    excludedUserAttributes.forEach(
      (attribute) => delete user.dataValues[attribute],
    );

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user,
      data: await this.getDataItems(),
    };
  }

  private async updateToken(
    user: User,
    ip: string,
    refreshToken?: string,
  ): Promise<Tokens> {
    const refreshTokens: UserRefresh[] =
      await this.userRefreshRepository.findAll({
        where: {
          userId: user.id,
        },
      });

    const accessOptions = {
      expiresIn: process.env.JWT_ACCESS_EXPIRE,
      secret: process.env.JWT_ACCESS_SECRET,
    };

    const payload = { id: user.id };
    const refreshOptions = {
      expiresIn: process.env.JWT_REFRESH_EXPIRE,
      secret: process.env.JWT_REFRESH_SECRET,
    };

    const newAccessToken: string = await this.jwtService.signAsync(
      payload,
      accessOptions,
    );
    const newRefreshToken: string = await this.jwtService.signAsync(
      payload,
      refreshOptions,
    );

    // If refreshToken exist - requested by user
    if (refreshToken) {
      const token: UserRefresh = refreshTokens.find(
        (r: UserRefresh) => r.refreshToken === refreshToken && r.ip === ip,
      );
      if (token) {
        try {
          await this.jwtService.verifyAsync(token.refreshToken, refreshOptions);
        } catch (e) {
          throw new HttpException(
            new Error(ErrorType.TokenExpired),
            HttpStatus.FORBIDDEN,
          );
        }

        await token.update({
          refreshToken: newRefreshToken,
        });
      } else {
        throw new HttpException(
          new Error(ErrorType.TokenNotFound),
          HttpStatus.FORBIDDEN,
        );
      }
    } else {
      const token: UserRefresh = refreshTokens.find(
        (r: UserRefresh) => r.ip === ip,
      );
      if (token) {
        await token.update({
          refreshToken: newRefreshToken,
        });
      } else {
        await this.userRefreshRepository.create({
          userId: user.id,
          refreshToken: newRefreshToken,
          ip,
        });
      }
    }

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}
