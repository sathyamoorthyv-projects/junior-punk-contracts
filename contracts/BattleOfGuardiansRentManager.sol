// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/utils/ERC721HolderUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

contract BattleOfGuardiansRentManager is OwnableUpgradeable, ERC721HolderUpgradeable, ReentrancyGuardUpgradeable {

	constructor () {}

	function initialize(address _feeWallet, uint256 _serviceFee) external initializer {
		__Ownable_init();
		__ERC721Holder_init();
		__ReentrancyGuard_init();

		// to do

	}
	
	// to do
	


	receive() external payable {}
}