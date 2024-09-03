import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import sequelize, { Op } from 'sequelize';
import { User } from 'src/user/user.model';
import { PaymeEndpointDto } from './dto/payme-endpoint.dto';
import { Purchase } from './purchase.model';
import { UserPurchase } from './user-purchase.model';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { GetPurchaseIdDto } from './dto/get-purchase-id.dto';
import { SocketGateway } from 'src/websockets/socket.gateway';
import { GetPurchaseAdminDto } from './dto/get-admin.dto';
import { EditPurchaseDto } from './dto/edit-purchase.dto';
import {
  ClickCompleteDto,
  ClickCompleteResponse,
  ClickError,
  ClickErrorResponse,
  ClickPrepareDto,
  ClickPrepareResponse,
} from './dto/click-endpoint.dto';
import { RefundTransactionDto } from './dto/refund-transaction.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { createHash } from 'crypto';
import { OffsetDto } from '../base/offset.dto';
import { Error, ErrorType } from '../error.class';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const md5 = require('md5');

const timeExpired = 43200000;

export enum TransactionState {
  STATE_NEW = 0,
  STATE_IN_PROGRESS = 1,
  STATE_DONE = 2,
  STATE_CANCELED = -1,
  STATE_POST_CANCELED = -2,
}

export enum TransactionCancelReason {
  USER_NOT_FOUND = 1,
  DEBIT_OPERATION_ERROR = 2,
  EXECUTE_ERROR = 3,
  TIMEOUT_ERROR = 4,
  REFUND = 5,
  UNKNOWN_ERROR = 10,
}

class ErrorMessage {
  readonly ru: string;
  readonly en: string;
  readonly uz: string;
}

class Result {
  readonly jsonrpc = '2.0';
  readonly id: number;
  readonly result: object;
}

class ResultError {
  readonly jsonrpc = '2.0';
  readonly id: number;
  readonly error: object;
}

class TransactionItem {
  readonly discount?: number;
  readonly title: string;
  readonly price: number;
  readonly count: number;
  readonly code: string;
  readonly units?: number;
  readonly package_code: string;
  readonly vat_percent: number;
}

class TransactionDetails {
  readonly receipt_type: number;
  readonly items: TransactionItem[];
}

const defaultPackageCode = '1501337';
const defaultCode = '10399001001000000';
const defaultVatPercent = 0;

@Injectable()
export class PurchaseService {
  constructor(
    @InjectModel(Purchase) private purchaseRepository: typeof Purchase,
    @InjectModel(User) private userRepository: typeof User,
    @InjectModel(UserPurchase)
    private userPurchaseRepository: typeof UserPurchase,
    private socketGateway: SocketGateway,
    private readonly httpService: HttpService,
  ) {}

  async getAll(): Promise<Purchase[]> {
    return await this.purchaseRepository.findAll({
      where: {
        active: true,
      },
      order: [['price', 'ASC']],
    });
  }

  async getAllAdmin(): Promise<Purchase[]> {
    return await this.purchaseRepository.findAll();
  }

  async addAdmin(createDto: CreatePurchaseDto): Promise<Purchase> {
    return await this.purchaseRepository.create({
      name: createDto.name,
      description: createDto.description,
      description_en: createDto.description_en,
      description_uz: createDto.description_uz,
      description_uz_cyr: createDto.description_uz_cyr,
      title: createDto.title,
      title_en: createDto.title_en,
      title_uz: createDto.title_uz,
      title_uz_cyr: createDto.title_uz_cyr,
      price: createDto.price,
      isSubscribe: createDto.isSubscribe,
      expireDays: createDto.isSubscribe ? createDto.expireDays : 0,
      superLikes: createDto.superLikes,
      returns: createDto.returns,
    });
  }

