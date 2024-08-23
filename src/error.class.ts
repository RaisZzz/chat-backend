export enum ErrorType {
  Unauthorized,
  UserExist,
  PhoneInvalid,
  PasswordInvalid,
  SmsNotSent,
  SmsNotConfirmed,
  SmsCodeInvalid,
  Forbidden,
  CodeNotExpired,
  FilesCount,
  FileType,
  BadFields,
  StepError,
  Unsubscribe,
  Deleted,
  SuperLikesCount,
  ReturnsCount,
  ApiVersion,
  Unlock,
  AlreadyVerified,
  UserBlocked,
  TransactionNotDone,
  RefundError,
  VoiceLength,
  UserNotFound,
  TokenInvalid,
  TokenExpired,
  TokenNotFound,
  AdminNotAvailable,
}

export class Error {
  readonly id: ErrorType;
  readonly info: string;
  readonly error: boolean = true;
  readonly data: any;

  constructor(id: ErrorType, data?: Record<any, any>) {
    this.id = id;
    this.info = ErrorType[this.id];
    if (data) {
      this.data = data;
    }
  }
}
