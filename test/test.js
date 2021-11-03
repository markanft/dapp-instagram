const { assert } = require('chai');

const Dappinstagram = artifacts.require('./Dappinstagram.sol');

require('chai')
  .use(require('chai-as-promised'))
  .should();

contract('Dappinstagram', ([_, author, tipper]) => {
  let dappinstagram;

  before(async () => {
    dappinstagram = await Dappinstagram.deployed();
  });

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = await dappinstagram.address;
      assert.notEqual(address, 0x0);
      assert.notEqual(address, '');
      assert.notEqual(address, null);
      assert.notEqual(address, undefined);
    });

    it('has a name', async () => {
      const name = await dappinstagram.name();
      assert.equal(name, 'Dappinstagram');
    });

    describe('images', async () => {
      let result, imageCount;
      const hash = 'didosjsdoijfweojsefowiefjwoijfwoeijfwe';

      before(async () => {
        result = await dappinstagram.uploadImage(hash, 'Image description', { from: author });
        imageCount = await dappinstagram.imageCount();
      });

      it('creates images', async () => {
        // SUCCESS
        assert.equal(imageCount, 1);
        const event = result.logs[0].args;
        assert.equal(event.id.toNumber(), imageCount.toNumber(), 'id is correct');
        assert.equal(event.hash, hash, 'Hash is correct');
        assert.equal(event.description, 'Image description', 'description is correct');
        assert.equal(event.tipAmount, '0', 'tip amount is correct');
        assert.equal(event.author, author, 'author is correct');

        // FAILURE
        await dappinstagram.uploadImage('', 'Image description', { form: author }).should.be.rejected;
        await dappinstagram.uploadImage(hash, '', { form: author }).should.be.rejected;
      });

      it('lists images', async () => {
        const image = await dappinstagram.images(imageCount);
        assert.equal(image.id.toNumber(), imageCount.toNumber(), 'id is correct');
        assert.equal(image.hash, hash, 'Hash is correct');
        assert.equal(image.description, 'Image description', 'description is correct');
        assert.equal(image.tipAmount, '0', 'tip amount is correct');
        assert.equal(image.author, author, 'author is correct');
      });

      it('allows users to tip images', async () => {
        // Track the author balance before purchase
        let oldAuthorBalance;
        oldAuthorBalance = await web3.eth.getBalance(author);
        oldAuthorBalance = new web3.utils.BN(oldAuthorBalance);
        console.log(oldAuthorBalance.toString());

        let sd = await web3.eth.getBalance(tipper);
        sd = new web3.utils.BN(sd);
        console.log(sd.toString());

        let result = await dappinstagram.tipImageOwner(imageCount, {
          from: tipper,
          value: web3.utils.toWei('1', 'Ether'),
        });

        let qw = await web3.eth.getBalance(tipper);
        qw = new web3.utils.BN(qw);
        console.log('cost tipper');
        console.log(sd.toString() - qw.toString());

        console.log('holi');
        console.log(result.receipt.gasUsed);

        // SUCCESS
        const event = result.logs[0].args;
        assert.equal(event.id.toNumber(), imageCount.toNumber(), 'id is correct');
        assert.equal(event.hash, hash, 'Hash is correct');
        assert.equal(event.description, 'Image description', 'description is correct');
        assert.equal(event.tipAmount, '1000000000000000000', 'tip amount is correct');
        assert.equal(event.author, author, 'author is correct');

        // Check that author received funds
        let newAuthorBalance;
        newAuthorBalance = await web3.eth.getBalance(author);
        newAuthorBalance = new web3.utils.BN(newAuthorBalance);
        console.log(newAuthorBalance.toString());
        console.log(newAuthorBalance - oldAuthorBalance);

        let tipImageOwner;
        tipImageOwner = web3.utils.toWei('1', 'Ether');
        tipImageOwner = new web3.utils.BN(tipImageOwner);

        const expectedBalance = oldAuthorBalance.add(tipImageOwner);

        assert.equal(newAuthorBalance.toString(), expectedBalance.toString());

        // FAILURE: Tries to tip a image that does not exist
        await dappinstagram.tipImageOwner(99, { from: tipper, value: web3.utils.toWei('1', 'Ether') }).should.be
          .rejected;
      });
    });
  });
});
