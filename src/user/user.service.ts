import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  excludedMainUserAttributes,
  excludedUserAttributes,
  getUserQuery,
  User,
  userAdditionalInfoQuery,
} from './user.model';
import { InjectModel } from '@nestjs/sequelize';
import { UpdateUserDto } from './dto/update-user.dto';
import { Op } from 'sequelize';
import { GetUsersDto } from './dto/get-users.dto';
import { Sequelize } from 'sequelize-typescript';
import { Role } from '../role/role.model';
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
import { SetFCMTokenDto } from './dto/set-fcm-token.dto';
import { UserDevice } from './user-device.model';
import { GetUserById } from './dto/get-user-by-id.dto';
import { ReturnUserDto } from './dto/return-user.dto';
import { DeleteDeviceSessionDto } from './dto/delete-device-session.dto';
import { BaseDto } from '../base/base.dto';
import { SetUserSettingsDto } from './dto/set-user-settings.dto';
import { ChangeGeoDto } from './dto/change-geo.dto';
import { DeletePhotoDto } from './dto/delete-photo.dto';
import { SetMainPhotoDto } from './dto/set-main-photo.dto';
import { OffsetDto } from '../base/offset.dto';
import { GetAdminUsersDto } from './dto/get-admin-users.dto';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const md5 = require('md5');

export class CheckUserExistResponse {
  readonly userRegistered: boolean;
}

export class UserSettings {
  readonly reactionsNotificationsEnabled: boolean;
  readonly messagesNotificationsEnabled: boolean;
  readonly messagesReactionsNotificationsEnabled: boolean;
}

