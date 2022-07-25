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
    verifyActorImplementation: false,
    deployActor: true,
    upgradeActor: false,
  };
  
  /**
   * Verify MutateActor Implementation
   */
  if (deployFlag.verifyActorImplementation) {
    const implementationAddress = '0x79F0E5E1C7ce8df82958DAaC85250246f4ba5b8a'
    await hre.run('verify:verify', {
      address: implementationAddress,
      constructorArguments: []
    })
    console.log('MutateActor Implementation contract verified')
  }

  /**
   *  Deploy MutateActor
   */
  if (deployFlag.deployActor) {
    const originCollection = '0xea9da6349c7004705237AEe68f5e44Ac52cd13D7';
    const catalystCollection = '0xD1A489b5bB7669F7feaEb9deA19aA1FdF850Fda4';
    const outcomeCollection = '0xc4789792047f96d06906e721d1885ee5cc6ab20f';
    const burnWallet = '0x000000000000000000000000000000000000dEaD';

    const MutateActor = await ethers.getContractFactory('MutateActor', {
      signer: (await ethers.getSigners())[0]
    })

    const actorContract = await upgrades.deployProxy(MutateActor,
      [burnWallet, originCollection, catalystCollection, outcomeCollection],
      { initializer: 'initialize' });
    await actorContract.deployed()

    console.log('MutateActor deployed: ', actorContract.address)
  }

  /**
   *  Upgrade MutateActor
   */
  if (deployFlag.upgradeActor) {
    const actorAddress = "0x99acF5898044Bd52DC4c2875c36270F49B4A5ed4";

    const MutateActorV2 = await ethers.getContractFactory('MutateActor', {
      signer: (await ethers.getSigners())[0]
    })

    const upgradedActorContract = await upgrades.upgradeProxy(actorAddress, MutateActorV2);
    console.log('MutateActor upgraded: ', upgradedActorContract.address)
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
