import WrongNetworkMessage from '../components/WrongNetworkMessage'
import ConnectWalletButton from '../components/ConnectWalletButton'
import TodoList from '../components/TodoList'

import {TaskContractAddress} from '../config.js';
import TaskABI from '../../backend/build/contracts/TaskContract.json';

import {ethers} from 'ethers';

import {useState,useEffect} from 'react';

/* 
const tasks = [
  { id: 0, taskText: 'clean', isDeleted: false }, 
  { id: 1, taskText: 'food', isDeleted: false }, 
  { id: 2, taskText: 'water', isDeleted: true }
]
*/

export default function Home() {
  const [correctNetwork, setCorrectNetwork] = useState(false);
  const [isUserLoggedIn,setIsUserLoggedIn] = useState(false);
  const [currentAccount,setCurrentAccount] = useState('');
  const [input,setInput] = useState('');
  const [tasks,setTasks] = useState([]);

  useEffect(() => {
    connectWallet();
    getAllTasks();
  },[])
  // Calls Metamask to connect wallet on clicking Connect Wallet button
  const connectWallet = async () => {
    try{
      const {ethereum} = window;
      if(!ethereum){
        console.log("Metamask not connected");
        return;
      }
      let chainId =  await ethereum.request({method : 'eth_chainId'});
      const rinkebyChainId = '0x4';
      if(chainId !== rinkebyChainId){
        alert("You're not on rinkeby test network");
        setCorrectNetwork(false);
        return;
      }
      else{
        const accounts = await ethereum.request({method : 'eth_requestAccounts'});
        console.log("Account selected : ",accounts[0]);
        setIsUserLoggedIn(true);
        setCurrentAccount(accounts[0]);
      }
    }
    catch(error){
      console.error(error);
    }
  }

  // Just gets all the tasks from the contract
  const getAllTasks = async () => {
  try{
      const {ethereum} = window;
      if(!ethereum){
        console.log("Metamask not connected");
        return;
      }

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const taskContract = new ethers.Contract(TaskContractAddress, TaskABI.abi, signer);

      let allTasks = await taskContract.getMyTask();
      setTasks(allTasks);
    }
    catch(error){
      console.error(error);
    }
  }

  // Add tasks from front-end onto the blockchain
  const addTask = async e => {
    e.preventDefault();
    let task = {
      taskTest : input,
      isDeleted : false
    }

    try{
      const {ethereum} = window;
      if(!ethereum){
        console.log("Metamask not connected");
        return;
      }

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const taskContract = new ethers.Contract(TaskContractAddress, TaskABI.abi, signer);

      taskContract.addTask(task.taskTest, task.isDeleted)
      .then((res) => {
        setTasks([...tasks,task]);
        console.log("Task added")
      })
      
    }
    catch(error){
      console.error(error);
    }

    setInput('');
  }

  // Remove tasks from front-end by filtering it out on our "back-end" / blockchain smart contract
  const deleteTask = key => async () => {
    try{
      const {ethereum} = window;
      if(!ethereum){
        console.log("Metamask not connected");
        return;
      }

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const taskContract = new ethers.Contract(TaskContractAddress, TaskABI.abi, signer);

      let res = await taskContract.deleteTask(key,true);
      let allTasks = await taskContract.getMyTask();
      setTasks(allTasks);
    }
    catch(error){
      console.error(error);
    }
  }

  return (
    <div className='bg-[#97b5fe] h-screen w-screen flex justify-center py-6'>
      {!isUserLoggedIn ? <ConnectWalletButton connectWallet={connectWallet}/> :
        'is this the correct network' ? <TodoList input={input} setInput={setInput} addTask={addTask} tasks={tasks} deleteTask={deleteTask}/> : <WrongNetworkMessage />}
    </div>
  )
}

