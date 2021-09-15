import { BigNumber, utils } from 'ethers';
import { deployments, ethers } from 'hardhat';
import { Keep3rJob, Keep3rJob__factory, Keep3rV1, Keep3rV3Helper } from '@typechained';
import { getNodeUrl } from '@utils/network';
import { evm, wallet } from '@test-utils';
import { KP3R } from '@deploy/01_keep3r_v3_helper';
import { contract, given, then } from '@test-utils/bdd';
import { JsonRpcSigner } from '@ethersproject/providers';
import { expect } from 'chai';
import forkBlockNumber from '@integration/fork-block-numbers';

contract('Keep3rV1', () => {
  let keep3rV3Helper: Keep3rV3Helper;
  let keep3r: Keep3rV1;
  let keep3rJob: Keep3rJob;
  let keep3rJobFactory: Keep3rJob__factory;

  let keep3rGovernor: JsonRpcSigner;
  let keeper: JsonRpcSigner;

  let snapshotId: string;

  before(async () => {
    await evm.reset({
      jsonRpcUrl: getNodeUrl('mainnet'),
      blockNumber: forkBlockNumber['Keep3rV1-work'],
    });
    await deployments.fixture('Keep3rV3Helper', { keepExistingDeployments: false });
    keep3rV3Helper = await ethers.getContract('Keep3rV3Helper');
    keep3r = await ethers.getContractAt('contracts/Keep3r.sol:Keep3rV1', KP3R);

    keep3rJobFactory = await ethers.getContractFactory('contracts/test/Keep3rJob.sol:Keep3rJob');
    keep3rJob = await keep3rJobFactory.deploy(KP3R);

    keep3rGovernor = await wallet.impersonate(await keep3r.callStatic.governance());
    keeper = await wallet.impersonate('0xf4dc7e5b00a39897736c7f560d55cba82c72a721');

    await keep3r.connect(keep3rGovernor).setKeep3rHelper(keep3rV3Helper.address);

    await keep3r.connect(keep3rGovernor).addJob(keep3rJob.address);

    await keep3r.connect(keep3rGovernor).addKPRCredit(keep3rJob.address, utils.parseEther('1000'));

    snapshotId = await evm.snapshot.take();
  });

  beforeEach(async () => {
    await evm.snapshot.revert(snapshotId);
  });

  describe('work', () => {
    let initialBonds: BigNumber;
    let initialCredits: BigNumber;
    given(async () => {
      initialBonds = await keep3r.bonds(keeper._address, KP3R);
      initialCredits = await keep3r.credits(keep3rJob.address, KP3R);
      await keep3rJob.connect(keeper).work();
    });
    then('adds credits to keeper bonds', async () => {
      expect(await keep3r.bonds(keeper._address, KP3R)).to.be.gt(initialBonds);
    });
    then('takes credits from job', async () => {
      expect(await keep3r.credits(keep3rJob.address, KP3R)).to.be.lt(initialCredits);
    });
  });
});
