import { keyBy } from 'lodash'
import {
  GET_AUCTIONS,
  GET_AUCTIONS_SUCCESS,
  SET_ERROR,
  GET_AUCTION,
  AUCTION_COUNT,
  AUCTION_COUNT_SUCCESS,
} from '../actions/types'

const initialState = {
  auctions: null,
  auction: null,
  loading: false,
  error: null,
  totalRecords: null,
}

export default (state = initialState, action) => {
  switch (action.type) {
    case GET_AUCTIONS:
      return {
        ...state,
        loading: true,
        auctions: null,
        error: null,
      }
    case GET_AUCTIONS_SUCCESS:
      const auctionsByIndex = keyBy(state.auctions, function(o) {
        return o.address
      })
      console.log('auction by index', auctionsByIndex)
      const updatedAuction = action.payload.map((auction) => {
        const updatedAuction = {
          ...auctionsByIndex[auction.address],
          ...auction,
        }
        return updatedAuction
      })
      console.log('updateauction', updatedAuction)
      return {
        ...state,
        loading: false,
        auctions: updatedAuction,
        error: null,
        auction: null,
      }
    case AUCTION_COUNT:
      return {
        ...state,
        loading: true,
        error: null,
      }
    case AUCTION_COUNT_SUCCESS:
      return {
        ...state,
        loading: false,
        totalRecords: action.payload,
        error: null,
      }
    case GET_AUCTION:
      let auctionByIndex = keyBy(state.auctions, function(o) {
        return o.address
      })
      return {
        ...state,
        loading: false,
        auction: state.auctions ? auctionByIndex[action.payload] : null,
        error: null,
      }
    case SET_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
      }
    default:
      return state
  }
}
