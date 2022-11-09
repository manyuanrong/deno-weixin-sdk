export class WeixinReply {
  constructor(public xml: string) {}
}

export class WeixinTextReply extends WeixinReply {
  constructor(args: { openId: string; appUserName: string; content: string }) {
    super(`<xml>
  <ToUserName><![CDATA[${args.openId}]]></ToUserName>
  <FromUserName><![CDATA[${args.appUserName}]]></FromUserName>
  <CreateTime>${Date.now()}</CreateTime>
  <MsgType><![CDATA[text]]></MsgType>
  <Content><![CDATA[${args.content}]]></Content>
</xml>
`);
  }
}

export class WeixinImageReply extends WeixinReply {
  constructor(args: { openId: string; appUserName: string; mediaId: string }) {
    super(`<xml>
  <ToUserName><![CDATA[${args.openId}]]></ToUserName>
  <FromUserName><![CDATA[${args.appUserName}]]></FromUserName>
  <CreateTime>${Date.now()}</CreateTime>
  <MsgType><![CDATA[image]]></MsgType>
  <Image>
    <MediaId><![CDATA[${args.mediaId}]]></MediaId>
  </Image>
</xml>
`);
  }
}

export class WeixinVoiceReply extends WeixinReply {
  constructor(args: { openId: string; appUserName: string; mediaId: string }) {
    super(`<xml>
  <ToUserName><![CDATA[${args.openId}]]></ToUserName>
  <FromUserName><![CDATA[${args.appUserName}]]></FromUserName>
  <CreateTime>${Date.now()}</CreateTime>
  <MsgType><![CDATA[voice]]></MsgType>
  <Voice>
    <MediaId><![CDATA[${args.mediaId}]]></MediaId>
  </Voice>
</xml>
`);
  }
}

export class WeixinVideoReply extends WeixinReply {
  constructor(args: {
    openId: string;
    appUserName: string;
    mediaId: string;
    title: string;
    description: string;
  }) {
    super(`<xml>
  <ToUserName><![CDATA[${args.openId}]]></ToUserName>
  <FromUserName><![CDATA[${args.appUserName}]]></FromUserName>
  <CreateTime>${Date.now()}</CreateTime>
  <MsgType><![CDATA[video]]></MsgType>
  <Video>
    <MediaId><![CDATA[${args.mediaId}]]></MediaId>
    <Title><![CDATA[${args.title}]]></Title>
    <Description><![CDATA[${args.description}]]></Description>
  </Video>
</xml>
`);
  }
}

export class WeixinArticlesReply extends WeixinReply {
  constructor(args: {
    openId: string;
    appUserName: string;
    articles: {
      title: string;
      description: string;
      picUrl: string;
      url: string;
    }[];
  }) {
    super(`<xml>
  <ToUserName><![CDATA[${args.openId}]]></ToUserName>
  <FromUserName><![CDATA[${args.appUserName}]]></FromUserName>
  <CreateTime>${Date.now()}</CreateTime>
  <MsgType><![CDATA[news]]></MsgType>
  <ArticleCount>${args.articles.length}</ArticleCount>
  <Articles>
    ${args.articles.map((article) => {
      return `
    <item>
      <Title><![CDATA[${article.title}]]></Title>
      <Description><![CDATA[${article.description}]]></Description>
      <PicUrl><![CDATA[${article.picUrl}]]></PicUrl>
      <Url><![CDATA[${article.url}]]></Url>
    </item>`;
    })}
  </Articles>
</xml>
`);
  }
}

export class WeixinMusicReply extends WeixinReply {
  constructor(args: {
    openId: string;
    appUserName: string;
    mediaId: string;
    title?: string;
    description?: string;
    url?: string;
    hqUrl?: string;
    thumbMediaId: string;
  }) {
    super(`<xml>
  <ToUserName><![CDATA[${args.openId}]]></ToUserName>
  <FromUserName><![CDATA[${args.appUserName}]]></FromUserName>
  <CreateTime>${Date.now()}</CreateTime>
  <MsgType><![CDATA[music]]></MsgType>
  <Music>
    <Title><![CDATA[${args.title}]]></Title>
    <Description><![CDATA[${args.description}]]></Description>
    <MusicUrl><![CDATA[${args.url}]]></MusicUrl>
    <HQMusicUrl><![CDATA[${args.hqUrl}]]></HQMusicUrl>
    <ThumbMediaId><![CDATA[${args.thumbMediaId}]]></ThumbMediaId>
  </Music>
</xml>
`);
  }
}
