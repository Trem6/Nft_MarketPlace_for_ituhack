import React from "react";

import "./modal.css";
import { ethers } from "ethers";

const Modal = ({ setShowModal, item, marketplace }) => {
  const bid = async () => {
    console.log(marketplace);
    const typedValue = document.getElementById("val").value;
    await marketplace.bid(parseInt(item.id), {value: ethers.utils.parseUnits(typedValue, 18)});
  }

  return (
    <div className="modal__wrapper">
      <div className="single__modal">
        <span className="close__modal">
          <i class="ri-close-line" onClick={() => setShowModal(false)}></i>
        </span>
        <h6 className="text-center text-light">Place a Bid</h6>
        <p className="text-center text-light">
          You must bid more than <span className="money">{item.price} ETH</span>
        </p>

        <div className="input__item mb-4">
          <input type="number" placeholder="0 ETH" id="val" />
        </div>

        <div className=" d-flex align-items-center justify-content-between">
          <p>You must bid more than</p>
          <span className="money">{item.price} ETH</span>
        </div>

        <button className="place__bid-btn" onClick={bid}>Place a Bid</button>
      </div>
    </div>
  );
};

export default Modal;
