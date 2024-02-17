import React, { useEffect, useState } from "react";

import CommonSection from "../components/ui/Common-section/CommonSection";

import NftCard from "../components/ui/Nft-card/NftCard";

import { Container, Row, Col } from "reactstrap";

import "../styles/market.css";

const MyNFTs = ({ marketplace, account }) => {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const getData = async () => {
      let items = marketplace.getMyNFTs();
      setItems(items);
    };
    marketplace && getData();
  }, [marketplace]);

  return (
    <>
      <CommonSection title={"My NFTs"} />

      <section>
        <Container>
          <Row>
            {items.length === 0 ? (
              items.map((item, idx) => (
                <Col lg="3" md="4" sm="6" className="mb-4" key={idx}>
                  <NftCard item={item} />
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
