import { checkError } from './error.ts';

export type QrCodeActionName =
  | 'QR_SCENE'
  | 'QR_STR_SCENE'
  | 'QR_LIMIT_SCENE'
  | 'QR_LIMIT_STR_SCENE';

export async function _generateQrCode(
  accessToken: string,
  expireSeconds: number,
  actionName: QrCodeActionName,
  sceneStr?: string,
  sceneId?: number
) {
  const result = await fetch(
    `https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=${accessToken}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        expire_seconds: expireSeconds,
        action_name: actionName,
        action_info: { scene: { scene_str: sceneStr, scene_id: sceneId } },
      }),
    }
  );
  const json = await checkError(result);
  const {
    ticket,
    expire_seconds,
    url,
  }: {
    ticket: string;
    expire_seconds: number;
    url: string;
  } = json;
  return {
    qrcode: `https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=${encodeURIComponent(
      ticket
    )}`,
    ticket,
    expire_seconds,
    url,
  };
}
