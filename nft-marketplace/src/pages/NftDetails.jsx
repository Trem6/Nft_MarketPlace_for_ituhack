import React, { useEffect, useState } from "react";

import CommonSection from "../components/ui/Common-section/CommonSection";
import { useParams } from "react-router-dom";
import { Container, Row, Col } from "reactstrap";

import LiveAuction from "../components/ui/Live-auction/LiveAuction";

import "../styles/nft-details.css";
import { ethers } from "ethers";

import { Link } from "react-router-dom";

const NftDetails = ({ marketplace }) => {
  const { id } = useParams();
  const [item, setItem] = useState([]);
  useEffect(() => {
    const loadMyItems = async () => {
      let nfts = await marketplace.getAllNFTs();
      const itemCount = nfts.length;
      for (let i = 0; i < itemCount; ++i) {
        const currItem = nfts[i];
        const uri = await marketplace.tokenURI(currItem.id);
        const response = await fetch(uri);
        const metadata = await response.json();
        if (parseInt(currItem.id) === parseInt(id)) {
          setItem({
            id: String(currItem.id),
            seller: currItem.seller,
            name: metadata.name,
            description: metadata.description,
            image: metadata.image,
            price: ethers.utils.formatEther(currItem.price),
            status: currItem.status
          });
          break;
        }
      }
    };
    marketplace && loadMyItems();
  }, [marketplace]);

  return (
    <>
      <CommonSection title={item.name} />

      <section>
        <Container>
          <Row>
            <Col lg="6" md="6" sm="6">
              <img
                src={item.image}
                alt=""
                className="w-100 single__nft-img"
              />
            </Col>

            <Col lg="6" md="6" sm="6">
              <div className="single__nft__content">
                <h2 style={{color: "#fff"}}>{item.name}</h2>

                <div className=" d-flex align-items-center justify-content-between mt-4 mb-4">
                  <div className=" d-flex align-items-center gap-4 single__nft-seen">
                    <span>
                      <i class="ri-eye-line"></i> 234
                    </span>
                    <span>
                      <i class="ri-heart-line"></i> 123
                    </span>
                  </div>

                  <div className=" d-flex align-items-center gap-2 single__nft-more">
                    <span>
                      <i class="ri-send-plane-line"></i>
                    </span>
                    <span>
                      <i class="ri-more-2-line"></i>
                    </span>
                  </div>
                </div>

                <div className="nft__creator d-flex gap-3 align-items-center">
                  <div className="creator__img">
                    <img src={item.image} alt="" className="w-100" />
                  </div>

                  <div className="creator__detail">
                    <p>Created By</p>
                    <h6>{item.seller}</h6>
                  </div>
                </div>

                <p className="my-4">{item.description}</p>
                <button className="singleNft-btn d-flex align-items-center gap-2 w-100">
                  <i class="ri-shopping-bag-line"></i>
                  <Link to="/wallet">Place a Bid</Link>
                </button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <LiveAuction />
    </>
  );
};

export default NftDetails;
