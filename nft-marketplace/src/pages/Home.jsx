import React from "react";

import HeroSection from "../components/ui/HeroSection";

import LiveAuction from "../components/ui/Live-auction/LiveAuction";

import Trending from "../components/ui/Trending-section/Trending";

import StepSection from "../components/ui/Step-section/StepSection";

const Home = ({marketplace}) => {
  return (
    <>
      <HeroSection />
      <LiveAuction marketplace={marketplace} />
      <Trending marketplace={marketplace} />
      <StepSection />
    </>
  );
};

export default Home;
