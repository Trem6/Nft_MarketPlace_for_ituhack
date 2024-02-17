import React, { useState } from "react";

import { Container, Row, Col } from "reactstrap";
import CommonSection from "../components/ui/Common-section/CommonSection";
import NftCard from "../components/ui/Nft-card/NftCard";
import { create as ipfsHttpClient } from 'ipfs-http-client'

import "../styles/create-item.css";

const projectId = '293cb9e77e5948b59b0981460c741f2e';
const ProjectSecret = 'sHRlJ6VsAjonpfiubrAwVkvtxtifQJ9LsSQv24oXwrjkuzIFfffUyQ';


var buffer = window.Buffer;
console.log("buffer", buffer)

const auth = "Basic" + " " + Buffer.from(projectId+":"+ProjectSecret).toString('base64')

const client = ipfsHttpClient({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  // apiPath:'/api/v0/',
  headers: {
    authorization: auth,
  }
});

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

  const uploadToIPFS = async (event) => {
    event.preventDefault()
    const file = event.target.files[0];
    if (typeof file !== 'undefined') {
      try {
        const result = await client.add(file);
        console.log(result)
        setImage(`https://ipfs.infura.io/ipfs/${result.path}`)
      } catch (error){
        console.log("ipfs image upload error: ", error)
      }
    }
  }

  const createNFT = async () => {
    if (!image || !price || !name || !description) return
    try{
      const result = await client.add(JSON.stringify({image, price, name, description}))
      mintThenList(result)
    } catch(error) {
      console.log("ipfs uri upload error: ", error)
    }
  }

  const mintThenList = async (result) => {
    const uri = `https://ipfs.infura.io/ipfs/${result.path}`
    if (amount > 1)
      {
        await marketplace.createCollection(uri, amount);
        // listing will be added
      }
    else
      {
        let tokenId = await marketplace.createToken(uri, 0);
        await marketplace.listToken(tokenId, price);
      }
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
                    <input type="file" className="upload__input" onChange={uploadToIPFS} />
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
