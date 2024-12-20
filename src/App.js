import React, { useState } from "react";
import axios from "axios";

const ETHERSCAN_API_KEY = process.env.REACT_APP_ETHERSCAN_API_KEY;
const ETHERSCAN_API_URL = "https://api.etherscan.io/api";

const App = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!walletAddress) {
      alert("Please enter a wallet address.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get(ETHERSCAN_API_URL, {
        params: {
          module: "account",
          action: "txlist",
          address: walletAddress,
          startblock: 0,
          endblock: 99999999,
          sort: "desc",
          apikey: ETHERSCAN_API_KEY
        }
      });

      if (response.data.status !== "1") {
        throw new Error("Failed to fetch data");
      }

      const transactions = response.data.result;
      const slides = await generateSlides(transactions, walletAddress);

      slides.forEach((slide, index) => {
        console.log(`Slide ${index + 1}: ${slide}`);
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to fetch wallet data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generateSlides = async (transactions, walletAddress) => {
    const insights = [];
    const currentYear = new Date().getFullYear();
    const oneYearAgo = new Date(currentYear - 1, 0, 1).getTime() / 1000;

    // Filter transactions from the past year
    const yearTransactions = transactions.filter(tx => parseInt(tx.timeStamp) >= oneYearAgo);

    // Total number of transactions
    insights.push(`You made a total of ${yearTransactions.length} transactions in the past year. What a journey!`);

    // Highest value transaction
    const highestValueTx = yearTransactions.reduce((max, tx) =>
      parseFloat(tx.value) > parseFloat(max.value) ? tx : max
    );
    insights.push(`Your biggest transaction was ${parseFloat(highestValueTx.value) / 1e18} ETH. Whale alert! 🐳`);

    // Most active month
    const txByMonth = yearTransactions.reduce((acc, tx) => {
      const month = new Date(tx.timeStamp * 1000).getMonth();
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});
    const mostActiveMonth = Object.entries(txByMonth).reduce((max, [month, count]) =>
      count > max[1] ? [month, count] : max
    );
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    insights.push(`You were on fire 🔥 in ${monthNames[mostActiveMonth[0]]} with ${mostActiveMonth[1]} transactions!`);

    // Gas spent
    const totalGasSpent = yearTransactions.reduce((sum, tx) =>
      sum + (parseFloat(tx.gasPrice) * parseFloat(tx.gasUsed)), 0
    );
    insights.push(`You spent a whopping ${(totalGasSpent / 1e18).toFixed(4)} ETH on gas fees. Ouch! 💸`);

    // Unique contracts interacted with
    const uniqueContracts = new Set(yearTransactions.map(tx => tx.to)).size;
    insights.push(`You interacted with ${uniqueContracts} unique smart contracts. Diversification at its finest! 🌈`);

    // Average transactions per day
    const avgTransactionsPerDay = yearTransactions.length / 365;
    insights.push(`On average, you made ${avgTransactionsPerDay.toFixed(2)} transactions per day. Crypto never sleeps! 😴`);

    // Transaction success rate
    const successfulTransactions = yearTransactions.filter(tx => tx.isError === '0').length;
    const successRate = (successfulTransactions / yearTransactions.length * 100).toFixed(2);
    insights.push(`Your transaction success rate was ${successRate}%. ${successRate > 95 ? 'Nailed it! 🎯' : 'Room for improvement! 🎓'}`);

    // Net ETH flow
    let netEthFlow = 0;
    for (const tx of yearTransactions) {
      const value = parseFloat(tx.value) / 1e18; // Convert from Wei to ETH
      if (tx.from.toLowerCase() === walletAddress.toLowerCase()) {
        netEthFlow -= value;
      } else {
        netEthFlow += value;
      }
    }
    insights.push(`Your net ETH flow for the year: ${netEthFlow.toFixed(4)} ETH. ${netEthFlow > 0 ? 'You\'re in the green! 💚' : 'Keep HODLing! 💎🙌'}`);

    // Most frequent interaction
    const frequentInteractions = yearTransactions.reduce((acc, tx) => {
      acc[tx.to] = (acc[tx.to] || 0) + 1;
      return acc;
    }, {});
    const mostFrequentAddress = Object.entries(frequentInteractions).reduce((max, [address, count]) =>
      count > max[1] ? [address, count] : max
    );
    insights.push(`Your favorite address was ${mostFrequentAddress[0].slice(0, 6)}...${mostFrequentAddress[0].slice(-4)}. You interacted with it ${mostFrequentAddress[1]} times! 💕`);

    // Summary insight
    insights.push(`In summary, your crypto year was a rollercoaster! You made ${yearTransactions.length} transactions, spent ${(totalGasSpent / 1e18).toFixed(4)} ETH on gas, and interacted with ${uniqueContracts} different contracts. Your net ETH flow was ${netEthFlow.toFixed(4)} ETH, and you were most active in ${monthNames[mostActiveMonth[0]]}. Keep on crypto-ing! 🚀`);

    return insights;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-extrabold text-center mb-6">
        Crypto Wrapped 2024
      </h1>
      <p className="text-center text-gray-400 mb-4">
        Relive your 2024 crypto journey! Enter your Ethereum wallet address to get started.
      </p>
      <input
        type="text"
        placeholder="Paste your wallet address"
        value={walletAddress}
        onChange={(e) => setWalletAddress(e.target.value)}
        className="w-full max-w-md p-3 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-green-500"
      />
      <button
        onClick={fetchData}
        disabled={loading}
        className={`mt-4 px-6 py-2 rounded-md font-bold ${loading
          ? "bg-gray-500 cursor-not-allowed"
          : "bg-green-500 hover:bg-green-700"
          }`}
      >
        {loading ? "Loading..." : "Get My Wrapped!"}
      </button>
    </div>
  );
};

export default App;
