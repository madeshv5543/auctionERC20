import contract from 'truffle-contract'

import web3 from '../utils/web3'
import AuctionFactoryArtifact from '../../build/contracts/AuctionFactory.json'
import AuctionArtifact from '../../build/contracts/Auction.json'

let contractInstance
let account
let auctionContract 

const initialize = async () => {
  try {
    const AuctionFacoryContract = contract(AuctionFactoryArtifact)
    auctionContract = contract(AuctionArtifact)
    AuctionFacoryContract.setProvider(web3.currentProvider)
    contractInstance = await AuctionFacoryContract.deployed()   
    // const imageRegisterContract = contract(ImageRegisterContractArtifact)
    // imageRegisterContract.setProvider(web3.currentProvider)
    // contractInstance = await imageRegisterContract.deployed()
    const accounts = await web3.adh.getAccounts()
    console.log('accounts', accounts)
    account = accounts[0]
    console.log(web3, contractInstance, accounts[0])
  } catch (error) {
    console.log('Error loading ImageRegister contract.', error)
  }
}

initialize()

export { web3, contractInstance, account, auctionContract }
