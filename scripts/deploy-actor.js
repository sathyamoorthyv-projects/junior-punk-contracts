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
    const implementationAddress = '0x845f3dbd38b1db031c5c68365e563d34233ccc2f'
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
    const originCollection = '0x8262C4d7AC21E49E149F778284660268e0a28b05';
    const catalystCollection = '0x8b70D0521c43fbd58D741765c6c0de6401F2C4A5';
    const outcomeCollection = '0x96d20695e7cb3CA373C214886BCA49931f869F85';
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
