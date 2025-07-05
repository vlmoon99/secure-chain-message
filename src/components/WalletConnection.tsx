import React, { useState, useEffect } from "react";
import { Wallet, LogOut, User as UserIcon } from "lucide-react";
import type { User } from "../types";
import { NearWallet, WalletSelector, WalletSelectorUI } from "@hot-labs/near-connect";
import "@hot-labs/near-connect/modal-ui.css";

interface WalletConnectionProps {
  user: User | null;
  onUserChange: (user: User | null) => void;
  wallet: NearWallet | null;
  onWalletChange: (user: NearWallet | null) => void;

}

const selector = new WalletSelector({ network: "mainnet" });
const modal = new WalletSelectorUI(selector);

export const WalletConnection: React.FC<WalletConnectionProps> = ({ user, onUserChange, wallet, onWalletChange }) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    selector.on("wallet:signIn", async (t) => {
      const w = await selector.wallet();
      onWalletChange(w);
      onUserChange({ accountId: t.accounts[0].accountId, isConnected: true });
    });
    selector.on("wallet:signOut", () => {
      onWalletChange(null);
      onUserChange(null);
    });
    selector.wallet().then((wallet) => {
      wallet.getAccounts().then((t) => {
        onWalletChange(wallet);
        onUserChange({ accountId: t[0].accountId, isConnected: true });
      });
    });
  }, []);

  const connect = async () => {
    setLoading(true);
    if (wallet) await selector.disconnect();
    else await modal.open();
    setLoading(false);
  };

  const disconnect = async () => {
    setLoading(true);
    await selector.disconnect();
    setLoading(false);
  };

  if (user) {
    return (
      <div className="flex items-center space-x-2 sm:space-x-4 flex-wrap gap-2">
        <div className="flex items-center space-x-2 bg-gray-800/50 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-gray-700">
          <UserIcon className="h-4 w-4 text-blue-400" />
          <span className="text-xs sm:text-sm font-medium text-white truncate max-w-[120px] sm:max-w-none">{user.accountId}</span>
        </div>
        <button
          onClick={disconnect}
          disabled={loading}
          className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white rounded-lg font-medium text-xs sm:text-sm"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">{loading ? "Disconnecting..." : "Disconnect"}</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      disabled={loading}
      className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-blue-800 disabled:to-purple-800 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm"
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white" />
      ) : (
        <Wallet className="h-4 w-4 sm:h-5 sm:w-5" />
      )}
      <span>{loading ? "Connecting..." : "Connect Wallet"}</span>
    </button>
  );
};