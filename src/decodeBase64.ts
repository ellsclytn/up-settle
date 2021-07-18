export const decodeBase64 = (input: string): string =>
  Buffer.from(input, 'base64').toString('utf-8')
