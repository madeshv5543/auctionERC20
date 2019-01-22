pragma solidity ^0.4.24;

contract TokenInterface {
    function transfer(address _to, uint256 _value) external view returns (bool) ;
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool);
    function balanceOf(address who) public view returns (uint256);
}

contract Auction {
    // static
    address public owner;
    uint public bidIncrement;
    uint public startBlock;
    uint public endBlock;
    string public ipfsHash;
    string public title;
    string public description;
    string public tags;
    TokenInterface public token;

    // state
    bool public canceled;
    uint public highestBindingBid;
    address public highestBidder;
    mapping(address => uint256) public fundsByBidder;
    bool ownerHasWithdrawn;

    event LogBid(address bidder, uint bid, address highestBidder, uint highestBid, uint highestBindingBid);
    event LogWithdrawal(address withdrawer, address withdrawalAccount, uint amount);
    event LogCanceled();

    constructor (address tokenAddress, address _owner, uint _bidIncrement, uint _startBlock, uint _endBlock, string _ipfsHash,
     string _title, string _description, string _tags)  public  {
        token = TokenInterface(tokenAddress);
         
        require (_startBlock < _endBlock,"start block is greater than endblock");
        require (_startBlock < block.number,"end block is lower than satrtblock");
        require (_owner != 0,"Owner is not empty");

        owner = _owner;
        bidIncrement = _bidIncrement;
        startBlock = _startBlock;
        endBlock = _endBlock;
        ipfsHash = _ipfsHash;
        title = _title;
        description = _description;
        tags = _tags;
    }

    function getHighestBid ()
       public
        constant
        returns (uint)
    {
        return fundsByBidder[highestBidder];
    }
    
    // function () payable public {
    //     placeBid(msg.value);
    // }

    function placeBid(uint _value)
        public
        onlyAfterStart
        onlyBeforeEnd
        onlyNotCanceled
        onlyNotOwner
        returns (bool success)
    {
        // reject payments of 0 ETH
        require (_value != 0) ;
        require (_value > 0);
        
        require (token.balanceOf(msg.sender) > _value);
        require(token.transferFrom(msg.sender, this, _value));

        // calculate the user's total bid based on the current amount they've sent to the contract
        // plus whatever has been sent with this transaction
        uint newBid = fundsByBidder[msg.sender] + _value;

        // if the user isn't even willing to overbid the highest binding bid, there's nothing for us
        // to do except revert the transaction.
    
        require (newBid > highestBindingBid) ;

        // grab the previous highest bid (before updating fundsByBidder, in case msg.sender is the
        // highestBidder and is just increasing their maximum bid).
        uint highestBid = fundsByBidder[highestBidder];

        fundsByBidder[msg.sender] = newBid;

        if (newBid <= highestBid) {
            // if the user has overbid the highestBindingBid but not the highestBid, we simply
            // increase the highestBindingBid and leave highestBidder alone.

            // note that this case is impossible if msg.sender == highestBidder because you can never
            // bid less ETH than you've already bid.

            highestBindingBid = min(newBid + bidIncrement, highestBid);
        } else {
            // if msg.sender is already the highest bidder, they must simply be wanting to raise
            // their maximum bid, in which case we shouldn't increase the highestBindingBid.

            // if the user is NOT highestBidder, and has overbid highestBid completely, we set them
            // as the new highestBidder and recalculate highestBindingBid.

            if (msg.sender != highestBidder) {
                highestBidder = msg.sender;
                highestBindingBid = min(newBid, highestBid + bidIncrement);
            }
            highestBid = newBid;
        }

        emit LogBid(msg.sender, newBid, highestBidder, highestBid, highestBindingBid);
        return true;
    }

    function min(uint a, uint b)
        pure
        private
        returns (uint)
    {
        if (a < b) return a;
        return b;
    }

    function cancelAuction()
        public
        onlyOwner
        onlyBeforeEnd
        onlyNotCanceled
        returns (bool success)
    {
        canceled = true;
        emit LogCanceled();
        return true;
    }

    function withdraw()
        public
        onlyEndedOrCanceled
        returns (bool success)
    {
        address withdrawalAccount;
        uint withdrawalAmount;

        if (canceled) {
            // if the auction was canceled, everyone should simply be allowed to withdraw their funds
            withdrawalAccount = msg.sender;
            withdrawalAmount = fundsByBidder[withdrawalAccount];

        } else {
            // the auction finished without being canceled

            if (msg.sender == owner) {
                // the auction's owner should be allowed to withdraw the highestBindingBid
                withdrawalAccount = highestBidder;
                withdrawalAmount = highestBindingBid;
                ownerHasWithdrawn = true;

            } else if (msg.sender == highestBidder) {
                // the highest bidder should only be allowed to withdraw the difference between their
                // highest bid and the highestBindingBid
                withdrawalAccount = highestBidder;
                if (ownerHasWithdrawn) {
                    withdrawalAmount = fundsByBidder[highestBidder];
                } else {
                    withdrawalAmount = fundsByBidder[highestBidder] - highestBindingBid;
                }

            } else {
                // anyone who participated but did not win the auction should be allowed to withdraw
                // the full amount of their funds
                withdrawalAccount = msg.sender;
                withdrawalAmount = fundsByBidder[withdrawalAccount];
            }
        }

        require (withdrawalAmount != 0) ;

        fundsByBidder[withdrawalAccount] -= withdrawalAmount;

        // send the funds
       // require (msg.sender.send(withdrawalAmount)) ;
       require(token.transferFrom(this, msg.sender, withdrawalAmount));

       emit LogWithdrawal(msg.sender, withdrawalAccount, withdrawalAmount);

        return true;
    }

    modifier onlyOwner {
        assert (msg.sender == owner) ;
        _;
    }

    modifier onlyNotOwner {
        require (msg.sender != owner) ;
        _;
    }

    modifier onlyAfterStart {
        require (block.number > startBlock) ;
        _;
    }

    modifier onlyBeforeEnd {
        require (block.number < endBlock) ;
        _;
    }

    modifier onlyNotCanceled {
        require (!canceled) ;
        _;
    }

    modifier onlyEndedOrCanceled {
        require (block.number > endBlock || canceled) ;
        _;
    }
}