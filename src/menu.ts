import { checkError } from './error.ts';

export interface WeixinCustomMenuSubButton {
  name: string;
  sub_button: WeixinCustomMenuItem[];
}

export interface WeixinCustomMenuItem {
  name: string;
  type:
    | 'click'
    | 'view'
    | 'scancode_push'
    | 'scancode_waitmsg'
    | 'pic_sysphoto'
    | 'pic_photo_or_album'
    | 'pic_weixin'
    | 'location_select'
    | 'media_id'
    | 'article_id'
    | 'article_view_limited';
  key?: string;
  url?: string;
  media_id?: string;
  appid?: string;
  pagepath?: string;
  article_id?: string;
}

export async function _createCustomMenu(
  accessToken: string,
  buttons: (WeixinCustomMenuSubButton | WeixinCustomMenuItem)[]
) {
  await checkError(
    await fetch(
      `https://api.weixin.qq.com/cgi-bin/menu/create?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          button: buttons,
        }),
      }
    )
  );
}
