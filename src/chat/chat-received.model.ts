import { Column, DataType, Model, Table } from 'sequelize-typescript';

export enum ChatReceivedType {
  deleted,
}

@Table({ tableName: 'chat_received', underscored: true, timestamps: false })
export class ChatReceived extends Model<ChatReceived> {
  @Column({ type: DataType.INTEGER, allowNull: false })
  chatId: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  userId: number;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  received: boolean;

  @Column({ type: DataType.INTEGER, allowNull: false })
  type: ChatReceivedType;
}
