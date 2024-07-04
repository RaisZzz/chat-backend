import { Column, DataType, Model, Table } from 'sequelize-typescript';

export enum ChatType {
  user,
}

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
