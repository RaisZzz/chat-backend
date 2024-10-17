import { Injectable } from '@nestjs/common';
import {
  TransactionCancelReason,
  TransactionState,
} from '../purchase/purchase.service';
import { Sequelize } from 'sequelize-typescript';
import { StatisticFilterDto } from './dto/statistic-filter.dto';
import { UserPurchase } from '../purchase/user-purchase.model';
import { ChatType } from '../chat/chat.model';

export class MainStat {
  totalProfit: number;
  monthlyProfit: number;
  totalSales: number;
  monthlySales: number;
  totalRefunds: number;
  monthlyRefunds: number;
  totalRefundsSum: number;
  monthlyRefundsSum: number;
  totalAndroidUsers: number;
  totalIosUsers: number;
  totalMaleUsers: number;
  totalFemaleUsers: number;
  totalCitiesUsers: Record<any, any>[];
  totalPairs: number;
}

@Injectable()
export class StatisticService {
  constructor(private readonly sequelize: Sequelize) {}

  async getPurchases(filterDto: StatisticFilterDto): Promise<UserPurchase[]> {
    const offset: number = filterDto.offset || 0;

    const refundsFilter = `state IN (${TransactionState.STATE_CANCELED}, ${TransactionState.STATE_POST_CANCELED}) AND reason = ${TransactionCancelReason.REFUND}`;
    const successFilter = `state = ${TransactionState.STATE_DONE}`;
    const stateFilter: string = [true, 'true'].includes(filterDto.showRefunds)
      ? refundsFilter
      : successFilter;

    const genderFilter: string = [0, 1].includes(filterDto.sex)
      ? `AND (
        SELECT sex FROM "user"
        WHERE id = p.user_id
      ) = ${filterDto.sex}`
      : '';

    const livePlaceFilter: string =
      Array.isArray(filterDto.livePlaceId) && filterDto.livePlaceId.length
        ? `AND (
        SELECT live_place_id FROM "user"
        WHERE id = p.user_id
      ) IN (${filterDto.livePlaceId})`
        : '';

    const dateFilter: string = filterDto.startDate
      ? filterDto.showRefunds === true
        ? `
          AND p.cancel_time >= ${new Date(filterDto.startDate).getTime()}`
        : `
          AND p.created_at >= '${filterDto.startDate}'
          `
      : '';

    const searchFilter =
      filterDto.search && filterDto.search.trim().length
        ? `AND (
            ${this.searchColumnLike('purchase.id', filterDto.search)}
            OR ${this.searchColumnLike('purchase.name', filterDto.search)}
            OR ${this.searchColumnLike('purchase.title', filterDto.search)}
            OR ${this.searchColumnLike('purchase.title_en', filterDto.search)}
            OR ${this.searchColumnLike('purchase.title_uz', filterDto.search)}
            OR ${this.searchColumnLike(
              'purchase.title_uz_cyr',
              filterDto.search,
            )}
            OR ${this.searchColumnLike('p.id', filterDto.search)}
            OR ${this.searchColumnLike('p.amount', filterDto.search)}
            OR ${this.searchColumnLike('p.transaction_id', filterDto.search)}
            OR ${this.searchColumnLike('p.user_id', filterDto.search)}
          )`
        : '';

    const filter = `
      ${stateFilter}
      ${genderFilter}
      ${livePlaceFilter}
      ${dateFilter}
      ${searchFilter}
    `;

    const [transactions] = await this.sequelize.query(`
      SELECT p.*,
      row_to_json(purchase) purchase
      FROM user_purchase p
      JOIN purchase ON purchase.id = p.purchase_id
      WHERE ${filter}
      ORDER BY created_at DESC
      OFFSET ${offset}
      LIMIT 20
    `);

    return transactions as UserPurchase[];
  }

  private searchColumnLike(column: string, like: string): string {
    return `
      LOWER(replace(${column}::text, ' ', ''))
      LIKE '%${like.replace(' ', '').toLowerCase()}%'
    `;
  }

