export interface User {
  accountId: string;
  isConnected: boolean;
}

export interface MessageCode {
  messageId: string;
  privateKey: string;
  publicKey: string;
}


export interface EncryptedMessage {
  content: string;
  publicKey: string;
}