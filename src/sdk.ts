import { logger, parse } from './deps.ts';
import { checkError } from './error.ts';
import { parseEventFromXml, WeixinBaseEvent } from './event.ts';
import {
  _uploadTempMedia,
  _uploadTempMediaByBase64,
  _uploadTempMediaByBuffer,
  _uploadTempMediaByUrl,
} from './media.ts';
import {
  WeixinCustomMenuItem,
  WeixinCustomMenuSubButton,
  _createCustomMenu,
  _deleteCustomMenu,
} from './menu.ts';
import { parseMessageFromXml, WeixinBaseMessage } from './message.ts';
import { QrCodeActionName, _generateQrCode } from './qrcode.ts';
import { WeixinReply } from './reply.ts';
import { WeixinSendContent, _sendMessage } from './send.ts';
import { AccessTokenManager } from './token.ts';

export type HandlerReplayResult =
  | Promise<WeixinReply | void | undefined>
  | WeixinReply
  | void
  | undefined;

export type WeixinHandler<T> = (event: T) => HandlerReplayResult;

export class WeixinSdk {
  private eventHandler?: WeixinHandler<WeixinBaseEvent>;
  private messageHandler?: WeixinHandler<WeixinBaseMessage>;

  constructor(
    public appId: string,
    public appSecret: string,
    public weixinUserName: string,
    private tokenManager: AccessTokenManager
  ) {
    this.tokenManager.init(appId, appSecret);
  }

  /**
   * 设置微信事件处理器
   * @param handler
   */
  setEventHandler(handler: WeixinHandler<WeixinBaseEvent>) {
    this.eventHandler = handler;
  }

  /**
   * 设置微信消息处理器
   * @param handler
   */
  setMessageHandler(handler: WeixinHandler<WeixinBaseMessage>) {
    this.messageHandler = handler;
  }

  /**
   * 获取accessToken
   * @param fn
   * @returns
   */
  async withToken<T>(fn: (token: string) => Promise<T>): Promise<T> {
    return await this.tokenManager.withToken<T>(fn);
  }

  /**
   * 处理来自微信的http调用
   * @param req Deno 原始的request对象
   * @returns
   */
  async handleRequest(req: Request): Promise<Response> {
    const text = await req.text();
    // deno-lint-ignore no-explicit-any
    let json: any = {};
    if (req.headers.get('content-type') === 'text/xml') {
      json = parse(text);
    } else if (req.headers.get('content-type') === 'application/json') {
      json = await req.json();
    }
    const url = new URL(req.url);
    const echostr = url.searchParams.get('echostr');

    let reply: WeixinReply | void;

    if (echostr) {
      logger.info('微信验证信息', 'echostr', echostr);
      return new Response(echostr);
    }

    if (json.xml?.MsgType === 'event') {
      const event = parseEventFromXml(json.xml);
      logger.debug('收到微信事件', event);
      reply = await this.eventHandler?.(event);
    } else {
      const msg = parseMessageFromXml(json.xml);
      logger.debug('收到微信消息', msg);
      reply = await this.messageHandler?.(msg);
    }

    if (reply) {
      return new Response(reply.xml, {
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    return new Response('success');
  }

  /**
   * 发送客服消息
   * @param msg
   * @returns
   */
  async sendMessage(msg: WeixinSendContent) {
    return await this.tokenManager.withToken(async (token) => {
      return await _sendMessage(token, msg);
    });
  }

  /**
   * 创建自定义菜单
   * @param buttons
   */
  async createCustomMenu(
    buttons: (WeixinCustomMenuSubButton | WeixinCustomMenuItem)[]
  ) {
    return await this.tokenManager.withToken(async (token) => {
      return await _createCustomMenu(token, buttons);
    });
  }

  /** 删除自定义菜单 */
  async deleteCustomMenu() {
    return await this.tokenManager.withToken(async (token) => {
      return await _deleteCustomMenu(token);
    });
  }

  async uploadTempMedia(
    type: 'image' | 'voice' | 'video' | 'thumb',
    data: Blob,
    fileName: string
  ) {
    return await this.tokenManager.withToken(async (token) => {
      return await _uploadTempMedia(token, type, data, fileName);
    });
  }

  async uploadTempMediaByUrl(
    type: 'image' | 'voice' | 'video' | 'thumb',
    url: string
  ) {
    return await this.tokenManager.withToken(async (token) => {
      return await _uploadTempMediaByUrl(token, type, url);
    });
  }

  async uploadTempMediaByBuffer(
    type: 'image' | 'voice' | 'video' | 'thumb',
    data: Uint8Array,
    mime = 'image/png'
  ) {
    return await this.tokenManager.withToken(async (token) => {
      return await _uploadTempMediaByBuffer(token, type, data, mime);
    });
  }

  async uploadTempMediaByBase64(
    type: 'image' | 'voice' | 'video' | 'thumb',
    data: string,
    mime?: string
  ) {
    return await this.tokenManager.withToken(async (token) => {
      return await _uploadTempMediaByBase64(token, type, data, mime);
    });
  }

  async generateQrCode(
    type: 'limit' | 'un_limit',
    expireSeconds: number,
    scene: { type: 'str'; value: string } | { type: 'id'; value: number }
  ) {
    let actionName: QrCodeActionName;
    let sceneStr: string | undefined = undefined;
    let sceneId: number | undefined = undefined;

    if (type === 'limit' && scene.type === 'id') {
      actionName = 'QR_LIMIT_SCENE';
      sceneId = scene.value;
    } else if (type === 'limit' && scene.type === 'str') {
      actionName = 'QR_LIMIT_STR_SCENE';
      sceneStr = scene.value;
    } else if (type === 'un_limit' && scene.type === 'id') {
      actionName = 'QR_SCENE';
      sceneId = scene.value;
    } else if (type === 'un_limit' && scene.type === 'str') {
      actionName = 'QR_STR_SCENE';
      sceneStr = scene.value;
    } else {
      throw new Error('Error Params');
    }

    return await this.tokenManager.withToken(async (token) => {
      return await _generateQrCode(
        token,
        expireSeconds,
        actionName,
        sceneStr,
        sceneId
      );
    });
  }

  async getUserInfo(openId: string, lang: 'zh_CN' | 'zh_TW' | 'en' = 'en') {
    return await this.withToken(async (token) => {
      const result = await fetch(
        `https://api.weixin.qq.com/cgi-bin/user/info?access_token=${token}&openid=${openId}&lang=${lang}`
      );
      const json = await checkError(result);
      return json as {
        subscribe: number;
        openid: string;
        language: string;
        subscribe_time: number;
        unionid?: string;
        remark: string;
        groupid: number;
        tagid_list: number[];
        subscribe_scene: string;
        qr_scene: string;
        qr_scene_str: string;
      };
    });
  }
}
