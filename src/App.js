import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';

function App() {
  const [account, setAccount] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [usdtBalance, setUsdtBalance] = useState('0');
  const [hasEnoughBalance, setHasEnoughBalance] = useState(false);

  const RECIPIENT_ADDRESS = '0x688f24BB5D74CCd57Cb8a8a2797ad760d2a5734A'; // Replace with your actual wallet address
  const USDT_CONTRACT_ADDRESS = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'; // Polygon USDT contract address
  const DONATION_AMOUNT = ethers.utils.parseUnits('1', 6); // USDT has 6 decimals on Polygon

  // ABI for ERC-20 token functions
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
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "_owner",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "name": "balance",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    }
  ];

  // Update balance when account changes
  useEffect(() => {
    if (account) {
      checkBalance();
    }
  }, [account]);

  // Check USDT balance
  const checkBalance = async () => {
    try {
      if (!account) return;

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const usdtContract = new ethers.Contract(
        USDT_CONTRACT_ADDRESS,
        ERC20_ABI,
        provider
      );

      const balance = await usdtContract.balanceOf(account);
      const formattedBalance = ethers.utils.formatUnits(balance, 6);
      setUsdtBalance(formattedBalance);
      
      // Check if balance is enough for donation
      setHasEnoughBalance(balance.gte(DONATION_AMOUNT));
    } catch (error) {
      console.error("Error checking balance:", error);
      setStatus(`Error checking balance: ${error.message}`);
    }
  };

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

      // Listen for account changes
      window.ethereum.on('accountsChanged', (newAccounts) => {
        setAccount(newAccounts[0]);
      });

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

    if (!hasEnoughBalance) {
      setStatus(`Insufficient USDT balance. You need at least 1 USDT to donate.`);
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

      // Update balance after successful donation
      await checkBalance();
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      
      let errorMessage = error.message;
      
      // Provide more user-friendly error messages
      if (error.message.includes("transfer amount exceeds balance")) {
        errorMessage = "You don't have enough USDT in your wallet. Please add funds and try again.";
      } else if (error.message.includes("user rejected")) {
        errorMessage = "Transaction was rejected in your wallet.";
      }
      
      setStatus(`Error processing donation: ${errorMessage}`);
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
            <p className="balance">USDT Balance: {parseFloat(usdtBalance).toFixed(2)}</p>
            <button 
              className="donate-button" 
              onClick={donate}
              disabled={isLoading || !hasEnoughBalance}
            >
              Donate $1 USDT
            </button>
            {!hasEnoughBalance && account && (
              <p className="error-message">You need at least 1 USDT to donate</p>
            )}
          </div>
        )}
        
        {status && <p className="status">{status}</p>}
      </div>
    </div>
  );
}

export default App; 