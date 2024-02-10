//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.19;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFTMarketplace is ERC721URIStorage {
    Counters.Counter private _tokenIds;
    Counters.Counter private _tokenSold;

    address payable owner;
    uint listPrice = 0.01 ether;
    uint deadline = 7 days;
    mapping(uint => ListedNFT) private idToListedToken;

    event TokenListed();
    event NFTMinted();

    struct ListedNFT {
        uint id;
        address owner;
        address seller;
        uint price;
        bool currentlyListed;
    }

    constructor() ERC721("NFTMarketplace", "NFTM") {
        owner = payable(msg.sender);
    }

    function createToken() public {
        // increment tokenIds, mint, setURI, emit event
    }

    function listToken() public {
        // change bool to true, transfer the token to the contract
    }

    function getAllNFTs() public view {}

    function getMyNFTs() public view {
        // check if msg.sender is an owner for the NFT for all NFTs
    }

    function executeSale() public {
        // transfer the token to buyer and transfer the money to the seller
    }

    function bid(uint _amount) public payable {}

    function withdraw() public {
        // if the auction is over, withdraw the money
    }
}
