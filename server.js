// server.js
const express = require('express');
const { ethers } = require('ethers');
require('dotenv').config();
const app = express();
app.use(express.json());

// Infura/Alchemy provider
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

// Wallet that funds the contract
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Contract ABI and address
const contractABI = [
  "function claimReward() external",
  "function getReward(address player) view returns(uint256)",
  "function withdraw() external"
];
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

// Fund contract endpoint (owner only)
app.post('/fund-contract', async (req, res) => {
  try {
    const tx = await wallet.sendTransaction({
      to: contractAddress,
      value: ethers.parseEther("0.05") // amount to fund
    });
    await tx.wait();
    res.send({ success: true, txHash: tx.hash });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, error: err.message });
  }
});

// Withdraw contract balance (owner only)
app.post('/withdraw', async (req, res) => {
  try {
    const tx = await contract.withdraw();
    await tx.wait();
    res.send({ success: true, txHash: tx.hash });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, error: err.message });
  }
});

// Get reward count for a player
app.get('/reward/:player', async (req, res) => {
  try {
    const reward = await contract.getReward(req.params.player);
    res.send({ reward: reward.toString() });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
