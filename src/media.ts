import { checkError } from './error.ts';

export function base64toFile(data: string) {
  const [head, encoded] = data.split(';base64,');
  if (head && encoded) {
    const [, mime] = head.split(':');
    return base64toFileByMime(encoded, mime);
  }
  return base64toFileByMime(encoded, 'image/jpg');
}

export function base64toFileByMime(data: string, mime: string) {
  return bufferToFileByMime(
    Uint8Array.from(atob(data), (c) => c.charCodeAt(0)),
    mime
  );
}

export function bufferToFileByMime(data: Uint8Array, mime: string) {
  const [, extname] = mime.split('/');
  const blob = new Blob([data], {
    type: mime,
  });
  const filename = `media_${Date.now()}.${extname}`;
  return [blob, filename] as [Blob, string];
}

export async function _uploadTempMedia(
  accessToken: string,
  type: 'image' | 'voice' | 'video' | 'thumb',
  data: Blob,
  fileName: string
) {
  const form = new FormData();
  form.append('media', data, fileName);
  const result = await fetch(
    `https://api.weixin.qq.com/cgi-bin/media/upload?access_token=${accessToken}&type=${type}`,
    {
      method: 'POST',
      body: form,
    }
  );
  const json = await checkError(result);
  const mediaId: string = json.media_id;
  return mediaId;
}

export async function _uploadTempMediaByUrl(
  accessToken: string,
  type: 'image' | 'voice' | 'video' | 'thumb',
  url: string
) {
  const result = await fetch(url);
  const blob = await result.blob();
  const mime = result.headers.get('content-type') ?? 'image/jpg';
  const [, extname] = mime.split('/');
  const filename = `media_${Date.now()}.${extname}`;
  return await _uploadTempMedia(accessToken, type, blob, filename);
}

export async function _uploadTempMediaByBase64(
  accessToken: string,
  type: 'image' | 'voice' | 'video' | 'thumb',
  data: string,
  mime?: string
) {
  const [blob, filename] = mime
    ? base64toFileByMime(data, mime)
    : base64toFile(data);
  return await _uploadTempMedia(accessToken, type, blob, filename);
}

export async function _uploadTempMediaByBuffer(
  accessToken: string,
  type: 'image' | 'voice' | 'video' | 'thumb',
  data: Uint8Array,
  mime: string
) {
  const [blob, filename] = bufferToFileByMime(data, mime);
  return await _uploadTempMedia(accessToken, type, blob, filename);
}
