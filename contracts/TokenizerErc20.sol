// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TokenizerErc20 is ERC20 {
    address public s_admin;
    address public s_tokenizerErc721;

    event TokensMinted(address recipient, uint256 amount);

    constructor(
        string memory _name,
        string memory _symbol,
        address _tokenizerErc721Addr
    ) ERC20(_name, _symbol) {
        s_admin = msg.sender;
        s_tokenizerErc721 = _tokenizerErc721Addr;
    }

    function mintTokens(address _recipient, uint256 _amount) external {
        require(
            msg.sender == s_tokenizerErc721,
            "mintTokens: Only tokenizerErc721"
        );
        _mint(_recipient, _amount);
        emit TokensMinted(_recipient, _amount);
    }
}
