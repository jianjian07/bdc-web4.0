import { encrypt, decrypt } from 'crypto-js/aes';
import { parse } from 'crypto-js/enc-utf8';
import pkcs7 from 'crypto-js/pad-pkcs7';
import ECB from 'crypto-js/mode-ecb';
import md5 from 'crypto-js/md5';
import UTF8 from 'crypto-js/enc-utf8';
import Base64 from 'crypto-js/enc-base64';
import * as CryptoJS from 'crypto-js'
export interface EncryptionParams {
  key: string;
  iv: string;
}

export class AesEncryption {
  private key;
  private iv;

  constructor(opt: Partial<EncryptionParams> = {}) {
    const { key, iv } = opt;
    if (key) {
      this.key = parse(key);
    }
    if (iv) {
      this.iv = parse(iv);
    }
  }

  get getOptions() {
    return {
      mode: ECB,
      padding: pkcs7,
      iv: this.iv,
    };
  }

  encryptByAES(cipherText: string) {
    return encrypt(cipherText, this.key, this.getOptions).toString();
  }

  decryptByAES(cipherText: string) {
    return decrypt(cipherText, this.key, this.getOptions).toString(UTF8);
  }
}

export function encryptByBase64(cipherText: string) {
  return UTF8.parse(cipherText).toString(Base64);
}

export function decodeByBase64(cipherText: string) {
  return Base64.parse(cipherText).toString(UTF8);
}

export function encryptByMd5(password: string) {
  return md5(password).toString();
}
export function encryptionAES(cipherText: string, cipherKey?: string) {
  const key = cipherKey || 'WONDER1274654321'
  const key_ele = CryptoJS.enc.Latin1.parse(key)
  var iv = key_ele
  // 加密
  var encrypted = CryptoJS.AES.encrypt(
    cipherText,
    key_ele, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.ZeroPadding
  })
  return encrypted.toString()
}

export function decryptAES(cipherText: string, cipherKey?: string) {
  const key = cipherKey || 'WONDER1274654321'
  const key_ele = CryptoJS.enc.Latin1.parse(key)
  var iv = key_ele
  try {
    var decrypted = CryptoJS.AES.decrypt(
      cipherText,
      key_ele, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.ZeroPadding
    })
    return decrypted.toString(CryptoJS.enc.Utf8)
  } catch (error) {
    // console.log('decryptAES error',error)
    return ''
  }
}
