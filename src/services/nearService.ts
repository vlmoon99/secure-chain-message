import type { Message, CreateMessageRequest, User } from '../types';
import { CryptoService } from './cryptoService';

// Mock Near blockchain service - replace with actual Near API calls
export class NearService {
  private static messages: Map<string, Message> = new Map();
  private static currentUser: User | null = null;

  static async connectWallet(): Promise<User> {
    // Mock wallet connection - replace with actual Near wallet selector
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
        
        // Encrypt the message
        const { encryptedMessage, keyPair } = CryptoService.encrypt(request.content);
        
        // Create message object
        const message: Message = {
          id: messageId,
          encryptedContent: JSON.stringify(encryptedMessage),
          timestamp: Date.now(),
          author: request.author
        };
        
        // Store in mock blockchain
        this.messages.set(messageId, message);
        
        // Create access code
        const messageCode = {
          messageId,
          privateKey: Array.from(keyPair.secretKey).join(','),
          publicKey: Array.from(keyPair.publicKey).join(',')
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
          // Decode the message code
          const messageCode = CryptoService.decodeMessageCode(encodedCode);
          
          // Get message from mock blockchain
          const encryptedMessage = this.messages.get(messageCode.messageId);
          
          if (!encryptedMessage) {
            reject(new Error('Message not found'));
            return;
          }
          
          // Decrypt the message
          const encrypted = JSON.parse(encryptedMessage.encryptedContent);
          const privateKey = new Uint8Array(messageCode.privateKey.split(',').map(Number));
          
          const decryptedContent = CryptoService.decrypt(encrypted, privateKey);
          
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