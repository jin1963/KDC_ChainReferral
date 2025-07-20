// main.js
let userAccount;
let contract;
let usdt;
let ref = null;

window.addEventListener("load", async () => {
    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3.eth.getAccounts();
        userAccount = accounts[0];
        contract = new web3.eth.Contract(contractABI, contractAddress);
        usdt = new web3.eth.Contract(usdtABI, usdtAddress);
        document.getElementById("wallet-status").innerText = "✅ เชื่อมต่อกระเป๋าแล้ว";
        ref = new URLSearchParams(window.location.search).get("ref");
        if (ref) {
            localStorage.setItem("ref", ref);
        } else {
            ref = localStorage.getItem("ref");
        }
        if (ref) {
            const link = `${window.location.origin}${window.location.pathname}?ref=${userAccount}`;
            const copyBtn = document.createElement("button");
            copyBtn.innerText = "📋 คัดลอกลิงก์แนะนำ";
            copyBtn.onclick = () => {
                navigator.clipboard.writeText(link);
                alert("คัดลอกลิงก์แล้ว!");
            };
            document.getElementById("ref-link").appendChild(copyBtn);
        }
    } else {
        document.getElementById("wallet-status").innerText = "❌ ไม่พบกระเป๋า";
    }
});

document.getElementById("registerBtn").onclick = async () => {
    const refAddress = document.getElementById("refAddress").value;
    try {
        await contract.methods.registerReferrer(refAddress).send({ from: userAccount });
        alert("✅ สมัคร Referrer สำเร็จ");
    } catch (e) {
        alert("❌ สมัคร Referrer ไม่สำเร็จ");
    }
};

document.getElementById("buyBtn").onclick = async () => {
    const amount = document.getElementById("usdtAmount").value;
    if (!amount || isNaN(amount)) {
        alert("กรุณากรอกจำนวน USDT ให้ถูกต้อง");
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
