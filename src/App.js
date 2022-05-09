import { useEffect, useState } from "react";
import Web3 from "web3";
import detectEthereumProvider from "@metamask/detect-provider";

import "./App.css";
import { loadContract } from "./utils/load-contract";

const App = () => {
  const [web3Api, setWeb3Api] = useState({
    provider: null,
    web3: null,
    contract: null,
    isProviderLoaded: false,
  });
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [shouldReload, setShouldReload] = useState(false);

  const canConnectToContract = web3Api.contract && account;

  const setAccountListener = (provider) => {
    provider.on("accountsChanged", (accounts) => {
      if (accounts.length) {
        setAccount(accounts[0]);
      } else {
        setAccount(null);
      }
    });
  };

  const setChainChangedListener = (provider) => {
    provider.on("chainChanged", (chain) => {
      console.log(chain);
      window.location.reload();
    });
  };

  useEffect(() => {
    const loadProvider = async () => {
      try {
        const provider = await detectEthereumProvider();

        if (provider) {
          const contract = await loadContract("Faucet", provider);

          setAccountListener(provider);
          setChainChangedListener(provider);

          setWeb3Api({
            web3: new Web3(provider),
            provider,
            contract,
            isProviderLoaded: true,
          });
        } else {
          setWeb3Api((prev) => ({ ...prev, isProviderLoaded: true }));
          console.warn("Please install metamask");
        }
      } catch (error) {
        console.warn("Error while set provider", error);
      }
    };

    loadProvider();
  }, []);

  useEffect(() => {
    const getAccount = async () => {
      try {
        const accounts = await web3Api.web3.eth.getAccounts();

        if (accounts.length) {
          setAccount(accounts[0]);
        }
      } catch (error) {
        console.warn("Error in get accounts", error);
      }
    };

    if (web3Api.web3) {
      getAccount();
    }
  }, [web3Api.web3]);

  useEffect(() => {
    const loadBalance = async () => {
      const { contract, web3 } = web3Api;
      try {
        const balanceWei = await web3.eth.getBalance(contract.address);
        const balance = await web3.utils.fromWei(balanceWei);

        setBalance(balance);
      } catch (error) {
        console.warn("Error in get balance", error);
      }
    };

    if (web3Api.contract) {
      loadBalance();
    }
  }, [web3Api, shouldReload]);

  const connectWallet = () => {
    if (web3Api.web3) {
      web3Api.provider.request({ method: "eth_requestAccounts" });
    } else {
      console.warn("Please install metamask");
    }
  };

  const addFunds = async () => {
    const { contract, web3 } = web3Api;

    if (contract && account) {
      try {
        const value = await web3.utils.toWei("1");
        await contract.addFunds({ from: account, value });

        setShouldReload(!shouldReload);
      } catch (error) {
        console.warn("Error in add funds", error);
      }
    } else {
      console.warn("There is no instance of a contract or address");
    }
  };

  const withdraw = async () => {
    const { contract, web3 } = web3Api;

    if (contract) {
      try {
        const withdrawAmount = await web3.utils.toWei("0.1");
        await contract.withdraw(withdrawAmount, { from: account });
        setShouldReload(!shouldReload);
      } catch (error) {
        console.warn("Error in withdraw", error);
      }
    }
  };

  return (
    <div className="faucet-wrapper">
      <div className="faucet">
        <span>
          <strong>Account:</strong>
        </span>
        {web3Api.isProviderLoaded ? (
          <div>
            {account ? (
              <h1>{account}</h1>
            ) : !web3Api.provider ? (
              <div className="notification is-warning is-small is rounded">
                Wallet is not detected.{" "}
                <a target="_blank" rel="noreferrer" href="https://metamask.io/">
                  Install metamask
                </a>
              </div>
            ) : (
              <button
                className="button is-info is-small"
                onClick={connectWallet}
              >
                Connect Wallet
              </button>
            )}
          </div>
        ) : (
          <span>Looking for web3...</span>
        )}
        <div className="balance-view is-size-2 mb-4">
          Current balance: <strong>{balance}</strong> ETH
        </div>

        {!canConnectToContract && (
          <i className="is-block ">
            You are on the wrong network. Please connect to Ganache.
          </i>
        )}

        <button
          disabled={!canConnectToContract}
          className="button is-link mr-2"
          onClick={addFunds}
        >
          Donate 1 ETH
        </button>
        <button
          disabled={!canConnectToContract}
          className="button is-primary"
          onClick={withdraw}
        >
          Withdraw
        </button>
      </div>
    </div>
  );
};

export default App;

// Private key 32 byte number
// aedde49012c80b3fc886ee27f45e80b8122378fc2d267867740301285afe29cc

// Public key uncompressed 64 bytes
// 04f691991361871a884b6e7ae1ff452e55ab5e9209415927d76e8e55d203c9812ece244047980026eb9f93776fc882d90ca641d7f1403ae54f2adc93ee9a153e1e

// Public key compressed 32 bytes
// 02f691991361871a884b6e7ae1ff452e55ab5e9209415927d76e8e55d203c9812e
