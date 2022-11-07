// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

interface ITokenizerErc20 {
    function mintTokens(address _recipient, uint256 _amount) external;
}

contract TokenizerErc721 is ERC721URIStorage {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;

    address public s_admin;
    uint256 public s_fee;
    uint256 public s_rewardsAmount;

    event NftMinted(address recipient);
    event FeeChanged(uint256 oldAmount, uint256 newAmount);
    event RewardsAmountChanged(uint256 oldAmount, uint256 newAmount);

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _fee,
        uint256 _rewardsAmount
    ) ERC721(_name, _symbol) {
        s_admin = msg.sender;
        s_fee = _fee;
        s_rewardsAmount = _rewardsAmount;
    }

    function mintCollectable(string memory _tokenURI, address erc20Addr)
        external
        payable
    {
        require(msg.value == s_fee, "mintCollectable: Incorrect Fee");
        _tokenIds.increment();
        _mint(msg.sender, _tokenIds.current());
        _setTokenURI(_tokenIds.current(), _tokenURI);
        mintRewards(msg.sender, erc20Addr);
        emit NftMinted(msg.sender);
    }

    function mintRewards(address _recipient, address _erc20Addr) private {
        ITokenizerErc20 rewardsContract = ITokenizerErc20(_erc20Addr);
        rewardsContract.mintTokens(_recipient, s_rewardsAmount);
    }

    function changeFee(uint256 _newFee) external {
        require(msg.sender == s_admin, "changeFee: Only Admin");
        uint256 oldAmount = s_fee;
        s_fee = _newFee;
        emit FeeChanged(oldAmount, _newFee);
    }

    function changeRewardsAmount(uint256 _newRewardsAmount) external {
        require(msg.sender == s_admin, "changeRewardsAmount: Only Admin");
        uint256 oldAmount = s_rewardsAmount;
        s_rewardsAmount = _newRewardsAmount;
        emit RewardsAmountChanged(oldAmount, _newRewardsAmount);
    }
}
