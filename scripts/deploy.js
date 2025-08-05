const hre = require('hardhat');

async function main() {
  console.log('Starting deployment...');

  // Get the ContractFactory and Signers here.
  const [deployer] = await hre.ethers.getSigners();
  console.log('Deploying contracts with the account:', deployer.address);
  console.log('Account balance:', (await deployer.getBalance()).toString());

  // Deploy DocuToken first
  console.log('\nDeploying DocuToken...');
  const DocuToken = await hre.ethers.getContractFactory('DocuToken');
  const docuToken = await DocuToken.deploy();
  await docuToken.deployed();
  console.log('DocuToken deployed to:', docuToken.address);

  // Deploy ClientToken
  console.log('\nDeploying ClientToken...');
  const ClientToken = await hre.ethers.getContractFactory('ClientToken');
  const clientToken = await ClientToken.deploy();
  await clientToken.deployed();
  console.log('ClientToken deployed to:', clientToken.address);

  // Deploy DataOwnership
  console.log('\nDeploying DataOwnership...');
  const DataOwnership = await hre.ethers.getContractFactory('DataOwnership');
  const dataOwnership = await DataOwnership.deploy();
  await dataOwnership.deployed();
  console.log('DataOwnership deployed to:', dataOwnership.address);

  // Deploy DocumentationRegistry
  console.log('\nDeploying DocumentationRegistry...');
  const DocumentationRegistry = await hre.ethers.getContractFactory('DocumentationRegistry');
  const docRegistry = await DocumentationRegistry.deploy();
  await docRegistry.deployed();
  console.log('DocumentationRegistry deployed to:', docRegistry.address);

  // Deploy TokenizedIncentives
  console.log('\nDeploying TokenizedIncentives...');
  const TokenizedIncentives = await hre.ethers.getContractFactory('TokenizedIncentives');
  const tokenizedIncentives = await TokenizedIncentives.deploy(
    docuToken.address,
    docRegistry.address
  );
  await tokenizedIncentives.deployed();
  console.log('TokenizedIncentives deployed to:', tokenizedIncentives.address);

  // Set up permissions
  console.log('\nSetting up permissions...');
  
  // Authorize TokenizedIncentives contract to mint DocuTokens
  await docuToken.authorizeMinter(tokenizedIncentives.address);
  console.log('TokenizedIncentives authorized as DocuToken minter');

  // Transfer ownership if needed (commented out for development)
  // await docuToken.transferOwnership(newOwner);
  // await clientToken.transferOwnership(newOwner);
  // await dataOwnership.transferOwnership(newOwner);
  // await docRegistry.transferOwnership(newOwner);
  // await tokenizedIncentives.transferOwnership(newOwner);

  console.log('\n=== Deployment Summary ===');
  console.log('DocuToken:', docuToken.address);
  console.log('ClientToken:', clientToken.address);
  console.log('DataOwnership:', dataOwnership.address);
  console.log('DocumentationRegistry:', docRegistry.address);
  console.log('TokenizedIncentives:', tokenizedIncentives.address);

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      DocuToken: docuToken.address,
      ClientToken: clientToken.address,
      DataOwnership: dataOwnership.address,
      DocumentationRegistry: docRegistry.address,
      TokenizedIncentives: tokenizedIncentives.address,
    },
  };

  const fs = require('fs');
  fs.writeFileSync(
    `deployments-${hre.network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log(`\nDeployment info saved to deployments-${hre.network.name}.json`);

  // Verify contracts on Etherscan if not local network
  if (hre.network.name !== 'hardhat' && hre.network.name !== 'localhost') {
    console.log('\nWaiting 30 seconds before verification...');
    await new Promise(resolve => setTimeout(resolve, 30000));

    try {
      await hre.run('verify:verify', {
        address: docuToken.address,
        constructorArguments: [],
      });
      console.log('DocuToken verified');
    } catch (error) {
      console.log('DocuToken verification failed:', error.message);
    }

    try {
      await hre.run('verify:verify', {
        address: clientToken.address,
        constructorArguments: [],
      });
      console.log('ClientToken verified');
    } catch (error) {
      console.log('ClientToken verification failed:', error.message);
    }

    try {
      await hre.run('verify:verify', {
        address: dataOwnership.address,
        constructorArguments: [],
      });
      console.log('DataOwnership verified');
    } catch (error) {
      console.log('DataOwnership verification failed:', error.message);
    }

    try {
      await hre.run('verify:verify', {
        address: docRegistry.address,
        constructorArguments: [],
      });
      console.log('DocumentationRegistry verified');
    } catch (error) {
      console.log('DocumentationRegistry verification failed:', error.message);
    }

    try {
      await hre.run('verify:verify', {
        address: tokenizedIncentives.address,
        constructorArguments: [docuToken.address, docRegistry.address],
      });
      console.log('TokenizedIncentives verified');
    } catch (error) {
      console.log('TokenizedIncentives verification failed:', error.message);
    }
  }

  console.log('\nDeployment completed successfully!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });