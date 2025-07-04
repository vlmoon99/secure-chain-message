import type { Message, CreateMessageRequest, User } from '../types';
import { CryptoService } from './cryptoService';

export class NearService {
  private static messages: Map<string, Message> = new Map();
  private static currentUser: User | null = null;

  static async connectWallet(): Promise<User> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user: User = {
          accountId: `user_${Date.now()}.testnet`,
          isConnected: true
        };
        this.currentUser = user;
        resolve(user);
      }, 1000);
    });
  }

  static async disconnectWallet(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.currentUser = null;
        resolve();
      }, 500);
    });
  }

  static getCurrentUser(): User | null {
    return this.currentUser;
  }

  static async createMessage(request: CreateMessageRequest): Promise<{
    messageId: string;
    encodedCode: string;
    transactionHash: string;
  }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const messageId = CryptoService.generateRandomId();
        
        const { encryptedMessage, keyPair } = CryptoService.encrypt(request.content);
        
        const message: Message = {
          id: messageId,
          encryptedContent: JSON.stringify(encryptedMessage),
          timestamp: Date.now(),
          author: request.author
        };
        
        this.messages.set(messageId, message);
        
        const messageCode = {
          messageId,
          privateKey: keyPair.private_key,
          publicKey: keyPair.public_key
        };
        
        const encodedCode = CryptoService.encodeMessageCode(messageCode);
        
        resolve({
          messageId,
          encodedCode,
          transactionHash: `tx_${Date.now()}`
        });
      }, 2000);
    });
  }

  static async readMessage(encodedCode: string): Promise<{
    message: string;
    author: string;
    timestamp: number;
  }> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const messageCode = CryptoService.decodeMessageCode(encodedCode);
          
          const encryptedMessage = this.messages.get(messageCode.messageId);
          
          if (!encryptedMessage) {
            reject(new Error('Message not found'));
            return;
          }
          
          const encrypted = JSON.parse(encryptedMessage.encryptedContent);
          
          const decryptedContent = CryptoService.decrypt(encrypted, messageCode.privateKey);
          
          resolve({
            message: decryptedContent,
            author: encryptedMessage.author,
            timestamp: encryptedMessage.timestamp
          });
        } catch (error) {
          reject(new Error('Failed to decrypt message: ' + (error as Error).message));
        }
      }, 1500);
    });
  }

  static async isWalletConnected(): Promise<boolean> {
    return this.currentUser !== null;
  }
}