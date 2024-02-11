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
    mapping(uint => Order[]) private orders;

    event TokenCreated(uint tokenID);
    event TokenListed(uint tokenId, address owner, address seller, uint price);
    event Bid(uint tokenId, address bidder, uint price);

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

    struct Order {
        address buyer;
        uint price;
    }

    constructor() ERC721("NFTMarketplace", "NFTM") {
        owner = payable(msg.sender);
    }

    function createToken(string memory _tokenURI) public returns (uint) {
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
        emit TokenCreated(newTokenID);
        return newTokenID;
    }

    function listToken(uint _tokenId, uint _price) public {
        // change bool to true, transfer the token to the contract
        require(_price == listPrice, "not equal to list price");
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

    function executeSale(uint _tokenId) public {
        // transfer the token to buyer and transfer the money to the seller
        require(listPrice == idToListedToken[_tokenId].price, "no one bids");
        require(
            idToListedToken[_tokenId].seller == payable(msg.sender),
            "not owner of the nft"
        );

        // updating the token state
        idToListedToken[_tokenId].status = Status.Executed;
        if (orders[_tokenId].length == 0)
            // can be used (idToListedToken[_tokenId].price == listPrice)
            return;

        _tokenSold.increment();

        Order memory highest = getHighestOrder(_tokenId);

        // give the NFT to the buyer
        _transfer(address(this), highest.buyer, _tokenId);
        approve(address(this), _tokenId);

        //give owner the price of the NFT
        payable(owner).transfer(highest.price);

        // payback function
        payback(_tokenId);
    }

    function getHighestOrder(
        uint _tokenId
    ) private view returns (Order memory) {
        Order[] memory currOrders = orders[_tokenId];
        uint price = currOrders[0].price;
        Order memory highestOrder = currOrders[0];
        for (uint i = 0; i < currOrders.length; ++i) {
            if (currOrders[i].price > price) {
                price = currOrders[i].price;
                highestOrder = currOrders[i];
            }
        }
        return highestOrder;
    }

    function payback(uint _tokenId) private {
        address seller = idToListedToken[_tokenId].seller;
        for (uint i = 0; i < orders[_tokenId].length; ++i) {
            address buyer = orders[_tokenId][i].buyer;
            uint price = orders[_tokenId][i].price;
            if (buyer != seller) payable(buyer).transfer(price); // give the money back to the bidder
        }
    }

    function bid(uint _tokenId) public payable {
        require(
            msg.value > idToListedToken[_tokenId].price,
            "price must be higher than old price"
        );
        require(
            idToListedToken[_tokenId].status != Status.NonListed,
            "non listed NFT"
        );
        require(
            idToListedToken[_tokenId].status != Status.Executed,
            "auction is over already"
        );

        Order memory newOrder = Order(msg.sender, msg.value);
        orders[_tokenId].push(newOrder);

        emit Bid(_tokenId, msg.sender, msg.value);
    }
}
