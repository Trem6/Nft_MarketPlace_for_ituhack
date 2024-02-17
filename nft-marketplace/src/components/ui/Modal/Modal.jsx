import React from "react";

import "./modal.css";
import { ethers } from "ethers";

const Modal = ({ setShowModal, item, marketplace }) => {
  const bid = async () => {
    const typedValue = document.getElementById("val").value;
    console.log("modal item id", typedValue);
    await marketplace.bid(item.id, {value: ethers.utils.parseEther(typedValue)});
  }

  return (
    <div className="modal__wrapper">
      <div className="single__modal">
        <span className="close__modal">
          <i class="ri-close-line" onClick={() => setShowModal(false)}></i>
        </span>
        <h6 className="text-center text-light">Place a Bid</h6>
        <p className="text-center text-light">
          You must bid at least <span className="money">{item.price}</span>
        </p>

        <div className="input__item mb-4">
          <input type="number" placeholder="0 ETH" id="val" />
        </div>

        <div className=" d-flex align-items-center justify-content-between">
          <p>You must bid at least</p>
          <span className="money">{item.price}</span>
        </div>

        <button className="place__bid-btn" onClick={bid}>Place a Bid</button>
      </div>
    </div>
  );
};

export default Modal;
