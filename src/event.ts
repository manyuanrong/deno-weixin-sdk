// deno-lint-ignore-file no-explicit-any

export type WeixinEventType =
  | 'subscribe'
  | 'unsubscribe'
  | 'SCAN'
  | 'LOCATION'
  | 'CLICK'
  | 'VIEW';

export class WeixinBaseEvent {
  msgType = 'event';
  toUserName: string;
  fromUserName: string;
  createTime: string;
  event: WeixinEventType;

  constructor(xml: any) {
    this.event = xml.Event;
    this.toUserName = xml.ToUserName;
    this.fromUserName = xml.FromUserName;
    this.createTime = xml.CreateTime;
  }
}

export class WeixinSubscribeEvent extends WeixinBaseEvent {
  eventKey?: string;
  ticket?: string;
  constructor(xml: any) {
    super(xml);
    this.eventKey = xml.EventKey;
    this.ticket = xml.Ticket;
  }
}

export class WeixinUnsubscribeEvent extends WeixinBaseEvent {}

export class WeixinScanEvent extends WeixinBaseEvent {
  eventKey: string;
  ticket: string;
  constructor(xml: any) {
    super(xml);
    this.eventKey = xml.EventKey;
    this.ticket = xml.Ticket;
  }
}

export class WeixinLocationEvent extends WeixinBaseEvent {
  latitude: number;
  longitude: number;
  precision: number;
  constructor(xml: any) {
    super(xml);
    this.latitude = xml.Latitude;
    this.longitude = xml.Longitude;
    this.precision = xml.Precision;
  }
}

export class WeixinClickEvent extends WeixinBaseEvent {
  eventKey: string;
  constructor(xml: any) {
    super(xml);
    this.eventKey = xml.EventKey;
  }
}

export class WeixinViewEvent extends WeixinClickEvent {}

export type WeixinEvent =
  | WeixinSubscribeEvent
  | WeixinUnsubscribeEvent
  | WeixinClickEvent
  | WeixinViewEvent
  | WeixinLocationEvent
  | WeixinScanEvent;

const EventMappers = {
  subscribe: WeixinSubscribeEvent,
  unsubscribe: WeixinUnsubscribeEvent,
  SCAN: WeixinScanEvent,
  LOCATION: WeixinLocationEvent,
  CLICK: WeixinClickEvent,
  VIEW: WeixinViewEvent,
};

export function parseEventFromXml(xml: any) {
  return new EventMappers[xml.Event as keyof typeof EventMappers](xml);
}
