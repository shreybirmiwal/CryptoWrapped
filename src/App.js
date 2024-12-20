import React, { useState } from "react";
import axios from "axios";
import { useSpring, animated } from "react-spring";
import { FaEthereum } from "react-icons/fa";
import { motion, AnimatePresence } from 'framer-motion';

const ETHERSCAN_API_KEY = process.env.REACT_APP_ETHERSCAN_API_KEY;
const ETHERSCAN_API_URL = "https://api.etherscan.io/api";

const App = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const fetchData = async () => {
    if (!walletAddress.trim()) {
      alert("Please enter a valid wallet address.");
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
      const generatedSlides = await generateSlides(transactions, walletAddress);
      setSlides(generatedSlides);
      setCurrentSlide(0); // Reset to the first slide
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
    insights.push({
      text: `You made a total of ${yearTransactions.length} transactions in the past year. What a journey!`,
      image: `https://images.unsplash.com/photo-1568438350562-2cae6d394ad0?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`
    });
    // Highest value transaction
    const highestValueTx = yearTransactions.reduce((max, tx) =>
      parseFloat(tx.value) > parseFloat(max.value) ? tx : max
    );
    insights.push({
      text: `Your biggest transaction was ${parseFloat(highestValueTx.value) / 1e18} ETH. Whale alert! 🐳`,
      image: `https://images.unsplash.com/photo-1559762717-99c81ac85459?q=80&w=2487&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`
    });

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
    insights.push({
      text: `You were on fire 🔥 in ${monthNames[mostActiveMonth[0]]} with ${mostActiveMonth[1]} transactions!`,
      image: 'https://images.unsplash.com/photo-1486546910464-ec8e45c4a137?q=80&w=2918&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    });

    // Gas spent
    const totalGasSpent = yearTransactions.reduce((sum, tx) =>
      sum + (parseFloat(tx.gasPrice) * parseFloat(tx.gasUsed)), 0
    );
    insights.push({
      text: `You spent a whopping ${(totalGasSpent / 1e18).toFixed(4)} ETH on gas fees. Ouch! 💸`,
      image: 'https://images.unsplash.com/photo-1549317336-206569e8475c?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    })

    // Unique contracts interacted with
    const uniqueContracts = new Set(yearTransactions.map(tx => tx.to)).size;
    insights.push(
      {
        text: `You interacted with ${uniqueContracts} unique smart contracts. Diversification at its finest! 🌈`,
        image: `https://plus.unsplash.com/premium_photo-1673795753320-a9df2df4461e?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`,
      });

    // Average transactions per day
    const avgTransactionsPerDay = yearTransactions.length / 365;
    insights.push(
      {
        text: `On average, you made ${avgTransactionsPerDay.toFixed(2)} transactions per day. Crypto never sleeps! 😴`,
        image: `https://images.unsplash.com/photo-1524351543168-8e38787614e9?q=80&w=2274&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`
      });

    // Transaction success rate
    const successfulTransactions = yearTransactions.filter(tx => tx.isError === '0').length;
    const successRate = (successfulTransactions / yearTransactions.length * 100).toFixed(2);
    insights.push(
      {
        text: `Your transaction success rate was ${successRate}%. ${successRate > 95 ? 'Nailed it! 🎯' : 'Room for improvement! 🎓'}`,
        image: `https://images.unsplash.com/photo-1578589385589-c94a956e2450?q=80&w=2360&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`
      });

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
    insights.push(
      {
        text: `Your net ETH flow for the year: ${netEthFlow.toFixed(4)} ETH. ${netEthFlow > 0 ? 'You\'re in the green! 💚' : 'Keep HODLing! 💎🙌'}`,
        image: `https://plus.unsplash.com/premium_photo-1672582776510-048e431afb31?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`
      });

    // Most frequent interaction
    const frequentInteractions = yearTransactions.reduce((acc, tx) => {
      acc[tx.to] = (acc[tx.to] || 0) + 1;
      return acc;
    }, {});
    const mostFrequentAddress = Object.entries(frequentInteractions).reduce((max, [address, count]) =>
      count > max[1] ? [address, count] : max
    );
    insights.push(
      {
        text: `Your favorite address was ${mostFrequentAddress[0].slice(0, 6)}...${mostFrequentAddress[0].slice(-4)}. You interacted with it ${mostFrequentAddress[1]} times! 💕`,
        image: `https://images.unsplash.com/photo-1549490349-8643362247b5?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTMxfHxhYnN0cmFjdHxlbnwwfHwwfHx8MA%3D%3D`
      });
    return insights;
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1 < slides.length ? prev + 1 : 0));
  };

  const slideAnimation = useSpring({
    opacity: 1,
    transform: "translateY(0)",
    from: { opacity: 0, transform: "translateY(20px)" },
    reset: true,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black text-white flex flex-col items-center justify-center p-4">
      <motion.h1
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-5xl font-extrabold text-center mb-6"
      >
        Crypto Wrapped 2024
      </motion.h1>
      {slides.length === 0 ? (
        <div className="w-full max-w-md">
          <p className="text-center text-gray-300 mb-4">
            Relive your 2024 crypto journey! Enter your Ethereum wallet address to get started.
          </p>
          <motion.input
            whileFocus={{ scale: 1.05 }}
            type="text"
            placeholder="Paste your wallet address"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            className="w-full p-3 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchData}
            disabled={loading}
            className={`mt-4 px-6 py-2 w-full rounded-md font-bold ${loading ? "bg-gray-500 cursor-not-allowed" : "bg-green-500 hover:bg-green-700"
              }`}
          >
            {loading ? "Loading..." : "Get My Wrapped!"}
          </motion.button>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md aspect-square relative overflow-hidden rounded-lg shadow-lg"
          >
            <img
              src={slides[currentSlide].image}
              alt="Insight background"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center p-6">
              <h2 className="text-2xl font-bold mb-4 text-center">{slides[currentSlide].text}</h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={nextSlide}
                className="mt-4 px-6 py-2 rounded-md font-bold bg-green-500 hover:bg-green-700"
              >
                Next Insight
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-10 right-10 text-6xl text-green-500 opacity-50"
      >
        <FaEthereum />
      </motion.div>
    </div>
  );
};

export default App;