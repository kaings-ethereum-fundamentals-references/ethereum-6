const truffleAssert = require('truffle-assertions');
const People = artifacts.require('People');

contract('People', async function(accounts) {
    let instance;

    before(async function() {
        instance = await People.deployed();
    });
    // beforeEach();
    // after();
    // afterEach();
    

    it('should not create a person with age over 150 years', async function() {
        // `createPerson` should fail if it is create with age more than 150
        // if it is not fail, there is bug
        await truffleAssert.fails(
            instance.createPerson('Bob', 200, 170, {value: web3.utils.toWei('1', 'ether')}),
            truffleAssert.ErrorType.REVERT  // you can specify the expected error, in this case we expect REVERT since `require` fails (the correct behavior)
            );

            // if the type of error is not REVERT, for example, it is OUT_OF_GAS, meaning there is bug
    });

    it('should not create a person without correct amount of payment', async function() {
        await truffleAssert.fails(
            instance.createPerson('Bob', 50, 170, {value: 1000}), 
            truffleAssert.ErrorType.REVERT
        );
    });

    it('should set senior status correctly', async function() {
        await instance.createPerson('Bob', 65, 170, {value: web3.utils.toWei('1', 'ether')});
        let person = await instance.getPerson();
        assert.equal(person.senior, true, 'status should be senior if age is equal to or over 65 years old');
    });

    it('should not allow non-owner to delete people', async function() {
        await instance.createPerson('Bob', 65, 170, {value: web3.utils.toWei('1', 'ether'), from: accounts[1]});    // accounts[1] is creator of person. Contract owner/creator is accounts[0]
        await truffleAssert.fails(
            instance.deletePerson(accounts[1], { from: accounts[1] }),
            truffleAssert.REVERT
        );
    });

    it('should allow owner to delete people', async function() {
        instance = await People.new();  // `People.new()` will create new copy of contract. `People.deployed()` is just using existing deployed contract 
        await instance.createPerson('Bob', 65, 170, {value: web3.utils.toWei('1', 'ether'), from: accounts[2]});    // accounts[2] is creator of person. Contract owner/creator is accounts[0]
        await truffleAssert.passes(
            instance.deletePerson(accounts[2], { from: accounts[0] })
        );
    });

    it('should increase contract balance when create person', async function() {
        instance = await People.new();  // create brand new copy of contract
        await instance.createPerson('Bob', 65, 170, {value: web3.utils.toWei('1', 'ether'), from: accounts[3]});
        let bal = await web3.eth.getBalance(instance.address);
        assert.equal(bal, web3.utils.toWei('1', 'ether'), 'each successful create person will add balance to contract');
    });

    it('should NOT allow non-owner to withdraw balance from contract', async function() {
        await truffleAssert.fails(
            instance.withdrawAll({from: accounts[1]}),
            truffleAssert.REVERT
        );
    });

    it('should only allow owner to withdraw balance from contract', async function() {
        // you can also parse the balance into frm BigNumber to float to avoid error as such
        // let balanceBfrWithdraw = parseFloat(await web3.eth.getBalance(accounts[0]));
        let balBfrWithdraw = await web3.eth.getBalance(accounts[0]);

        await truffleAssert.passes(
            instance.withdrawAll({from: accounts[0]})
        );
        
        let balAftWithdraw = await web3.eth.getBalance(accounts[0]);

        assert(balAftWithdraw > balBfrWithdraw, 'owner account balance should increase in ether');
    });
});