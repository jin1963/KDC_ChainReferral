// main.js

const contractAddress = "0x25D071772bd2Dc0f5ACe31631fa25f8A4B0bdcF2"; // contract ใหม่
const usdtAddress = "0x55d398326f99059fF775485246999027B3197955"; // USDT บน BSC
const chainId = "0x38"; // BSC Mainnet

let web3;
let user;
let contract;
let usdt;

window.addEventListener("load", async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    await ethereum.request({ method: "eth_requestAccounts" });
    const accounts = await web3.eth.getAccounts();
    user = accounts[0];

    await switchToBSC();

    contract = new web3.eth.Contract(abi, contractAddress);
    usdt = new web3.eth.Contract(usdtAbi, usdtAddress);

    document.getElementById("walletAddress").textContent = "✅ Connected: " + user;

    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get("ref");
    if (ref) {
      document.getElementById("referrerInfo").textContent = "Referrer: " + ref;
    }

    const referralLink = `${window.location.origin}${window.location.pathname}?ref=${user}`;
    document.getElementById("referralLink").value = referralLink;
    document.getElementById("refLinkSection").style.display = "block";
  } else {
    alert("Please install MetaMask or Bitget Wallet.");
  }
});

async function switchToBSC() {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainId }],
    });
  } catch (err) {
    console.error("Switch network failed:", err);
  }
}

async function copyReferralLink() {
  const copyText = document.getElementById("referralLink");
  copyText.select();
  copyText.setSelectionRange(0, 99999);
  document.execCommand("copy");
  alert("Copied: " + copyText.value);
}

async function registerReferrer() {
  const urlParams = new URLSearchParams(window.location.search);
  const ref = urlParams.get("ref");
  if (!ref || ref.toLowerCase() === user.toLowerCase()) {
    alert("Invalid referrer address.");
    return;
  }

  try {
    await contract.methods.registerReferrer(ref).send({ from: user });
    alert("✅ Referrer registered successfully.");
  } catch (err) {
    alert("❌ Register failed: " + err.message);
  }
}

async function updateKJCPreview() {
  const amount = document.getElementById("usdtAmount").value;
  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    document.getElementById("kjcPreview").textContent = "Enter valid amount";
    return;
  }

  try {
    const kjc = await contract.methods.getKJCperUSDT().call();
    const decimals = await usdt.methods.decimals().call();
    const amountKJC = (amount * kjc) / (10 ** decimals);
    document.getElementById("kjcPreview").textContent = `≈ ${amountKJC.toFixed(2)} KJC`;
  } catch (err) {
    console.error(err);
    document.getElementById("kjcPreview").textContent = "Error fetching rate";
  }
}

async function purchase() {
  const amount = document.getElementById("usdtAmount").value;
  if (!amount || isNaN(amount) || Number(amount) < 10) {
    alert("❌ Minimum 10 USDT required.");
    return;
  }

  const amountWei = web3.utils.toWei(amount, "ether");

  try {
    await usdt.methods.approve(contractAddress, amountWei).send({ from: user });
    await contract.methods.buyWithReferral(amountWei).send({ from: user });
    alert("✅ Purchase successful and KJC distributed.");
  } catch (err) {
    alert("❌ Purchase failed: " + err.message);
  }
}
