import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'chat', underscored: true, timestamps: false })
export class Chat extends Model<Chat> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;
}
