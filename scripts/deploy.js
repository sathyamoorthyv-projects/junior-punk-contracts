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
    deployNft: true,
    cloneNft: false
  };

  /**
   * Deploy NFT
   */
  if (deployFlag.deployNft) {
    // const DropCollection = await ethers.getContractFactory('DropKitCollection', { signer: (await ethers.getSigners())[0] })

    // const dropCollection = await DropCollection.deploy();
    // await dropCollection.deployed();
    // await sleep(30);
    // console.log("DropCollection deployed to: ", dropCollection.address);

    // await hre.run('verify:verify', {
    //   address: dropCollection.address,
    //   constructorArguments: []
    // })

    // console.log("DropCollection at: ", dropCollection.address, " verified");

    const MutateCollection = await ethers.getContractFactory('contracts\\MutateCollection.sol:MutateCollection', { signer: (await ethers.getSigners())[0] })

    const mutateCollection = await MutateCollection.deploy('Junior Punks 3D', 'JPNK3D');
    await mutateCollection.deployed();
    await sleep(30);
    console.log("MutateCollection deployed to: ", mutateCollection.address);

    await hre.run('verify:verify', {
      address: mutateCollection.address,
      constructorArguments: ['Junior Punks 3D', 'JPNK3D']
    })

    console.log("MutateCollection at: ", mutateCollection.address, " verified");
  }

  /**
   * Clone NFT from Factory
   */
  if (deployFlag.cloneNft) {
    const nftData = {
      botl: {
        name: "HODL Bottles",
        symbol: "BOTL",
        treasury: "0x19E53469BdfD70e103B18D9De7627d88c4506DF2"
      },
      jpnk: {
        name: "Junior Punks",
        symbol: "JPNK",
        treasury: "0x19E53469BdfD70e103B18D9De7627d88c4506DF2"
      },
      jpnk3d: {
        name: "Junior Punks 3D",
        symbol: "JPNK3D",
        treasury: "0x19E53469BdfD70e103B18D9De7627d88c4506DF2",
        mutateActor: "0x0000000000000000000000000000000000000000"
      },
    }
    const niftyKitAddress = '0x286eD0be3E72E6B9f90a092C3467a5F6D7B9fc6e';
    const NiftyKit = await ethers.getContractFactory('NiftyKit', { signer: (await ethers.getSigners())[0] });
    const niftyKit = await NiftyKit.attach(niftyKitAddress);

    {
      const tx = await niftyKit.createDropCollection(nftData.jpnk.name, nftData.jpnk.symbol, nftData.jpnk.treasury);
      await tx.wait();
      console.log('Junior Punks NFT Cloned');
    }

    {
      const tx = await niftyKit.createDropCollection(nftData.botl.name, nftData.botl.symbol, nftData.botl.treasury);
      await tx.wait();
      console.log('HODL Bottle NFT Cloned');
    }

    {
      const tx = await niftyKit.createMutateCollection(nftData.jpnk3d.name, nftData.jpnk3d.symbol, nftData.jpnk3d.mutateActor, nftData.jpnk3d.treasury);
      await tx.wait();
      console.log('Junior Punks 3D NFT Cloned');
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
