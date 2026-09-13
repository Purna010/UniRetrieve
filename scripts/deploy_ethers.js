import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const artifactPath = path.join(__dirname, "../artifacts/contracts/ClaimsLedger.sol/ClaimsLedger.json");
  if (!fs.existsSync(artifactPath)) {
    throw new Error("Contract artifact not found. Please run compile first.");
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  
  const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545";
  console.log("Connecting to blockchain RPC:", rpcUrl);

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  let signer;

  if (process.env.PRIVATE_KEY) {
    signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  } else {
    signer = await provider.getSigner();
  }

  const deployerAddress = await signer.getAddress();
  const balance = await provider.getBalance(deployerAddress);

  console.log("Deploying contract with account:", deployerAddress);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("🚀 ClaimsLedger successfully deployed to address:", address);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
