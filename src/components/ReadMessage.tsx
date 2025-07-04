import React, { useState } from 'react';
import { Eye, Lock, Calendar, User as UserIcon } from 'lucide-react';
import { NearService } from '../services/nearService';

export const ReadMessage: React.FC = () => {
  const [code, setCode] = useState('');
  const [isReading, setIsReading] = useState(false);
  const [result, setResult] = useState<{
    message: string;
    author: string;
    timestamp: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReadMessage = async () => {
    if (!code.trim()) return;

    setIsReading(true);
    setError(null);
    
    try {
      const response = await NearService.readMessage(code);
      setResult(response);
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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (result) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
            <Eye className="h-8 w-8 text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Message Decrypted!</h3>
          <p className="text-gray-300">The message has been successfully decrypted</p>
        </div>

        <div className="space-y-4">
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg p-6 border border-green-500/20">
            <div className="flex items-center space-x-2 mb-3">
              <Lock className="h-5 w-5 text-green-400" />
              <span className="text-sm font-medium text-gray-300">Decrypted Message</span>
            </div>
            <p className="text-white text-lg leading-relaxed">{result.message}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <UserIcon className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-gray-300">Author</span>
              </div>
              <code className="text-sm text-blue-200 font-mono break-all">{result.author}</code>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-gray-300">Created</span>
              </div>
              <span className="text-sm text-purple-200">{formatDate(result.timestamp)}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={handleNewRead}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
          >
            Read Another Message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-full mb-4">
          <Eye className="h-8 w-8 text-purple-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Read Secure Message</h3>
        <p className="text-gray-300">Enter the decryption code to read a message</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Decryption Code
          </label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste the decryption code here..."
            className="w-full h-24 px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-mono text-sm"
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={handleReadMessage}
          disabled={!code.trim() || isReading}
          className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:scale-100"
        >
          {isReading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
          <span>{isReading ? 'Decrypting...' : 'Decrypt & Read Message'}</span>
        </button>
      </div>
    </div>
  );
};