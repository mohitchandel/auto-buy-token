import { useState } from "react";
import { Input, Button, Row, Col, Space, InputNumber } from "antd";
import { ethers, isAddress } from "ethers";

import ERC20 from "./abis/ERC20.json";
import pancakeRouterAbi from "./abis/Router.json";

function App() {
  const [tokenAddress, setTokenAddress] = useState<string>("");
  const [privateKey, setPrivateKey] = useState<string>("");
  const [amountToBuy, setAmountToBuy] = useState<number | undefined>();
  const [numberOfBuys, setNumberOfBuys] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const bscTestnetUrl = "https://data-seed-prebsc-1-s1.binance.org:8545/";
  const pancakeRouterAddress = "0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3";
  const bnbAddress = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd";
  const provider = new ethers.JsonRpcProvider(bscTestnetUrl);

  /**
   * The function `handleBuyClick` is an asynchronous function that handles the logic for buying tokens
   * and monitoring liquidity on the PancakeSwap platform in a TypeScript React application.
   * @returns The function does not explicitly return anything.
   */
  async function handleBuyClick() {
    try {
      if (
        !isAddress(tokenAddress) ||
        !ethers.isHexString(privateKey, 32) ||
        amountToBuy === undefined ||
        numberOfBuys === undefined
      ) {
        console.log("Please validate or provide all required inputs.");
        return;
      }

      const pancakeRouterContract = new ethers.Contract(
        pancakeRouterAddress,
        pancakeRouterAbi,
        provider
      );
      const tokenContract = new ethers.Contract(tokenAddress, ERC20, provider);

      const tokenBalance = await tokenContract.balanceOf(pancakeRouterAddress);

      const tokenReserve = parseFloat(ethers.formatUnits(tokenBalance, 18));

      pancakeRouterContract.on(
        "addLiquidity",
        async (sender, tokenAmount, bnbAmount) => {
          if (sender === tokenAddress) {
            const bnbReserve = parseFloat(ethers.formatUnits(bnbAmount, 18));
            const tokenPrice = bnbReserve / tokenReserve;

            console.log(
              `Liquidity Added: ${tokenAmount.toString()} tokens and ${bnbAmount.toString()} BNB`
            );
            await buyTokens(tokenAmount, numberOfBuys);

            console.log(`Token Price: ${tokenPrice} BNB`);
          }
        }
      );
      console.log("Monitoring liquidity...");
    } catch (error) {
      console.error(`An error occurred: ${error}`);
    }
  }

  /**
   * The `buyTokens` function allows a user to buy a specified amount of tokens multiple times using
   * the PancakeSwap router contract.
   * @param tokenAmount - The amount of tokens you want to buy. It should be of type
   * ethers.BigNumberish, which is a BigNumber or a string representing a number.
   * @param {number} numberOfBuys - The `numberOfBuys` parameter is the number of times you want to
   * execute the token purchase transaction. It determines how many times the
   * `swapExactTokensForETHSupportingFeeOnTransferTokens` function will be called in the for loop. Each
   * iteration of the loop represents a separate token purchase transaction
   * @returns The function does not explicitly return anything.
   */
  async function buyTokens(
    tokenAmount: ethers.BigNumberish,
    numberOfBuys: number
  ) {
    setIsLoading(true);

    try {
      if (!privateKey || numberOfBuys === undefined) {
        console.log("Private key or number of buys not provided.");
        return;
      }

      const wallet = new ethers.Wallet(privateKey, provider);

      const pancakeRouterContract = new ethers.Contract(
        pancakeRouterAddress,
        pancakeRouterAbi,
        wallet
      );

      const deadline = Math.floor(Date.now() / 1000) + 600;
      const amountOutMin = amountToBuy || 0;

      const path = [tokenAddress, bnbAddress];

      for (let i = 0; i < numberOfBuys; i++) {
        const tx =
          await pancakeRouterContract.swapExactTokensForETHSupportingFeeOnTransferTokens(
            tokenAmount,
            amountOutMin,
            path,
            wallet.address,
            deadline,
            { gasPrice: ethers.parseUnits("10", "gwei") }
          );

        console.log(`Buying tokens (Iteration ${i + 1})...`);
        await tx.wait();
        console.log(`Tokens bought successfully (Iteration ${i + 1})!`);
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      console.error(`An error occurred: ${error}`);
    }
  }

  return (
    <>
      <Row justify={"center"}>
        <Col span={12}>
          <Space direction="vertical" size="middle" style={{ display: "flex" }}>
            <h1>Automated Token Purchase Tool</h1>

            <label>Provide the desired token address</label>
            <Input
              placeholder="Token Address"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
            />
            <label>Provide the private key of your wallet</label>
            <Input
              placeholder="Private Key"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
            />

            <label>Specify the amount of the token you want to buy</label>
            <InputNumber
              placeholder="Amount to Buy"
              value={amountToBuy}
              onChange={(e) => setAmountToBuy(e?.valueOf())}
            />

            <label>Number of Buys</label>
            <InputNumber
              placeholder="Number of Buys"
              value={numberOfBuys}
              onChange={(e) => setNumberOfBuys(e?.valueOf())}
            />

            <Button
              type="primary"
              disabled={isLoading}
              onClick={handleBuyClick}
            >
              {isLoading ? "Started Automated Buying" : "Start Automated Buys"}
            </Button>
          </Space>
        </Col>
      </Row>
    </>
  );
}

export default App;
