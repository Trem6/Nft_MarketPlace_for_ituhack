import React from "react";

import { Routes, Route, Navigate } from "react-router-dom";

import Home from "../pages/Home";
import Market from "../pages/Market";
import Create from "../pages/Create";
import Contact from "../pages/Contact";
import MyNFTs from "../pages/MyNFTs";

import Wallet from "../pages/Wallet";
import NftDetails from "../pages/NftDetails";

const Routers = ({marketplace, account}) => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" />} />
      <Route path="/home" element={<Home marketplace={marketplace} />} />
      <Route path="/market" element={<Market marketplace={marketplace} />} />
      <Route path="/create" element={<Create marketplace={marketplace} account={account} />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/wallet" element={<Wallet />} />
      {account && <Route path="/nfts" element={<MyNFTs marketplace={marketplace} account={account} />} />}
      <Route path="/market/:id" element={<NftDetails marketplace={marketplace} account={account} />} />
    </Routes>
  );
};

export default Routers;
