基于 Deno 的微信公众号 SDK

## 使用方法

```ts
import { serve } from 'https://deno.land/std@0.163.0/http/server.ts';

import {
  WeixinSdk,
  MemoryAccessTokenManager,
  WeixinBaseEvent,
  WeixinBaseMessage,
  WeixinTextMessage,
  WeixinSubscribeEvent,
} from './mod.ts';

// 微AccessToken管理器，该类用于管理SDK中调用微信API的accessToken
// 由于微信的token只能有唯一的一个，且生成新的token会使旧的token失效，
// 并且token的有效期只有2小时，且获取频率受限制，所以必须对它进行有效管理。
// MemoryAccessTokenManager管理器用于自动申请token并在内存中缓存起来
// 注意，MemoryAccessTokenManager 是基于内存管理，如果你的程序不是单实例，请不要使用它
// 而应该考虑继承AccessTokenManager实现自己的管理器，比如基于redis缓存
const tokenManager = MemoryAccessTokenManager();

const sdk = new WeixinSdk(
  'appid',
  'appSecret',
  '公众号用户名',
  new MemoryAccessTokenManager()
);

// 设置用户消息处理函数，这里处理用户的各种事件: 点击菜单，关注公众号、取消关注公众号，扫码等等
sdk.setEventHandler((event: WeixinBaseEvent) => {
  console.log('收到微信事件');
  // 收到的消息类型是WeixinBaseEvent，是所有事件的基础类型。event.type判断为指定事件之后可以通过断言转换为特定的事件类型
  if (event.event === 'subscribe') {
    event as WeixinSubscribeEvent;
    // 这是用户关注事件
  }
});

// 设置用户消息处理函数，这里处理用户输入的各种消息: 文本、图片、音频等等
sdk.setMessageHandler((msg: WeixinBaseMessage) => {
  console.log('收到微信消息');
  // 收到的消息类型是WeixinBaseMessage，是所有消息的基础类型。event.type判断为指定消息之后可以通过断言转换为特定的消息类型
  if (msg.msgType === 'text') {
    event as WeixinTextMessage;
    // 这是文本消息
  }

  // 这是一个自动回复示例，回复给用户一段文本。其他类型消息的回复类似
  return new WeixinTextReply({
    // 消息体中的fromUserName为发送消息的用户的openId
    openId: msg.fromUserName;
    // 消息体中的toUserName为用户发送的消息的接收方，也就是公众号本身
    appUserName: msg.toUserName;
    content: "你好！"
  })
});

serve(async (request) => {
  // 该调用放在接收微信请求的路由下，是微信唯一的回调入口。传递原始的Request对象即可。返回值为Response对象，作为微信回调的应答
  const response = await sdk.handleRequest(request);
  return response;
});
```
