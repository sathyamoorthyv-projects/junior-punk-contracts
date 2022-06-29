// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IMutateCollection {
    /**
     * @dev Contract upgradeable initializer
     */
    function initialize(
        string memory,
        string memory,
        address,
        address
    ) external;

    /**
     * @dev part of Ownable
     */
    function transferOwnership(address) external;

    /**
     * @dev mint nft in mutate mode
     */
    function mutateMint(uint256 tokenId, address recipient)
        external;
}
