import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Req,
  Request,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PaymeEndpointDto } from './dto/payme-endpoint.dto';
import { Purchase } from './purchase.model';
import { PurchaseService } from './purchase.service';
import { UserPurchase } from './user-purchase.model';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { PurchaseExceptionFilter } from './purchase-exception.filter';
import { GetPurchaseIdDto } from './dto/get-purchase-id.dto';
import { GetPurchaseAdminDto } from './dto/get-admin.dto';
import { EditPurchaseDto } from './dto/edit-purchase.dto';
import {
  ClickCompleteDto,
  ClickCompleteResponse,
  ClickPrepareDto,
  ClickPrepareResponse,
} from './dto/click-endpoint.dto';
import { RefundTransactionDto } from './dto/refund-transaction.dto';
import { SmsGuard } from '../user/sms.guard';
import { RolesGuard } from '../role/roles.guard';
import { Roles } from '../role/roles-auth.decorator';
import { UserBlockGuard } from '../user/user-block.guard';
import { OffsetDto } from '../base/offset.dto';

@ApiTags('Покупки')
@Controller('purchase')
export class PurchaseController {
  constructor(private purchaseService: PurchaseService) {}

  @ApiOperation({ summary: 'Получение всех товаров' })
  @ApiResponse({ status: 200, type: [Purchase] })
  @Get('/get_all')
  @UseGuards(JwtAuthGuard, UserBlockGuard, SmsGuard)
  getAll() {
    return this.purchaseService.getAll();
  }

  @ApiOperation({ summary: 'Получение всех продуктов' })
  @ApiResponse({ status: 200, type: [Purchase] })
  @Get('/get_all_admin')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  getAllAdmin() {
    return this.purchaseService.getAllAdmin();
  }

  @ApiOperation({ summary: 'Добавить продукт (для админа)' })
  @ApiResponse({ status: 200, type: Purchase })
  @Post('/add_admin')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  addAdmin(@Body() createDto: CreatePurchaseDto): Promise<Purchase> {
    return this.purchaseService.addAdmin(createDto);
  }

  @ApiOperation({ summary: 'Изменить продукт (для админа)' })
  @ApiResponse({ status: 200, type: Purchase })
  @Post('/edit_admin')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  editAdmin(@Body() editDto: EditPurchaseDto): Promise<Purchase> {
    return this.purchaseService.editAdmin(editDto);
  }

  @ApiOperation({ summary: 'Вернуть деньги (для админа)' })
  @ApiResponse({ status: 200, type: UserPurchase })
  @Post('/refund')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  refund(@Body() refundDto: RefundTransactionDto): Promise<UserPurchase> {
    return this.purchaseService.refundTransaction(refundDto);
  }

  @ApiOperation({ summary: 'Создать транзакцию' })
  @ApiResponse({ status: 200, type: UserPurchase })
  @Get('/get_order_id')
  @UseGuards(JwtAuthGuard, UserBlockGuard, SmsGuard)
  getOrderId(
    @Req() req,
    @Query() getDto: GetPurchaseIdDto,
  ): Promise<UserPurchase> {
    return this.purchaseService.getPurchaseId(req.user, getDto);
  }

  @ApiOperation({ summary: 'Endpoint для платежной системы Payme' })
  @ApiResponse({ status: 200, type: [Purchase] })
  @Post('/payment_endpoint')
  @HttpCode(200)
  @UseFilters(new PurchaseExceptionFilter())
  paymentEndpoint(@Body() data: PaymeEndpointDto, @Request() req) {
    // TODO: Check authorization
    if (
      req.headers.authorization !==
      `Basic ${btoa('Paycom:yc6wm&BQ#EkDz21xJD9%kCEkGNwwKCP2n%jA')}`
    ) {
      throw new HttpException(
        {
          jsonrpc: '2.0',
          id: data?.id,
          error: {
            code: -32504,
            message: {
              ru: 'Авторизация не пройдена',
              en: 'Авторизация не пройдена',
              uz: 'Авторизация не пройдена',
            },
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.purchaseService.paymeEndpoint(data);
  }

  @ApiOperation({ summary: 'Endpoint для платежной системы Click (Prepare)' })
  @ApiResponse({ status: 200, type: ClickPrepareResponse })
  @Post('/click_prepare')
  @HttpCode(200)
  clickPrepare(@Body() data: ClickPrepareDto): Promise<ClickPrepareResponse> {
    console.log('CLICK PREPARE', data);
    this.purchaseService.clickPrepareCheckSign(data);
    return this.purchaseService.clickPrepare(data);
  }

  @ApiOperation({ summary: 'Endpoint для платежной системы Click (Complete)' })
  @ApiResponse({ status: 200, type: ClickPrepareResponse })
  @Post('/click_complete')
  @HttpCode(200)
  clickComplete(
    @Body() data: ClickCompleteDto,
  ): Promise<ClickCompleteResponse> {
    console.log('CLICK COMPLETE', data);
    this.purchaseService.clickCompleteCheckSign(data);
    return this.purchaseService.clickComplete(data);
  }

  @ApiOperation({ summary: 'Получение всех транзакций пользователя' })
  @ApiResponse({ status: 200, type: [UserPurchase] })
  @Get('/get_transactions')
  @UseGuards(JwtAuthGuard, UserBlockGuard, SmsGuard)
  getTransactions(@Req() req, @Query() offsetDto: OffsetDto) {
    return this.purchaseService.getTransactions(req.user, offsetDto);
  }

  @ApiOperation({
    summary: 'Получение всех транзакций пользователей (для админа)',
  })
  @ApiResponse({ status: 200, type: [UserPurchase] })
  @Get('/get_all_transactions')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  getAllTransactions(@Query() param: GetPurchaseAdminDto) {
    return this.purchaseService.getAllTransactions(param);
  }
}
