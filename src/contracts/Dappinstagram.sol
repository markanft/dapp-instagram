// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

contract Dappinstagram {
  string public name = 'Dappinstagram';

  uint256 public imageCount = 0;

  struct Image {
    uint256 id;
    string hash;
    string description;
    uint256 tipAmount;
    address payable author;
  }
  mapping(uint256 => Image) public images;

  event ImageCreated(uint256 id, string hash, string description, uint256 tipAmount, address author);
  event ImageTipped(uint256 id, string hash, string description, uint256 tipAmount, address author);

  function uploadImage(string memory imageHash, string memory description) public {
    require(bytes(imageHash).length > 0);
    require(bytes(description).length > 0);
    require(msg.sender != address(0x0));

    imageCount++;
    images[imageCount] = Image(imageCount, imageHash, description, 0, payable(msg.sender));
    emit ImageCreated(imageCount, imageHash, description, 0, msg.sender);
  }

  function tipImageOwner(uint256 id) public payable {
    require(id > 0 && id <= imageCount);
    Image memory image = images[id];
    image.author.transfer(msg.value);
    image.tipAmount += msg.value;
    images[id] = image;

    emit ImageTipped(id, image.hash, image.description, image.tipAmount, image.author);
  }
}
