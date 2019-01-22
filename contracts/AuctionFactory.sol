pragma solidity ^0.4.24;
import { Auction } from './Auction.sol';

contract AuctionFactory {
    address[] public auctions;

    event AuctionCreated(address auctionContract, address owner, uint numAuctions, address[] allAuctions);

     constructor() public {
    }

    function createAuction(uint bidIncrement, address tokenAddres, uint startBlock, uint endBlock, string ipfsHash, string title, string description, string tags) public {
        Auction newAuction = new Auction(tokenAddres, msg.sender, bidIncrement, startBlock, endBlock, ipfsHash, title, description, tags);
        auctions.push(newAuction);

        emit AuctionCreated(newAuction, msg.sender, auctions.length, auctions);
    }

    function allAuctions() public constant returns (address[]) {
        return auctions;
    }
}