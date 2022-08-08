class DebugHelper {

  static async getAddressBalances(contracts, address) {
    if (address === undefined) {
      return {
        erc20: 0,
        thusd: 0,
        eth: 0
      };
    }

    const erc20Balance = await contracts.erc20.balanceOf(address);
    const thusdBalance = await contracts.thusdToken.balanceOf(address);
    const ethBalance = await web3.eth.getBalance(address);

    return {
      erc20: web3.utils.fromWei(erc20Balance, "ether"),
      thusd: web3.utils.fromWei(thusdBalance, "ether"),
      eth: web3.utils.fromWei(ethBalance, "ether")
    }
  }

  static async printAddressBalances(balances, address, name) {
    if (balances.erc20 > 0 || balances.thusd > 0 || balances.eth > 0){
      if (name.length > 0) {
        console.log(name, " : ", address);
      } else {
        console.log(address);
      }
      console.log("\tERC20 : \t", balances.erc20);
      console.log("\tTHUSD : \t\t", balances.thusd);
      console.log("\tETH : \t\t", balances.eth);
      console.log("")
    }
  }

  static async debugBalances(contracts, users, print) {

    if (print) {
      console.log("==================================================================")
      console.log("CONTRACT BALANCES");
      console.log("------------------------------------------------------------------")
    }
    let data = {}
    const contractNames = [
      "activePool",
      "borrowerOperations",
      "troveManager",
      "collSurplusPool",
      "defaultPool",
      "hintHelpers",
      "pcv",
      "priceFeed",
      "sortedTroves",
      "stabilityPool",
      "gasPool",
    ];

    for (let contract of contractNames) {
      if (contract in contracts) {
        const address = contracts[contract].address;
        if (address === undefined) {
          continue;
        }
        data[address] = await this.getAddressBalances(contracts, address);
        if (print) {
          await this.printAddressBalances(data[address], address, contract);
        }
      }
    }
    if (print) {
      console.log("==================================================================")
      console.log("USER BALANCES");
      console.log("------------------------------------------------------------------")
    }

    for (let address of users) {
      data[address] = await this.getAddressBalances(contracts, address);
      if (print) {
        this.printAddressBalances(data[address], address, "");
      }
    }
    return data;
  }
};
module.exports = {
  DebugHelper
}
