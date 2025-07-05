import React, { useState } from 'react';
import { Send, Copy, Check, Shield } from 'lucide-react';
import { NearWallet } from '@hot-labs/near-connect';
import { encrypt_message, generate_keypair, KeyPair } from "../encryption/cryptography_project.js";
import bs58 from 'bs58';

interface CreateMessageProps {
  wallet: NearWallet | null;
}

export const CreateMessage: React.FC<CreateMessageProps> = ({ wallet }) => {
  const [message, setMessage] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState<{ encodedText: string; transactionHash: string } | null>(null);
  const [copied, setCopied] = useState<{ tx: boolean; code: boolean }>({ tx: false, code: false });

  const handleCreateMessage = async () => {
    if (!message.trim() || !wallet) return;
    setIsCreating(true);
    try {
      const keyPair: KeyPair = generate_keypair();
      const encrypted = encrypt_message(keyPair.public_key, message);
      const res = await wallet.signAndSendTransactions({
        transactions: [{
          receiverId: "securechainmsg.near",
          actions: [{
            type: "FunctionCall",
            params: {
              methodName: "CreateMsg",
              args: { key: keyPair.public_key, msg: encrypted },
              gas: "30000000000000",
              deposit: "00000000000001",
            },
          }],
        }],
      });
      if (res) {
        const data = JSON.stringify({ public_key : keyPair.public_key, private_key: keyPair.private_key });
        let msgEncoded = bs58.encode(new TextEncoder().encode(data));
        setResult({
          encodedText: msgEncoded,
          transactionHash: res[0].transaction.hash,
        });
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopy = (text: string, type: 'tx' | 'code') => {
    navigator.clipboard.writeText(text);
    setCopied((prev) => ({ ...prev, [type]: true }));
    setTimeout(() => setCopied((prev) => ({ ...prev, [type]: false })), 2000);
  };

  const reset = () => {
    setResult(null);
    setMessage('');
    setCopied({ tx: false, code: false });
  };

  if (result) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-700">
        <div className="text-center mb-4 sm:mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-green-500/20 rounded-full mb-3 sm:mb-4">
            <Check className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Message Created Successfully!</h3>
          <p className="text-sm sm:text-base text-gray-300 px-2">Share this code with the recipient to decrypt your message</p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium text-gray-300">Transaction Hash</span>
            </div>
            <button
              onClick={() => handleCopy(result.transactionHash, 'tx')}
              className="flex items-center space-x-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm"
            >
              {copied.tx ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copied.tx ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
          <code className="text-xs text-gray-400 font-mono break-all">{result.transactionHash}</code>
        </div>
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-blue-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">Deployed Secure Message</span>
            <button
              onClick={() => handleCopy(result.encodedText, 'code')}
              className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
            >
              {copied.code ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copied.code ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
          <code className="text-sm text-blue-200 font-mono break-all bg-gray-900/50 p-3 rounded block">
            {result.encodedText}
          </code>
        </div>
        <div className="mt-6 text-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200"
          >
            Create Another Message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-700">
      <div className="text-center mb-4 sm:mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-500/20 rounded-full mb-3 sm:mb-4">
          <Send className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Create Secure Message</h3>
        <p className="text-sm sm:text-base text-gray-300 px-2">Write your message and encrypt it on the blockchain</p>
      </div>
      <div className="space-y-3 sm:space-y-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Your Message</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Enter your secret message..."
            className="w-full h-24 sm:h-32 px-3 sm:px-4 py-2 sm:py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base"
          />
        </div>
        <button
          onClick={handleCreateMessage}
          disabled={!message.trim() || isCreating}
          className="w-full flex items-center justify-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200 text-sm sm:text-base"
        >
          {isCreating ? (
            <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white" />
          ) : (
            <Send className="h-4 w-4 sm:h-5 sm:w-5" />
          )}
          <span>{isCreating ? 'Creating Message...' : 'Create & Encrypt Message'}</span>
        </button>
      </div>
    </div>
  );
};