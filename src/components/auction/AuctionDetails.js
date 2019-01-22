import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import toastr from 'toastr'

import './AuctionDetails.css'
import {
  getAuction,
  bidAuction,
  cancelAuction,
  withdrawAuction,
} from '../../actions/auctionActions'

class AuctionDetails extends Component {
  state = {
    status: 'Running',
    bidValue: 0,
    blockNumber: null,
    intervalId: null,
    myBid: 0,
    highestBid: 0,
    highestBidder: '0x0000000000000000000000000000000000000000',
    highestBindingBid: 0,
    canceled: false,
    auction: null,
  }
  componentDidMount() {
    this.props.getAuction(this.props.match.params.address)
    console.log('props', this.props)
    let intervalId = setInterval(this.getBlockNumber.bind(this), 1000)
    this.setState({ intervalId: intervalId })
    this.getContractDetails(this.props.auction)
  }

  componentWillUnmount() {
    clearInterval(this.state.intervalId)
  }

  getBlockNumber() {
    let app = this
    if (!app.props.auction) return
    this.props.web3.web3.adh.getBlockNumber((err, blockNumber) => {
      var status = 'Running'
      if (app.state.canceled) {
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

  getContractDetails = async (auction) => {
    if (!auction) return
    if (auction === this.state.auction) return
    let contract = auction.contract
    console.log('get auction details')
    let highestBid = (await contract.getHighestBid.call()) / 1e18
    let highestBidder = await contract.highestBidder.call()
    let highestBindingBid = (await contract.highestBindingBid.call()) / 1e18
    let canceled = await contract.canceled.call()
    let myBid = (await contract.fundsByBidder(this.props.web3.account)) / 1e18
    this.setState({
      highestBid,
      highestBidder,
      highestBindingBid,
      canceled,
      auction,
      myBid,
    })
  }

  getfunderBid = async (address, contract) => {
    console.log('contract', contract)
    let bids = await contract.fundsByBidder(address)
    return bids / 1e18
  }

  handleChange = (event) => {
    this.setState({
      [event.target.id]: event.target.value,
    })
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

  handleBidPlace = async (event) => {
    event.preventDefault()
    const { bidValue } = this.state
    console.log('bid', bidValue, this.props.auction)
    try {
      await this.props.bidAuction(this.props.auction, bidValue)
      toastr.success(
        'Bid places Successfully.  It may take a while for MetaMash to respond'
      )
    } catch (err) {
      toastr.error(err)
    }
  }

  handleWithDraw = async () => {
    try {
      await this.props.withdrawAuction(this.props.auction)
      toastr.success(
        'Request for withdraw is triggered. It may take a while for MetaMask to respond'
      )
    } catch (err) {
      toastr.error(err)
    }
  }

  withdrawButton() {
    if (!this.props.auction) return
    if (this.state.status === 'Canceled' || this.state.status === 'Ended') {
      return (
        <div>
          <div className="mb-3">
            <button
              type="button"
              onClick={this.handleWithDraw}
              className="btn btn-primary"
            >
              Withdraw
            </button>
          </div>
        </div>
      )
    }
  }

  bidInput() {
    if (!this.props.auction) return <div>Not found</div>
    if (
      this.state.status === 'Running' &&
      this.props.web3.account !== this.props.auction.owner
    ) {
      return (
        <div className="row">
          <div className="card-body">
            <form
              className="needs-validation"
              noValidate
              onSubmit={this.handleBidPlace}
            >
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
                <div className="invalid-feedback">Bid value is required.</div>
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

  canclebutton() {
    if (!this.props.auction) return <div>Not found</div>
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

  getyourBid = async () => {
    if (!this.props.auction) return
    let yourbid = await this.fundsByBidder(
      this.props.auction.contract,
      this.props.web3.account
    )
    this.setState({
      mybid: yourbid,
    })
  }

  mybid() {
    if (!this.props.auction) return
    return (
      <tr>
        <th scope="row">Your Bid</th>
        <td>
          {this.getfunderBid(
            this.props.auction.contract,
            this.props.web3.account
          )}
        </td>
      </tr>
    )
  }

  render() {
    const auction = this.props.auction ? this.props.auction : {}
    if (this.props.auction) this.getContractDetails(this.props.auction)
    const {
      address,
      title,
      description,
      // tags,
      owner,
      startBlock,
      endBlock,
      ipfsHash,
    } = auction
    return (
      <div className="container">
        <div className="alert alert-info mt-3" role="alert">
          Blockchain transaction information is <strong>not</strong> presisted.
          {/* This information <i>may</i> be lost when you refresh the browser or login as another user. */}
        </div>
        <div className="mt-3 mb-3">
          <Link to="/">Go Home</Link>
        </div>
        <div className="row">
          <div className="col-md-4">
            <div className="card mb-3">
              {ipfsHash ? (
                <img
                  src={`https://ipfs.io/ipfs/${ipfsHash}`}
                  className="card-img-top"
                  alt={`${ipfsHash}`}
                />
              ) : (
                <img
                  src="https://api.fnkr.net/testimg/333x180/?text=IPFS"
                  className="card-img-top"
                  alt="NA"
                />
              )}
              <div className="card-body">
                <h5 className="card-title">{title}</h5>
                <p className="card-text">{description}</p>
                {/* <p className="card-text">
                  <small>
                    Uploaded on  {uploadedOn ? uploadedOn : 'N/A'}
                  </small>
                </p> */}
              </div>
            </div>
            <p className="lead">
              <a
                target="_blank"
                href={`https://ipfs.io/ipfs/${ipfsHash}`}
                className={`btn btn-primary btn-lg ${!ipfsHash && 'disabled'}`}
                role="button"
              >
                View on IPFS
              </a>
            </p>
            {this.bidInput()}
            {this.canclebutton()}
            {this.state.myBid ? this.withdrawButton() : ''}
          </div>
          <div className="col-md-8">
            <h3>Contract Address</h3>
            <p>
              {address ? (
                <a
                  target="_blank"
                  href={`http://adhichain.info/addr/${address}`}
                  className="lead"
                  role="button"
                >
                  {address}
                </a>
              ) : (
                'N/A'
              )}
            </p>
            <hr className="my-4" />
            <h3>Blockchain Details</h3>
            <div className="table-responsive">
              <table className="table">
                <tbody>
                  <tr>
                    <th scope="row">Highest Bid</th>
                    <td>
                      {this.state.highestBid
                        ? this.state.highestBid.toString()
                        : 0}
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Highest Bidder</th>
                    <td>
                      {this.state.highestBidder
                        ? this.state.highestBidder
                        : 'N/A'}
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">start Block</th>
                    <td>{startBlock ? startBlock : 'N/A'} </td>
                  </tr>
                  <tr>
                    <th scope="row">End Block</th>
                    <td>{endBlock ? endBlock : 'N/A'}</td>
                  </tr>
                  <tr>
                    <th scope="row">Owner</th>
                    <td>{owner ? owner : 'N/A'}</td>
                  </tr>
                  <tr>
                    <th scope="row">canceled</th>
                    <td>{this.state.canceled ? 'Cancel' : 'N/A'}</td>
                  </tr>
                  <tr>
                    <th scope="row">Status</th>
                    <td>{this.state.status ? this.state.status : 'N/A'}</td>
                  </tr>
                  <tr>
                    <th scope="row">Your Bid</th>
                    <td>{this.state.myBid}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  auction: state.auction.auction,
  web3: state.web3,
})

export default connect(
  mapStateToProps,
  {
    getAuction,
    bidAuction,
    cancelAuction,
    withdrawAuction,
  }
)(AuctionDetails)
