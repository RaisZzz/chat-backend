import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { excludedUserAttributes, User } from './user.model';
import { InjectModel } from '@nestjs/sequelize';
import { UpdateUserDto } from './dto/update-user.dto';
import { Op } from 'sequelize';
import { GetUsersDto } from './dto/get-users.dto';
import { Sequelize } from 'sequelize-typescript';
import { Role } from '../role/role.model';
import { City } from '../city/city.model';
import { Interest } from '../interest/interest.model';
import { Speciality } from '../speciality/speciality.model';
import { Education } from '../education/education.model';
import { OrganisationType } from '../organisation-type/organisation.model';
import { FamilyPosition } from '../family-position/family-position.model';
import { Language } from '../language/language.model';
import { Religion } from '../religion/religion.model';
import { Children } from '../children/children.model';
import { PlaceWish } from '../place-wish/place-wish.model';
import { Parents } from '../parents/parents.model';
import { RedisService } from '../redis/redis.service';
import { SocketGateway } from '../websockets/socket.gateway';
import { UserReaction } from '../user-reaction/user-reaction.model';
import { Report } from '../report/report.model';
import { SmsDto } from './dto/sms.dto';
import { SuccessInterface } from '../base/success.interface';
import { GetUserByPhoneDto } from './dto/get-user-by-phone.dto';
import { UploadPhotoDto } from './dto/upload-photo.dto';
import { Error, ErrorType } from '../error.class';
import { Image } from '../image/image.model';
import { ImageService } from '../image/image.service';

