import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'

import Spinner from '../common/Spinner'
import Pagination from '../common/Pagination'
import AuctionItem from './AuctionItem'
import {
  getAuctions,
  bidAuction,
  getAuctionscount,
} from '../../actions/auctionActions'

const styles = {
  root: {
    flexGrow: 1,
  },
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
}

const backgroundImage = require('../../../assets/images/decentralized-network.jpg')

class Auctions extends Component {
  state = {
    currentPage: null,
    auctions: [],
  }
  static propTypes = {
    getAuctions: PropTypes.func.isRequired,
    auction: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
  }
  componentDidMount = () => {
    this.props.getAuctionscount()
  }

  // onPageChanged = (data) => {
  //   console.log('page changed', data)
  //   const { currentPage, totalPages, pageLimit } = data
  //   const offset = (currentPage - 1) * pageLimit
  //   this.props.getAuctions(data)
  // }

  // componentWillUnmount() {
  //   clearInterval(this.state.intervalId)
  // }
  // getBlockNumber() {
  //   console.log('getblocknumber', this.state.blockNumber)
  //   let app = this
  //   this.props.web3.web3.adh.getBlockNumber((err, blockNumber) => {
  //     console.log('blocknumer', blockNumber)
  //     this.setState({
  //       blockNumber: blockNumber,
  //     })
  //   })
  // }

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.auction.auctions != nextProps.auction.auctions
  }
  render() {
    const { classes } = this.props
    let { totalRecords, auctions, loading } = this.props.auction
    let auctionItems
    if (auctions === null || loading) {
      auctionItems = <Spinner />
    } else {
      if (auctions && auctions.length > 0) {
        auctionItems = auctions.map((auction) => (
          <AuctionItem
            key={auction.address}
            auction={auction}
            web3={this.props.web3}
          />
        ))
      } else {
        auctionItems = <h4>No auctions found</h4>
      }
    }
    return (
      <div>
        {/* <div className={classes.space50}> </div> */}
        <section
          className="jumbotron text-center"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            opacity: '1.0',
          }}
        >
          <div className="container">
            <h1 className="jumbotron-heading"> Auctions</h1>
            <p className="lead text-muted">Auction Platform</p>
            <p className="lead text-muted">
              {/* Block Number - {this.state.blockNumber} */}
            </p>
            <p>
              <small>
                Metamask Account{' '}
                <mark>{this.props.web3.account || 'Not Connected'}</mark>
              </small>
            </p>
            <p>
              <Link to="/createAuction" className="btn btn-primary my-2">
                Create Auction
              </Link>
            </p>
          </div>
        </section>
        <div>
          <div className="d-flex flex-row py-4 align-items-center">
            <Pagination />
          </div>
        </div>
        <div className="album py-5 bg-light">
          <div className="container">
            <div className="row">
              {auctionItems}
              {/* {this.state.auctions.length} */}
              {/* {this.state.auctions.length
                ? this.state.auctions.map((auction) => (
                    <AuctionItem
                      key={auction.address}
                      auction={auction}
                      web3={this.props.web3}
                    />
                  ))
                : 'No Auction Found'} */}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  web3: state.web3,
  auction: state.auction,
})

Auctions = withStyles(styles)(Auctions)
export default connect(
  mapStateToProps,
  {
    getAuctions,
    bidAuction,
    getAuctionscount,
  }
)(Auctions)