  async editAdmin(editDto: EditPurchaseDto): Promise<Purchase> {
    const purchase = await this.purchaseRepository.findOne({
      where: {
        id: editDto.id,
      },
    });
    if (!purchase) {
      throw new HttpException(
        new Error(ErrorType.BadFields),
        HttpStatus.FORBIDDEN,
      );
    }

    await purchase.update({
      name: editDto.name,
      description: editDto.description,
      description_en: editDto.description_en,
      description_uz: editDto.description_uz,
      description_uz_cyr: editDto.description_uz_cyr,
      title: editDto.title,
      title_en: editDto.title_en,
      title_uz: editDto.title_uz,
      title_uz_cyr: editDto.title_uz_cyr,
      price: editDto.price.toString(),
      superLikes: editDto.superLikes,
      returns: editDto.returns,
    });

    return purchase;
  }

  async getPurchaseId(
    user: User,
    getDto: GetPurchaseIdDto,
  ): Promise<UserPurchase> {
    const purchase: Purchase = await this.purchaseRepository.findOne({
      include: { all: true },
      where: {
        id: getDto.purchaseId,
      },
    });

    if (!purchase) {
      throw new HttpException(
        new Error(ErrorType.BadFields),
        HttpStatus.FORBIDDEN,
      );
    }

    return await this.userPurchaseRepository.create({
      purchaseId: purchase.id,
      userId: user.id,
      state: TransactionState.STATE_NEW,
      amount: purchase.price,
      operator: getDto.operator,
    });
  }

  async clickPrepare(data: ClickPrepareDto): Promise<ClickPrepareResponse> {
    // Check purchase exist and price equal amount
    const purchase: UserPurchase = await this.userPurchaseRepository.findOne({
      include: [Purchase],
      where: {
        id: parseInt(data.merchant_trans_id) || 0,
      },
    });

    if (!purchase) {
      throw new HttpException(
        this.sendClickErrorResponse(ClickError.TransactionDoesNotExist),
        HttpStatus.FORBIDDEN,
      );
    }

    if (parseInt(purchase.amount) !== data.amount * 100) {
      throw new HttpException(
        this.sendClickErrorResponse(ClickError.IncorrectParameterAmount),
        HttpStatus.FORBIDDEN,
      );
    }

    if (purchase.state === TransactionState.STATE_DONE) {
      throw new HttpException(
        this.sendClickErrorResponse(ClickError.AlreadyPaid),
        HttpStatus.FORBIDDEN,
      );
    }

    if (purchase.state === TransactionState.STATE_CANCELED) {
      throw new HttpException(
        this.sendClickErrorResponse(ClickError.TransactionCancelled),
        HttpStatus.FORBIDDEN,
      );
    }

    const user: User = await this.userRepository.findOne({
      where: {
        id: purchase.userId,
      },
    });

    if (!user) {
      throw new HttpException(
        this.sendClickErrorResponse(ClickError.UserDoesNotExist),
        HttpStatus.FORBIDDEN,
      );
    }

    return {
      click_trans_id: data.click_trans_id,
      merchant_trans_id: data.merchant_trans_id,
      merchant_prepare_id: purchase.id,
      error: 0,
      error_note: '',
    };
  }

  async clickComplete(data: ClickCompleteDto): Promise<ClickCompleteResponse> {
    if (data.action !== '1') {
      return;
    }

    await this.clickPrepare(data);

    const purchase: UserPurchase = await this.userPurchaseRepository.findOne({
      include: [Purchase],
      where: {
        id: parseInt(data.merchant_trans_id) || 0,
      },
    });

    const user: User = await this.userRepository.findOne({
      where: {
        id: purchase.userId,
      },
    });

    await user.update({
      superLikes: user.superLikes + purchase.purchase.superLikes,
      returns: user.returns + purchase.purchase.returns,
    });
    await purchase.update({
      transactionId: data.click_paydoc_id.toString(),
      performTime: Date.now().toString(),
      state: TransactionState.STATE_DONE,
    });

    this.socketGateway.sendUpdateData(user.id);

    return {
      click_trans_id: data.click_trans_id,
      merchant_trans_id: data.merchant_trans_id,
      error: 0,
      error_note: '',
    };
  }

