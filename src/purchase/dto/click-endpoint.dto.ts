import { IsDecimal, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class ClickPrepareDto {
  click_trans_id: number;
  service_id: number;
  click_paydoc_id: number;
  merchant_trans_id: string;
  amount: number;
  action: string;
  error: number;
  error_note: string;
  sign_time: string;
  sign_string: string;
}

export abstract class ClickPrepareResponse {
  click_trans_id: number;
  merchant_trans_id: string;
  merchant_prepare_id: number;
  error: number;
  error_note: string;
}

export class ClickCompleteDto extends ClickPrepareDto {
  merchant_prepare_id: string;
}

export abstract class ClickCompleteResponse {
  click_trans_id: number;
  merchant_trans_id: string;
  error: number = ClickError.Success;
  error_note: string;
}

export enum ClickError {
  Success = 0,
  SignCheckFailed = -1,
  IncorrectParameterAmount = -2,
  ActionNotFound = -3,
  AlreadyPaid = -4,
  UserDoesNotExist = -5,
  TransactionDoesNotExist = -6,
  FailedToUpdateUser = -7,
  ErrorInRequestFromClick = -8,
  TransactionCancelled = -9,
}

export abstract class ClickErrorResponse {
  error: ClickError;
  error_note: string;
}
