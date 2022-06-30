require('dotenv').config()
const hre = require('hardhat')

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay * 1000));

async function main() {
  const ethers = hre.ethers
  const upgrades = hre.upgrades;

  console.log('network:', await ethers.provider.getNetwork())

  const signer = (await ethers.getSigners())[0]
  console.log('signer:', await signer.getAddress())

  const deployFlag = {
    verifyKitImplementation: true,
    deployKit: false,
    upgradeKit: false,
  };
  
  /**
   * Verify NiftyKit Implementation
   */
  if (deployFlag.verifyKitImplementation) {
    const implementationAddress = '0xbb0d2c468bcf26d587fcf53c1562b92555854245'
    await hre.run('verify:verify', {
      address: implementationAddress,
      constructorArguments: []
    })
    console.log('NiftyKit Implementation contract verified')
  }

  /**
   *  Deploy NiftyKit
   */
  if (deployFlag.deployKit) {
    const dropImplementation = '0xB93cB7e184Ad3cC497275276384B3B3082ba8C00';
    const tokenImplementation = '0x0000000000000000000000000000000000000000';
    const mutateImplementation = '0x61dd8354917c92f986BA81f2222Ac033A4Bb1521';

    const NiftyKit = await ethers.getContractFactory('NiftyKit', {
      signer: (await ethers.getSigners())[0]
    })

    const kitContract = await upgrades.deployProxy(NiftyKit,
      [dropImplementation, tokenImplementation, mutateImplementation],
      { initializer: 'initialize' });
    await kitContract.deployed()

    console.log('NiftyKit deployed: ', kitContract.address)
  }

  /**
   *  Upgrade NFT
   */
  if (deployFlag.upgradeKit) {
    const kitAddress = "0xf9d83e63Fc708716176C32aE51Db683F5B57D36C";

    const NiftyKitV2 = await ethers.getContractFactory('NiftyKit', {
      signer: (await ethers.getSigners())[0]
    })

    const upgradedKitContract = await upgrades.upgradeProxy(kitAddress, NiftyKitV2);
    console.log('NiftyKit upgraded: ', upgradedKitContract.address)
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
