import React, { Component } from 'react'
import toastr from 'toastr'
import { createAuction } from '../../actions/auctionActions'
import { Link } from 'react-router-dom'
import Spinner from '../common/Spinner'
import { connect } from 'react-redux'

class CreateAuction extends Component {
  state = {
    title: '',
    description: '',
    tags: '',
    buffer: null,
    file: null,
    bidIncrement: 100000000000000000,
    startBlock: 0,
    endBlock: 0,
    tokenAddress: null,
    blockNumber: null,
  }

  componentDidMount() {
    let intervalId = setInterval(this.getBlockNumber.bind(this), 1000)
    this.setState({ intervalId: intervalId })
  }

  componentWillUnmount() {
    clearInterval(this.state.intervalId)
  }

  handleChange = (event) => {
    this.setState({
      [event.target.id]: event.target.value,
    })
  }

  captureFile = (event) => {
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState({
        buffer: Buffer(reader.result),
        file: URL.createObjectURL(file),
      })
    }
  }

  getBlockNumber() {
    this.props.web3.web3.adh.getBlockNumber((err, blockNumber) => {
      this.setState({
        blockNumber: blockNumber,
      })
    })
  }

  handleCreateAuction = async (event) => {
    event.preventDefault()
    const {
      bidIncrement,
      startBlock,
      endBlock,
      buffer,
      title,
      description,
      tags,
      tokenAddress,
    } = this.state
    console.log(bidIncrement, startBlock, endBlock)
    try {
      await this.props.createAuction(
        buffer,
        bidIncrement,
        startBlock,
        endBlock,
        title,
        description,
        tags,
        tokenAddress
      )
      toastr.success(
        'Auction Created. It may take a while for MetaMash to respond, the transaction to be mined and the image to appear in the list.'
      )
    } catch (err) {
      toastr.error(err)
    }

    this.props.history.push('/')
  }
  render() {
    return (
      <div className="container">
        <fieldset disabled={this.props.loading}>
          <div className="row">
            <div className="col-md-8 m-auto">
              <h1 className="display-4 text-center mt-4">Upload an image</h1>
              <p className="text-center">{this.state.blockNumber}</p>
              {this.props.loading ? (
                <Spinner />
              ) : (
                <p className="lead text-center">
                  Let's get some information before uploading your image to IPFS
                  and the Blockchain
                </p>
              )}
              <form
                className="needs-validation"
                onSubmit={this.handleCreateAuction}
              >
                <div className="form-group">
                  <label htmlFor="title">Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    placeholder="Title"
                    value={this.state.title}
                    onChange={this.handleChange}
                    required
                  />
                  <div className="invalid-feedback">Title is required.</div>
                </div>
                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    className="form-control"
                    id="description"
                    placeholder="Description"
                    rows="3"
                    value={this.state.description}
                    onChange={this.handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="tags">Tags *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="tags"
                    placeholder="Tags"
                    value={this.state.tags}
                    onChange={this.handleChange}
                    required
                  />
                  <div className="invalid-feedback">Tags is required.</div>
                </div>
                {/* <div className="form-group">
                  <label htmlFor="tags">Tags *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="tags"
                    placeholder="Tags"
                    value={this.state.tags}
                    required
                  />
                  <small id="tagsHelpBlock" className="form-text text-muted">
                    Comma-delimited e.g Baseball, softball, Soccer
                  </small>
                  <div className="invalid-feedback">Tags are required</div>
                </div> */}
                <div className="form-group">
                  <label htmlFor="bidIncrement">Bid Increment *</label>
                  <input
                    type="number"
                    className="form-control"
                    id="bidIncrement"
                    placeholder="Bid Increment"
                    value={this.state.bidIncrement}
                    onChange={this.handleChange}
                    required
                  />
                  <div className="invalid-feedback">Title is required.</div>
                </div>
                <div className="form-group">
                  <label htmlFor="startBlock">Start Block</label>
                  <input
                    className="form-control"
                    id="startBlock"
                    placeholder="Start Block"
                    value={this.state.startBlock}
                    onChange={this.handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="endBlock">End Block</label>
                  <input
                    className="form-control"
                    id="endBlock"
                    placeholder="End Block"
                    value={this.state.endBlock}
                    onChange={this.handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="tokenAddress">Token Address</label>
                  <input
                    className="form-control"
                    id="tokenAddress"
                    placeholder="Token Address"
                    value={this.state.tokenAddress}
                    onChange={this.handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="file">Image *</label>
                  <input
                    type="file"
                    className="form-control-file"
                    id="file"
                    onChange={this.captureFile}
                    required
                  />
                  <div className="invalid-feedback"> Image required</div>
                </div>
                <small className="d-block pb-3">* = required fields</small>
                {/* <small className="d-block pb-3">
                  uploading the same file multiple times will result in the same file with the same hash being Upload
                </small> */}
                <div className="mb-3">
                  <Link to="/" className="btn btn-secondary mr-2">
                    Cancel
                  </Link>
                  <button type="submit" className="btn btn-primary">
                    Create Auction
                  </button>
                </div>
              </form>
              {this.state.file && (
                <div className="text-center mt-3 mb-3">
                  <img
                    src={this.state.file}
                    className="img-thumbnail"
                    alt="Preview"
                  />
                </div>
              )}
            </div>
          </div>
        </fieldset>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  loading: state.auction.loading,
  web3: state.web3,
})

export default connect(
  mapStateToProps,
  { createAuction }
)(CreateAuction)
