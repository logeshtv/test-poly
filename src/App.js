import React, { useState } from 'react';
import { ethers } from 'ethers';
import './App.css';

function App() {
  const [account, setAccount] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const RECIPIENT_ADDRESS = '0x688f24BB5D74CCd57Cb8a8a2797ad760d2a5734A'; // Replace with your actual wallet address
  const USDT_CONTRACT_ADDRESS = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'; // Polygon USDT contract address
  const DONATION_AMOUNT = ethers.utils.parseUnits('1', 6); // USDT has 6 decimals on Polygon

  // ABI for ERC-20 token transfer function
  const ERC20_ABI = [
    {
      "constant": false,
      "inputs": [
        {
          "name": "_to",
          "type": "address"
        },
        {
          "name": "_value",
          "type": "uint256"
        }
      ],
      "name": "transfer",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

  // Connect wallet
  const connectWallet = async () => {
    try {
      setIsLoading(true);
      setStatus('Connecting wallet...');

      // Check if MetaMask is installed
      if (!window.ethereum) {
        setStatus('MetaMask not detected. Please install MetaMask to continue.');
        setIsLoading(false);
        return;
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Check if connected to Polygon network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      if (chainId !== '0x89') { // Polygon Mainnet Chain ID
        setStatus('Please switch to Polygon Mainnet');
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x89' }], // Polygon Mainnet
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            // Chain not added, try to add Polygon network
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: '0x89',
                    chainName: 'Polygon Mainnet',
                    nativeCurrency: {
                      name: 'MATIC',
                      symbol: 'MATIC',
                      decimals: 18
                    },
                    rpcUrls: ['https://polygon-rpc.com/'],
                    blockExplorerUrls: ['https://polygonscan.com/']
                  }
                ],
              });
            } catch (addError) {
              setStatus('Failed to add Polygon network. Please add it manually.');
              setIsLoading(false);
              return;
            }
          } else {
            setStatus('Failed to switch to Polygon network.');
            setIsLoading(false);
            return;
          }
        }
      }
      
      setAccount(accounts[0]);
      setStatus('Wallet connected successfully.');
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setStatus(`Error connecting wallet: ${error.message}`);
      setIsLoading(false);
    }
  };

  // Handle donation
  const donate = async () => {
    if (!account) {
      setStatus('Please connect your wallet first.');
      return;
    }

    try {
      setIsLoading(true);
      setStatus('Processing donation...');

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      // Create USDT contract instance
      const usdtContract = new ethers.Contract(
        USDT_CONTRACT_ADDRESS,
        ERC20_ABI,
        signer
      );

      // Send 1 USDT to recipient
      const tx = await usdtContract.transfer(RECIPIENT_ADDRESS, DONATION_AMOUNT);
      
      setStatus('Transaction submitted. Waiting for confirmation...');
      
      // Wait for transaction to be mined
      await tx.wait();
      
      setStatus(`Thank you for your donation! Transaction hash: ${tx.hash}`);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setStatus(`Error processing donation: ${error.message}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="container">
        <h1>Polygon USDT Donation</h1>
        <p className="description">
          Support us with a $1 USDT donation on Polygon
        </p>
        
        {!account ? (
          <button 
            className="connect-button" 
            onClick={connectWallet}
            disabled={isLoading}
          >
            Connect Wallet
          </button>
        ) : (
          <div className="account-container">
            <p className="account">Connected: {account.slice(0, 6)}...{account.slice(-4)}</p>
            <button 
              className="donate-button" 
              onClick={donate}
              disabled={isLoading}
            >
              Donate $1 USDT
            </button>
          </div>
        )}
        
        {status && <p className="status">{status}</p>}
      </div>
    </div>
  );
}

export default App; 