  clickPrepareCheckSign(data: ClickPrepareDto): void {
    const sign = md5(
      `${data.click_trans_id}${data.service_id}${process.env.CLICK_SECRET_KEY}${data.merchant_trans_id}${data.amount}${data.action}${data.sign_time}`,
    );
    if (sign !== data.sign_string) {
      throw new HttpException(
        this.sendClickErrorResponse(ClickError.SignCheckFailed),
        HttpStatus.FORBIDDEN,
      );
    }
  }

  clickCompleteCheckSign(data: ClickCompleteDto): void {
    const sign = md5(
      `${data.click_trans_id}${data.service_id}${process.env.CLICK_SECRET_KEY}${data.merchant_trans_id}${data.merchant_prepare_id}${data.amount}${data.action}${data.sign_time}`,
    );
    if (sign !== data.sign_string) {
      throw new HttpException(
        this.sendClickErrorResponse(ClickError.SignCheckFailed),
        HttpStatus.FORBIDDEN,
      );
    }
  }

  private sendClickErrorResponse(error: ClickError): ClickErrorResponse {
    return { error, error_note: '' };
  }

  async paymeEndpoint(data: PaymeEndpointDto): Promise<Result> {
    const params = data.params;

    switch (data.method) {
      case 'CheckPerformTransaction':
        return await this.checkPerformTransaction(
          data.id,
          params.account.order,
          params.amount,
          params.account.phone,
        );
      case 'CreateTransaction':
        return await this.createTransaction(
          data.id,
          params.id,
          params.time,
          params.amount,
          params.account.order,
          params.account.phone,
        );
      case 'CheckTransaction':
        return await this.checkTransaction(data.id, params.id);
      case 'PerformTransaction':
        return await this.performTransaction(data.id, params.id);
      case 'CancelTransaction':
        return await this.cancelTransaction(data.id, params.id, params.reason);
    }
  }

  async refundTransaction(
    refundDto: RefundTransactionDto,
  ): Promise<UserPurchase> {
    const transaction: UserPurchase = await this.userPurchaseRepository.findOne(
      {
        where: {
          id: refundDto.transactionId,
        },
      },
    );

    if (!transaction) {
      throw new HttpException(
        new Error(ErrorType.BadFields),
        HttpStatus.FORBIDDEN,
      );
    }

    if (transaction.state !== TransactionState.STATE_DONE) {
      throw new HttpException(
        new Error(ErrorType.TransactionNotDone),
        HttpStatus.FORBIDDEN,
      );
    }

    const timestamp = Math.floor(new Date().getTime() / 1000);
    const digest = createHash('sha1')
      .update(`${timestamp}${process.env.CLICK_SECRET_KEY}`)
      .digest('hex');

    let response;

    switch (transaction.operator) {
      case 'click':
        response = await firstValueFrom(
          this.httpService.delete(
            `${process.env.CLICK_URL}/payment/reversal/${process.env.CLICK_SERVICE_ID}/${transaction.transactionId}`,
            {
              headers: {
                Auth: `${process.env.CLICK_MERCHANT_USER_ID}:${digest}:${timestamp}`,
              },
            },
          ),
        );
        if (response.data?.error_code !== 0) {
          throw new HttpException(
            new Error(ErrorType.RefundError),
            HttpStatus.FORBIDDEN,
          );
        }

        break;
      case 'payme':
        response = await firstValueFrom(
          this.httpService.post(
            process.env.PAYME_URL,
            {
              id: 123,
              method: 'receipts.cancel',
              params: {
                id: transaction.transactionId,
              },
            },
            {
              headers: {
                'X-Auth': `${process.env.PAYME_ID}:${process.env.PAYME_PASSWORD}`,
              },
            },
          ),
        );
        if (!response.data?.result?.receipt) {
          throw new HttpException(
            new Error(ErrorType.RefundError),
            HttpStatus.FORBIDDEN,
          );
        }

        break;
      default:
        throw new HttpException(
          new Error(ErrorType.RefundError),
          HttpStatus.FORBIDDEN,
        );
    }

    await transaction.update({
      state: TransactionState.STATE_CANCELED,
      reason: TransactionCancelReason.REFUND,
      cancelTime: Date.now().toString(),
    });

    return transaction;
  }

