// main.js
let userAccount;
let contract;
let usdt;
let ref = null;

window.addEventListener("load", async () => {
    if (window.ethereum) {
        // เตรียม Web3 และ listener ปุ่ม connect
        document.getElementById("connectBtn").addEventListener("click", connectWallet);
    } else {
        document.getElementById("wallet-status").innerText = "❌ ไม่พบกระเป๋า";
    }
});

async function connectWallet() {
    try {
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3.eth.getAccounts();
        userAccount = accounts[0];
        contract = new web3.eth.Contract(contractABI, contractAddress);
        usdt = new web3.eth.Contract(usdtABI, usdtAddress);
        document.getElementById("wallet-status").innerText = "✅ เชื่อมต่อกระเป๋าแล้ว: " + userAccount;

        // ตรวจ ref จาก URL หรือ localStorage
        ref = new URLSearchParams(window.location.search).get("ref");
        if (ref) {
            localStorage.setItem("ref", ref);
        } else {
            ref = localStorage.getItem("ref");
        }

        // สร้างลิงก์ผู้แนะนำ
        const myLink = `${window.location.origin}${window.location.pathname}?ref=${userAccount}`;
        document.getElementById("ref-link").value = myLink;

    } catch (err) {
        alert("❌ การเชื่อมต่อล้มเหลว");
    }
}

document.getElementById("registerBtn").onclick = async () => {
    const refAddress = document.getElementById("refAddress").value;
    if (!refAddress || refAddress.toLowerCase() === userAccount.toLowerCase()) {
        alert("❌ Referrer ไม่ถูกต้อง");
        return;
    }

    try {
        await contract.methods.registerReferrer(refAddress).send({ from: userAccount });
        alert("✅ สมัคร Referrer สำเร็จ");
    } catch (e) {
        alert("❌ สมัคร Referrer ไม่สำเร็จ");
    }
};

document.getElementById("buyBtn").onclick = async () => {
    const amount = document.getElementById("usdtAmount").value;
    if (!amount || isNaN(amount) || Number(amount) < 10) {
        alert("❌ กรุณากรอกจำนวน USDT มากกว่า 10");
        return;
    }

    const value = web3.utils.toWei(amount, "ether");

    try {
        await usdt.methods.approve(contractAddress, value).send({ from: userAccount });
        await contract.methods.buyWithReferral(value).send({ from: userAccount });
        alert("✅ ซื้อสำเร็จ");
    } catch (e) {
        alert("❌ เกิดข้อผิดพลาดในการซื้อ");
    }
};
