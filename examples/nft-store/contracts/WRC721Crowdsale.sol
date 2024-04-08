pragma solidity >=0.4.24 <0.6.0;

import "./WRC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/roles/MinterRole.sol";

contract WRC721Crowdsale is MinterRole, ReentrancyGuard {
    using SafeMath for uint64;
    using SafeMath for uint128;
    using SafeMath for uint256;
	// owner to benefit from primary sales
	address owner;
	// Stablecoin placeholder
	ERC20 public wrc20;
	// 721 tokens
	WRC721 wrc721;
	//sales
	mapping(address => uint256) public contributions;
	// uint256 public raised;
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
	uint256 public totalItems;
	//constructor
	constructor(address _owner, ERC20 _wrc20, WRC721 _wrc721) public {
		owner = _owner;
		wrc20 = _wrc20;
		wrc721 = _wrc721;
	}
	/********************************
	Primary Sales
	********************************/
    function purchaseWithWOC(address to, uint256 index) public nonReentrant payable {
        uint256 weiAmount = msg.value;
		require(to != address(0), "Crowdsale: beneficiary is the zero address");
        require(weiAmount != 0, "Crowdsale: weiAmount is 0");
		uint128 price = items[index].price;
        require(weiAmount == price, "Crowdsale: weiAmount does not equal price");
		//transfer funds to owner
        items[index].owner.transfer(msg.value);
		//mint and send the token
		_mint(to, index);
    }
	function purchaseWithWRC20(uint256 amount, uint256 index) public {
		address to = msg.sender;
		require(to != address(0), "Crowdsale: beneficiary is the zero address");
        require(amount != 0, "Crowdsale: amount is 0");
		uint128 price = items[index].price;
        require(amount == price, "Crowdsale: amount does not equal price");
		uint256 balance = wrc20.balanceOf(to);
        require(balance >= amount, "Crowdsale: receiver doesn't have enough tokens");
		//transfer funds to owner
        wrc20.transferFrom(to, owner, amount);
		//mint and send the token
		_mint(to, index);
    }
	/********************************
	Only safe minting that passes purchase conditions
	********************************/
	function _mint(address to, uint256 index) internal {
		uint64 minted = items[index].minted;
		uint64 limit = items[index].limit;
		require(minted < limit, "Crowdsale: item limit reached");
        items[index].minted++;
		wrc721.mintWithIndex(to, index);
	}

	/********************************
	Secondary Sales
	********************************/
	function buyTokenOnSale(uint256 tokenId, uint256 amount) public payable {
		address to = msg.sender;
		uint256 price = wrc721.getSalePrice(tokenId);
        require(price != 0, "Crowdsale: cannot buy token with price 0");
        require(amount == price, "Crowdsale: price doesn't equal wrc721.getSalePrice(tokenId)");
		uint256 balance = wrc20.balanceOf(to);
        require(balance >= amount, "Crowdsale: receiver doesn't have enough tokens");
		address owner = wrc721.ownerOf(tokenId);
		//pay for token
        wrc20.transferFrom(to, owner, amount);
		//remove the sale
		wrc721.minterSetSale(tokenId, 0);
		//transfer the token
		wrc721.transferFrom(owner, to, tokenId);
	}


	/********************************
	Inventory management, Only the Minter
	********************************/
	function mint(address to, uint256 index) public onlyMinter {
		_mint(to, index);
	}
	//inventory management
	function addItem(uint64 limit, uint128 price, string memory url) public onlyMinter {
		items.push(Item(0, limit, price, msg.sender, url));
		totalItems++;
	}
	//add item and mint
	function addItemAndMint(uint64 limit, uint128 price, string memory url, address to) public onlyMinter {
		addItem(limit, price, url);
		_mint(to, totalItems - 1);
	}

	/********************************
	Public Getters
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