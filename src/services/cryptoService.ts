import { randomBytes } from 'tweetnacl';
import { encodeUTF8, encodeBase64 } from 'tweetnacl-util';
import bs58 from 'bs58';
import type { MessageCode, EncryptedMessage } from '../types';
import initSync, {
    decrypt_message,
    encrypt_message,
    generate_keypair,
    KeyPair,
} from "../encryption/cryptography_project.js";

export class CryptoService {
  static async init() {
      await initSync();
  }


  static generateKeyPair(): KeyPair {
    return generate_keypair();
  }

  static encrypt(message: string): { encryptedMessage: EncryptedMessage; keyPair: KeyPair } {
    const keyPair = this.generateKeyPair();
    const encryptedMessage: EncryptedMessage = {
      content: encrypt_message(keyPair.public_key, message),
      publicKey: keyPair.public_key,
    };
    return {
      encryptedMessage,
      keyPair
    };
  }

  static decrypt(encryptedMessage: EncryptedMessage, privateKey: string): string {
    return decrypt_message(privateKey,encryptedMessage.content);
  }

  static encodeMessageCode(messageCode: MessageCode): string {
    const codeData = {
      messageId: messageCode.messageId,
      privateKey: messageCode.privateKey,
      publicKey: messageCode.publicKey
    };
    const jsonString = JSON.stringify(codeData); 
    return bs58.encode(Uint8Array.from(jsonString));
  }

  static decodeMessageCode(encodedCode: string): MessageCode {
    try {
      const decoded = bs58.decode(encodedCode); 
      const jsonString = encodeUTF8(decoded);
      const codeData = JSON.parse(jsonString);

      return {
        messageId: codeData.messageId,
        privateKey: codeData.privateKey,
        publicKey: codeData.publicKey
      };
    } catch {
      throw new Error('Invalid message code format');
    }
  }

  static generateRandomId(): string {
    return encodeBase64(randomBytes(16));
  }
}