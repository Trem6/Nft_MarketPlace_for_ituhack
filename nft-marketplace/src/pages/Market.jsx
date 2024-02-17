import React, { useEffect, useState } from "react";

import CommonSection from "../components/ui/Common-section/CommonSection";

import NftCard from "../components/ui/Nft-card/NftCard";

import { Container, Row, Col } from "reactstrap";

import { ethers } from "ethers";
import "../styles/market.css";

const Market = ({ marketplace }) => {
  const [data, setData] = useState();
  const [items, setItems] = useState([]);
  const [select, setSelect] = useState("all");
  useEffect(() => {
    const loadMarketplaceItems = async () => {
      let items = [];
      let nfts = await marketplace.getAllNFTs();
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
          price: ethers.utils.formatEther(item.price),
          collection: parseInt(item.collection)
        });
      }
      setItems(items);
    };
    marketplace && loadMarketplaceItems();
    }, [marketplace]);

    const handleItems = ((e) => {
      setSelect(e.target.value);
      let filteredItems = [];

      if (select === "single-item") {
        filteredItems = items.filter((item) => item.collection === 0);
      } else if (select === "bundle") {
        filteredItems = items.filter((item) => item.collection !== 0);
      } else {
        filteredItems = items;
      }

      setData(filteredItems);
    });

  return (
    <>
      <CommonSection title={"Marketplace"} />

      <section>
        <Container>
          <Row>
            <Col lg="12" className="mb-5">
              <div className="market__product__filter d-flex align-items-center justify-content-between">
                <div className="filter__left d-flex align-items-center gap-5">

                  <div className="all__items__filter">
                    <select onChange={handleItems} defaultValue={"all"} id="select">
                      <option value="all">All Items</option>
                      <option value="single-item">Single Item</option>
                      <option value="bundle">Item in Collection</option>
                    </select>
                  </div>
                </div>
              </div>
            </Col>
            {select === "all" ? (items && items.map((item) => (
                <Col lg="3" md="4" sm="6" className="mb-4" key={item.id}>
                  <NftCard item={item} />
                </Col>
              ))) : (
                (data && data.map((item) => (
                  <Col lg="3" md="4" sm="6" className="mb-4" key={item.id}>
                    <NftCard item={item} />
                  </Col>
                )))
              )}
          </Row>
        </Container>
      </section>
    </>
  );
};

export default Market;
