import React, { useState } from "react";

import { Container, Row, Col } from "reactstrap";
import CommonSection from "../components/ui/Common-section/CommonSection";
import NftCard from "../components/ui/Nft-card/NftCard";

import "../styles/create-item.css";
import { ethers } from "ethers";
require('dotenv').config()

const pinataSDK = require('@pinata/sdk');
const axios = require('axios')
const FormData = require('form-data')
const JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJmNmI4NWJjNC1iMDY3LTQxNzgtOWM2MC00Yzk1N2UzODBlNjUiLCJlbWFpbCI6InVtdXRzdHI1NEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJpZCI6IkZSQTEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX0seyJpZCI6Ik5ZQzEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiZDgyNDQzMmRmM2U0ZjQxNzY3MGEiLCJzY29wZWRLZXlTZWNyZXQiOiIwOTJlOWU0YmQyOTM0MDM2ZGMxMjIwNjQ3ZjFiMmE2NmI1ZWFkMzJiNTE4MGI0MmEyMDAyNGFhZWY1MGU4ZDkyIiwiaWF0IjoxNzA4MjUxNDM1fQ.9jLIyqgakjkD4QMB8_e6OIGaiZrtTUyq1m9yk1LnyhI";
const pinata = new pinataSDK({ pinataJWTKey: JWT});

const Create = ({ marketplace, account }) => {
  const [image, setImage] = useState('')
  const [price, setPrice] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState(1)

  let item = {
    id: 0,
    seller: account ? account : "",
    name: name,
    description: description,
    image: image,
    price: price
  };

  const pinFileToIPFS = (e) => {
    console.log(process.env.JWT)
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

    //we gather a local file for this example, but any valid readStream source will work here.
    let data = new FormData();
    data.append('file', e.target.files[0]);

    return axios.post(url,
        data,
        {
            maxContentLength: 'Infinity', //this is needed to prevent axios from erroring out with large files
            headers: {
                'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
                Authorization: `Bearer ${JWT}`
            }
        }
    ).then(function (response) {
        let link = "https://gateway.pinata.cloud/ipfs/" + response["data"]["IpfsHash"];
        console.log(link);
        setImage(link);
    }).catch(function (error) {
        console.log(error);
    });
  };

  const createNFT = async () => {
    if (!image || !price || !name || !description) return
    try {
      const body = {
        image: image,
        price: price,
        name: name,
        description: description
    };
      const options = {
        pinataMetadata: {
            name: "newNFT" + name
        },
        pinataOptions: {
            cidVersion: 0
        }
      };
      const res = await pinata.pinJSONToIPFS(body, options);
      mintThenList("https://gateway.pinata.cloud/ipfs/" + res["IpfsHash"]);
    } catch(error) {
      console.log("ipfs uri upload error: ", error)
    }
  }

  const mintThenList = async (uri) => {
    const response = await fetch(uri);
    const metadata = await response.json();
    if (amount > 1)
      {
        await marketplace.createCollection(uri, amount);
        // listing will be added
      }
    else
        await marketplace.createAndListToken(uri, 0, ethers.utils.parseUnits(metadata.price, 18));
  }

  return (
    <>
      <CommonSection title="Create Item" />

      <section>
        <Container>
          <Row>
            <Col lg="3" md="4" sm="6">
              <h5 className="mb-4 text-light">Preview Item</h5>
              <NftCard item={item} />
            </Col>

            <Col lg="9" md="8" sm="6">
              <div className="create__item">
                <form>
                  <div className="form__input">
                    <label htmlFor="">Upload File</label>
                    <input type="file" className="upload__input" onChange={pinFileToIPFS} />
                  </div>

                  <div className="form__input">
                    <label htmlFor="">Minimum Bid</label>
                    <input
                      type="number"
                      placeholder="Enter minimum bid for one item (ETH)"
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>

                  <div className="form__input">
                    <label htmlFor="">Amount</label>
                    <input type="number" placeholder="Enter NFT amount" onChange={(e) => setAmount(e.target.value)} />
                  </div>

                  <div className="form__input">
                    <label htmlFor="">Title</label>
                    <input type="text" placeholder="Enter title" onChange={(e) => setName(e.target.value)} />
                  </div>

                  <div className="form__input">
                    <label htmlFor="">Description</label>
                    <textarea
                      name=""
                      id=""
                      rows="7"
                      placeholder="Enter description"
                      className="w-100"
                      onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                  </div>
                </form>
                <button
            className="bid__btn d-flex align-items-center gap-1" onClick={createNFT}>
            Create
            </button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default Create;
