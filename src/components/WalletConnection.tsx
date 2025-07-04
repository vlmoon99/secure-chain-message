import React, { useState, useEffect } from 'react';
import { Wallet, LogOut, User as UserIcon } from 'lucide-react';
import { NearService } from '../services/nearService';
import type { User } from '../types';

interface WalletConnectionProps {
  user: User | null;
  onUserChange: (user: User | null) => void;
}

export const WalletConnection: React.FC<WalletConnectionProps> = ({ user, onUserChange }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    const isConnected = await NearService.isWalletConnected();
    if (isConnected) {
      const currentUser = NearService.getCurrentUser();
      onUserChange(currentUser);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const connectedUser = await NearService.connectWallet();
      onUserChange(connectedUser);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await NearService.disconnectWallet();
      onUserChange(null);
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    } finally {
      setIsDisconnecting(false);
    }
  };

  if (user) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-700">
          <UserIcon className="h-4 w-4 text-blue-400" />
          <span className="text-sm font-medium text-white">{user.accountId}</span>
        </div>
        <button
          onClick={handleDisconnect}
          disabled={isDisconnecting}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
        >
          {isDisconnecting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          <span>{isDisconnecting ? 'Disconnecting...' : 'Disconnect'}</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-blue-800 disabled:to-purple-800 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:scale-100"
    >
      {isConnecting ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
      ) : (
        <Wallet className="h-5 w-5" />
      )}
      <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
    </button>
  );
};