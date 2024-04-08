pragma solidity >=0.4.24 <0.6.0;

import "./WRC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/roles/MinterRole.sol";

contract WRC721Auction is MinterRole, ReentrancyGuard {
    using SafeMath for uint64;
    using SafeMath for uint128;
    using SafeMath for uint256;
	// owner to benefit from auction
	address owner;
	// auction open / closed
	bool public isOpen;
	// Stablecoin placeholder
	// ERC20 public wrc20;
	/********************************
	NFTs
	********************************/
	WRC721 wrc721;
	//inventory
	struct Item {
		//tight pack 256bits
        uint64 minted;
		uint64 limit;
		uint128 price;
		//end tight pack
		address payable owner;
		string url;
    }
	Item[] private items;
	/********************************
	Auction and Bids
	********************************/
	//current bid
	// mapping(uint256 => uint256) bidAmount; //itemIndex => price
	// mapping(uint256 => address) bidOwner; 
	struct Bid {
		uint256 amount;
		address payable owner;
    }
	mapping(address => string) private names; //when address makes bid they can set / update their name
	mapping(uint256 => Bid[]) private bids; // item index to bids array

	/********************************
	Constructor
	********************************/
	constructor(address _owner, WRC721 _wrc721) public {
		owner = _owner;
		// wrc20 = _wrc20;
		wrc721 = _wrc721;
	}
	/********************************
	Auction Admin
	********************************/
	function toggleIsOpen(bool state) public onlyMinter {
		isOpen = state;
	}
	//closes and distributes all NFTs
	function distribute() public onlyMinter {
		require(isOpen == false); // auction must be closed
		uint256 totalItemsLength = totalItems();
		// loop through all item indexes
		for (uint256 index = 0; index < totalItemsLength; index++) {
			uint256 tbs = totalBids(index);
			if (tbs > 0) { //bid exists
				_mint(bids[index][tbs - 1].owner, index); //highest bid wins
			}
			delete bids[index]; // remove all bids for this item
        }
	}
	// withdraw the funds
	function withdraw() public onlyMinter {
		require(isOpen == false); // auction must be closed
		uint256 totalItemsLength = totalItems();
		for (uint256 index = 0; index < totalItemsLength; index++) {
			uint256 tbs = totalBids(index);
			require(tbs == 0); // there cannot be any bids on any items
        }
		address payable payableOwner = address(uint160(owner));
		payableOwner.transfer(address(this).balance);
	}
	/********************************
	Bidding Process
	********************************/
    function makeBid(uint128 index) public nonReentrant payable {
		require(isOpen == true); // auction must be open
		uint256 tbs = totalBids(index);
		if (tbs > 0) {
			Bid memory previous = bids[index][tbs - 1];
			//current bid > previous
			require(msg.value > previous.amount);
			//return previous bid funds
			address payable previousOwner = address(uint160(previous.owner));
			previousOwner.transfer(previous.amount);
		}
		bids[index].push(Bid(msg.value, msg.sender));
	}
	function setName(string memory name) public {
		names[msg.sender] = name;
	}
	/********************************
	Only safe minting that passes auction conditions
	********************************/
	function _mint(address to, uint256 index) internal {
		uint64 minted = items[index].minted;
		uint64 limit = items[index].limit;
		require(minted < limit, "Auction: item limit reached");
        items[index].minted++;
		wrc721.mintWithIndex(to, index);
	}
	function mint(address to, uint256 index) public onlyMinter {
		_mint(to, index);
	}
	//inventory management
	function addItem(uint64 limit, uint128 price, string memory url) public onlyMinter {
		items.push(Item(0, limit, price, msg.sender, url));
	}
	/********************************
	Public Getters for Arrays
	********************************/
	function totalItems() public view returns(uint256 count) {
		return items.length;
	}
	function totalBids(uint256 index) public view returns(uint256 count) {
		return bids[index].length;
	}
	/********************************
	Public Getters for Auction and Bids
	********************************/
	function getName(address who) public view returns (string memory) {
		return names[who];
	}
	function getBidAmount(uint256 itemIndex, uint256 bidIndex) public view returns (uint256) {
		return bids[itemIndex][bidIndex].amount;
	}
	function getBidOwner(uint256 itemIndex, uint256 bidIndex) public view returns (address) {
		return bids[itemIndex][bidIndex].owner;
	}
	function getBidOwnerName(uint256 itemIndex, uint256 bidIndex) public view returns (string memory) {
		return names[bids[itemIndex][bidIndex].owner];
	}
	/********************************
	Public Getters for Inventory
	********************************/
	function getMinted(uint256 index) public view returns (uint64) {
		return items[index].minted;
	}
	function getLimit(uint256 index) public view returns (uint64) {
		return items[index].limit;
	}
	function getPrice(uint256 index) public view returns (uint128) {
		return items[index].price;
	}
	function getUrl(uint256 index) public view returns (string memory) {
		return items[index].url;
	}
	function getTokenData(uint256 tokenId) public view returns (string memory) {
		return items[wrc721.getItemIndex(tokenId)].url;
	}
}