require('dotenv').config()
const hre = require('hardhat')

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay * 1000));

async function main () {
  const ethers = hre.ethers
  const upgrades = hre.upgrades;

  console.log('network:', await ethers.provider.getNetwork())

  const signer = (await ethers.getSigners())[0]
  console.log('signer:', await signer.getAddress())

  const feeAddress = "0x885A73F551FcC946C688eEFbC10023f4B7Cc48f3";
  const fee = 250;
  const wbnbAddress = {
    4: "0xF14d7EA41EABcf949Eef74312F9eD4bF7Dd503a5",
    97: "0x171BB6a358B7E769B1eB3E7b2Aab779423CBeee0",
    56: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
    137: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270"
  };
  

  const deployFlag = {
    deployNFT: false,
    deployNFTFactory: false,
    deployNFTMarketPlace: true,
    upgradeNFTMarketPlace: false,
  };
  
  /**
   *  Deploy Nftology NFT MarketPlace
   */
  if(deployFlag.deployNFTMarketPlace) {
    const NftologyMarketPlace = await ethers.getContractFactory('BattleOfGuardiansRentManager', {
      signer: (await ethers.getSigners())[0]
    })

    const marketPlaceContract = await upgrades.deployProxy(NftologyMarketPlace, 
      [feeAddress, fee, wbnbAddress[process.env.CHAIN_ID]],
      {initializer: 'initialize'});
    await marketPlaceContract.deployed()
  
    console.log('Nftology MarketPlace deployed to:', marketPlaceContract.address)
  } 

  /**
   *  Upgrade Nftology MarketPlace
   */
  if(deployFlag.upgradeNFTMarketPlace) {
	const nftMarketPlace = "0x7BF883B2673E1a7F4BB0dde2777F620228704c49";

    const NftologyMarketPlaceV2 = await ethers.getContractFactory('BattleOfGuardiansRentManager', {
      signer: (await ethers.getSigners())[0]
    })

    const marketPlaceContract = await upgrades.upgradeProxy(nftMarketPlace, NftologyMarketPlaceV2);
    console.log('Nftology MarketPlace V2 upgraded: ', marketPlaceContract.address)
    
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
