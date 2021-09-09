// SPDX-License-Identifier: MIT
pragma solidity >=0.8.7 <0.9.0;

import '../Keep3rV3Helper.sol';

contract Keep3rV3HelperForTest is Keep3rV3Helper {
  uint256 basefee;

  constructor(
    IKeep3rV1 _KP3R,
    address _WETH,
    address _POOL
  ) Keep3rV3Helper(_KP3R, _WETH, _POOL) { }

  function setBasefee(uint256 _basefee) external {
    basefee = _basefee;
  }

  function getBasefeeWithBonus() external view returns (uint256) {
    return _getBasefeeWithBonus();
  }

  function _getBasefee() internal override view returns (uint256) {
    if (basefee != 0) return basefee;
    return super._getBasefee();
  }
}