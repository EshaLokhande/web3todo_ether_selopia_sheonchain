import React, { useState, useEffect } from 'react';
import { TextField, Button, CircularProgress, Avatar, IconButton } from '@mui/material';
import { Logout, Refresh } from '@mui/icons-material';
import Task from './Task';
import { ethers } from 'ethers';
import TaskAbi from './utils/TaskContract.json';
import { TaskContractAddress } from './config.js';

function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  const [currentAccount, setCurrentAccount] = useState('');
  const [correctNetwork, setCorrectNetwork] = useState(false);
  const [loading, setLoading] = useState(false);
  const [txLoading, setTxLoading] = useState(false);

  const getAllTasks = async () => {
    setLoading(true);
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const TaskContract = new ethers.Contract(
          TaskContractAddress,
          TaskAbi.abi,
          signer
        );
  
        // Fetch tasks from the contract
        const rawTasks = await TaskContract.getMyTasks();
  
        // Transform task data
        const formattedTasks = rawTasks.map((task) => ({
          id: task.id.toString(),
          taskText: task.taskText,
          isDeleted: task.isDeleted,
        }));
  
        setTasks(formattedTasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (currentAccount) getAllTasks();
  }, [currentAccount]);

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) return alert('Please install MetaMask');

      const chainId = await ethereum.request({ method: 'eth_chainId' });
      const sepoliaChainId = '0xaa36a7';

      if (chainId !== sepoliaChainId) {
        alert('Please connect to the Sepolia Testnet');
        return setCorrectNetwork(false);
      }

      setCorrectNetwork(true);
      const [account] = await ethereum.request({ method: 'eth_requestAccounts' });
      setCurrentAccount(account);
    } catch (error) {
      console.log('Error connecting:', error);
    }
  };

  const disconnectWallet = () => {
    setCurrentAccount('');
    setCorrectNetwork(false);
    setTasks([]);
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
  
    setTxLoading(true); // Start loading
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const TaskContract = new ethers.Contract(
          TaskContractAddress,
          TaskAbi.abi,
          signer
        );

        const tx = await TaskContract.addTask(input, false);
        await tx.wait(); // Wait for transaction confirmation
        await getAllTasks(); // Refresh tasks
        setInput('');
      }
    } catch (error) {
      console.log('Error adding task:', error);
    }
    setTxLoading(false); // Stop loading
  };

  const deleteTask = async (taskId) => {
    setTxLoading(true); // Start loading
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const TaskContract = new ethers.Contract(
          TaskContractAddress,
          TaskAbi.abi,
          signer
        );

        const tx = await TaskContract.deleteTask(taskId, true);
        await tx.wait(); // Wait for transaction confirmation
        await getAllTasks(); // Refresh tasks
      }
    } catch (error) {
      console.log('Error deleting task:', error);
    }
    setTxLoading(false); // Stop loading
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 p-8 animate-gradient-x">
      {/* Transaction Loading Overlay */}
      {txLoading && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-glass p-6 rounded-2xl shadow-xl flex flex-col items-center space-y-4">
            <CircularProgress className="!text-purple-400" size={50} thickness={2} />
            <p className="text-white font-medium text-lg animate-pulse">Processing Magic...</p>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-glass backdrop-blur-lg rounded-2xl p-6 mb-8 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Web3 Task Manager
            </h1>
            
            {currentAccount ? (
              <div className="flex items-center gap-4">
                <IconButton 
                  onClick={getAllTasks} 
                  className="!bg-white/10 hover:!bg-white/20 !transition-all"
                  title="Refresh tasks"
                >
                  <Refresh className="text-purple-200" />
                </IconButton>
                <div className="flex items-center gap-3 bg-white/5 rounded-full pl-3 pr-2 py-1 border border-white/10">
                  <Avatar className="!bg-purple-500 !text-white shadow-md">
                    {currentAccount.slice(2, 3).toUpperCase()}
                  </Avatar>
                  <span className="text-purple-100 font-medium">
                    {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}
                  </span>
                  <IconButton 
                    onClick={disconnectWallet} 
                    className="!text-purple-200 hover:!bg-white/10"
                    title="Disconnect"
                  >
                    <Logout className="!scale-110" />
                  </IconButton>
                </div>
              </div>
            ) : (
              <Button
                onClick={connectWallet}
                variant="contained"
                className="!bg-gradient-to-r !from-purple-500 !to-blue-500 !text-white !px-8 !py-3 !rounded-full !shadow-lg hover:!shadow-xl !transition-all !transform hover:!scale-105"
              >
                Connect Wallet
              </Button>
            )}
          </div>
        </div>

        {currentAccount && correctNetwork && (
          <div className="bg-glass backdrop-blur-lg rounded-2xl shadow-2xl p-6">
            <form onSubmit={addTask} className="flex flex-col sm:flex-row gap-4 mb-8">
              <TextField
                fullWidth
                variant="outlined"
                label="What needs to be done?"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-grow bg-white/5 rounded-lg"
                InputProps={{
                  className: "!text-white !text-lg",
                  style: {
                    borderRadius: '1rem',
                  }
                }}
                InputLabelProps={{
                  className: "!text-gray-300"
                }}
              />
              <Button
                type="submit"
                variant="contained"
                className="!bg-gradient-to-r !from-green-400 !to-cyan-500 !text-white !px-8 !py-3 !rounded-full !shadow-lg hover:!shadow-xl !transition-transform hover:!scale-105 h-full"
                size="large"
              >
                + Add Task
              </Button>
            </form>

            {loading ? (
              <div className="text-center py-12">
                <CircularProgress className="!text-purple-400" size={50} />
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-4">🌟 Your task list is empty!</div>
                <p className="text-gray-500">Start by adding your first magical task</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <Task
                    key={task.id}
                    task={task}
                    onDelete={() => deleteTask(task.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {!correctNetwork && currentAccount && (
          <div className="mt-6 p-4 bg-red-400/20 backdrop-blur-sm rounded-xl border border-red-400/30 text-red-100 text-center animate-pulse-fast">
            ⚠️ Please switch to Sepolia Testnet
          </div>
        )}
      </div>

      {/* Floating Particles Background */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${15 + i%5 * 5}s infinite ${i * 0.2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default App;