import { checkError } from './error.ts';

export interface WeixinSendTextContent {
  touser: string;
  msgtype: 'text';
  text: { content: string };
}

export interface WeixinSendImageContent {
  touser: string;
  msgtype: 'image';
  image: { media_id: string };
}

export interface WeixinSendVoiceContent {
  touser: string;
  msgtype: 'voice';
  voice: { media_id: string };
}

export interface WeixinSendVideoContent {
  touser: string;
  msgtype: 'video';
  video: {
    media_id: string;
    thumb_media_id: string;
    title: string;
    description: string;
  };
}

export interface WeixinSendMusicContent {
  touser: string;
  msgtype: 'video';
  music: {
    hqmusicurl: string;
    thumb_media_id: string;
    title: string;
    musicurl: string;
    description: string;
  };
}

export interface WeixinSendMenuContent {
  touser: string;
  msgtype: 'msgmenu';
  msgmenu: {
    head_content: string;
    list: {
      id: number;
      content: string;
    }[];
  };
  tail_content?: string;
}

export interface WeixinSendMiniProgramPageContent {
  touser: string;
  msgtype: 'miniprogrampage';
  miniprogrampage: {
    title: string;
    appid: string;
    pagepath: string;
    thumb_media_id: string;
  };
}

export type WeixinSendContent =
  | WeixinSendMenuContent
  | WeixinSendMusicContent
  | WeixinSendVideoContent
  | WeixinSendVoiceContent
  | WeixinSendImageContent
  | WeixinSendTextContent
  | WeixinSendMiniProgramPageContent;

export async function _sendMessage(
  accessToken: string,
  msg: WeixinSendContent
) {
  const result = await fetch(
    `https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=${accessToken}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg),
    }
  );
  const json = await checkError(result);
  return json;
}
