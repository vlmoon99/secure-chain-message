import { box, randomBytes } from 'tweetnacl';
import { encodeUTF8, decodeUTF8, encodeBase64, decodeBase64 } from 'tweetnacl-util';
import bs58 from 'bs58';
import type { MessageCode, EncryptedMessage } from '../types';

export class CryptoService {
  static generateKeyPair() {
    return box.keyPair();
  }

  static encrypt(message: string): { encryptedMessage: EncryptedMessage; keyPair: any } {
    const nonce = randomBytes(box.nonceLength);
    const messageUint8 = encodeUTF8(message);
    const keyPair = this.generateKeyPair();
    
    // Use the same key pair for both public and secret key (message sealing)
    const encrypted = box(messageUint8, nonce, keyPair.publicKey, keyPair.secretKey);
    
    const encryptedMessage = {
      content: encodeBase64(encrypted),
      publicKey: encodeBase64(keyPair.publicKey),
      nonce: encodeBase64(nonce)
    };
    
    return {
      encryptedMessage,
      keyPair
    };
  }

  static decrypt(encryptedMessage: EncryptedMessage, privateKey: Uint8Array): string {
    const encrypted = decodeBase64(encryptedMessage.content);
    const nonce = decodeBase64(encryptedMessage.nonce);
    const publicKey = decodeBase64(encryptedMessage.publicKey);
    
    const decrypted = box.open(encrypted, nonce, publicKey, privateKey);
    
    if (!decrypted) {
      throw new Error('Failed to decrypt message');
    }
    
    return decodeUTF8(decrypted);
  }

  static encodeMessageCode(messageCode: MessageCode): string {
    const codeData = {
      messageId: messageCode.messageId,
      privateKey: encodeBase64(new Uint8Array(messageCode.privateKey.split(',').map(Number))),
      publicKey: encodeBase64(new Uint8Array(messageCode.publicKey.split(',').map(Number)))
    };
    
    const jsonString = JSON.stringify(codeData);
    const encoded = encodeUTF8(jsonString);
    
    return bs58.encode(encoded);
  }

  static decodeMessageCode(encodedCode: string): MessageCode {
    try {
      const decoded = bs58.decode(encodedCode);
      const jsonString = decodeUTF8(decoded);
      const codeData = JSON.parse(jsonString);
      
      return {
        messageId: codeData.messageId,
        privateKey: Array.from(decodeBase64(codeData.privateKey)).join(','),
        publicKey: Array.from(decodeBase64(codeData.publicKey)).join(',')
      };
    } catch (error) {
      throw new Error('Invalid message code format');
    }
  }

  static generateRandomId(): string {
    return encodeBase64(randomBytes(16));
  }
}