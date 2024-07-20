const {Web3} = require("web3");
const config = require("./config.json");

main().catch(e => console.error(e.message));

async function main() {
    let web3;
    for(var j=0;j<config.chain.length;j++) {
        await showBalance(config.chain[j]);
    }
}

async function showBalance(item) {
    let web3 = new Web3(new Web3.providers.HttpProvider(item.rpcurl));
    let owner = web3.eth.accounts.privateKeyToAccount(`0x${config.privatekey}`);
    let nativeToken = web3.utils.fromWei(await web3.eth.getBalance(owner.address), 'ether');
    let oracleContract = new web3.eth.Contract(config.abi, item.oracle_token);
    let oracleBalanceWei = Number(await oracleContract.methods.balanceOf(owner.address).call());
    let oracleDecimals = parseFloat(await oracleContract.methods.decimals().call());
    let oracleBalance = oracleBalanceWei / 10 ** oracleDecimals;
    let oracleSymbol = await oracleContract.methods.symbol().call();

    console.log(`[${item.name}]`);
    console.log(`  native token : ${nativeToken} ${item.native_token_symbol}`);
    console.log(`  oracle token : ${oracleBalance} ${oracleSymbol}`);
    if(item.erc20s.length > 0) {
        console.log('  [erc20 token]');
    }
    for(var i=0;i<item.erc20s.length;i++) {
        let erc20Contract = new web3.eth.Contract(config.abi, item.erc20s[i]);
        let erc20BalanceWei = Number(await erc20Contract.methods.balanceOf(owner.address).call());
        let erc20Decimals = parseFloat(await erc20Contract.methods.decimals().call());
        let erc20Balance = erc20BalanceWei / 10 ** erc20Decimals;
        let erc20Symbol = await erc20Contract.methods.symbol().call();
        console.log(`    ${item.erc20s[i]} : ${erc20Balance} ${erc20Symbol}`);
    }
}

function getMaxLength() {
    let maxlength = 0;
    for (var data in NETWORKS) {
        NETWORKS[data].forEach(item => {
            if(item.name.length > maxlength) {
                maxlength = item.name.length;
            }
        });
    }
    return maxlength;
}

