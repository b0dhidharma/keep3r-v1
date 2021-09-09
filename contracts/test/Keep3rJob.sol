// SPDX-License-Identifier: MIT
pragma solidity >=0.8.7 <0.9.0;

interface IKeep3rV1 {
  function worked(address _keeper) external;

  function isKeeper(address _keeper) external returns (bool);
}

contract Keep3rJob {
  address public keep3r;

  constructor(
    address _keep3r
  ) {
    keep3r = _keep3r;
  }

  modifier validateAndPayKeeper(address _keeper) {
    IKeep3rV1(keep3r).isKeeper(_keeper);
    _;
    IKeep3rV1(keep3r).worked(_keeper);
  }

  function work() external validateAndPayKeeper(msg.sender) {
    uint256[] memory array = new uint256[](100);
    for (uint256 i; i < 100; i++) {
      array[i] = type(uint256).max;
    }
  }
}