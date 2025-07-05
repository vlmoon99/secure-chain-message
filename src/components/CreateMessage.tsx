import React, { useState } from 'react';
import { Send, Copy, Check, Shield, Hash } from 'lucide-react';
import { NearWallet } from '@hot-labs/near-connect';
import {
    // decrypt_message,
    encrypt_message,
    generate_keypair,
    KeyPair,
} from "../encryption/cryptography_project.js";

interface CreateMessageProps {
  wallet: NearWallet | null;
}


export const CreateMessage: React.FC<CreateMessageProps> = ({wallet}) => {
  const [message, setMessage] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState<{
    key: string;
    encodedText: string;
    transactionHash: string;
  } | null>(null);
  const [copiedStates, setCopiedStates] = useState<{
    messageId: boolean;
    transactionHash: boolean;
    decryptionCode: boolean;
  }>({
    messageId: false,
    transactionHash: false,
    decryptionCode: false,
  });

  const handleCreateMessage = async () => {
    if (!message.trim()) return;
    setIsCreating(true);
    let keyPair: KeyPair = generate_keypair();
    let encryptedMessage = encrypt_message(keyPair.public_key, message);
    try {
     let res = await wallet?.signAndSendTransactions({
          transactions: [
            {
              receiverId: "securechainmsg.near",
              actions: [
                {
                  type: "FunctionCall",
                  params: {
                    methodName: "CreateMsg",
                    args: { key: keyPair.public_key ,msg: encryptedMessage },
                    gas: "30000000000000",
                    deposit: "00000000000001",
                  },
                },
              ],
            },
          ],
        });
      if(res){
      let hash = res[0].transaction.hash;
      setResult({key :keyPair.public_key,encodedText :encryptedMessage,transactionHash : hash});
      } else {
        throw new Error("Transaction failed, there are no tx hash");
      }
    } catch (error) {
      console.error('Failed to create message:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopy = async (text: string, type: 'messageId' | 'transactionHash' | 'decryptionCode') => {
    await navigator.clipboard.writeText(text);
    setCopiedStates(prev => ({ ...prev, [type]: true }));
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [type]: false }));
    }, 2000);
  };

  const handleNewMessage = () => {
    setResult(null);
    setMessage('');
    setCopiedStates({
      messageId: false,
      transactionHash: false,
      decryptionCode: false,
    });
  };

  if (result) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
            <Check className="h-8 w-8 text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Message Created Successfully!</h3>
          <p className="text-gray-300">Share this code with the recipient to decrypt your message</p>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-300">Message ID</span>
              <button
                onClick={() => handleCopy(result.key, 'messageId')}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
              >
                {copiedStates.messageId ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copiedStates.messageId ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <code className="text-xs text-gray-400 font-mono break-all">{result.key}</code>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-300">Transaction Hash</span>
              <button
                onClick={() => handleCopy(result.transactionHash, 'transactionHash')}
                className="flex items-center space-x-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
              >
                {copiedStates.transactionHash ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copiedStates.transactionHash ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <code className="text-xs text-gray-400 font-mono break-all">{result.transactionHash}</code>
          </div>

          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-blue-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">Decryption Code</span>
              <button
                onClick={() => handleCopy(result.encodedText, 'decryptionCode')}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
              >
                {copiedStates.decryptionCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copiedStates.decryptionCode ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <code className="text-sm text-blue-200 font-mono break-all bg-gray-900/50 p-3 rounded block">
              {result.encodedText}
            </code>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={handleNewMessage}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
          >
            Create Another Message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-4">
          <Send className="h-8 w-8 text-blue-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Create Secure Message</h3>
        <p className="text-gray-300">Write your message and encrypt it on the blockchain</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Your Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your secret message..."
            className="w-full h-32 px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        <button
          onClick={handleCreateMessage}
          disabled={!message.trim() || isCreating}
          className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:scale-100"
        >
          {isCreating ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
          ) : (
            <Send className="h-5 w-5" />
          )}
          <span>{isCreating ? 'Creating Message...' : 'Create & Encrypt Message'}</span>
        </button>
      </div>
    </div>
  );
};