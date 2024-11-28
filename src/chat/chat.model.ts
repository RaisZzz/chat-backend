import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';

export enum ChatType {
  user,
  support,
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
    CASE 
      WHEN "type" = ${ChatType.user} THEN (
        select row_to_json(user_reaction)
        from user_reaction
        where sender_id = users[1] and recipient_id = users[2]
        and super_like_msg IS NOT NULL
      )
    END
  ) as "firstUserLike",
  (
    CASE 
      WHEN "type" = ${ChatType.user} THEN (
        select row_to_json(user_reaction)
        from user_reaction
        where sender_id = users[2] and recipient_id = users[1]
        and super_like_msg IS NOT NULL
      )
    END
  ) as "secondUserLike"
`;
};

@Table({ tableName: 'chat', underscored: true, timestamps: false })
export class Chat extends Model<Chat> {
  @ApiProperty({ example: 1, description: 'Chat ID' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({ enum: ChatType, description: 'Chat type' })
  @Column({ type: DataType.INTEGER, allowNull: false })
  type: ChatType;
}
