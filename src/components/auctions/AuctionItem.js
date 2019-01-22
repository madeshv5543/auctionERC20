import React, { Component } from 'react'
import PropTypes from 'prop-types'
import toastr from 'toastr'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import './AuctionItem.css'

import { bidAuction, cancelAuction } from '../../actions/auctionActions'
import { textTruncate } from '../../utils/string'
class AuctionItem extends Component {
  state = {
    blockNumber: null,
    status: 'Running',
    bidValue: 0,
    eventlistener: {},
    myBid: 0,
    highestBid: 0,
    highestBidder: null,
    highestBindingBid: 0,
    canceled: false,
  }

  componentDidMount() {
    console.log('props', this.props)
    let { contract, address } = this.props.auction
    let eventlistener = {}
    eventlistener[address] = contract.LogBid({
      fromBlock: 0,
      toBlock: 'latest',
    })
    eventlistener[address].watch(this.onLogBid)
    this.setState({
      eventlistener: eventlistener,
    })
    let intervalId = setInterval(this.getBlockNumber.bind(this), 1000)
    this.setState({ intervalId: intervalId })
    this.getContractDetails(contract, address)
    // this.getyourBid()
  }

  componentWillUnmount() {
    clearInterval(this.state.intervalId)
  }

  getContractDetails = async (contract, address) => {
    if (!contract) return
    let highestBid = (await contract.getHighestBid.call()) / 1e18
    let highestBidder = await contract.highestBidder.call()
    let highestBindingBid = (await contract.highestBindingBid.call()) / 1e18
    let canceled = await contract.canceled.call()
    this.setState({ highestBid, highestBidder, highestBindingBid, canceled })
  }

  handleChange = (event) => {
    this.setState({
      [event.target.id]: event.target.value,
    })
  }

  handleBidPlace = async (event) => {
    event.preventDefault()
    const { bidValue } = this.state
    try {
      await this.props.bidAuction(this.props.auction, bidValue)
      toastr.success(
        'Bid places Successfully.  It may take a while for MetaMash to respond'
      )
    } catch (err) {
      toastr.error(err)
    }
  }

  cancelAuction = async () => {
    try {
      await this.props.cancelAuction(this.props.auction)
      toastr.success(
        'Auction cancled triggerd. It may take a while for MetaMask to respond'
      )
    } catch (err) {
      toastr.error(err)
    }
  }

  canclebutton() {
    let auction = this.props.auction
    if (
      this.props.web3.account === auction.owner &&
      (this.state.status === 'Running' || this.state.status === 'Unstarted')
    ) {
      return (
        <div>
          <div className="mb-3">
            <button
              type="button"
              onClick={this.cancelAuction}
              className="btn btn-primary"
            >
              Cancel Auction
            </button>
          </div>
        </div>
      )
    }
  }

  bidInput() {
    if (
      this.state.status === 'Running' &&
      this.props.web3.account !== this.props.auction.owner
    ) {
      return (
        <div className="row">
          <div className="card-body">
            <form className="needs-validation" onSubmit={this.handleBidPlace}>
              <div className="form-group">
                <label htmlFor="bidValue"> Bid Value *</label>
                <input
                  type="number"
                  className="form-control"
                  id="bidValue"
                  placeholder="Bid Value"
                  value={this.state.bidValue}
                  onChange={this.handleChange}
                  required
                />
                <div className="invalid-feedback">Title is required.</div>
              </div>
              <div className="mb-3">
                <button type="submit" className="btn btn-primary">
                  Place Bid
                </button>
              </div>
            </form>
          </div>
        </div>
      )
    }
  }

  getBlockNumber() {
    let app = this
    this.props.web3.web3.adh.getBlockNumber((err, blockNumber) => {
      var status = 'Running'
      if (this.state.canceled) {
        status = 'Canceled'
      } else if (app.state.blockNumber > app.props.auction.endBlock) {
        status = 'Ended'
      } else if (app.state.blockNumber < app.props.auction.startBlock) {
        status = 'Unstarted'
      }
      app.setState({
        blockNumber: blockNumber,
        status: status,
      })
    })
  }

  // getyourBid = async () => {
  //   console.log('call bid')
  //   if (!this.props.auction) return
  //   let yourbid = await this.props.auction.contract.fundsByBidder(
  //     this.props.web3.account
  //   )
  //   this.setState({myBid: yourbid})
  // }

