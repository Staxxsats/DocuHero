import React from 'react';
import { useWeb3 } from './Web3Provider';

interface WalletConnectionProps {
  className?: string;
}

export const WalletConnection: React.FC<WalletConnectionProps> = ({ className = '' }) => {
  const {
    account,
    chainId,
    isConnected,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    switchNetwork,
  } = useWeb3();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getChainName = (chainId: number) => {
    const chains: { [key: number]: string } = {
      1: 'Ethereum',
      11155111: 'Sepolia',
      137: 'Polygon',
      80001: 'Mumbai',
      31337: 'Localhost',
    };
    return chains[chainId] || `Chain ${chainId}`;
  };

  const isWrongNetwork = () => {
    // Define supported networks
    const supportedChains = [1, 11155111, 137, 80001, 31337];
    return chainId && !supportedChains.includes(chainId);
  };

  if (!isConnected) {
    return (
      <div className={`wallet-connection ${className}`}>
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isConnecting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connecting...
            </span>
          ) : (
            'Connect Wallet'
          )}
        </button>
        {error && (
          <div className="mt-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-2">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`wallet-connection ${className}`}>
      <div className="flex items-center space-x-4">
        {/* Network Status */}
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isWrongNetwork() ? 'bg-red-500' : 'bg-green-500'}`}></div>
          <span className="text-sm text-gray-600">
            {chainId ? getChainName(chainId) : 'Unknown Network'}
          </span>
          {isWrongNetwork() && (
            <button
              onClick={() => switchNetwork(11155111)} // Switch to Sepolia as default
              className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded hover:bg-orange-200 transition-colors"
            >
              Switch Network
            </button>
          )}
        </div>

        {/* Account Info */}
        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {account ? account.slice(2, 4).toUpperCase() : '??'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">
              {account ? formatAddress(account) : 'Unknown'}
            </span>
            <span className="text-xs text-gray-500">Connected</span>
          </div>
        </div>

        {/* Disconnect Button */}
        <button
          onClick={disconnectWallet}
          className="text-gray-500 hover:text-red-600 transition-colors"
          title="Disconnect Wallet"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="mt-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-2">
          {error}
        </div>
      )}

      {isWrongNetwork() && (
        <div className="mt-2 text-orange-600 text-sm bg-orange-50 border border-orange-200 rounded-lg p-2">
          <div className="flex items-center justify-between">
            <span>Please switch to a supported network</span>
            <div className="flex space-x-2">
              <button
                onClick={() => switchNetwork(1)}
                className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded hover:bg-orange-200"
              >
                Ethereum
              </button>
              <button
                onClick={() => switchNetwork(137)}
                className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded hover:bg-orange-200"
              >
                Polygon
              </button>
              <button
                onClick={() => switchNetwork(11155111)}
                className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded hover:bg-orange-200"
              >
                Sepolia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};