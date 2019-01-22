import { combineReducers } from 'redux'
import web3Reducer from './web3Reducer'
import imageReducer from './imageReducer'
import auctionReducer from './auctionReducer'

export default combineReducers({
  web3: web3Reducer,
  image: imageReducer,
  auction: auctionReducer,
})