  onLogBid(err, resp) {
    console.log('LogBid ~>', resp.args)
  }

  static propTypes = {
    auction: PropTypes.object.isRequired,
    web3: PropTypes.object.isRequired,
  }
  render() {
    const {
      // contract,
      address,
      ipfsHash,
      title,
      description,
      // tags,
    } = this.props.auction
    return (
      <div className="flip-card">
        <div className="flip-card-inner">
          <div className="flip-card-front">
            <img
              className="card-img-top"
              src={`https://ipfs.io/ipfs/${ipfsHash}`}
              alt="Card"
            />
            <div className="card-body">
              <h4 className="card-title">{title}</h4>
              <p className="card-text"> {textTruncate(description, 25)}</p>
            </div>
          </div>
          <div className="flip-card-back">
            <div className="row">
              <div className="card-body">
                <strong> Highest Bid </strong>
                <p>
                  <span className="text-muted">
                    {this.state.highestBid.toString()}
                  </span>
                </p>
              </div>
              <div className="card-body">
                <strong> Highest Bidder </strong>
                <p>
                  <span className="text-muted">
                    {this.state.highestBidder
                      ? textTruncate(this.state.highestBidder.toString(), 10)
                      : '0x00000...'}
                  </span>
                </p>
              </div>
            </div>
            <div className="row">
              <div className="card-body">
                <strong> Highest BindingBid </strong>
                <p>
                  <span className="text-muted">
                    {this.state.highestBindingBid
                      ? textTruncate(this.state.highestBindingBid.toString(), 4)
                      : 0}
                  </span>
                </p>
              </div>
              <div className="card-body">
                <strong> Status </strong>
                <p>
                  <span className="text-muted">{this.state.status}</span>
                </p>
              </div>
            </div>
            <div className="row">
              <div className="card-body text-center">
                <Link
                  to={`/auction/${address}`}
                  className="btn btn-secondary btn-lg"
                  role="button"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      // <div className="col-md-4">
      //   <div className="card mb-4 box-shadow">
      //     <img
      //       className="card-img-top"
      //       src={`https://ipfs.io/ipfs/${ipfsHash}`}
      //       alt="Card"
      //     />
      //     <div className="card-body">
      //       <h4 className="card-title">{title}</h4>
      //       <p className="card-text"> {textTruncate(description, 25)}</p>
      //     </div>
      //     <hr />
      //     {/* <div className="row">
      //       <div className="card-body">
      //         <strong> StartBlock </strong>
      //         <p>
      //           <span className="text-muted">{startBlock}</span>
      //         </p>
      //       </div>
      //       <div className="card-body">
      //         <strong> EndBlock </strong>
      //         <p>
      //           <span className="text-muted">{endBlock}</span>
      //         </p>
      //       </div>
      //     </div> */}
      //     <div className="row">
      //       <div className="card-body">
      //         <strong> Highest Bid </strong>
      //         <p>
      //           <span className="text-muted">
      //             {this.state.highestBid.toString()}
      //           </span>
      //         </p>
      //       </div>
      //       <div className="card-body">
      //         <strong> Highest Bidder </strong>
      //         <p>
      //           <span className="text-muted">
      //             {this.state.highestBidder
      //               ? textTruncate(this.state.highestBidder.toString(), 10)
      //               : '0x00000...'}
      //           </span>
      //         </p>
      //       </div>
      //     </div>
      //     <div className="row">
      //       <div className="card-body">
      //         <strong> Highest BindingBid </strong>
      //         <p>
      //           <span className="text-muted">
      //             {this.state.highestBindingBid
      //               ? textTruncate(this.state.highestBindingBid.toString(), 4)
      //               : 0}
      //           </span>
      //         </p>
      //       </div>
      //       <div className="card-body">
      //         <strong> Status </strong>
      //         <p>
      //           <span className="text-muted">{this.state.status}</span>
      //         </p>
      //       </div>
      //     </div>
      //     <div className="row">
      //       <div className="card-body text-center">
      //         <Link
      //           to={`/auction/${address}`}
      //           className="btn btn-primary btn-lg"
      //           role="button"
      //         >
      //           View Details
      //         </Link>
      //       </div>
      //     </div>
      //   </div>
      // </div>
    )
  }
}

const mapStateToProps = (state) => ({
  web3: state.web3,
})

export default connect(
  mapStateToProps,
  { bidAuction, cancelAuction }
)(AuctionItem)
