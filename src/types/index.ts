export interface User {
  accountId: string;
  isConnected: boolean;
}

export interface Message {
  id: string;
  encryptedContent: string;
  timestamp: number;
  author: string;
}

export interface MessageCode {
  messageId: string;
  privateKey: string;
  publicKey: string;
}

export interface CreateMessageRequest {
  content: string;
  author: string;
}

export interface ReadMessageRequest {
  code: string;
}

export interface EncryptedMessage {
  content: string;
  publicKey: string;
  nonce: string;
}