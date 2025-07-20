let web3;
let contract;
let usdtContract;
let userAddress;

window.addEventListener("load", async () => {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        await connectWallet();
    } else {
        alert("⚠️ กรุณาติดตั้ง MetaMask หรือ Wallet ที่รองรับ");
    }

    // หากมี ref ใน URL ให้แสดงค่าบนปุ่มสมัคร
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) {
        document.getElementById("refAddress").value = ref;
    }

    document.getElementById("connectButton").onclick = connectWallet;
    document.getElementById("registerButton").onclick = registerReferrer;
    document.getElementById("purchaseButton").onclick = purchaseKJC;
    document.getElementById("copyButton").onclick = copyReferralLink;
    document.getElementById("usdtInput").oninput = updateKJCPreview;
});

async function connectWallet() {
    try {
        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
        userAddress = accounts[0];
        document.getElementById("walletStatus").innerHTML = `✅ เชื่อมต่อกระเป๋าแล้ว: ${userAddress}`;

        contract = new web3.eth.Contract(contractABI, contractAddress);
        usdtContract = new web3.eth.Contract(usdtAbi, usdtAddress);

        const referralLink = `${window.location.origin}${window.location.pathname}?ref=${userAddress}`;
        document.getElementById("referralLink").value = referralLink;
        document.getElementById("referralArea").style.display = "block";
    } catch (err) {
        console.error(err);
        document.getElementById("walletStatus").innerHTML = "❌ การเชื่อมต่อล้มเหลว";
    }
}

async function registerReferrer() {
    const ref = document.getElementById("refAddress").value.trim();
    if (!web3.utils.isAddress(ref)) return alert("❌ Referrer address ไม่ถูกต้อง");

    if (ref.toLowerCase() === userAddress.toLowerCase()) {
        return alert("❌ ห้ามใส่ address ตัวเองเป็น referrer");
    }

    try {
        await contract.methods.registerReferrer(ref).send({ from: userAddress });
        alert("✅ สมัคร Referrer สำเร็จ");
    } catch (err) {
        console.error(err);
        alert("❌ สมัคร Referrer ไม่สำเร็จ");
    }
}

async function purchaseKJC() {
    const amount = document.getElementById("usdtInput").value;
    if (!amount || isNaN(amount) || amount <= 0) return alert("❌ ใส่จำนวน USDT ให้ถูกต้อง");

    const decimals = 18; // USDT บน BSC มักใช้ 18 decimal
    const amountInWei = web3.utils.toWei(amount, "ether");

    try {
        const allowance = await usdtContract.methods.allowance(userAddress, contractAddress).call();
        if (Number(allowance) < Number(amountInWei)) {
            await usdtContract.methods.approve(contractAddress, amountInWei).send({ from: userAddress });
        }

        await contract.methods.buyWithReferral(amountInWei).send({ from: userAddress });
        alert("✅ ซื้อ KJC สำเร็จแล้ว");
    } catch (err) {
        console.error(err);
        alert("❌ การซื้อไม่สำเร็จ");
    }
}

async function updateKJCPreview() {
    const amount = document.getElementById("usdtInput").value;
    if (!amount || isNaN(amount) || amount <= 0 || !contract) return;

    try {
        const rate = await contract.methods.getKJCperUSDT().call();
        const kjcAmount = (Number(amount) * Number(rate)) / 1e18;
        document.getElementById("kjcPreview").innerText = `≈ ${kjcAmount.toFixed(2)} KJC`;
    } catch (err) {
        document.getElementById("kjcPreview").innerText = "";
    }
}

function copyReferralLink() {
    const input = document.getElementById("referralLink");
    input.select();
    document.execCommand("copy");
    alert("✅ คัดลอกลิงก์ Referral แล้ว");
}
