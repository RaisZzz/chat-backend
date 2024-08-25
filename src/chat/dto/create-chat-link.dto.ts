export class CreateChatLinkDto {
  readonly chatId: number;
  readonly userId: number;
  readonly expireTime: number;
  readonly uuid: string;
}
