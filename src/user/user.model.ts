import {
  Model,
  Column,
  DataType,
  Table,
  BelongsTo,
  ForeignKey,
  BelongsToMany,
} from 'sequelize-typescript';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { City } from '../city/city.model';
import { Role } from '../role/role.model';
import { UserRoles } from '../role/user-role.model';
import { UserLanguage } from '../language/user-language.model';
import { Language } from '../language/language.model';
import { Education } from '../education/education.model';
import { Parents } from '../parents/parents.model';
import { Speciality } from '../speciality/speciality.model';
import { Interest } from '../interest/interest.model';
import { PlaceWish } from '../place-wish/place-wish.model';
import { UserPlaceWish } from '../place-wish/user-place-wish.model';
import { UserInterest } from '../interest/user-interest.model';
import { UserSpeciality } from '../speciality/user-speciality.model';
import { OrganisationType } from '../organisation-type/organisation.model';
import { FamilyPosition } from '../family-position/family-position.model';
import { Religion } from '../religion/religion.model';
import { Children } from '../children/children.model';
import { Image } from '../image/image.model';
import { UserVerificationImages } from '../image/user-verification-image.model';

@Table({ tableName: 'user', underscored: true })
export class User extends Model<User, CreateUserDto> {
  @ApiProperty({ example: 1, description: 'ID пользователя' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({ example: '+71234567890', description: 'Номер телефона' })
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  phone: string;

  @ApiProperty({ example: '1234567q', description: 'Пароль' })
  @Column({ type: DataType.STRING, allowNull: false })
  password: string;

  @ApiProperty({ example: '+71234567890', description: 'Номер телефона' })
  @Column({ type: DataType.STRING, allowNull: false })
  firstName: string;

  @ApiProperty({ example: 'Румянцев', description: 'Фамилия пользователя' })
  @Column({ type: DataType.STRING, allowNull: false })
  lastName: string;

  @ApiProperty({
    example: 'Sun Dec 18 2022 01:20:50 GMT+0300 (Москва, стандартное время)',
    description: 'Дата рождения',
  })
  @Column({ type: DataType.DATE, allowNull: false })
  birthdate: string;

  @ApiProperty({
    example: 0,
    description: 'Пол (0 - женский, 1 - мужской)',
  })
  @Column({ type: DataType.SMALLINT, allowNull: false })
  sex: number;

  @ApiProperty({ example: 2, description: 'Этап регистрации' })
  @Column({ type: DataType.SMALLINT, defaultValue: 2 })
  step: number;

  @Column({ type: DataType.STRING })
  code: string;

  @ApiProperty({ example: false, description: 'Статус подтверждения кода' })
  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  code_confirmed: boolean;

  @ApiProperty({ example: 32.20234, description: 'Широта места нахождения' })
  @Column({ type: DataType.FLOAT })
  geo_lat: number;

  @ApiProperty({ example: 32.20234, description: 'Долгота места нахождения' })
  @Column({ type: DataType.FLOAT })
  geo_lon: number;

  @BelongsTo(() => City, 'livePlaceId')
  livePlace: City;

  @ApiProperty({ example: 1, description: 'ID места проживания' })
  @ForeignKey(() => City)
  @Column({ type: DataType.INTEGER })
  livePlaceId: number;

  @BelongsTo(() => City, 'birthPlaceId')
  birthPlace: City;

  @ApiProperty({ example: 1, description: 'ID места рождения' })
  @ForeignKey(() => City)
  @Column({ type: DataType.INTEGER })
  birthPlaceId: number;

  @ApiProperty({ description: 'Роли пользователя' })
  @BelongsToMany(() => Role, () => UserRoles)
  roles: Role[];

  @ApiProperty({ description: 'Знание языков' })
  @BelongsToMany(() => Language, () => UserLanguage)
  languages: Language[];

  @BelongsTo(() => Education)
  education: Education;

  @ApiProperty({ example: 1, description: 'ID образования' })
  @ForeignKey(() => Education)
  educationId: number;

  @BelongsTo(() => Parents)
  parents: Parents;

  @ApiProperty({ example: 1, description: 'ID "родителей"' })
  @ForeignKey(() => Parents)
  parentsId: number;

  @ApiProperty({ description: 'Специальности пользователя' })
  @BelongsToMany(() => Speciality, () => UserSpeciality)
  specialities: Speciality[];

  @ApiProperty({ description: 'Интересы пользователя' })
  @BelongsToMany(() => Interest, () => UserInterest)
  interests: Interest[];

  @ApiProperty({ description: 'Пожелания местожительства' })
  @BelongsToMany(() => PlaceWish, () => UserPlaceWish)
  placeWishes: PlaceWish[];

  @BelongsTo(() => OrganisationType)
  organisation: OrganisationType;

  @ApiProperty({ example: 1, description: 'ID вида организации' })
  @ForeignKey(() => OrganisationType)
  organisationId: number;

  @BelongsTo(() => FamilyPosition)
  familyPosition: FamilyPosition;

  @ApiProperty({ example: 1, description: 'ID семейного положения' })
  @ForeignKey(() => FamilyPosition)
  familyPositionId: number;

  @BelongsTo(() => Religion)
  religion: Religion;

  @ApiProperty({ example: 1, description: 'ID религии' })
  @ForeignKey(() => Religion)
  religionId: number;

  @ApiProperty({ example: true, description: 'Читает намаз' })
  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  readNamaz: boolean;

  @ApiProperty({ example: true, description: 'Носит хиджаб' })
  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  wearsHijab: boolean;

  @BelongsTo(() => Children)
  hasChildren: Children;

  @ApiProperty({ example: 1, description: 'ID детей' })
  @ForeignKey(() => Children)
  hasChildrenId: number;

  @ApiProperty({ example: true, description: 'Есть родители' })
  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  hasParents: boolean;

  @ApiProperty({
    example: 'Требования к кандидату...',
    description: 'Требования к кандидату',
  })
  @Column({ type: DataType.TEXT, defaultValue: '' })
  requirements: string;

  @ApiProperty({ description: 'Фотографии пользователя' })
  @Column({ type: DataType.JSONB, defaultValue: {}, allowNull: false })
  photos: Record<string, number>;

  @ApiProperty({ example: 1, description: 'Кол-во суперлайков' })
  @Column({ type: DataType.INTEGER, defaultValue: 10, allowNull: false })
  superLikes: number;

  @ApiProperty({ example: 1, description: 'Кол-во возвратов' })
  @Column({ type: DataType.INTEGER, defaultValue: 1, allowNull: false })
  returns: number;

  @ApiProperty({ example: 'ios', description: 'Платформа' })
  @Column({ type: DataType.TEXT, allowNull: false })
  platform: string;

  @ApiProperty({ example: 'iPhone14', description: 'Девайс' })
  @Column({ type: DataType.TEXT, allowNull: false })
  device: string;

  @ApiProperty({ example: 1, description: 'Версия API' })
  @Column({ type: DataType.INTEGER, allowNull: false })
  v: number;

  @ApiProperty({ example: false, description: 'Верификация' })
  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  verified: boolean;

  @ApiProperty({ description: 'Фотографии пользователя для верификации' })
  @BelongsToMany(() => Image, () => UserVerificationImages)
  verificationImages: Image[];

  @ApiProperty({
    example: new Date().toISOString(),
    description: 'Дата блокировки',
  })
  @Column({ type: DataType.DATE })
  blockedAt: Date;

  @ApiProperty({ example: 'asd', description: 'Причина блокировки' })
  @Column({ type: DataType.TEXT })
  blockReason: string;

  @ApiProperty({
    example: new Date().toISOString(),
    description: 'Дата отправки заявки на верификацию',
  })
  @Column({ type: DataType.DATE })
  tryVerifiedAt: Date;

  @ApiProperty({
    example: new Date().toISOString(),
    description: 'Дата обработки заявки на верификацию',
  })
  @Column({ type: DataType.DATE })
  verifyAnsweredAt: Date;

  @ApiProperty({ example: false, description: 'Обучение пройдено' })
  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  tutorialDone: boolean;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    defaultValue: Math.floor(Date.now() / 1000),
  })
  declare createdAt: number;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    defaultValue: Math.floor(Date.now() / 1000),
  })
  declare updatedAt: number;
}
