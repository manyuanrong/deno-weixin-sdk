export class TokenExpiredError extends Error {}

export async function checkError(response: Response) {
  const json = await response.json();

  if (json.errcode && json.errcode !== 0) {
    if (
      json.errcode === 40001 ||
      json.errcode === 40014 ||
      json.errcode === 42001
    ) {
      throw new TokenExpiredError(json.errmsg);
    } else {
      throw new Error(json.errmsg);
    }
  }

  return json;
}
