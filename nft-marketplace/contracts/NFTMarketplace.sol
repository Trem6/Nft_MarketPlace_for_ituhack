//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.19;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFTMarketplace is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    Counters.Counter private _tokenSold;

    address payable owner;
    uint listPrice = 0.01 ether;
    uint deadline = 7 days;
    mapping(uint => ListedNFT) private idToListedToken;

    event TokenCreated(uint tokenID, uint price);
    event TokenListed(uint id, address owner, address seller, uint price);
    event NFTMinted();

    enum Status {
        NonListed,
        Listed,
        Executed
    }

    struct ListedNFT {
        uint id;
        address owner;
        address seller;
        uint price;
        Status status;
    }

    constructor() ERC721("NFTMarketplace", "NFTM") {
        owner = payable(msg.sender);
    }

    function createToken(
        string memory _tokenURI,
        uint _price
    ) public returns (uint) {
        // increment tokenIds, mint, setURI, emit event
        _tokenIds.increment();
        uint newTokenID = _tokenIds.current();
        _safeMint(msg.sender, newTokenID);
        _setTokenURI(newTokenID, _tokenURI);
        idToListedToken[_tokenIds.current()] = ListedNFT(
            _tokenIds.current(),
            payable(msg.sender),
            address(0),
            0,
            Status.NonListed
        );
        emit TokenCreated(newTokenID, _price);
        return newTokenID;
    }

    function listToken(uint _tokenId, uint _price) public payable {
        // change bool to true, transfer the token to the contract
        require(msg.value == listPrice, "not equal to list price");
        require(_price > 0, "price < 0");
        idToListedToken[_tokenId].status = Status.Listed;
        idToListedToken[_tokenId].price = _price;
        idToListedToken[_tokenId].owner = payable(address(this));
        idToListedToken[_tokenId].seller = payable(msg.sender);
        _transfer(msg.sender, address(this), _tokenId);
        emit TokenListed(_tokenId, address(this), msg.sender, _price);
    }

    function getAllNFTs() public view returns (ListedNFT[] memory) {
        ListedNFT[] memory tokens = new ListedNFT[](_tokenIds.current());
        uint currentId = 0;
        for (uint i = 1; i < _tokenIds.current(); ++i) {
            if (idToListedToken[i - 1].status == Status.Listed)
                tokens[currentId++] = idToListedToken[i - 1];
        }
        return tokens;
    }

    function getMyNFTs() public view returns (ListedNFT[] memory) {
        // check if msg.sender is an owner for the NFT for all NFTs
        ListedNFT[] memory tokens = new ListedNFT[](_tokenIds.current());
        uint currentId = 0;
        for (uint i = 1; i < _tokenIds.current(); ++i) {
            if (
                idToListedToken[i].owner == msg.sender ||
                idToListedToken[i].seller == msg.sender
            ) tokens[currentId++] = idToListedToken[i];
        }
        return tokens;
    }

    function executeSale(uint _tokenId) public view {
        // transfer the token to buyer and transfer the money to the seller
        require(listPrice == idToListedToken[_tokenId].price, "no one bids");
    }
}
