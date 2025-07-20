
let userAccount;
let contract;
let usdt;
let ref = null;

async function connectWallet() {
  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum);
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const accounts = await web3.eth.getAccounts();
    userAccount = accounts[0];
    contract = new web3.eth.Contract(contractABI, contractAddress);
    usdt = new web3.eth.Contract(usdtABI, usdtAddress);
    document.getElementById("wallet-status").innerText = "✅ เชื่อมต่อ: " + userAccount;

    ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) {
      localStorage.setItem("ref", ref);
    } else {
      ref = localStorage.getItem("ref");
    }

    if (ref) {
      const link = `${window.location.origin}${window.location.pathname}?ref=${userAccount}`;
      document.getElementById("ref-link").value = link;
    }
  } else {
    alert("กรุณาติดตั้ง MetaMask หรือ Wallet ที่รองรับ");
  }
}

document.getElementById("connectBtn").onclick = connectWallet;

document.getElementById("registerBtn").onclick = async () => {
  const refAddress = document.getElementById("refAddress").value;
  try {
    await contract.methods.registerReferrer(refAddress).send({ from: userAccount });
    alert("✅ สมัคร Referrer สำเร็จ");
  } catch (e) {
    alert("❌ สมัครไม่สำเร็จ");
  }
};

document.getElementById("buyBtn").onclick = async () => {
  const amount = document.getElementById("usdtAmount").value;
  if (!amount || isNaN(amount)) return alert("กรุณากรอกจำนวน USDT ที่ถูกต้อง");
  const value = web3.utils.toWei(amount, "ether");
  try {
    await usdt.methods.approve(contractAddress, value).send({ from: userAccount });
    await contract.methods.buyWithReferral(value).send({ from: userAccount });
    alert("✅ ซื้อสำเร็จ");
  } catch (e) {
    alert("❌ ซื้อไม่สำเร็จ");
  }
};

document.getElementById("copyRefBtn").onclick = () => {
  const link = document.getElementById("ref-link").value;
  if (link) {
    navigator.clipboard.writeText(link);
    alert("คัดลอกลิงก์แล้ว");
  } else {
    alert("ยังไม่มีลิงก์แนะนำ");
  }
};