export class UserInfoResponse {
  readonly user: User;
  readonly userSettings: UserSettings;
}

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User) private userRepository: typeof User,
    @InjectModel(UserDevice) private userDeviceRepository: typeof UserDevice,
    @InjectModel(Image) private imageRepository: typeof Image,
    @InjectModel(Report) private reportRepository: typeof Report,
    @InjectModel(UserReaction)
    private userReactionRepository: typeof UserReaction,
    private sequelize: Sequelize,
    private redisService: RedisService,
    private imageService: ImageService,
    private socketGateway: SocketGateway,
  ) {}

  // TODO: REMOVE THIS ON PROD
  async getAllUsersTest(): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const [users]: [Record<any, any>] = await this.sequelize.query(`
      select id, phone, first_name, last_name, geo_lat, geo_lon,
      (EXTRACT(year FROM age(current_date, birthdate))) as "age", sex,
      (select title from city where id = birth_place_id) as "birthPlace",
      (select title from city where id = live_place_id) as "livePlace",
      read_namaz,
      wears_hijab,
      (select title from education where id = education_id) as "education",
      (select title from parents where id = parents_id) as "parents",
      (select title from organisation where id = organisation_id) as "organisation",
      (select title from family_position where id = family_position_id) as "familyPosition",
      (select title from religion where id = religion_id) as "religion",
      (select title from children where id = has_children_id) as "hasChildren",
      (select array(select title from interest where id in (select interest_id from user_interests where user_id = "user".id))) as "interests",
      (select array(select title from language where id in (select language_id from user_language where user_id = "user".id))) as "languages",
      (select array(select title from speciality where id in (select speciality_id from user_specialities where user_id = "user".id))) as "specialities",
      (select array(select title from place_wish where id in (select place_wish_id from user_place_wish where user_id = "user".id))) as "placeWishes",
      (select array(select title from wedding_wish where id in (select wedding_wish_id from user_wedding_wish where user_id = "user".id))) as "weddingWishes",
      (select array(select title from main_quality where id in (select main_quality_id from user_main_quality where user_id = "user".id))) as "mainQualities"
      from "user"
      where first_name <> 'Admin'
      order by sex
    `);

    return `
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport"
              content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>Document</title>
        <style>
          #map {
            height: 70vh;
            width: 100%;
          }
          html, body {
            height: 100%;
            margin: 0;
            padding: 0;
          }
          table {
            border-collapse: collapse;
          }
          table td,
          table th {
            padding: 5px;
            border: 1px solid #000;
          }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Телефон</th>
              <th>Имя</th>
              <th>Фамилия</th>
              <th>Возраст</th>
              <th>Пол</th>
              <th>Место рождения</th>
              <th>Место проживания</th>
              <th>Читает намаз</th>
              <th>Носит хиджаб</th>
              <th>Образование</th>
              <th>Родители</th>
              <th>Организация</th>
              <th>Семейное положение</th>
              <th>Религия</th>
              <th>Есть дети</th>
              <th>Интересы</th>
              <th>Знание языков</th>
              <th>Специальность</th>
              <th>Пожелания места жительства</th>
              <th>Пожелания после свадьбы</th>
              <th>Главные качества</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(
              (user) => `<tr>
                <td>${user.id}</td>
                <td>${user.phone}</td>
                <td>${user.first_name}</td>
                <td>${user.last_name}</td>
                <td>${user.age}</td>
                <td>${user.sex === 0 ? 'Женский' : 'Мужской'}</td>
                <td>${user.birthPlace}</td>
                <td>${user.livePlace}</td>
                <td>${user.read_namaz ? 'Да' : 'Нет'}</td>
                <td>${user.wears_hijab ? 'Да' : 'Нет'}</td>
                <td>${user.education}</td>
                <td>${user.parents}</td>
                <td>${user.organisation}</td>
                <td>${user.familyPosition}</td>
                <td>${user.religion}</td>
                <td>${user.hasChildren}</td>
                <td>${user.interests}</td>
                <td>${user.languages}</td>
                <td>${user.specialities}</td>
                <td>${user.placeWishes}</td>
                <td>${user.weddingWishes}</td>
                <td>${user.mainQualities}</td>
              </tr>`,
            )}
          </tbody>
        </table>
        <br>
        <br>
        <div id="map"></div>

        <script>
          var c = 'google';
          (g=>{var h,a,k,p="The Google Maps JavaScript API",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=\`https://maps.googleapis.com/maps/api/js?\`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})({
            key: "AIzaSyBC8mhpt_IufNyq5crWF0JNOW4HJxIW5hI",
            v: "weekly",
          });
        </script>
        <script src="https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js"></script>

        <script>
          let map;

          async function initMap() {
            const { Map } = await google.maps.importLibrary("maps");
            const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

            map = new Map(document.getElementById("map"), {
              zoom: 5,
              center: { lat: 41.315163, lng: 69.256048 },
              mapId: "DEMO_MAP_ID",
            });
          
            const markers = [];
          
            ${users.map((u) => `markers.push(new AdvancedMarkerElement({position: { lat: ${u.geo_lat}, lng: ${u.geo_lon} },content: (new google.maps.marker.PinElement({glyph: '${u.first_name}',glyphColor: "black",})).element,}));`).join(' ')}
          
            new markerClusterer.MarkerClusterer({ markers, map });
          }
          
          initMap();
        </script>
      </body>
      </html>
    `;
  }

  async getUserInfo(user: User, baseDto: BaseDto): Promise<UserInfoResponse> {
    const [newUser] = await this.sequelize.query(getUserQuery(user.id), {
      mapToModel: true,
      model: User,
    });

    excludedMainUserAttributes.forEach(
      (attribute) => delete newUser.dataValues[attribute],
    );

    const userDevice: UserDevice = await this.userDeviceRepository.findOne({
      where: { userId: user.id, deviceId: baseDto.deviceId },
    });

    return {
      user: newUser,
      userSettings: {
        reactionsNotificationsEnabled:
          !!userDevice?.reactionsNotificationsEnabled,
        messagesNotificationsEnabled:
          !!userDevice?.messagesNotificationsEnabled,
        messagesReactionsNotificationsEnabled:
          !!userDevice?.messagesReactionsNotificationsEnabled,
      },
    };
  }

  async changeGeo(token: string, user: User, changeDto: ChangeGeoDto) {
    const secretCheck: boolean =
      md5(process.env.APP_SECRET_KEY + token) === changeDto.secret;
    if (!secretCheck) {
      throw new HttpException(
        new Error(ErrorType.BadFields),
        HttpStatus.FORBIDDEN,
      );
    }

    await user.update({
      geo_lat: changeDto.latitude,
      geo_lon: changeDto.longitude,
    });

    return { success: true };
  }

  async setUserSettings(
    user: User,
    setDto: SetUserSettingsDto,
  ): Promise<SuccessInterface> {
    const userDevice: UserDevice = await this.userDeviceRepository.findOne({
      where: { userId: user.id, deviceId: setDto.deviceId },
    });
    if (!userDevice) return { success: false };

    await userDevice.update({
      reactionsNotificationsEnabled:
        setDto.reactionsNotificationsEnabled ??
        userDevice.reactionsNotificationsEnabled,
      messagesNotificationsEnabled:
        setDto.messagesNotificationsEnabled ??
        userDevice.messagesNotificationsEnabled,
      messagesReactionsNotificationsEnabled:
        setDto.messagesReactionsNotificationsEnabled ??
        userDevice.messagesReactionsNotificationsEnabled,
    });

    this.socketGateway.sendUpdateData(user.id);
    return { success: true };
  }

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
    // Get users that should not display
    for (const usersDtoKey in getUsersDto) {
      try {
        getUsersDto[usersDtoKey] = JSON.parse(getUsersDto[usersDtoKey]);
      } catch (e) {}
    }

    const userReactionsLastDate: Date = new Date();
    userReactionsLastDate.setMinutes(userReactionsLastDate.getMinutes() - 5);
    const userReactions: UserReaction[] =
      await this.userReactionRepository.findAll({
        attributes: ['recipientId'],
        where: {
          [Op.or]: [
            {
              senderId: user.id,
              isLiked: true,
            },
            {
              senderId: user.id,
              isLiked: false,
              updatedAt: { [Op.gt]: userReactionsLastDate.getTime() },
            },
          ],
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

    const excludingUsersIds: number[] = [
      user.id,
      ...userReactions.map((r) => r.recipientId),
      ...userReports.map((r) => r.reportedId),
      ...chatsWithUser.map((c) => parseInt(c['user_id']) || 0),
    ];
    if (Array.isArray(getUsersDto.usersIds)) {
      getUsersDto.usersIds.forEach((id) => {
        excludingUsersIds.push(id);
      });
    }

    // Get user age
    const userLatitude: number = getUsersDto.geoLat || user.geo_lat || 0;
    const userLongitude: number = getUsersDto.geoLon || user.geo_lon || 0;
    const userAge: number = Math.abs(
      new Date(
        Date.now() - new Date(user.birthdate).getTime(),
      ).getUTCFullYear() - 1970,
    );

    // Sex is different of user sex
    const anotherUserSex: number = user.sex === 0 ? 1 : 0;

    // Get min and max age
    const ageMin: number = getUsersDto.ageMin >= 18 ? getUsersDto.ageMin : 18;
    const ageMax: number =
      getUsersDto.ageMax <= 100 && getUsersDto.ageMax >= ageMin
        ? getUsersDto.ageMax
        : 100;

    // Get users
    const users: User[] = await this.sequelize.query(
      `
      select * from (
        select *,
        (select ROUND(abs(sqrt(x * x + y * y))::numeric, 3)) as "distance" -- distance in kilometers
        from(
          select *,
          (EXTRACT(year FROM age(current_date, birthdate))) as "age",
          (select 111.12 * (${userLatitude} - geo_lat)) as "x",
          (select 111.12 * (${userLongitude} - geo_lon) * cos(geo_lat / 92.215)) as "y",
          ${userAdditionalInfoQuery}
          from "user"
          where sex = ${anotherUserSex}
          and first_name IS NOT NULL
          and last_name IS NOT NULL
          and birthdate IS NOT NULL
          and (SELECT COUNT(*) FROM jsonb_object_keys(photos)) >= 2
          and code_confirmed = true
          and birth_place_id IS NOT NULL
          and live_place_id IS NOT NULL
          and blocked_at IS NULL
          and education_id IS NOT NULL
          and parents_id IS NOT NULL
          and organisation_id IS NOT NULL
          and family_position_id IS NOT NULL
          and religion_id IS NOT NULL
          ${excludingUsersIds.length ? `and id not in (${excludingUsersIds})` : ''}
          ${getUsersDto.birthPlaceId?.length ? `and birth_place_id IN (${getUsersDto.birthPlaceId})` : ''}
          ${getUsersDto.livePlaceId?.length ? `and live_place_id IN (${getUsersDto.livePlaceId})` : ''}
          ${getUsersDto.educations?.length ? `and education_id IN (${getUsersDto.educations})` : ''}
          ${getUsersDto.organisationTypes?.length ? `and organisation_id IN (${getUsersDto.organisationTypes})` : ''}
          ${getUsersDto.readNamaz?.length ? `and read_namaz IN (${getUsersDto.readNamaz})` : ''}
          ${getUsersDto.wearsHijab?.length ? `and wears_hijab IN (${getUsersDto.wearsHijab})` : ''}
          ${getUsersDto.familyPositions?.length ? `and family_position_id IN (${getUsersDto.familyPositions})` : ''}
          ${getUsersDto.religions?.length ? `and religion_id IN (${getUsersDto.religions})` : ''}
          ${getUsersDto.hasChildrens?.length ? `and has_children_id IN (${getUsersDto.hasChildrens})` : ''}
          ${getUsersDto.parents?.length ? `and parents_id IN (${getUsersDto.parents})` : ''}
        ) a
        where age >= ${ageMin}
        and age <= ${ageMax}
        and array_length("interestsIds", 1) > 0
        and array_length("languagesIds", 1) > 0
        and array_length("specialitiesIds", 1) > 0
        and array_length("placeWishesIds", 1) > 0
        and array_length("weddingWishesIds", 1) > 0
        and array_length("mainQualitiesIds", 1) > 0
        ${getUsersDto.interests?.length ? `and "interestsIds" && '{${getUsersDto.interests}}'` : ''}
        ${getUsersDto.languages?.length ? `and "languagesIds" && '{${getUsersDto.languages}}'` : ''}
        ${getUsersDto.specialities?.length ? `and "specialitiesIds" && '{${getUsersDto.specialities}}'` : ''}
        ${getUsersDto.placeWishes?.length ? `and "placeWishesIds" && '{${getUsersDto.placeWishes}}'` : ''}
        ${getUsersDto.weddingWishes?.length ? `and "weddingWishesIds" && '{${getUsersDto.weddingWishes}}'` : ''}
        ${getUsersDto.mainQualities?.length ? `and "mainQualitiesIds" && '{${getUsersDto.mainQualities}}'` : ''}
      ) b
      order by (abs(${userAge} - age) + distance / 10) asc
      limit 20
    `,
      { mapToModel: true, model: User },
    );

    for (const someUser of users) {
      excludedUserAttributes.forEach(
        (attribute) => delete someUser.dataValues[attribute],
      );
      delete someUser.dataValues['x'];
      delete someUser.dataValues['y'];
      delete someUser.dataValues['age'];
      someUser.dataValues['online'] = await this.getUserOnline(someUser.id);
    }

    return users;
  }

  async getUsersForAdmin(
    user: User,
    getDto: GetAdminUsersDto,
  ): Promise<User[]> {
    const filterQuery: string | null = getDto.searchQuery?.length
      ? `
      LOWER(first_name) LIKE '%${getDto.searchQuery.trim().toLowerCase()}%'
      OR LOWER(last_name) LIKE '%${getDto.searchQuery.trim().toLowerCase()}%'
    `
      : null;

    // Get all users for admin, excluding admins users
    const users: User[] = await this.sequelize.query(
      `
      select *,
      ${userAdditionalInfoQuery}
      from "user"
      where id <> ${user.id}
      and ('admin' <> ANY(select value from role where id in (select role_id from user_role where user_id = "user".id)))
      ${filterQuery ? `and (${filterQuery})` : ''}
      offset ${getDto.offset ?? 0}
      limit 20
    `,
      { mapToModel: true, model: User },
    );

    for (const someUser of users) {
      excludedMainUserAttributes.forEach(
        (attribute) => delete someUser.dataValues[attribute],
      );
      someUser.dataValues['online'] = await this.getUserOnline(someUser.id);
    }

    return users;
  }

  async returnUser(
    user: User,
    returnUserDto: ReturnUserDto,
    withoutTimeout = false,
  ): Promise<SuccessInterface> {
    if (user.id === returnUserDto.userId) {
      throw new HttpException(
        new Error(ErrorType.BadFields),
        HttpStatus.BAD_REQUEST,
      );
    }

    if (user.returns <= 0) {
      throw new HttpException(
        new Error(ErrorType.ReturnsCount),
        HttpStatus.FORBIDDEN,
      );
    }

    const lastDislike: UserReaction = await this.userReactionRepository.findOne(
      {
        attributes: ['id', 'recipientId', 'isLiked'],
        where: {
          senderId: user.id,
          recipientId: returnUserDto.userId,
        },
        order: [['updatedAt', 'DESC']],
      },
    );
    if (!lastDislike && !withoutTimeout) {
      setTimeout(async () => {
        this.returnUser(user, returnUserDto, true);
      }, 5000);
    } else {
      if (lastDislike) await lastDislike.destroy();
      await user.update({ returns: user.returns - 1 });
      this.socketGateway.sendUpdateData(user.id);
    }

    return { success: true };
  }

  async setFCMToken(
    user: User,
    setFCMTokenDto: SetFCMTokenDto,
  ): Promise<SuccessInterface> {
    const userDevice: UserDevice = await this.userDeviceRepository.findOne({
      where: { userId: user.id, deviceId: setFCMTokenDto.deviceId },
    });
    if (!userDevice) return { success: false };

    await userDevice.update({ fcmToken: setFCMTokenDto.fcmToken });

    return { success: true };
  }

  async deleteUserDeviceSession(
    user: User,
    deleteDeviceSessionDto: DeleteDeviceSessionDto,
  ): Promise<SuccessInterface> {
    const userDevice: UserDevice = await this.userDeviceRepository.findOne({
      where: { userId: user.id, deviceId: deleteDeviceSessionDto.deviceId },
    });
    if (!userDevice) return { success: false };

    await userDevice.destroy();

    return { success: true };
  }

  async updateUserInfo(
    user: User,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    await user.update({
      firstName: updateUserDto.firstName ?? user.firstName,
      lastName: updateUserDto.lastName ?? user.lastName,
      birthdate: updateUserDto.birthdate ?? user.birthdate,
      geo_lat: updateUserDto.geo_lat ?? user.geo_lat,
      geo_lon: updateUserDto.geo_lon ?? user.geo_lon,
      livePlaceId: updateUserDto.livePlaceId ?? user.livePlaceId,
      birthPlaceId: updateUserDto.birthPlaceId ?? user.birthPlaceId,
      parentsId: updateUserDto.parentsId ?? user.parentsId,
      organisationId: updateUserDto.organisationId ?? user.organisationId,
      familyPositionId: updateUserDto.familyPositionId ?? user.familyPositionId,
      religionId: updateUserDto.religionId ?? user.religionId,
      hasChildrenId: updateUserDto.hasChildrenId ?? user.hasChildrenId,
      readNamaz: updateUserDto.readNamaz ?? user.readNamaz,
      wearsHijab: updateUserDto.wearsHijab ?? user.wearsHijab,
      hasParents: updateUserDto.hasParents ?? user.hasParents,
      requirements: updateUserDto.requirements ?? user.requirements,
      educationId: updateUserDto.educationId ?? user.educationId,
      tutorialDone: updateUserDto.tutorialDone ?? user.tutorialDone,
    });

    if (
      Array.isArray(updateUserDto.languagesIds) &&
      updateUserDto.languagesIds.length
    ) {
      await user.$set('languages', updateUserDto.languagesIds);
    }

    if (
      Array.isArray(updateUserDto.placeWishesIds) &&
      updateUserDto.placeWishesIds.length
    ) {
      await user.$set('placeWishes', updateUserDto.placeWishesIds);
    }

    if (
      Array.isArray(updateUserDto.weddingWishesIds) &&
      updateUserDto.weddingWishesIds.length
    ) {
      await user.$set('weddingWishes', updateUserDto.weddingWishesIds);
    }

    if (
      Array.isArray(updateUserDto.mainQualitiesIds) &&
      updateUserDto.mainQualitiesIds.length
    ) {
      await user.$set('mainQualities', updateUserDto.mainQualitiesIds);
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

    if ([0, 1].includes(updateUserDto.sex) && user.sex !== updateUserDto.sex) {
      await user.update({
        sex: updateUserDto.sex,
        familyPositionId: null,
        organisationId: null,
        educationId: null,
      });
      await user.$set('placeWishes', []);
      await user.$set('weddingWishes', []);
      await user.$set('mainQualities', []);
    }

    delete user.dataValues.password;
    this.socketGateway.sendUpdateData(user.id);

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
  ): Promise<Record<any, any>> {
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

  async setMainPhoto(
    user: User,
    setMainPhotoDto: SetMainPhotoDto,
  ): Promise<Record<any, any>> {
    const photos = { ...user.photos };
    if (
      Object.values(photos).length < 2 ||
      !photos[setMainPhotoDto.index.toString()]
    ) {
      throw new HttpException(
        new Error(ErrorType.Forbidden),
        HttpStatus.FORBIDDEN,
      );
    }

    const mainImageId = photos[0];
    photos['0'] = photos[setMainPhotoDto.index.toString()];
    photos[setMainPhotoDto.index.toString()] = mainImageId;

    await user.update({ photos });

    return photos;
  }

  async deletePhoto(
    user: User,
    deletePhotoDto: DeletePhotoDto,
  ): Promise<Record<any, any>> {
    const photos = { ...user.photos };
    if (!Object.values(photos).includes(deletePhotoDto.imageId)) {
      throw new HttpException(
        new Error(ErrorType.Forbidden),
        HttpStatus.FORBIDDEN,
      );
    }

    const deletedImage: Image = await this.imageRepository.findOne({
      where: { id: deletePhotoDto.imageId },
    });
    await this.imageService.deleteFile(deletedImage);

    const newPhotos = {};
    for (const value of Object.values(photos)) {
      if (value !== deletePhotoDto.imageId) {
        newPhotos[Object.values(newPhotos).length] = value;
      }
    }
    await user.update({ photos: newPhotos });

    return newPhotos;
  }

  async sendVerificationPhotos(user: User, photo: Express.Multer.File) {
    if (user.verified) {
      throw new HttpException(
        new Error(ErrorType.AlreadyVerified),
        HttpStatus.FORBIDDEN,
      );
    }
    const file: Image = await this.imageService.saveFile(photo, user.id);
    await user.$set('verificationImages', [file]);
    await user.update({ tryVerifiedAt: new Date(), verifyAnsweredAt: null });
    const admin: User = await this.userRepository.findOne({
      include: [{ model: Role, where: { value: 'admin' } }],
    });
    this.socketGateway.sendVerificationUserRequest(admin.id, user);
    return file;
  }

  private async updatePhoto(
    user: User,
    photo: Express.Multer.File,
    uploadPhotoDto: UploadPhotoDto,
  ): Promise<Record<any, any>> {
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
    this.socketGateway.sendUpdateData(user.id);

    return photos;
  }

  async getAnotherUsersOnline(user: User): Promise<Record<number, any>> {
    const usersOnline: Record<number, any> = {};

    const [chatsUsers] = await this.sequelize.query(`
      SELECT user_id FROM "chat_user"
      WHERE chat_id IN (
        SELECT chat_id FROM "chat_user"
        WHERE user_id = ${user.id}
      )
      AND user_id <> ${user.id}
    `);
    const chatsUsersIds: number[] = chatsUsers.map(
      (c) => parseInt(c['user_id']) || 0,
    );
    for (const userId of chatsUsersIds) {
      usersOnline[userId] = await this.getUserOnline(userId);
    }

    const reactionsUsers: UserReaction[] =
      await this.userReactionRepository.findAll({
        attributes: ['senderId'],
        where: {
          recipientId: user.id,
          isLiked: true,
          senderId: { [Op.notIn]: chatsUsersIds },
        },
      });
    const reactionsUsersIds: number[] = reactionsUsers.map((r) => r.senderId);
    for (const userId of reactionsUsersIds) {
      usersOnline[userId] = await this.getUserOnline(userId);
    }

    return usersOnline;
  }

  async getUserById(user: User, getDto: GetUserById): Promise<User> {
    return await this.userRepository.findOne({
      attributes: { exclude: excludedUserAttributes },
      where: { id: getDto.userId, sex: user.sex == 0 ? 1 : 0 },
    });
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
