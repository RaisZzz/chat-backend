import { Column, DataType, Model, Table } from 'sequelize-typescript';

export enum ChatType {
  user,
}

export const chatInfoPsqlQuery = (userId: number) => {
  return `
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
  )) as "imageId",
  (
    select row_to_json(user_reaction)
    from user_reaction
    where sender_id = users[1] and recipient_id = users[2]
    and super_like_msg IS NOT NULL
  ) as "firstUserLike",
  (
    select row_to_json(user_reaction)
    from user_reaction
    where sender_id = users[2] and recipient_id = users[1]
    and super_like_msg IS NOT NULL
  ) as "secondUserLike"
`;
};

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
