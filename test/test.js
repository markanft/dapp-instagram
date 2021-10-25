const Dappinstagram = artifacts.require("./Dappinstagram.sol");

require("chai")
  .use(require("chai-as-promised"))
  .should();

contract("Dappinstagram", ([deployer, author, tipper]) => {
  let dappinstagram;

  before(async () => {
    dappinstagram = await Dappinstagram.deployed();
  });

  describe("deployment", async () => {
    it("deploys successfully", async () => {
      const address = await dappinstagram.address;
      assert.notEqual(address, 0x0);
      assert.notEqual(address, "");
      assert.notEqual(address, null);
      assert.notEqual(address, undefined);
    });

    it("has a name", async () => {
      const name = await dappinstagram.name();
      assert.equal(name, "Dappinstagram");
    });
  });
});
