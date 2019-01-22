import { ipfs } from '../utils/ipfs'
import web3 from '../utils/web3'
import axios from 'axios'

import tokenInterface from '../../contractbuild/LANSToken.json'

import {
  GET_AUCTIONS,
  GET_AUCTIONS_SUCCESS,
  CREATE_AUCTION,
  CREATE_AUCTION_SUCCESS,
  SET_ERROR,
  GET_AUCTION,
  PLACE_BID_SUCCESS,
  AUCTION_COUNT,
  AUCTION_COUNT_SUCCESS,
} from './types'

export const getAuctions = (data) => async (dispatch, getState) => {
  console.log('get all auction', data)
  dispatch({
    type: GET_AUCTIONS,
  })
  const web3State = getState().web3
  const allAuctions = []
  try {
    let auction = await axios.get(
      `http://localhost:8080/api/allAuction?currentPage=${
        data.currentPage
      }&pageLimit=${data.pageLimit}`
    )
    if (auction.data && auction.data.status) {
      let response = auction.data
      if (response.status != 200) {
        dispatch({
          type: SET_ERROR,
          payload: response.message,
        })
      } else {
        let data = response.data
        // let auctions = await web3State.contractInstance.allAuctions.call()
        for (let n of data) {
          const auction = web3State.auctionContract.at(n.address)
          const token = await auction.token.call()
          // const highestBid = await auction.getHighestBid.call()
          // const highestBindingBid = await auction.highestBindingBid.call()
          // const highestBidder = await auction.highestBidder.call()
          // const canceled = await auction.canceled.call()
          // let highestBidValue = await convertWebiToether(highestBid)
          // let highestBindingBidValue = await convertWebiToether(
          //   highestBindingBid
          // )
          let auctionDetails = {
            ...n,
            contract: auction,
            token: token,
          }
          allAuctions.push(auctionDetails)
        }
        console.log('newArray', allAuctions)
      }
    }
    // for (let auctionaddr of auctions) {
    //   const auction = web3State.auctionContract.at(auctionaddr)
    //   const owner = await auction.owner.call()
    //   const startBlock = await auction.startBlock.call()
    //   const endBlock = await auction.endBlock.call()
    //   const bidIncrement = await auction.bidIncrement.call()
    //   const highestBid = await auction.getHighestBid.call()
    //   const highestBindingBid = await auction.highestBindingBid.call()
    //   const highestBidder = await auction.highestBidder.call()
    //   const canceled = await auction.canceled.call()
    //   const ipfsHash = await auction.ipfsHash.call()
    //   const title = await auction.title.call()
    //   const description = await auction.description.call()
    //   const tags = await auction.tags.call()
    //   let bidIncrementvalue = await convertWebiToether(bidIncrement)
    //   let highestBidValue = await convertWebiToether(highestBid)
    //   let highestBindingBidValue = await convertWebiToether(highestBindingBid)
    //   let auctionDetails = {
    //     contract: auction,
    //     address: auctionaddr,
    //     owner: owner,
    //     startBlock: startBlock.toString(),
    //     endBlock: endBlock.toString(),
    //     bidIncrement: bidIncrementvalue,
    //     highestBid: highestBidValue,
    //     highestBindingBid: highestBindingBidValue,
    //     highestBidder: highestBidder,
    //     canceled: canceled,
    //     ipfsHash: ipfsHash,
    //     title: title,
    //     description: description,
    //     tags: tags,
    //   }
    //   allAuctions.push(auctionDetails)
    // }
    console.log('auctions', allAuctions)
    dispatch({
      type: GET_AUCTIONS_SUCCESS,
      payload: allAuctions,
    })
    // localStorage.setItem('auctions', JSON.stringify(allAuctions))
  } catch (error) {
    console.log('error', error)
    dispatch({
      type: SET_ERROR,
      payload: error,
    })
  }
}

export const getAuctionscount = () => async (dispatch, getState) => {
  console.log('getAuction count')
  dispatch({
    type: AUCTION_COUNT,
  })
  let totalRecords
  try {
    const web3State = getState().web3
    let auctionArray = await web3State.contractInstance.allAuctions.call()
    if (Array.isArray(auctionArray)) {
      totalRecords = auctionArray.length
    }
    dispatch({
      type: AUCTION_COUNT_SUCCESS,
      payload: totalRecords,
    })
  } catch (error) {
    dispatch({
      type: SET_ERROR,
      payload: error,
    })
  }
}

