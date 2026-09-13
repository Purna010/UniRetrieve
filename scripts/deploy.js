import hre from "hardhat";

async function main() {
  const ClaimsLedger = await hre.ethers.getContractFactory("ClaimsLedger");
  const claimsLedger = await ClaimsLedger.deploy();
  await claimsLedger.waitForDeployment();
  console.log("ClaimsLedger deployed to:", await claimsLedger.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
