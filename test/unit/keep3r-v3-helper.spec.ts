import { given, then, when } from '@test-utils/bdd';
import chai, { expect } from 'chai';
import { abi as IERC20ABI } from '@openzeppelin/contracts/build/contracts/IERC20.json';
import { abi as Keep3rV1ABI } from '@artifacts/contracts/Keep3r.sol/Keep3rV1.json';
import { abi as IUniswapV3PoolABI } from '@artifacts/@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';
import { IERC20, IUniswapV3Pool, Keep3rV1, Keep3rV3Helper, Keep3rV3HelperForTest, Keep3rV3HelperForTest__factory } from '@typechained';
import { FakeContract, smock } from '@defi-wonderland/smock';
import { ethers, network } from 'hardhat';
import { BigNumber, utils } from 'ethers';
import { evm } from '@test-utils';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signers';
import moment from 'moment';
import { TransactionResponse } from '@ethersproject/abstract-provider';

chai.use(smock.matchers);

describe('Keep3rV3Helper', () => {

  let governor: SignerWithAddress;

  let keep3rV1: FakeContract<Keep3rV1>;
  let WETH: FakeContract<IERC20>;

  let keep3rV3Helper: Keep3rV3HelperForTest;
  let keep3rV3HelperFactory: Keep3rV3HelperForTest__factory;

  let uniPool: FakeContract<IUniswapV3Pool>;
  let snapshotId: string;

  before(async () => {
    [governor] = await ethers.getSigners();
    keep3rV3HelperFactory = await ethers.getContractFactory('contracts/test/Keep3rV3Helper.sol:Keep3rV3HelperForTest');
    WETH = await smock.fake<IERC20>(IERC20ABI);
    uniPool = await smock.fake<IUniswapV3Pool>(IUniswapV3PoolABI);
    keep3rV1 = await smock.fake<Keep3rV1>(Keep3rV1ABI);
    keep3rV3Helper = await keep3rV3HelperFactory.deploy(keep3rV1.address, WETH.address, uniPool.address);
    snapshotId = await evm.snapshot.take();
  });

  beforeEach(async () => {
    await evm.snapshot.revert(snapshotId);
  });

  describe('setTWAPPeriod', () => {
    // only governor
    when('twap period is zero', () => {
      then('tx is reverted with reason', async () => {
        await expect(
          keep3rV3Helper.setTWAPPeriod(0)
        ).to.be.revertedWith('InvalidTWAP');
      });
    });
    when('twap is not zero', () => {
      const newTWAP = moment.duration('5', 'minutes').as('seconds');
      let setTWAPTx: TransactionResponse;
      given(async () => {
        setTWAPTx = await keep3rV3Helper.setTWAPPeriod(newTWAP);
      });
      then('sets twap period', async () => {
        expect(
          await keep3rV3Helper.twapPeriod()
        ).to.equal(newTWAP);
      });
      then('emits event', async () => {
        await expect(setTWAPTx).to.emit(
          keep3rV3Helper, 'TWAPSet'
        ).withArgs(newTWAP);
      });
    });
  });

  describe('setBasefeeBonus', () => {
    // only governor
    when('basefeeBonus period is bigger than MAX_BASEFEE_BONUS', () => {
      then('tx is reverted with reason', async () => {
        await expect(
          keep3rV3Helper.setBasefeeBonus(await keep3rV3Helper.MAX_BASEFEE_BONUS() + 1)
        ).to.be.revertedWith('InvalidBasefeeBonus');
      });
    });
    when('basefeeBonus is less than MAX_BASEFEE_BONUS', () => {
      let setBasefeeBonusTx: TransactionResponse;
      const basefeeBonus = 9315;
      given(async () => {
        setBasefeeBonusTx = await keep3rV3Helper.setBasefeeBonus(basefeeBonus);
      });
      then('sets basefeeBonus', async () => {
        expect(
          await keep3rV3Helper.basefeeBonus()
        ).to.equal(basefeeBonus);
      });
      then('emits event', async () => {
        await expect(setBasefeeBonusTx).to.emit(
          keep3rV3Helper, 'BasefeeBonusSet'
        ).withArgs(basefeeBonus);
      });
    });
  });

  describe('_getBasefeeWithBonus', () => {
    const basefee = 1000;
    given(async () => {
      await keep3rV3Helper.setBasefee(basefee);
    });
    when('there is no bonus', () => {
      given(async () => {
        await keep3rV3Helper.setBasefeeBonus(0);
      });
      then('returns basefee', async () => {
        expect(
          await keep3rV3Helper.getBasefeeWithBonus()
        ).to.equal(basefee);
      });
    });
    when('there is bonus', () => {
      then('returns basefee + bonus', async () => {
        expect(
          await keep3rV3Helper.getBasefeeWithBonus()
        ).to.equal(basefee * 1.05);
      });
    });
  });
});
