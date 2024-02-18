import "./app.css";
import Layout from "./components/Layout/Layout";
import React, { useEffect } from "react";


function App() {
  useEffect(() => {
    document.title = "BlazeNFT Marketplace";
  }, []);
  return <Layout />;
}

export default App;
