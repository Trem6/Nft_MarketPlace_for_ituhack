import React, { useEffect, useState } from "react";

import "./ListModal.css";
import { ethers } from "ethers";

const ListModal = ({ setShowListModal, item, marketplace }) => {
  const [price, setPrice] = useState(0);
  const listNFT = async () => {
    await marketplace.listToken(parseInt(item.id), ethers.utils.parseUnits(price, 18));
  };

  useEffect(() => {}, [marketplace]);

  return (
    <div className="modal__wrapper">
      <div className="single__modal">
        <span className="close__modal">
          <i class="ri-close-line" onClick={() => setShowListModal(false)}></i>
        </span>
        <h6 className="text-center text-light">Type the listing Price</h6>

        <div className="input__item mb-4">
          <input type="number" placeholder="0 ETH" id="val" onChange={(e) => setPrice(e.target.value)} />
        </div>

        <div className=" d-flex align-items-center justify-content-between">
          <p>Your NFT will be listed with the price </p>
          <span className="money">{price} ETH</span>
        </div>

        <button className="place__bid-btn" onClick={listNFT}>List the NFT</button>
      </div>
    </div>
  );
};

export default ListModal;
