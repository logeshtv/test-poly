# Polygon USDT Donation App

A simple React application that allows users to connect their Polygon wallet and donate 1 USDT to a specified wallet address.

## Features

- Connect MetaMask or other Web3 wallets
- Automatic network detection and switching to Polygon Mainnet
- Send 1 USDT donation to a predefined wallet address
- User-friendly transaction status updates

## Prerequisites

- Node.js and npm installed
- MetaMask or another Web3 wallet browser extension

## Setup and Configuration

1. Clone the repository:
```
git clone <repository-url>
cd polygon-donation
```

2. Install dependencies:
```
npm install
```

3. Configure the recipient wallet address in `src/App.js`:
   - Locate the line with `RECIPIENT_ADDRESS` and replace `0xYourPolygonWalletAddressHere` with your actual Polygon wallet address

4. Start the development server:
```
npm start
```

5. Open your browser and navigate to `http://localhost:3000`

## Deploying to Production

### Deploy to Netlify or Vercel

1. Create a build:
```
npm run build
```

2. Deploy the `build` folder to your preferred hosting provider:
   - Netlify: Drag and drop the `build` folder to Netlify's dashboard
   - Vercel: Connect your GitHub repository or deploy using Vercel CLI

### Deploy to GitHub Pages

1. Install GitHub Pages package:
```
npm install --save gh-pages
```

2. Add the following to your `package.json`:
```json
"homepage": "https://yourusername.github.io/repository-name",
"scripts": {
  // other scripts
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}
```

3. Deploy:
```
npm run deploy
```

## Technical Notes

- The app uses ethers.js v5.7.2 for blockchain interactions
- The Polygon USDT contract address is set to `0xc2132D05D31c914a87C6611C10748AEb04B58e8F`
- USDT on Polygon has 6 decimal places

## Important Security Considerations

- This dApp runs entirely client-side and interacts directly with the Polygon blockchain
- No data is stored on any server
- Users must approve the transaction in their wallet to complete the donation 