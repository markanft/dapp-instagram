import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import './App.css';
import Dappinstagram from '../abis/Dappinstagram.json';
import Navbar from './Navbar';
import Main from './Main';
import { Buffer } from 'buffer';
import ipfsClient from 'ipfs-http-client';

const ipfs = ipfsClient({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
});

function App() {
  const [account, setAccount] = useState('');
  const [loading, setLoading] = useState(true);
  const [dappinstagram, setDappinstagram] = useState(null);
  const [images, setImages] = useState([]);
  const [buffer, setBuffer] = useState();
  let chainId;

  const startApp = async provider => {
    // If the provider returned by detectEthereumProvider is not the same as
    // window.ethereum, something is overwriting it, perhaps another wallet.
    if (provider !== window.ethereum) {
      console.error('Do you have multiple wallets installed?');
    }

    const web3 = new Web3(window.ethereum);
    const networkId = await web3.eth.net.getId();
    const networkData = Dappinstagram.networks[networkId];
    if (networkData) {
      const dappinstagram = new web3.eth.Contract(Dappinstagram.abi, networkData.address);
      setDappinstagram(dappinstagram);
      const imageCount = await dappinstagram.methods.imageCount().call();

      let imagesArray = [];
      for (let i = 1; i <= imageCount; i++) {
        const image = await dappinstagram.methods.images(i).call();
        imagesArray.push(image);
      }

      setImages(imagesArray.sort((a, b) => b.tipAmount - a.tipAmount));
    } else {
      window.alert('Dappinstagram contract not deployed to detected network');
    }
    // Access the decentralized web!
  };

  const handleChainChanged = _chainId => {
    // We recommend reloading the page, unless you must do otherwise
    if (chainId !== _chainId) {
      window.location.reload();
      // Run any other necessary logic...
    }
  };

  let currentAccount = null;
  const handleAccountsChanged = accounts => {
    if (accounts.length === 0) {
      setAccount(null);
      // MetaMask is locked or the user has not connected any accounts
      console.log('Please connect to MetaMask.');
    } else if (accounts[0] !== currentAccount) {
      currentAccount = accounts[0];
      setAccount(currentAccount);
      // Do any other work!
    }
  };

  let loadWeb3 = async () => {
    const provider = await detectEthereumProvider();

    if (provider) {
      await startApp(provider); // Initialize your app
    } else {
      console.log('Please install MetaMask!');
    }

    window.ethereum
      .request({ method: 'eth_accounts' })
      .then(handleAccountsChanged)
      .catch(err => {
        // Some unexpected error.
        // For backwards compatibility reasons, if no accounts are available,
        // eth_accounts will return an empty array.
        console.error(err);
      });

    chainId = await window.ethereum.request({ method: 'eth_chainId' }).catch(err => console.error(err));

    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('accountsChanged', handleAccountsChanged);
  };

  const signIn = () => {
    window.ethereum
      .request({ method: 'eth_requestAccounts' })
      .then(handleAccountsChanged)
      .catch(err => {
        if (err.code === 4001) {
          // EIP-1193 userRejectedRequest error
          // If this happens, the user rejected the connection request.
          console.log('Please connect to MetaMask.');
        } else {
          console.error(err);
        }
      });
  };

  const captureFile = event => {
    event.preventDefault();
    const file = event.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);

    reader.onloadend = () => {
      setBuffer(Buffer(reader.result));
    };
  };

  const uploadImage = description => {
    console.log('Submiting dile to ipfs');
    ipfs
      .add(buffer)
      .then(result => {
        console.log('Ipfs result', result);
        setLoading(true);
        dappinstagram.methods
          .uploadImage(result[0].hash, description)
          .send({ from: account })
          .on('confirmation', hash => {
            window.location.reload();
          });
      })
      .catch(error => {
        console.error(error);
      });
  };

  const tipImageOwner = async (id, tipAmount) => {
    setLoading(true);
    dappinstagram.methods
      .tipImageOwner(id)
      .send({ from: account, value: tipAmount })
      .on('confirmation', hash => {
        window.location.reload();
      });
  };

  useEffect(() => {
    loadWeb3();
    setLoading(false);
  }, []);

  return (
    <div>
      <Navbar account={account} onSignIn={signIn} />
      {loading ? (
        <div id="loader" className="text-center mt-5">
          <p>Loading...</p>
        </div>
      ) : (
        <>
          <Main captureFile={captureFile} uploadImage={uploadImage} images={images} tipImageOwner={tipImageOwner} />
        </>
      )}
    </div>
  );
}

export default App;
