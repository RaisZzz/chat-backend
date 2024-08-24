import { Column, DataType, Model, Table } from 'sequelize-typescript';

export enum UserReactionReceivedType {
  sent,
  deleted,
}

@Table({
  tableName: 'user_reaction_received',
  underscored: true,
  timestamps: false,
})
export class UserReactionReceived extends Model<UserReactionReceived> {
  @Column({ type: DataType.INTEGER, allowNull: false })
  userReactionId: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  userId: number;

  @Column({ type: DataType.TEXT, allowNull: false })
  deviceId: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  received: boolean;

  @Column({ type: DataType.INTEGER, allowNull: false })
  type: UserReactionReceivedType;
}
