export enum ErrorType {
  UserNotFound,
  UserExist,
  PasswordInvalid,
  TokenInvalid,
  TokenExpired,
  TokenNotFound,
  BadFields,
  LowBalance,
  GameNotFound,
  BlackjackForbidden,
}

export class Error {
  readonly id: ErrorType;
  readonly info: string;
  readonly error: boolean = true;

  constructor(id: ErrorType) {
    this.id = id;
    this.info = ErrorType[this.id];
  }
}