export class CheckUserExistResponse {
  readonly userRegistered: boolean;
}

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User) private userRepository: typeof User,
    @InjectModel(Image) private imageRepository: typeof Image,
    @InjectModel(Report) private reportRepository: typeof Report,
    @InjectModel(UserReaction)
    private userReactionRepository: typeof UserReaction,
    private sequelize: Sequelize,
    private redisService: RedisService,
    private imageService: ImageService,
    private socketGateway: SocketGateway,
  ) {}

  async checkUserExist(
    checkDto: GetUserByPhoneDto,
  ): Promise<CheckUserExistResponse> {
    return {
      userRegistered: !!(await this.userRepository.findOne({
        where: { phone: checkDto.phone },
      })),
    };
  }

  async getUsers(user: User, getUsersDto: GetUsersDto): Promise<User[]> {
    for (const usersDtoKey in getUsersDto) {
      try {
        getUsersDto[usersDtoKey] = JSON.parse(getUsersDto[usersDtoKey]);
      } catch (e) {}
    }

    // Get distance and age difference
    const latitude: number = getUsersDto.geoLat || user.geo_lat || 0;
    const longitude: number = getUsersDto.geoLon || user.geo_lon || 0;
    const age: number = Math.abs(
      new Date(
        Date.now() - new Date(user.birthdate).getTime(),
      ).getUTCFullYear() - 1970,
    );

    // Distance in kilometers
    const x = `111.12 * (${latitude} - geo_lat)`;
    const y = `111.12 * (${longitude} - geo_lon) * cos(geo_lat / 92.215)`;
    const distanceQuery = `abs(sqrt(${x} * ${x} + ${y} * ${y}))`;

    const ageQuery = `EXTRACT(year FROM age(current_date, birthdate))`;
    const ageDiffQuery = `abs(${age} - ${ageQuery})`;

    // Sex is different of user sex
    const sexCondition = user.sex === 0 ? 1 : 0;

    // Get users that should not display
    const userReactionsLastDate: Date = new Date();
    userReactionsLastDate.setMinutes(userReactionsLastDate.getMinutes() - 5);
    const userReactions: UserReaction[] =
      await this.userReactionRepository.findAll({
        attributes: ['recipientId'],
        where: {
          senderId: user.id,
          updatedAt: { [Op.gt]: userReactionsLastDate.getTime() },
        },
      });
    const userReports: Report[] = await this.reportRepository.findAll({
      attributes: ['reportedId'],
      where: { ownerId: user.id },
    });
    const [chatsWithUser] = await this.sequelize.query(`
      SELECT user_id FROM "chat_user"
      WHERE user_id <> ${user.id}
      AND chat_id IN (
        SELECT chat_id FROM "chat_user"
        WHERE user_id = ${user.id}
      )
    `);

    const userIds: number[] = [
      user.id,
      ...userReactions.map((r) => r.recipientId),
      ...userReports.map((r) => r.reportedId),
      ...chatsWithUser.map((c) => parseInt(c['user_id']) || 0),
    ];
    if (Array.isArray(getUsersDto.usersIds)) {
      getUsersDto.usersIds.forEach((id) => {
        userIds.push(id);
      });
    }

    const userIdCondition = { [Op.not]: userIds };
    const whereQuery = {
      id: userIdCondition,
      [Op.and]: [],
      sex: sexCondition,
      step: 5,
    };

    // Filter
    let placeWishesWhere;

    if (
      Array.isArray(getUsersDto.placeWishes) &&
      getUsersDto.placeWishes.length
    ) {
      const placeWishes: number[] = [...getUsersDto.placeWishes];
      let whereId;

      const nullIndex: number = placeWishes.indexOf(null);
      if (nullIndex > -1) {
        placeWishes.splice(nullIndex, 1);

        whereId = {
          [Op.or]: {
            [Op.eq]: null,
          },
        };

        if (placeWishes.length) {
          whereId[Op.or][Op.in] = placeWishes;
        }
      } else if (placeWishes.length) {
        whereId = placeWishes;
      }

      if (whereId) {
        placeWishesWhere = { id: whereId };
      }
    }

    whereQuery[Op.and].push(placeWishesWhere);

    // Add filters
    const includeQuery = [
      Role,
      {
        model: City,
        as: 'birthPlace',
      },
      {
        model: City,
        as: 'livePlace',
      },
      {
        model: Interest,
        where: getUsersDto.interests?.length
          ? {
              id: { [Op.in]: getUsersDto.interests },
            }
          : null,
      },
      {
        model: Speciality,
        where: getUsersDto.specialities?.length
          ? {
              id: { [Op.in]: getUsersDto.specialities },
            }
          : null,
      },
      Education,
      OrganisationType,
      FamilyPosition,
      {
        model: Language,
        where: getUsersDto.languages?.length
          ? {
              id: { [Op.in]: getUsersDto.languages },
            }
          : null,
      },
      Religion,
      Children,
      {
        model: PlaceWish,
        where: getUsersDto.placeWishes?.length
          ? {
              id: { [Op.in]: getUsersDto.placeWishes },
            }
          : null,
      },
      {
        model: Parents,
        where: getUsersDto.parents?.length
          ? {
              id: { [Op.in]: getUsersDto.parents },
            }
          : null,
      },
      Speciality,
      Interest,
      PlaceWish,
    ];

    const ageMin: number = getUsersDto.ageMin >= 18 ? getUsersDto.ageMin : 18;
    const ageMax: number =
      getUsersDto.ageMax <= 100 && getUsersDto.ageMax >= ageMin
        ? getUsersDto.ageMax
        : 100;

    whereQuery[Op.and].push(this.sequelize.literal(`${ageQuery} <= ${ageMax}`));

    whereQuery[Op.and].push(this.sequelize.literal(`${ageQuery} >= ${ageMin}`));

    if (
      Array.isArray(getUsersDto.educations) &&
      getUsersDto.educations.length
    ) {
      whereQuery['educationId'] = getUsersDto.educations;
    }

    if (
      Array.isArray(getUsersDto.livePlaceId) &&
      getUsersDto.livePlaceId.length
    ) {
      const livePlaceId: number[] = [...getUsersDto.livePlaceId];

      const nullIndex: number = livePlaceId.indexOf(null);
      if (nullIndex > -1) {
        livePlaceId.splice(nullIndex, 1);

        whereQuery['livePlaceId'] = {
          [Op.or]: {
            [Op.is]: null,
          },
        };

        if (livePlaceId.length) {
          whereQuery['livePlaceId'][Op.or][Op.in] = livePlaceId;
        }
      } else {
        whereQuery['livePlaceId'] = livePlaceId.length ? livePlaceId : null;
      }
    }

    if (
      Array.isArray(getUsersDto.birthPlaceId) &&
      getUsersDto.birthPlaceId.length
    ) {
      const birthPlaceId: number[] = [...getUsersDto.birthPlaceId];

      const nullIndex: number = birthPlaceId.indexOf(null);
      if (nullIndex > -1) {
        birthPlaceId.splice(nullIndex, 1);

        whereQuery['birthPlaceId'] = {
          [Op.or]: {
            [Op.is]: null,
          },
        };

        if (birthPlaceId.length) {
          whereQuery['birthPlaceId'][Op.or][Op.in] = birthPlaceId;
        }
      } else {
        whereQuery['birthPlaceId'] = birthPlaceId.length ? birthPlaceId : null;
      }
    }

    if (
      Array.isArray(getUsersDto.financePositions) &&
      getUsersDto.financePositions.length
    ) {
      whereQuery['financePositionId'] = getUsersDto.financePositions;
    }

    if (
      Array.isArray(getUsersDto.organisationTypes) &&
      getUsersDto.organisationTypes.length
    ) {
      whereQuery['organisationId'] = getUsersDto.organisationTypes;
    }

    if (getUsersDto.readNamaz && getUsersDto.readNamaz.length) {
      whereQuery['readNamaz'] = getUsersDto.readNamaz;
    }

    if (getUsersDto.wearsHijab && getUsersDto.wearsHijab.length) {
      whereQuery['wearsHijab'] = getUsersDto.wearsHijab;
    }

    if (getUsersDto.familyPositions && getUsersDto.familyPositions.length) {
      whereQuery['familyPositionId'] = getUsersDto.familyPositions;
    }

    if (getUsersDto.religions && getUsersDto.religions.length) {
      whereQuery['religionId'] = getUsersDto.religions;
    }

    if (getUsersDto.hasChildrens && getUsersDto.hasChildrens.length) {
      whereQuery['hasChildrenId'] = getUsersDto.hasChildrens;
    }

    const users = await this.userRepository.findAll({
      attributes: {
        include: [
          [this.sequelize.literal(`${distanceQuery}`), 'distance'],
          [this.sequelize.literal(ageQuery), 'age'],
        ],
        exclude: excludedUserAttributes,
      },
      include: includeQuery,
      where: whereQuery,
      limit: 20,
      order: [
        [
          this.sequelize.literal(`${ageDiffQuery} + ${distanceQuery} / 10`),
          'ASC',
        ],
      ],
    });

    for (const someUser of users) {
      someUser.dataValues['online'] = await this.getUserOnline(someUser.id);
    }

    return users;
  }

  async updateUserInfo(
    user: User,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    await user.update({
      firstName: updateUserDto.firstName,
      lastName: updateUserDto.lastName,
      birthdate: updateUserDto.birthdate,
      geo_lat: updateUserDto.geo_lat,
      geo_lon: updateUserDto.geo_lon,
      livePlaceId: updateUserDto.livePlaceId,
      birthPlaceId: updateUserDto.birthPlaceId,
      parentsId: updateUserDto.parentsId,
      organisationId: updateUserDto.organisationId,
      familyPositionId: updateUserDto.familyPositionId,
      religionId: updateUserDto.religionId,
      hasChildrenId: updateUserDto.hasChildrenId,
      readNamaz: updateUserDto.readNamaz,
      wearsHijab: updateUserDto.wearsHijab,
      hasParents: updateUserDto.hasParents,
      requirements: updateUserDto.requirements,
    });

    if (
      Array.isArray(updateUserDto.languagesIds) &&
      updateUserDto.languagesIds.length
    ) {
      await user.$set('languages', updateUserDto.languagesIds);
    }

    if (
      Array.isArray(updateUserDto.educationsIds) &&
      updateUserDto.educationsIds.length
    ) {
      await user.$set('education', updateUserDto.educationsIds);
    }

    if (
      Array.isArray(updateUserDto.specialitiesIds) &&
      updateUserDto.specialitiesIds.length
    ) {
      await user.$set('specialities', updateUserDto.specialitiesIds);
    }

    if (
      Array.isArray(updateUserDto.interestsIds) &&
      updateUserDto.interestsIds.length
    ) {
      await user.$set('interests', updateUserDto.interestsIds);
    }

    delete user.dataValues.password;

    return user;
  }

  async checkSmsCode(user: User, checkDto: SmsDto): Promise<SuccessInterface> {
    const success: boolean = user.code === checkDto.code;
    if (success) await user.update({ code_confirmed: true, code: null });
    return { success };
  }

  async updatePhotosRequest(
    user: User,
    photos: [Express.Multer.File],
    uploadPhotoDto: UploadPhotoDto,
  ) {
    // Validate photos array
    if (!photos.length) {
      throw new HttpException(
        new Error(ErrorType.FilesCount),
        HttpStatus.BAD_REQUEST,
      );
    }

    const imageTypes: string[] = ['image/jpeg', 'image/png'];
    const photo: Express.Multer.File = photos[0];
    if (!imageTypes.includes(photo.mimetype)) {
      throw new HttpException(
        new Error(ErrorType.FileType),
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.updatePhoto(user, photo, uploadPhotoDto);
  }

  private async updatePhoto(
    user: User,
    photo: Express.Multer.File,
    uploadPhotoDto: UploadPhotoDto,
  ): Promise<Image> {
    const photos = { ...user.photos };
    let editPhotoIndex =
      uploadPhotoDto.index >= 0 &&
      uploadPhotoDto.index < 6 &&
      !!photos[uploadPhotoDto.index]
        ? uploadPhotoDto.index
        : null;
    let file: Image;

    if (
      Object.values(photos).length >= 6 &&
      (editPhotoIndex === null || editPhotoIndex > 5)
    ) {
      editPhotoIndex = 5;
    }

    if (editPhotoIndex != null) {
      // Delete old photo
      try {
        const deletedImage: Image = await this.imageRepository.findOne({
          where: { id: photos[editPhotoIndex] },
        });
        await this.imageService.deleteFile(deletedImage);
      } catch (e) {}

      file = await this.imageService.saveFile(photo, user.id);
      photos[editPhotoIndex] = file.id;
    } else {
      file = await this.imageService.saveFile(photo, user.id);
      photos[Object.keys(photos).length] = file.id;
    }

    await user.update({
      photos,
      verified: false,
      tryVerifiedAt: null,
      verifyAnsweredAt: null,
    });

    return file;
  }

  async getAnotherUsersOnline(user: User): Promise<Record<number, any>> {
    const usersOnline: Record<number, any> = {};

    const [userIds] = await this.sequelize.query(`
      SELECT user_id FROM "chat_user"
      WHERE chat_id IN (
        SELECT chat_id FROM "chat_user"
        WHERE user_id = ${user.id}
      )
      AND user_id <> ${user.id}
    `);
    for (const toUser of userIds) {
      usersOnline[toUser['user_id']] = await this.getUserOnline(
        toUser['user_id'],
      );
    }

    return usersOnline;
  }

  private async getUserOnline(userId: number): Promise<boolean | number> {
    if (this.socketGateway.getUserConnected(userId)) return true;

    const lastOnlineAt = await this.redisService.hGet(String(userId), 'online');
    if (lastOnlineAt) {
      try {
        return parseInt(lastOnlineAt) || false;
      } catch (e) {
        return false;
      }
    }

    return false;
  }
}