  async usersStatistic(filterDto: StatisticFilterDto): Promise<any> {
    const [firstUser] = await this.sequelize.query(`
        SELECT created_at FROM user
        ORDER BY created_at ASC
        LIMIT 1
      `);

    const today: Date = new Date();
    const startDate: Date =
      new Date(filterDto.startDate) || new Date(firstUser[0]['created_at']);
    const dateSteps = (today.getTime() - startDate.getTime()) / 7;
    const chartData = [];
    for (
      let i: Date = startDate;
      i < today;
      i.setMilliseconds(i.getMilliseconds() + dateSteps)
    ) {
      const date: Date = new Date(i.getTime());
      const firstDate: number = date.getTime();
      date.setMilliseconds(date.getMilliseconds() + dateSteps);
      const lastDate: number = date.getTime();
      const [maleChat] = await this.sequelize.query(`
          SELECT COUNT(*) "allCount"
          FROM "user"
          WHERE sex = 1
          AND created_at >= ${firstDate}
          AND created_at < ${lastDate}
        `);
      const [femaleChart] = await this.sequelize.query(`
          SELECT COUNT(*) "allCount"
          FROM "user"
          WHERE sex = 0
          AND cancel_time >= ${firstDate}
          AND cancel_time < ${lastDate}
        `);
      chartData.push({
        date: new Date(firstDate).toISOString(),
        maleCount: parseInt(maleChat[0]['allCount']) || 0,
        femaleCount: parseInt(femaleChart[0]['allCount']) || 0,
      });
    }

    return { chartData };
  }

  async purchaseStatistic(filterDto: StatisticFilterDto): Promise<any> {
    const refundsFilter = `state IN (${TransactionState.STATE_CANCELED}, ${TransactionState.STATE_POST_CANCELED}) AND reason = ${TransactionCancelReason.REFUND}`;
    const successFilter = `state = ${TransactionState.STATE_DONE}`;
    const stateFilter: string = [true, 'true'].includes(filterDto.showRefunds)
      ? refundsFilter
      : successFilter;

    const genderFilter: string = [0, 1].includes(
      parseInt(filterDto.sex?.toString()),
    )
      ? `AND (
        SELECT sex FROM "user"
        WHERE id = p.user_id
      ) = ${filterDto.sex}`
      : '';

    const livePlaceFilter: string =
      Array.isArray(filterDto.livePlaceId) && filterDto.livePlaceId.length
        ? `AND (
        SELECT live_place_id FROM "user"
        WHERE id = p.user_id
      ) IN (${filterDto.livePlaceId})`
        : '';

    const dateFilter: string = filterDto.startDate
      ? filterDto.showRefunds === true
        ? `
          AND p.cancel_time >= ${new Date(filterDto.startDate).getTime()}`
        : `
          AND p.created_at >= '${filterDto.startDate}'
          `
      : '';

    const filter = `
      ${stateFilter}
      ${genderFilter}
      ${livePlaceFilter}
      ${dateFilter}
    `;

    const response = {};

    const [allCounts] = await this.sequelize.query(`
        SELECT name, title,
        (
          SELECT COUNT(*) FROM user_purchase p
          WHERE purchase_id = purchase.id
          AND ${filter}
        ) as "count",
        (
          SELECT coalesce(SUM(amount), 0) FROM user_purchase p
          WHERE purchase_id = purchase.id
          AND ${filter}
        ) as "total"
        FROM purchase
      `);
    response['allCounts'] = allCounts;

    const [firstPurchase] = await this.sequelize.query(`
        SELECT created_at FROM user_purchase
        ORDER BY created_at ASC
        LIMIT 1
      `);

    const today: Date = new Date();
    const startDate: Date =
      new Date(filterDto.startDate) || new Date(firstPurchase[0]['created_at']);
    const dateSteps = (today.getTime() - startDate.getTime()) / 7;
    const chartData = [];
    for (
      let i: Date = startDate;
      i < today;
      i.setMilliseconds(i.getMilliseconds() + dateSteps)
    ) {
      const date: Date = new Date(i.getTime());
      const firstDate: string = date.toISOString();
      date.setMilliseconds(date.getMilliseconds() + dateSteps);
      const lastDate: string = date.toISOString();
      const [successChart] = await this.sequelize.query(`
          SELECT coalesce(SUM(amount), 0) "allSum", COUNT(*) "allCount"
          FROM user_purchase p
          WHERE
          ${successFilter}
          ${genderFilter}
          ${livePlaceFilter}
          AND created_at >= '${firstDate}'
          AND created_at < '${lastDate}'
        `);
      const [refundsChart] = await this.sequelize.query(`
          SELECT coalesce(SUM(amount), 0) "allSum", COUNT(*) "allCount"
          FROM user_purchase p
          WHERE
          ${refundsFilter}
          ${genderFilter}
          ${livePlaceFilter}
          AND cancel_time >= ${new Date(firstDate).getTime()}
          AND cancel_time < ${new Date(lastDate).getTime()}
        `);
      chartData.push({
        date: firstDate,
        successSum: parseInt(successChart[0]['allSum']) || 0,
        successCount: parseInt(successChart[0]['allCount']) || 0,
        refundsSum: parseInt(refundsChart[0]['allSum']) || 0,
        refundsCount: parseInt(refundsChart[0]['allCount']) || 0,
      });
    }
    response['chartData'] = chartData;

    return response;
  }

