// deno-lint-ignore-file no-explicit-any

export type WeixinMessageType =
  | 'text'
  | 'voice'
  | 'image'
  | 'video'
  | 'location'
  | 'link';

export class WeixinBaseMessage {
  msgType: WeixinMessageType;
  toUserName: string;
  fromUserName: string;
  createTime: string;
  msgId: number;

  constructor(xml: any) {
    this.msgId = xml.MsgId;
    this.msgType = xml.MsgType;
    this.toUserName = xml.ToUserName;
    this.fromUserName = xml.FromUserName;
    this.createTime = xml.CreateTime;
  }
}

export class WeixinTextMessage extends WeixinBaseMessage {
  content: string;
  msgType: 'text';
  bizmsgmenuid?: number;
  constructor(xml: any) {
    super(xml);
    this.content = '' + xml.Content;
    this.msgType = xml.MsgType;
    this.bizmsgmenuid = xml.bizmsgmenuid;
  }
}

export class WeixinImageMessage extends WeixinBaseMessage {
  picUrl: string;
  mediaId: string;
  msgDataId: string;
  constructor(xml: any) {
    super(xml);
    this.picUrl = xml.PicUrl;
    this.mediaId = xml.MediaId;
    this.msgDataId = xml.MsgDataId;
  }
}

export class WeixinVoiceMessage extends WeixinBaseMessage {
  mediaId: string;
  format: string;
  msgDataId: string;
  constructor(xml: any) {
    super(xml);
    this.mediaId = xml.MediaId;
    this.format = xml.Format;
    this.msgDataId = xml.MsgDataId;
  }
}

export class WeixinVideoMessage extends WeixinBaseMessage {
  mediaId: string;
  thumbMediaId: string;
  msgDataId: string;
  constructor(xml: any) {
    super(xml);
    this.mediaId = xml.MediaId;
    this.thumbMediaId = xml.ThumbMediaId;
    this.msgDataId = xml.MsgDataId;
  }
}

export class WeixinLocationMessage extends WeixinBaseMessage {
  locationX: number;
  locationY: number;
  scale: number;
  label: string;
  msgDataId: string;
  constructor(xml: any) {
    super(xml);
    this.locationX = xml.Location_X;
    this.locationY = xml.Location_Y;
    this.scale = xml.Scale;
    this.label = xml.Label;
    this.msgDataId = xml.MsgDataId;
  }
}

export class WeixinLinkMessage extends WeixinBaseMessage {
  description: string;
  title: string;
  url: string;
  msgDataId: string;
  constructor(xml: any) {
    super(xml);
    this.title = xml.Title;
    this.description = xml.Description;
    this.url = xml.Url;
    this.msgDataId = xml.MsgDataId;
  }
}

export type WeixinMessage =
  | WeixinTextMessage
  | WeixinLocationMessage
  | WeixinLinkMessage
  | WeixinVideoMessage
  | WeixinImageMessage
  | WeixinVoiceMessage
  | WeixinVideoMessage;

const MessageMappers = {
  text: WeixinTextMessage,
  voice: WeixinVoiceMessage,
  image: WeixinImageMessage,
  video: WeixinVideoMessage,
  location: WeixinLocationMessage,
  link: WeixinLinkMessage,
};

export function parseMessageFromXml(xml: any) {
  return new MessageMappers[xml.MsgType as keyof typeof MessageMappers](xml);
}
