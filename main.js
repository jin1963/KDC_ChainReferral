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

        // อ่านค่าจาก URL หรือ localStorage
        ref = new URLSearchParams(window.location.search).get("ref");
        if (ref) {
            localStorage.setItem("ref", ref);
        } else {
            ref = localStorage.getItem("ref");
        }

        // แสดงลิงก์ของผู้ใช้งาน
        generateReferralLink(userAccount);
    } else {
        document.getElementById("wallet-status").innerText = "❌ ไม่พบกระเป๋า";
    }
});

function generateReferralLink(account) {
    const baseUrl = window.location.origin + window.location.pathname;
    const referralLink = `${baseUrl}?ref=${account}`;
    const input = document.getElementById("referralInput");
    input.value = referralLink;

    const copyBtn = document.getElementById("copyBtn");
    if (copyBtn) {
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(referralLink);
            alert("✅ คัดลอกลิงก์แล้ว!");
        };
    }
}

document.getElementById("registerBtn").onclick = async () => {
    const refAddress = document.getElementById("refAddress").value;
    try {
        await contract.methods.registerReferrer(refAddress).send({ from: userAccount });
        alert("✅ สมัคร Referrer สำเร็จ");
    } catch (e) {
        alert("❌ สมัคร Referrer ไม่สำเร็จ");
        console.error(e);
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
        console.error(e);
    }
};
