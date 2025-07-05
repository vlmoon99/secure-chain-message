import React, { useState } from 'react';
import { Eye, Lock } from 'lucide-react';
import { NearWallet } from '@hot-labs/near-connect';
import { decrypt_message } from "../encryption/cryptography_project.js";
import bs58 from 'bs58';

interface ReadMessageProps {
  wallet: NearWallet | null;
}

export const ReadMessage: React.FC<ReadMessageProps> = ({wallet}) => {
  const [code, setCode] = useState('');
  const [isReading, setIsReading] = useState(false);

  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReadMessage = async () => {
    if (!code.trim()) return;

    setIsReading(true);
    setError(null);
    const json = new TextDecoder().decode(bs58.decode(code));
    let {public_key,private_key} = JSON.parse(json);

    if (!public_key || !private_key) {
      setError('Invalid decryption code format');
      setIsReading(false);
      return;
    }
    console.log("Public Key:", public_key);
    console.log("Private Key:", private_key);

    try {
      const res = await wallet?.signAndSendTransactions({
        transactions: [{
          receiverId: "securechainmsg.near",
          actions: [{
            type: "FunctionCall",
            params: {
              methodName: "GetMsg",
              args: { key: public_key},
              gas: "30000000000000",
              deposit: "00000000000001",
            },
          }],
        }],
        });
        
        console.log(res);

        if(res){
          let base64Msg = res[0].status.SuccessValue;
          let binaryStr = atob(base64Msg).slice(4);
          let decryptedResult = decrypt_message(private_key, binaryStr);
          setResult(decryptedResult);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsReading(false);
    }
  };

  const handleNewRead = () => {
    setResult(null);
    setCode('');
    setError(null);
  };

  if (result) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-700">
        <div className="text-center mb-4 sm:mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-green-500/20 rounded-full mb-3 sm:mb-4">
            <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Message Decrypted!</h3>
          <p className="text-sm sm:text-base text-gray-300 px-2">The message has been successfully decrypted</p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg p-4 sm:p-6 border border-green-500/20">
            <div className="flex items-center space-x-2 mb-3">
              <Lock className="h-5 w-5 text-green-400" />
              <span className="text-xs sm:text-sm font-medium text-gray-300">Decrypted Message</span>
            </div>
            <p className="text-white text-sm sm:text-lg leading-relaxed break-words">{result}</p>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 text-center">
          <button
            onClick={handleNewRead}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 text-sm sm:text-base"
          >
            Read Another Message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-700">
      <div className="text-center mb-4 sm:mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-purple-500/20 rounded-full mb-3 sm:mb-4">
          <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Read Secure Message</h3>
        <p className="text-sm sm:text-base text-gray-300 px-2">Enter the decryption code to read a message</p>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Decryption Code
          </label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste the decryption code here..."
            className="w-full h-20 sm:h-24 px-3 sm:px-4 py-2 sm:py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-mono text-xs sm:text-sm"
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-red-400 text-xs sm:text-sm break-words">{error}</p>
          </div>
        )}

        <button
          onClick={handleReadMessage}
          disabled={!code.trim() || isReading}
          className="w-full flex items-center justify-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:scale-100 text-sm sm:text-base"
        >
          {isReading ? (
            <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white" />
          ) : (
            <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
          )}
          <span>{isReading ? 'Decrypting...' : 'Decrypt & Read Message'}</span>
        </button>
      </div>
    </div>
  );
};