import React, { useState } from "react";
import Routers from "../../routes/Routers";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import MarketplaceAbi from "../../contractsData/Marketplace-abi.json";
import MarketplaceAddress from "../../contractsData/Marketplace-address.json";
import { ethers } from "ethers";


const Layout = () => {
  const [account, setAccount] = useState(null);
  const [marketplace, setMarketplace] = useState();
  const web3Handler = async () => {
    const accounts = await window.ethereum.request({method:"eth_requestAccounts"});
    setAccount(accounts[0]);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    loadContracts(signer);
  };

  const loadContracts = async (signer) => {
    const marketplace = new ethers.Contract(MarketplaceAddress.address, MarketplaceAbi, signer);
    setMarketplace(marketplace);
  };

  return (
    <div>
      <Header web3Handler={web3Handler} account={account} />
      <div>
        <Routers marketplace={marketplace} account={account} />
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
