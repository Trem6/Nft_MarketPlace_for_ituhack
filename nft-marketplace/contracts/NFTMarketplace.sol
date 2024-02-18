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
    Counters.Counter private _collections;

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
        uint collection; // collection 0 = not in collection
    }

    struct Order {
        address buyer;
        uint price;
    }

    constructor() ERC721("NFTMarketplace", "NFTM") {
        owner = payable(msg.sender);
    }

    function createCollection(
        string memory _tokenURI,
        uint _size
    ) public returns (uint) {
        _collections.increment();
        for (uint i = 0; i < _size; ++i)
            createToken(_tokenURI, _collections.current());
        return _collections.current();
    }

    function createToken(
        string memory _tokenURI,
        uint _collection
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
            Status.NonListed,
            _collection
        );
        emit TokenCreated(newTokenID);
        return newTokenID;
    }

    function createAndListToken(
        string memory _tokenURI,
        uint _collection,
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
            Status.NonListed,
            _collection
        );
        emit TokenCreated(newTokenID);
        listToken(newTokenID, _price);
        return newTokenID;
    }

    function listToken(uint _tokenId, uint _price) public {
        // change bool to true, transfer the token to the contract
        require(_price >= listPrice, "not bigger than or equal to list price");
        require(_price > 0, "price < 0");
        require(
            idToListedToken[_tokenId].status != Status.Listed,
            "already listed"
        );
        require(
            msg.sender == idToListedToken[_tokenId].owner,
            "you're not the owner"
        );
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
        for (uint i = 1; i < _tokenIds.current() + 1; ++i) {
            tokens[currentId++] = idToListedToken[i];
        }
        return tokens;
    }

    function getCollectionNFTsAndInfo(
        uint _collection
    ) public view returns (ListedNFT[] memory, uint _floor, uint _high) {
        ListedNFT[] memory tokens = new ListedNFT[](_tokenIds.current());
        uint currentId = 0;
        uint minPrice = 1000 ether;
        uint maxPrice = 0;
        for (uint i = 1; i < _tokenIds.current() + 1; ++i) {
            if (idToListedToken[i].collection > _collection) break;
            if (idToListedToken[i].collection == _collection) {
                tokens[currentId++] = idToListedToken[i];
                if (idToListedToken[i].price > maxPrice)
                    maxPrice = idToListedToken[i].price;
                if (idToListedToken[i].price < minPrice)
                    minPrice = idToListedToken[i].price;
            }
        }
        // shrinking the array
        ListedNFT[] memory tokensLast = new ListedNFT[](currentId);
        for (uint i = 0; i < currentId; ++i) tokensLast[i] = tokens[i];
        delete tokens;

        return (tokensLast, minPrice, maxPrice);
    }

    function getMyNFTs() public view returns (ListedNFT[] memory) {
        // check if msg.sender is an owner for the NFT for all NFTs
        ListedNFT[] memory tokens = new ListedNFT[](_tokenIds.current());
        uint currentId = 0;
        for (uint i = 1; i < _tokenIds.current() + 1; ++i) {
            if (
                idToListedToken[i].owner == msg.sender ||
                idToListedToken[i].seller == msg.sender
            ) tokens[currentId++] = idToListedToken[i];
        }
        ListedNFT[] memory tokensLast = new ListedNFT[](currentId);
        for (uint i = 0; i < currentId; ++i) tokensLast[i] = tokens[i];
        delete tokens;

        return tokensLast;
    }

    function getListedNFTs() public view returns (ListedNFT[] memory) {
        ListedNFT[] memory tokens = new ListedNFT[](_tokenIds.current());
        uint currentId = 0;
        for (uint i = 1; i < _tokenIds.current() + 1; ++i) {
            if (idToListedToken[i].status == Status.Listed)
                tokens[currentId++] = idToListedToken[i];
        }
        ListedNFT[] memory tokensLast = new ListedNFT[](currentId);
        for (uint i = 0; i < currentId; ++i) tokensLast[i] = tokens[i];
        delete tokens;

        return tokensLast;
    }

    function executeSale(uint _tokenId) public {
        if (orders[_tokenId].length == 0) {
            idToListedToken[_tokenId].owner = msg.sender;
            idToListedToken[_tokenId].seller = address(0);
            _transfer(address(this), msg.sender, _tokenId);
            approve(address(this), _tokenId);
            idToListedToken[_tokenId].status = Status.NonListed;
            return;
        }
        Order memory highest = getHighestOrder(_tokenId);
        // transfer the token to buyer and transfer the money to the seller
        require(
            idToListedToken[_tokenId].status == Status.Listed,
            "not listed"
        );
        require(listPrice != idToListedToken[_tokenId].price, "no one bids");
        require(
            idToListedToken[_tokenId].seller == payable(msg.sender),
            "not owner of the nft"
        );

        // give the NFT to the buyer
        _transfer(address(this), highest.buyer, _tokenId);

        //give owner the price of the NFT
        // payable(idToListedToken[_tokenId].seller).transfer(highest.price);
        (bool sent, ) = payable(idToListedToken[_tokenId].seller).call{
            value: highest.price
        }("");
        require(sent, "Failed to send Ether in executeSale");

        _tokenSold.increment();

        // setting the new owner
        idToListedToken[_tokenId].owner = highest.buyer;
        idToListedToken[_tokenId].seller = address(0);
        idToListedToken[_tokenId].price = 0;

        // updating the token state
        idToListedToken[_tokenId].status = Status.Executed;

        if (orders[_tokenId].length > 1) payback(_tokenId);

        // clearing the orders
        delete orders[_tokenId];
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
        address highestBuyer = getHighestOrder(_tokenId).buyer;
        for (uint i = 0; i < orders[_tokenId].length; ++i) {
            address buyer = orders[_tokenId][i].buyer;
            uint price = orders[_tokenId][i].price;
            if (buyer != highestBuyer) {
                (bool sent, ) = payable(buyer).call{value: price}(""); // give the money back to the bidder
                require(sent, "Failed to send Ether in payback");
            }
        }
    }

    function bid(uint _tokenId) public payable {
        require(
            msg.sender != idToListedToken[_tokenId].seller,
            "you cannot buy your own NFT"
        );
        require(
            msg.value > idToListedToken[_tokenId].price,
            "bid must be higher than old price"
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
        idToListedToken[_tokenId].price = msg.value;

        emit Bid(_tokenId, msg.sender, msg.value);
    }
}
