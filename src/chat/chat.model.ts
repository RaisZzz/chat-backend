import { Column, DataType, Model, Table } from 'sequelize-typescript';

export enum ChatType {
  user,
}

export const chatInfoPsqlQuery = (userId: number) => `
  (SELECT CONCAT(first_name, ' ', last_name) FROM "user" where id = (
    CASE 
      WHEN users[1] = ${userId} THEN users[2]
      ELSE users[1]
    END
  )) as "title",
  (SELECT photos[0] FROM "user" where id = (
    CASE 
      WHEN users[1] = ${userId} THEN users[2]
      ELSE users[1]
    END
  )) as "imageId"
`;

@Table({ tableName: 'chat', underscored: true, timestamps: false })
export class Chat extends Model<Chat> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  type: ChatType;
}
