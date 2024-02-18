import React, { useState } from "react";
import { Link } from "react-router-dom";

import "./nft-card.css";

import Modal from "../Modal/Modal";
import ListModal from "../ListModal/ListModal"

const NftCard = ({item, marketplace, account}) => {
  const [showModal, setShowModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);

  const executeSale = async () => {
    await marketplace.executeSale(parseInt(item.id));
  };

  return (
    <div className="single__nft__card">
      <div className="nft__img">
        <img src={item.image} alt="" className="w-100" />
      </div>

      <div className="nft__content">
        <h5 className="nft__title">
          <Link to={`/market/${item.id}`}>{item.name}</Link>
        </h5>

        <div className="creator__info-wrapper d-flex gap-3">
          <div className="creator__img">
            <img src={item.image} alt="" className="w-100" />
          </div>

          <div className="creator__info w-100 d-flex align-items-center justify-content-between">
            <div>
              <h6>Created By</h6>
              <p>{item.seller.slice(0, 5) + '...' + item.seller.slice(38, 42)}</p>
            </div>

            <div>
              <h6>Current Bid</h6>
              <p>{item.price} ETH</p>
            </div>
          </div>
        </div>

        <div className=" mt-3 d-flex align-items-center justify-content-between">
          {
            item.status === 0 ? (
              <button
                className="bid__btn d-flex align-items-center gap-1"
                onClick={() => setShowListModal(true)}>
                <i class="ri-file-list-3-line"></i>List the NFT
              </button>
            ) : (
              account === item.seller.toLowerCase() ? (
                <button
                  className="bid__btn d-flex align-items-center gap-1"
                  onClick={executeSale}>
                  <i class="ri-money-dollar-circle-line"></i>Execute Sale
                </button>
              ) : (
                <button
                  className="bid__btn d-flex align-items-center gap-1"
                  onClick={() => setShowModal(true)}>
                  <i className="ri-shopping-bag-line"></i> Place Bid
                </button>
              )
            )
          }

          {showModal && <Modal setShowModal={setShowModal} item={item} marketplace={marketplace} />}
          {showListModal && <ListModal setShowListModal={setShowListModal} item={item} marketplace={marketplace} />}
        </div>
      </div>
    </div>
  );
};

export default NftCard;
