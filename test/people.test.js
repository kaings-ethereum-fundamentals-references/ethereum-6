const truffleAssert = require('truffle-assertions');
const People = artifacts.require('People');

contract('People', async function() {
    it('should not create a person with age over 150 years', async function() {
        let instance = await People.deployed();
        // `createPerson` should fail if it is create with age more than 150
        // if it is not fail, there is bug
        await truffleAssert.fails(instance.createPerson('Bob', 200, 170, {value: web3.utils.toWei('1', 'ether')}));
    });
});