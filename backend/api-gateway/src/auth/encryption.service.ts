import { Injectable } from '@nestjs/common';
import * as CryptoJS from 'crypto-js';
import { env } from 'src/config/env.schema';

@Injectable()
export class EncryptionService {
  private readonly encryptionKey: string;

  constructor() {
    this.encryptionKey = env.ENCRYPTION_KEY;
  }

  encrypt(text: string): string {
    const encrypted = CryptoJS.AES.encrypt(text, this.encryptionKey).toString();
    return encrypted;
  }

  decrypt(encryptedText: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedText, this.encryptionKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted;
  }
}
