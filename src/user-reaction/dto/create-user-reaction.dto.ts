export class CreateUserReactionDto {
  readonly senderId: number;
  readonly recipientId: number;
  readonly isLiked: boolean;
  readonly superLikeMsg: string;
}
