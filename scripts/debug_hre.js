import hre from "hardhat";
console.log("HRE Keys:", Object.keys(hre));
if (hre.ethers) {
  console.log("hre.ethers is defined!");
} else {
  console.log("hre.ethers is UNDEFINED.");
}
