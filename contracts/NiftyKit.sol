// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/ClonesUpgradeable.sol";
import "./interfaces/IBaseCollection.sol";
import "./interfaces/IMutateCollection-Clonable.sol";
import "./interfaces/INiftyKit.sol";

contract NiftyKit is Initializable, OwnableUpgradeable, INiftyKit {
    struct Entry {
        uint256 value;
        bool isValue;
    }

    using AddressUpgradeable for address;
    using SafeMathUpgradeable for uint256;
    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.AddressSet;

    uint256 private constant _rate = 500; // parts per 10,000

    address private _treasury;
    EnumerableSetUpgradeable.AddressSet _collections;

    mapping(address => Entry) private _rateOverride;

    mapping(address => uint256) private _fees;
    mapping(address => uint256) private _feesClaimed;

    address private _dropImplementation;
    address private _tokenImplementation;
    address private _mutateImplementation;

    function initialize(
        address dropImplementation,
        address tokenImplementation,
        address mutateImplementation
    ) public initializer {
        __Ownable_init();
        _treasury = _msgSender();
        _dropImplementation = dropImplementation;
        _tokenImplementation = tokenImplementation;
        _mutateImplementation = mutateImplementation;
    }

    function createDropCollection(
        string memory name,
        string memory symbol,
        address treasury
    ) external {
        address deployed = _createCollection(
            _dropImplementation,
            name,
            symbol,
            treasury
        );
        _collections.add(deployed);
        emit CollectionCreated(deployed);
    }

    function createMutateCollection(
        string memory name,
        string memory symbol,
        address mutateActor,
        address treasury
    ) external {
        address deployed = _createMutateCollection(
            _mutateImplementation,
            name,
            symbol,
            mutateActor,
            treasury
        );
        _collections.add(deployed);
        emit CollectionCreated(deployed);
    }

    function createTokenCollection(
        string memory name,
        string memory symbol,
        address treasury
    ) external {
        address deployed = _createCollection(
            _tokenImplementation,
            name,
            symbol,
            treasury
        );
        _collections.add(deployed);
        emit CollectionCreated(deployed);
    }

    function setTreasury(address treasury) external onlyOwner {
        _treasury = treasury;
    }

    function setDropImplementation(address implementation) external onlyOwner {
        _dropImplementation = implementation;
    }

    function setTokenImplementation(address implementation) external onlyOwner {
        _tokenImplementation = implementation;
    }

    function setMutateImplementation(address implementation)
        external
        onlyOwner
    {
        _mutateImplementation = implementation;
    }

    function addCollection(address collection) external onlyOwner {
        _collections.add(collection);
    }

    function removeCollection(address collection) external onlyOwner {
        _collections.remove(collection);
    }

    function setRateOverride(address collection, uint256 rate)
        external
        onlyOwner
    {
        _rateOverride[collection].isValue = true;
        _rateOverride[collection].value = rate;
    }

    function withdraw(uint256 amount) external {
        require(address(this).balance >= amount, "Not enough to withdraw");

        AddressUpgradeable.sendValue(payable(_treasury), amount);
    }

    function addFees(uint256 amount) external override {
        require(_collections.contains(_msgSender()), "Invalid Collection");

        _fees[_msgSender()] = _fees[_msgSender()].add(
            commission(_msgSender(), amount)
        );
    }

    function addFeesClaimed(uint256 amount) external override {
        require(_collections.contains(_msgSender()), "Invalid Collection");

        _feesClaimed[_msgSender()] = _feesClaimed[_msgSender()].add(amount);
    }

    function commission(address collection, uint256 amount)
        public
        view
        override
        returns (uint256)
    {
        uint256 rate = _rateOverride[collection].isValue
            ? _rateOverride[collection].value
            : _rate;

        return ((rate * amount) / 10000);
    }

    function getFees(address account) external view override returns (uint256) {
        return _fees[account] - _feesClaimed[account];
    }

    receive() external payable {}

    function _createCollection(
        address implementation,
        string memory name,
        string memory symbol,
        address treasury
    ) private returns (address) {
        address deployed = ClonesUpgradeable.clone(implementation);
        IBaseCollection collection = IBaseCollection(deployed);
        collection.initialize(name, symbol, treasury);
        collection.transferOwnership(_msgSender());

        return deployed;
    }

    function _createMutateCollection(
        address implementation,
        string memory name,
        string memory symbol,
        address mutateActor,
        address treasury
    ) private returns (address) {
        address deployed = ClonesUpgradeable.clone(implementation);
        IMutateCollection collection = IMutateCollection(deployed);
        collection.initialize(name, symbol, mutateActor, treasury);
        collection.transferOwnership(_msgSender());

        return deployed;
    }
}
