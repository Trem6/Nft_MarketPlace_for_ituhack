import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "reactstrap";

import { ethers } from "ethers";
import "./trending.css";

import NftCard from "../Nft-card/NftCard";

const Trending = ({marketplace}) => {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const loadMarketplaceItems = async () => {
      let items = [];
      let nfts = await marketplace.getListedNFTs();
      const itemCount = nfts.length;
      for (let i = 0; i < itemCount; ++i) {
        const item = nfts[i];
        const uri = await marketplace.tokenURI(item.id);
        const response = await fetch(uri);
        const metadata = await response.json();
        items.push({
          id: String(item.id),
          seller: item.seller,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
          price: ethers.utils.formatEther(item.price)
        });
      }
      setItems(items);
    };
    marketplace && loadMarketplaceItems();
    }, [marketplace]);

  return (
    <section>
      <Container>
        <Row>
          <Col lg="12" className="mb-5">
            <h3 className="trending__title">Trending</h3>
          </Col>
          {items.slice(0, 8).map((item, idx) => (
            <Col lg="3" md="4" sm="6" key={idx} className="mb-4">
              <NftCard item={item} marketplace={marketplace} />
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default Trending;
