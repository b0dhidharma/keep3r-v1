import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

export const KP3R = '0x1ceb5cb57c4d4e2b2433641b95dd330a33185a44';
export const WETH = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
export const UNISWAP_V3_POOL = '0x11B7a6bc0259ed6Cf9DB8F499988F9eCc7167bf5';
export const GOVERNOR = '0x0d5dc686d0a2abbfdafdfb4d0533e886517d4e83';

const deployFunction: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer, governor } = await hre.getNamedAccounts();

  await hre.deployments.deploy('Keep3rV3Helper', {
    contract: 'contracts/Keep3rV3Helper.sol:Keep3rV3Helper',
    from: deployer,
    args: [GOVERNOR, KP3R, WETH, UNISWAP_V3_POOL],
    log: true,
  });
};

deployFunction.tags = ['Keep3rV3Helper'];
export default deployFunction;
