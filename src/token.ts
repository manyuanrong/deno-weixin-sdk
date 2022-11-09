import { checkError, TokenExpiredError } from './error.ts';

/**
 * AccessToken管理器，由于微信AccessToken获取频率有限制，且一次只能有一个有效token。
 * 实现管理器用于管理token的获取和缓存，可以缓存到内存或者是使用redis有或者是通过http从其他应用获取
 */
export abstract class AccessTokenManager {
  constructor() {}
  abstract getToken(): Promise<string>;
  abstract refreshToken(): Promise<string>;

  protected appId!: string;
  protected appSecret!: string;

  init(appId: string, appSecret: string) {
    this.appId = appId;
    this.appSecret = appSecret;
  }

  async withToken<T>(fn: (token: string) => Promise<T>): Promise<T> {
    const token = await this.getToken();
    try {
      return await fn(token);
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        // token过期或者失效, 刷新token，重试一次
        const token = await this.refreshToken();
        return await fn(token);
      }
      throw error;
    }
  }
}

/**
 * 该API用于从微信获取AccessToken
 * 注意：微信一次只有一个有效token，通过此方法获取注意会使其他地方获取到token失效。
 * 除非是编写新的 AccessTokenManager，否则谨慎调用此API
 * @param appId
 * @param appSecret
 * @returns
 */
export async function generateAccessTokenFromWeixin(
  appId: string,
  appSecret: string
) {
  const result = await fetch(
    `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`
  );
  const { access_token }: { access_token: string } = await checkError(result);
  return access_token;
}

/**
 * 内存AccessToken管理器，用于将token缓存到内存中。也可以自动或手动刷新token
 * 注意：该管理器基于内存，只能应用在单示例的应用中，否则会token互斥出现严重的token失效错误
 */
export class MemoryAccessTokenManager extends AccessTokenManager {
  token?: string;

  constructor(autoRefresh: boolean = false) {
    super();
    if (autoRefresh) {
      // 定期刷新token
      setInterval(() => this.refreshToken(), 6000 * 1000);
    }
  }

  async refreshToken() {
    this.token = undefined;
    return await this.getToken();
  }

  async getToken(): Promise<string> {
    if (!this.token) {
      this.token = await generateAccessTokenFromWeixin(
        this.appId,
        this.appSecret
      );
    }
    return this.token;
  }
}
