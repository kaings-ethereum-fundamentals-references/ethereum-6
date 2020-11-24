const truffleAssert = require('truffle-assertions');
const People = artifacts.require('People');

contract('People', async function(accounts) {
    it('should not create a person with age over 150 years', async function() {
        let instance = await People.deployed();
        // `createPerson` should fail if it is create with age more than 150
        // if it is not fail, there is bug
        await truffleAssert.fails(
            instance.createPerson('Bob', 200, 170, {value: web3.utils.toWei('1', 'ether')}),
            truffleAssert.ErrorType.REVERT  // you can specify the expected error, in this case we expect REVERT since `require` fails (the correct behavior)
            );

            // if the type of error is not REVERT, for example, it is OUT_OF_GAS, meaning there is bug
    });

    it('should not create a person without correct amount of payment', async function() {
        let instance = await People.deployed();
        await truffleAssert.fails(
            instance.createPerson('Bob', 50, 170, {value: 1000}), 
            truffleAssert.ErrorType.REVERT
        );
    });

    it('should set senior status correctly', async function() {
        let instance = await People.deployed();
        await instance.createPerson('Bob', 65, 170, {value: web3.utils.toWei('1', 'ether')});
        let person = await instance.getPerson();
        assert.equal(person.senior, true, 'status should be senior if age is equal to or over 65 years old');
    });

    it('should not allow non-owner to delete people', async function() {
        let instance = await People.deployed();
        await instance.createPerson('Bob', 65, 170, {value: web3.utils.toWei('1', 'ether'), from: accounts[1]});    // accounts[1] is creator of person. Contract owner/creator is accounts[0]
        await truffleAssert.fails(
            instance.deletePerson(accounts[1], { from: accounts[1] }),
            truffleAssert.REVERT
        );
    });

    it('should allow owner to delete people', async function() {
        let instance = await People.deployed();
        await instance.createPerson('Bob', 65, 170, {value: web3.utils.toWei('1', 'ether'), from: accounts[2]});    // accounts[2] is creator of person. Contract owner/creator is accounts[0]
        await truffleAssert.passes(
            instance.deletePerson(accounts[2], { from: accounts[0] })
        );
    });
});