  async getMainStatistic(): Promise<MainStat> {
    let totalProfit = 0;
    let monthlyProfit = 0;
    let totalSales = 0;
    let monthlySales = 0;
    let totalRefunds = 0;
    let monthlyRefunds = 0;
    let totalRefundsSum = 0;
    let monthlyRefundsSum = 0;
    let totalAndroidUsers = 0;
    let totalIosUsers = 0;
    let totalMaleUsers = 0;
    let totalFemaleUsers = 0;
    let totalCitiesUsers: Record<any, any>[] = [];
    let totalPairs = 0;

    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    const lastDay = new Date(year, month + 1, 0).getDate();

    const startMonthString = `${year}-${month + 1}-01`;
    const endMonthString = `${year}-${month + 1}-${lastDay}`;
    const monthlyQuery = `AND created_at >= '${startMonthString}' AND created_at <= '${endMonthString}'`;

    const totalProfitQuery = `(
      SELECT coalesce(SUM(amount), 0) FROM user_purchase WHERE state = ${TransactionState.STATE_DONE}
    ) "totalProfit"`;
    const monthlyProfitQuery = `(
      SELECT coalesce(SUM(amount), 0) FROM user_purchase WHERE state = ${TransactionState.STATE_DONE}
      ${monthlyQuery}
    ) "monthlyProfit"`;

    const totalRefundsSumQuery = `(
      SELECT coalesce(SUM(amount), 0) FROM user_purchase
      WHERE state IN (${TransactionState.STATE_CANCELED}, ${TransactionState.STATE_POST_CANCELED})
      AND reason = ${TransactionCancelReason.REFUND}
    ) "totalRefundsSum"`;
    const monthlyRefundsSumQuery = `(
      SELECT coalesce(SUM(amount), 0) FROM user_purchase
      WHERE state IN (${TransactionState.STATE_CANCELED}, ${
        TransactionState.STATE_POST_CANCELED
      })
      AND reason = ${TransactionCancelReason.REFUND}
      AND cancel_time >= ${new Date(
        year,
        month,
        1,
        0,
        0,
        0,
      ).getTime()} AND cancel_time <= ${new Date(
        year,
        month,
        lastDay,
        23,
        59,
        59,
      ).getTime()}
    ) "monthlyRefundsSum"`;

    const totalSalesQuery = `(
      SELECT coalesce(COUNT(*), 0) FROM user_purchase WHERE state = ${TransactionState.STATE_DONE}
    ) "totalSales"`;
    const monthlySalesQuery = `(
      SELECT coalesce(COUNT(*), 0) FROM user_purchase WHERE state = ${TransactionState.STATE_DONE}
      ${monthlyQuery}
    ) "monthlySales"`;

    const totalRefundsQuery = `(
      SELECT coalesce(COUNT(*), 0) FROM user_purchase
      WHERE state IN (${TransactionState.STATE_CANCELED}, ${TransactionState.STATE_POST_CANCELED})
      AND reason = ${TransactionCancelReason.REFUND}
    ) "totalRefunds"`;
    const monthlyRefundsQuery = `(
      SELECT coalesce(COUNT(*), 0) FROM user_purchase
      WHERE state IN (${TransactionState.STATE_CANCELED}, ${
        TransactionState.STATE_POST_CANCELED
      })
      AND reason = ${TransactionCancelReason.REFUND}
      AND cancel_time >= ${new Date(
        today.getFullYear(),
        today.getMonth(),
        1,
      ).getTime()} AND cancel_time <= ${new Date(
        today.getFullYear(),
        today.getMonth(),
        lastDay,
      ).getTime()}
    ) "monthlyRefunds"`;

    const totalAndroidUsersQuery = `(
      SELECT count(*) FROM "user" WHERE platform = 'android'
    ) "totalAndroidUsers"`;
    const totalIosUsersQuery = `(
      SELECT count(*) FROM "user" WHERE platform = 'ios'
    ) "totalIosUsers"`;

    const totalMaleUsersQuery = `(
      SELECT count(*) FROM "user" WHERE sex = 1
    ) "totalMaleUsers"`;
    const totalFemaleUsersQuery = `(
      SELECT count(*) FROM "user" WHERE sex = 0
    ) "totalFemaleUsers"`;

    const totalPairsQuery = `(
      SELECT count(*) FROM "chat" WHERE type = ${ChatType.user}
    ) "totalPairs"`;

    const [response] = await this.sequelize.query(`
      SELECT
      ${totalProfitQuery},
      ${monthlyProfitQuery},
      ${totalSalesQuery},
      ${monthlySalesQuery},
      ${totalRefundsSumQuery},
      ${monthlyRefundsSumQuery},
      ${totalRefundsQuery},
      ${monthlyRefundsQuery},
      ${totalAndroidUsersQuery},
      ${totalIosUsersQuery},
      ${totalMaleUsersQuery},
      ${totalFemaleUsersQuery},
      ${totalPairsQuery}
    `);

    if (response.length) {
      totalProfit = parseInt(response[0]['totalProfit']) || 0;
      monthlyProfit = parseInt(response[0]['monthlyProfit']) || 0;
      totalSales = parseInt(response[0]['totalSales']) || 0;
      monthlySales = parseInt(response[0]['monthlySales']) || 0;
      totalRefunds = parseInt(response[0]['totalRefunds']) || 0;
      monthlyRefunds = parseInt(response[0]['monthlyRefunds']) || 0;
      totalRefundsSum = parseInt(response[0]['totalRefundsSum']) || 0;
      monthlyRefundsSum = parseInt(response[0]['monthlyRefundsSum']) || 0;
      totalAndroidUsers = parseInt(response[0]['totalAndroidUsers']) || 0;
      totalIosUsers = parseInt(response[0]['totalIosUsers']) || 0;
      totalMaleUsers = parseInt(response[0]['totalMaleUsers']) || 0;
      totalFemaleUsers = parseInt(response[0]['totalFemaleUsers']) || 0;
      totalPairs = parseInt(response[0]['totalPairs']) || 0;
    }

    const [citiesResponse] = await this.sequelize.query(`
      SELECT id,
      (SELECT COUNT(*) FROM "user" where birth_place_id = "city".id) as "birthPlaceUsers",
      (SELECT COUNT(*) FROM "user" where live_place_id = "city".id) as "livePlaceUsers"
      FROM city
    `);
    if (citiesResponse.length) {
      totalCitiesUsers = citiesResponse;
    }

    return {
      totalProfit,
      monthlyProfit,
      totalSales,
      monthlySales,
      totalRefunds,
      monthlyRefunds,
      totalRefundsSum,
      monthlyRefundsSum,
      totalAndroidUsers,
      totalIosUsers,
      totalMaleUsers,
      totalFemaleUsers,
      totalCitiesUsers,
      totalPairs,
    };
  }
}