  private async checkPerformTransaction(
    rpcId: number,
    orderId: number,
    amount: number,
    phone: string,
  ): Promise<Result> {
    if (typeof phone !== 'string') {
      throw new HttpException(this.fieldsError(rpcId), HttpStatus.BAD_REQUEST);
    }

    // Check purchase exist and price equal amount
    const purchase: UserPurchase = await this.userPurchaseRepository.findOne({
      include: [Purchase],
      where: {
        id: orderId,
      },
    });
    if (!purchase) {
      throw new HttpException(
        this.orderNotExist(rpcId),
        HttpStatus.BAD_REQUEST,
      );
    }
    if (parseInt(purchase.amount) !== amount) {
      throw new HttpException(this.wrongAmount(rpcId), HttpStatus.BAD_REQUEST);
    }

    // Check user exist
    const user: User = await this.userRepository.findOne({ where: { phone } });
    if (!user) {
      throw new HttpException(this.userNotFound(rpcId), HttpStatus.BAD_REQUEST);
    }

    // Check user on waiting transactions
    // const userPurchase = await this.userPurchaseRepository.findOne({
    //   where: {
    //     userId: user.id,
    //     state: {
    //       [Op.in]: [TransactionState.STATE_IN_PROGRESS, TransactionState.STATE_NEW],
    //     }
    //   }
    // });
    // if (userPurchase) {
    //   throw new HttpException(this.transactionAlreadyExist(rpcId), HttpStatus.BAD_REQUEST);
    // }

    // TODO: Check user have not already subscribe
    const purchaseLikes = purchase.purchase.superLikes;
    const purchaseReturns = purchase.purchase.returns;

    const item: TransactionItem = {
      title:
        purchase.purchase.title +
        (purchaseLikes > 0
          ? ` (${purchaseLikes} симпатий)`
          : purchaseReturns > 0
            ? ` (${purchaseReturns} возвратов)`
            : ''),
      price: parseInt(purchase.amount),
      count: 1,
      package_code: defaultPackageCode,
      code: defaultCode,
      vat_percent: defaultVatPercent,
    };
    const details: TransactionDetails = {
      receipt_type: 0,
      items: [item],
    };
    const additional = {
      name: item.title,
      price: item.price / 100,
      description: purchase.purchase.description,
      phone: user.phone,
    };
    return this.allow(rpcId, details, additional);
  }

