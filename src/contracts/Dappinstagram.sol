// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

contract Dappinstagram {
  string public name = 'Dappinstagram';
  struct Image {
    uint256 id;
    string hash;
    string description;
    uint256 tipAmount;
    address payable author;
  }
  mapping(uint256 => Image) public images;
}
