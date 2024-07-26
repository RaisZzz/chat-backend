import { Injectable } from '@nestjs/common';
import { createClient } from 'redis';

@Injectable()
export class RedisService {
  private client;

  constructor() {
    this.init().then(() => console.log('REDIS STARTED'));
  }

  async init() {
    this.client = createClient({
      password:
        process.env.NODE_ENV === 'production'
          ? process.env.REDIS_PASSWORD
          : null,
    });
    await this.client.connect();
  }

  async set(key: string, value: string) {
    return await this.client.set(key, value);
  }

  async hSet(key: string, field: string, value: string) {
    return await this.client.hSet(key, field, value);
  }

  async get(key: string) {
    return await this.client.get(key);
  }

  async hGet(key: string, field: string) {
    return await this.client.hGet(key, field);
  }

  async hGetAll(key: string) {
    return await this.client.hGetAll(key);
  }

  async hDel(key: string, value: string) {
    return await this.client.hDel(key, value);
  }

  async lPush(key: string, value: string) {
    try {
      return await this.client.lPush(key, value);
    } catch (e) {}
  }

  async lRem(key: string, value: string) {
    try {
      return await this.client.lRem(key, 0, value);
    } catch (e) {}
  }

  async del(key: string) {
    try {
      return await this.client.del(key);
    } catch (e) {}
  }

  async lRange(key: string, start: number, end: number): Promise<any> {
    try {
      return await this.client.lRange(key, start, end);
    } catch (e) {
      return [];
    }
  }

  async lGetAll(key: string): Promise<[]> {
    try {
      return await this.lRange(key, 0, -1);
    } catch (e) {
      return [];
    }
  }

  async lAddIfNotExist(key: string, value: string) {
    await this.lRem(key, value);
    await this.lPush(key, value);
  }
}
