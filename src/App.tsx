import { useEffect, useState } from "react";
import {
  Input,
  Row,
  Col,
  Space,
  InputNumber,
  Button,
  Divider,
  Alert,
} from "antd";
import { ethers, isAddress } from "ethers";
import "./globals.d.ts";
import ERC20 from "./abis/ERC20.json";
import pancakeRouterAbi from "./abis/Router.json";

function App() {
  const [tokenAddress, setTokenAddress] = useState<string>("");
  const [privateKey, setPrivateKey] = useState<string>("");
  const [amountToBuy, setAmountToBuy] = useState<number | undefined>();
  const [numberOfBuys, setNumberOfBuys] = useState<number | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const bscTestnetUrl = "https://data-seed-prebsc-1-s1.binance.org:8545/";
  const pancakeRouterAddress = "0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3";
  const bnbAddress = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd";
  const provider = new ethers.JsonRpcProvider(bscTestnetUrl);
  const MINUTE_MS = 100000;
  const clearErrorMessage = () => {
    setErrorMessage(null);
  };

  /**
   * The function `addLiquidity` adds liquidity to a PancakeSwap pool by approving and executing a
   * transaction on the PancakeRouter contract.
   */
  async function handleAddLiquidity() {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();

      const pancakeRouterContract = new ethers.Contract(
        pancakeRouterAddress,
        pancakeRouterAbi,
        provider
      );

      const amountBnb = ethers.parseEther("0.01");

      const tx = await pancakeRouterContract.addLiquidity(
        bnbAddress,
        tokenAddress,
        amountBnb,
        0,
        0,
        signer.address,
        Date.now() + 1000 * 60 * 10
      );

      await tx.wait();

      console.log("Liquidity added successfully!");
    } catch (error) {
      console.error("Error adding liquidity:", error);
    }
  }

  async function runLiquidityCheck() {
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
      buyTokens(ethers.parseEther(amountToBuy.toString()), numberOfBuys);
      console.log("Monitoring liquidity...");
    } catch (error) {
      console.error(`An error occurred: ${error}`);
    }
  }

  async function buyTokens(
    tokenAmount: ethers.BigNumberish,
    numberOfBuys: number
  ) {
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
      }
    } catch (error) {
      console.error(`An error occurred: ${error}`);
    }
  }

  useEffect(() => {
    let intervalId: string | number | NodeJS.Timeout | undefined;

    const runLiquidityCheckInterval = async () => {
      await runLiquidityCheck();
      intervalId = setTimeout(runLiquidityCheckInterval, MINUTE_MS);
    };

    runLiquidityCheckInterval(); // Start the initial interval

    return () => clearTimeout(intervalId); // Clear timeout on component unmount
  }, []);

  return (
    <>
      <Row justify="center" align="middle" style={{ height: "100vh" }}>
        <Col span={18}>
          <h2 style={{ marginBottom: 24 }}>Automated Token Purchase Tool</h2>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <div>
              <p>Provide the desired token address</p>
              <Input
                placeholder="Token Address"
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
              />

              <p>Provide the token amount</p>
              <InputNumber
                placeholder="Token amount"
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e?.valueOf() as string)}
              />

              <Button onClick={handleAddLiquidity}>Add Liquidity</Button>
            </div>
            <Divider />
            <div>
              <p>Monitor liquidity and buy tokens</p>
              <Input
                placeholder="Private Key"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
              />
              <InputNumber
                placeholder="Amount to Buy"
                value={amountToBuy}
                onChange={(value) => setAmountToBuy(value as number)}
              />
              <InputNumber
                placeholder=" Buys"
                value={numberOfBuys}
                onChange={(value) => setNumberOfBuys(value as number)}
              />
            </div>
            {errorMessage && (
              <Alert
                message="Error"
                description={errorMessage}
                type="error"
                showIcon
                closable
                onClose={clearErrorMessage}
              />
            )}
          </Space>
        </Col>
      </Row>
    </>
  );
}

export default App;
