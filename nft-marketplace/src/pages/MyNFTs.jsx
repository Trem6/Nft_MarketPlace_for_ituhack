import React, { useEffect, useState } from "react";

import CommonSection from "../components/ui/Common-section/CommonSection";

import NftCard from "../components/ui/Nft-card/NftCard";

import { Container, Row, Col } from "reactstrap";

import { ethers } from "ethers";

import "../styles/market.css";

const MyNFTs = ({ marketplace, account }) => {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const loadMyItems = async () => {
      let items = [];
      let nfts = await marketplace.getMyNFTs();
      const itemCount = nfts.length;
      let collectionCount = 1;
      let number = 0;
      for (let i = 0; i < itemCount; ++i) {
        const item = nfts[i];
        const uri = await marketplace.tokenURI(item.id);
        const response = await fetch(uri);
        const metadata = await response.json();
        let newName = metadata.name;
        if (Number(item.collection) !== 0) {
          if (collectionCount === Number(item.collection)) {
            number++;
          }
          else {
            number = 1;
            collectionCount++;
          }
          newName = metadata.name + "#" + number;
        }
        items.push({
          id: String(item.id),
          seller: item.seller,
          name: newName,
          description: metadata.description,
          image: metadata.image,
          price: ethers.utils.formatEther(item.price),
          status: item.status
        });
      }
    setItems(items);
  };
  marketplace && loadMyItems();
  }, [marketplace]);

  return (
    <>
      <CommonSection title={"My NFTs"} />

      <section>
        <Container>
          <Row>
            {items.length !== 0 ? (
              items.map((item, idx) => (
                <Col lg="3" md="4" sm="6" className="mb-4" key={idx}>
                  <NftCard item={item} marketplace={marketplace} account={account} />
                </Col>
              ))
            ) : (
              <main><h1 style={{color: "#fff"}}>No Items</h1></main>
            )}
          </Row>
        </Container>
      </section>
    </>
  );
};

export default MyNFTs;
