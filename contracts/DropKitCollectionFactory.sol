// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./DropKitCollection.sol";

contract DropKitCollectionFactory is Ownable {
    address public immutable collectionImplementation =
        0x2a521B2825824115e233b7860E567F01FdcA2326;
    address public latestClonedAddress;

    constructor() {}

    function cloneCollection(
        string calldata name_,
        string calldata symbol_,
        address treasury_
    ) external onlyOwner {
        address clone = Clones.clone(collectionImplementation);
        DropKitCollection(clone).initialize(name_, symbol_, treasury_);
        DropKitCollection(clone).transferOwnership(_msgSender());
        latestClonedAddress = clone;
    }
}
