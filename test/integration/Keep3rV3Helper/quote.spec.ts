import { utils } from 'ethers';
import { deployments, ethers } from 'hardhat';
import { Keep3rV3Helper } from '@typechained';
import { getNodeUrl } from '@utils/network';
import { bn, evm } from '@test-utils';
import { contract, given, then } from '@test-utils/bdd';
import moment from 'moment';
import { coingecko } from '@test-utils';

let keep3rV3Helper: Keep3rV3Helper;
let startingTime: number;
let minCoingeckoDelta: number = moment.duration('5', 'minutes').as('seconds');

const PRICE_THRESHOLD = utils.parseEther('0.20'); // 0.20 KP3R of threshold

contract('Keep3rV3Helper', () => {
  before(async () => {
    startingTime = moment().unix();
    await evm.reset({
      jsonRpcUrl: getNodeUrl('mainnet'),
    });
    await deployments.fixture('Keep3rV3Helper', { keepExistingDeployments: false });
    keep3rV3Helper = await ethers.getContract('Keep3rV3Helper');
  });

  describe('quote', () => {
    let ETHToKP3RRate: number;
    given(async () => {
      const KP3RETHRate = await coingecko.getLastPrice('keep3rv1', 'eth', startingTime - minCoingeckoDelta, startingTime);
      ETHToKP3RRate = 1/KP3RETHRate;
    });
    then('returns correct twap', async () => {
      const twap = await keep3rV3Helper.getQuote(utils.parseEther('1'));
      bn.expectToEqualWithThreshold({
        value: twap,
        to: coingecko.convertPriceToBigNumberWithDecimals(ETHToKP3RRate, 18),
        threshold: PRICE_THRESHOLD
      });
    });
  });
});
