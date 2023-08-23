# Automated Token Purchase Tool

The Automated Token Purchase Tool is a React application designed to automatically monitor the addition of liquidity for a specific token on the Binance Smart Chain (BSC) and execute a token buy operation a specified number of times when liquidity is added. The tool utilizes the PancakeSwap router contract and the BSC testnet for testing purposes.

## Installation

1. Clone the repository to your local machine:

```bash
git clone https://github.com/mohitchandel/auto-buy-token.git
```

2. Install the project dependencies:

```bash
cd automated-token-purchase-tool
npm install
```

3. Start the development server:

```bash
npm start

```

The application will open in your default web browser at http://localhost:3000.

### Usage

Open the application in your web browser.

Fill in the required inputs:

1. `Token Address`: Provide the address (BEP20) of the token you want to monitor for liquidity.

2. `Private Key`: Provide the private key associated with your wallet for buying tokens.

3. `Amount to Buy`: Specify the amount of the token you want to buy in each iteration.

4. `Number of Buys`: Specify the number of times to buy the token whenever liquidity is added. Click the "Start Automated Buys" button to begin monitoring liquidity and automated token purchases.

### Important Notes

- Ensure that you have a valid Ethereum wallet with BNB balance on the BSC testnet to cover gas fees.
- The tool is for educational and testing purposes. Use caution and do not expose sensitive private keys or perform transactions on mainnet without thorough testing.
- The application utilizes the PancakeSwap router contract and BSC testnet for testing purposes. Modify the contract addresses and ABIs for use on mainnet.

### Dependencies

- [TypeScript](https://www.typescriptlang.org/)
- [React](https://reactjs.org/)
- [antd (Ant Design)](https://ant.design/)
- [ethers](https://docs.ethers.io/v5/)