export const createAuction = (
  buffer,
  bidIncrement,
  startBlock,
  endBlock,
  title,
  description,
  tags,
  tokenAddress
) => async (dispatch, getState) => {
  dispatch({
    type: CREATE_AUCTION,
  })
  const web3State = getState().web3
  ipfs.add(buffer, async (error, result) => {
    if (error) {
      console.log('ERR', error)
      dispatch({
        type: SET_ERROR,
        payload: {
          error,
        },
      })
    } else {
      const ipfsHash = result[0].path // base58 encoded multihash
      ipfs.get(ipfsHash, (error, files) => {
        console.log('uploaded files', files)
      })
      try {
        console.log('here create')
        // let bidIncrementvalue = convertWebiToether(bidIncrement)
        web3State.contractInstance.createAuction(
          bidIncrement,
          tokenAddress,
          startBlock,
          endBlock,
          ipfsHash,
          title,
          description,
          tags,
          {
            from: web3State.account,
            gas: 4000000,
          }
        )
        dispatch({
          type: CREATE_AUCTION_SUCCESS,
        })
      } catch (error) {
        console.log('ERR', error)
        dispatch({
          type: SET_ERROR,
          payload: {
            error,
          },
        })
        throw error
      }
    }
  })
}
export const getAuction = (index) => ({ type: GET_AUCTION, payload: index })

export const bidAuction = (auction, value) => async (dispatch, getState) => {
  try {
    const web3State = getState().web3
    value = convertToWeb(value)
    let smartcontract = web3State.web3.adh
      .contract(tokenInterface.abi)
      .at(auction.token)
    smartcontract.approve(
      auction.address,
      value,
      {
        from: web3State.account,
      },
      function(err, res) {
        if (err) {
          dispatch({
            type: SET_ERROR,
            payload: {
              err,
            },
          })
          return
        }
        if (!err) auction.contract.placeBid(value, { from: web3State.account })
        dispatch({
          type: PLACE_BID_SUCCESS,
        })
      }
    )
    // console.log('test', approve)
    // web3State.web3.adh.sendTransaction(
    //   {
    //     from: web3State.account,
    //     to: auction.address,
    //     value: convertToWeb(value),
    //   },
    //   function(err, res) {
    //     dispatch({
    //       type: PLACE_BID_SUCCESS,
    //     })
    //   }
    // )
  } catch (error) {
    console.log('ERR', error)
    dispatch({
      type: SET_ERROR,
      payload: {
        error,
      },
    })
  }
}

export const withdrawAuction = (auction) => async (dispatch, getState) => {
  try {
    const web3State = getState().web3
    console.log('account', web3State.account, auction)
    auction.contract.withdraw({ from: web3State.account })
  } catch (error) {
    console.log('ERR', error)
    dispatch({
      type: SET_ERROR,
      payload: {
        error,
      },
    })
  }
}

export const cancelAuction = (auction) => async (dispatch, getState) => {
  try {
    const web3State = getState().web3
    auction.contract.cancelAuction({ from: web3State.account })
  } catch (error) {
    console.log('Err', error)
    dispatch({
      type: SET_ERROR,
      payload: {
        error,
      },
    })
  }
}

const convertWebiToether = (vale) => {
  return web3.fromWei(vale, 'ether')
}

const convertToWeb = (value) => {
  return web3.toWei(value, 'ether')
}

const getAuctionDetails = async (n, web3State) => {
  const auction = web3State.auctionContract.at(n.address)
  const highestBid = await auction.getHighestBid.call()
  const highestBindingBid = await auction.highestBindingBid.call()
  const highestBidder = await auction.highestBidder.call()
  const canceled = await auction.canceled.call()
  let highestBidValue = await convertWebiToether(highestBid)
  let highestBindingBidValue = await convertWebiToether(highestBindingBid)
  let auctionDetails = {
    ...n,
    highestBid: highestBidValue,
    highestBindingBid: highestBindingBidValue,
    highestBidder: highestBidder,
    canceled: canceled,
  }
  return auctionDetails
}

// const getAuctionDetails = (auctionAddr, Auction) => {
//   const auction = Auction.at(auctionAddr)
//   const owner = auction.owner.call()
//   const startBlock = auction.startBlock.call()
//   const endBlock = auction.endBlock.call()
//   const bidIncrement = auction.bidIncrement.call()
//   const highestBid = auction.getHighestBid.call()
//   const highestBindingBid = auction.highestBindingBid.call()
//   const highestBidder = auction.highestBidder.call()
//   const canceled = auction.canceled.call()

//   return Promise.all([ owner, startBlock, endBlock, bidIncrement, highestBid, highestBindingBid, highestBidder, canceled ]).then(vals => {
//       const [ owner, startBlock, endBlock, bidIncrement, highestBid, highestBindingBid, highestBidder, canceled ] = vals
//       return {
//           contract: auction,
//           address: auctionAddr,
//           owner: owner,
//           startBlock: startBlock.toString(),
//           endBlock: endBlock.toString(),
//           bidIncrement: this.props.web3.fromWei(bidIncrement, 'ether').toString(),
//           highestBid: this.props.web3.fromWei(highestBid, 'ether').toString(),
//           highestBindingBid: this.props.web3.fromWei(highestBindingBid, 'ether').toString(),
//           highestBidder: highestBidder,
//           canceled: canceled,
//       }
//   })
// }
