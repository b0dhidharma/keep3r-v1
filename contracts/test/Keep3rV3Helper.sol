// SPDX-License-Identifier: MIT
pragma solidity >=0.8.7 <0.9.0;

import '../Keep3rV3Helper.sol';

 /* solhint-disable */

contract Keep3rV3HelperForTest is Keep3rV3Helper {
  uint256 basefee;

  constructor(
    address _governor,
    IKeep3rV1 _KP3R,
    address _WETH,
    address _POOL
  ) Keep3rV3Helper(_governor, _KP3R, _WETH, _POOL) {}

  function setBasefee(uint256 _basefee) external {
    basefee = _basefee;
  }

  function _getBasefee() internal view override returns (uint256) {
    if (basefee != 0) return basefee;
    return super._getBasefee();
  }
}