  private async createTransaction(
    rpcId: number,
    id: string,
    time: number,
    amount: number,
    orderId: number,
    phone: string,
  ): Promise<Result> {
    if (typeof id !== 'string') {
      throw new HttpException(this.fieldsError(rpcId), HttpStatus.BAD_REQUEST);
    }

    const transaction: UserPurchase = await this.getTransaction(id);

    if (!transaction) {
      if (await this.checkPerformTransaction(rpcId, orderId, amount, phone)) {
        const user: User = await this.userRepository.findOne({
          where: { phone },
        });
        const purchase: UserPurchase =
          await this.userPurchaseRepository.findOne({
            where: { id: orderId },
          });
        if (purchase.state === TransactionState.STATE_NEW) {
          await purchase.update({
            transactionId: id,
            paycomTime: time,
            state: TransactionState.STATE_IN_PROGRESS,
            userId: user.id,
          });
          return this.createTransactionResult(rpcId, purchase);
        } else {
          throw new HttpException(
            this.transactionAlreadyExist(rpcId),
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    } else {
      if (transaction.state == TransactionState.STATE_IN_PROGRESS) {
        if (Date.now() - transaction.paycomTime > timeExpired) {
          throw new HttpException(
            this.unableComplete(rpcId),
            HttpStatus.BAD_REQUEST,
          );
        } else {
          return this.createTransactionResult(rpcId, transaction);
        }
      } else {
        await transaction.update({
          state: TransactionState.STATE_CANCELED,
          reason: TransactionCancelReason.TIMEOUT_ERROR,
          cancelTime: Date.now().toString(),
        });
        throw new HttpException(
          this.unableComplete(rpcId),
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  private async getTransaction(id: string): Promise<UserPurchase> {
    return await this.userPurchaseRepository.findOne({
      where: { transactionId: id },
    });
  }

  private async checkTransaction(rpcId: number, id: string): Promise<Result> {
    const transaction: UserPurchase = await this.getTransaction(id);
    if (!transaction) {
      throw new HttpException(
        this.error(rpcId, -31003),
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.createTransactionResult(rpcId, transaction);
  }

  private async performTransaction(rpcId: number, id: string) {
    const transaction: UserPurchase = await this.getTransaction(id);
    if (!transaction) {
      throw new HttpException(
        this.error(rpcId, -31003),
        HttpStatus.BAD_REQUEST,
      );
    }

    if (transaction.state === TransactionState.STATE_IN_PROGRESS) {
      if (Date.now() - transaction.paycomTime > timeExpired) {
        await transaction.update({
          state: TransactionState.STATE_CANCELED,
          reason: TransactionCancelReason.TIMEOUT_ERROR,
          cancelTime: Date.now().toString(),
        });
        throw new HttpException(
          this.unableComplete(rpcId),
          HttpStatus.BAD_REQUEST,
        );
      } else {
        const purchase: Purchase = await this.purchaseRepository.findOne({
          where: {
            id: transaction.purchaseId,
          },
        });
        if (!purchase) {
          throw new HttpException(
            this.fieldsError(rpcId),
            HttpStatus.BAD_REQUEST,
          );
        }

        const user: User = await this.userRepository.findOne({
          where: { id: transaction.userId },
        });
        if (purchase.superLikes || purchase.returns) {
          if (!user) {
            throw new HttpException(
              this.fieldsError(rpcId),
              HttpStatus.BAD_REQUEST,
            );
          }

          let superLikes: number = user.superLikes > 0 ? user.superLikes : 0;
          let returns: number = user.returns > 0 ? user.returns : 0;

          if (purchase.superLikes) {
            superLikes += purchase.superLikes;
          }

          if (purchase.returns) {
            returns += purchase.returns;
          }

          await user.update({
            superLikes,
            returns,
          });
        }

        await transaction.update({
          state: TransactionState.STATE_DONE,
          performTime: Date.now().toString(),
        });

        this.socketGateway.sendUpdateData(user.id);

        return this.createTransactionResult(rpcId, transaction);
      }
    } else if (transaction.state === TransactionState.STATE_DONE) {
      return this.createTransactionResult(rpcId, transaction);
    } else {
      throw new HttpException(
        this.error(rpcId, -31008),
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async cancelTransaction(rpcId: number, id: string, reason: number) {
    const transaction: UserPurchase = await this.getTransaction(id);
    if (!transaction) {
      throw new HttpException(
        this.error(rpcId, -31003),
        HttpStatus.BAD_REQUEST,
      );
    }

    if (transaction.state === TransactionState.STATE_IN_PROGRESS) {
      await transaction.update({
        state: TransactionState.STATE_CANCELED,
        reason,
        cancelTime: Date.now().toString(),
      });
      return this.createTransactionResult(rpcId, transaction);
    } else if (transaction.state === TransactionState.STATE_DONE) {
      // Нельзя отменять товар никогда
      await transaction.update({
        state: TransactionState.STATE_POST_CANCELED,
        reason,
        cancelTime: Date.now().toString(),
      });
      return this.createTransactionResult(rpcId, transaction);
    } else {
      return this.createTransactionResult(rpcId, transaction);
    }
  }

  private cancelForbidden(rpcId: number): ResultError {
    return this.error(rpcId, -31007);
  }

  private createTransactionResult(
    rpcId: number,
    transaction: UserPurchase,
  ): Result {
    return this.result(rpcId, {
      create_time: Date.parse(transaction.createdAt),
      perform_time: parseInt(transaction.performTime),
      cancel_time: parseInt(transaction.cancelTime),
      transaction: transaction.id.toString(),
      state: transaction.state,
      reason: transaction.reason === 0 ? null : transaction.reason,
    });
  }

  async getTransactions(user: User, dto: OffsetDto) {
    const offset = dto.offset > 0 ? dto.offset : 0;
    const limit = 20;
    const expireQuery = `created_at + INTERVAL '1 day' * purchase.expire_days`;

    return await this.userPurchaseRepository.findAll({
      where: {
        userId: user.id,
        state: {
          [Op.in]: [
            TransactionState.STATE_CANCELED,
            TransactionState.STATE_POST_CANCELED,
            TransactionState.STATE_DONE,
          ],
        },
      },
      attributes: {
        include: [
          [
            // Check if transaction is active
            sequelize.literal(`current_timestamp < ${expireQuery}`),
            'active',
          ],
          [
            // Get expired days
            sequelize.literal(
              `EXTRACT(days FROM ${expireQuery} - current_date)`,
            ),
            'expireDays',
          ],
        ],
      },
      include: [Purchase],
      order: [['createdAt', 'DESC']],
      offset,
      limit,
    });
  }

  async getAllTransactions(
    getDto: GetPurchaseAdminDto,
  ): Promise<UserPurchase[]> {
    const where = getDto.search
      ? {
          [Op.or]: {
            id: parseInt(getDto.search) ?? null,
            transactionId: getDto.search,
            userId: parseInt(getDto.search) ?? null,
          },
        }
      : null;

    return await this.userPurchaseRepository.findAll({
      include: [Purchase],
      where,
    });
  }

  private fieldsError(rpcId: number): ResultError {
    return this.error(rpcId, -32600);
  }

  private orderNotExist(rpcId: number): ResultError {
    return this.error(rpcId, -31050, {
      ru: 'Транзакция не найдена',
      en: 'Транзакция не найдена',
      uz: 'Транзакция не найдена',
    });
  }

  private userNotFound(rpcId: number): ResultError {
    return this.error(rpcId, -31051, {
      ru: 'Пользователь с таким номером телефона не найден',
      en: 'Пользователь с таким номером телефона не найден',
      uz: 'Пользователь с таким номером телефона не найден',
    });
  }

  private transactionAlreadyExist(rpcId: number): ResultError {
    return this.error(rpcId, -31052, {
      ru: 'Транзакция ожидает оплаты',
      en: 'Транзакция ожидает оплаты',
      uz: 'Транзакция ожидает оплаты',
    });
  }

  private wrongAmount(rpcId: number): ResultError {
    return this.error(rpcId, -31001, {
      ru: 'Неверная сумма платежа',
      en: 'Неверная сумма платежа',
      uz: 'Неверная сумма платежа',
    });
  }

  private unableComplete(rpcId: number): ResultError {
    return this.error(rpcId, -31008);
  }

  private error(
    rpcId: number,
    code: number,
    message?: ErrorMessage,
  ): ResultError {
    return {
      jsonrpc: '2.0',
      id: rpcId,
      error: {
        code,
        message,
      },
    };
  }

  private allow(
    id: number,
    detail?: TransactionDetails,
    additional?: Record<any, any>,
  ): Result {
    let r = { allow: true };
    if (detail) {
      r = Object.assign(r, { detail }, { additional });
    }
    return this.result(id, r);
  }

  private result(id: number, r: object): Result {
    return {
      jsonrpc: '2.0',
      id: id,
      result: r,
    };
  }
}
