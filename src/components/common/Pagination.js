import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { getAuctions, getAuctionscount } from '../../actions/auctionActions'

const LEFT_PAGE = 'LEFT'
const RIGHT_PAGE = 'RIGHT'

const range = (from, to, step = 1) => {
  let i = from
  const range = []

  while (i <= to) {
    range.push(i)
    i += step
  }
  return range
}

class Pagination extends Component {
  state = {
    currentPage: 0,
  }
  // static propTypes = {
  //   totalRecords: Proptypes.number.isRequired,
  //   pageLimit: Proptypes.number,
  //   pageNeighbours: Proptypes.number,
  //   onPageChanged: Proptypes.func,
  // }
  // constructor(props) {
  //   super(props)
  //   const { totalRecords = null, pageLimit = 30, pageNeighbours = 0 } = props
  //   this.pageLimit = typeof pageLimit === 'number' ? pageLimit : 30
  //   this.totalRecords = typeof totalRecords === 'number' ? totalRecords : 0

  //   this.pageNeighbours =
  //     typeof pageNeighbours === 'number'
  //       ? Math.max(0, Math.min(pageNeighbours, 2))
  //       : 0
  //   this.totalPages = Math.ceil(this.totalRecords / this.pageLimit)
  //   this.state = { currentPage: 1 }
  // }

  onPageChanged = (data) => {
    this.props.getAuctions(data)
  }

  gotoPage = (page) => {
    // const { onPageChanged = (f) => f } = this.props
    const totalPages = Math.ceil(this.props.totalRecords / this.props.pageLimit)
    const currentPage = Math.max(0, Math.min(page, totalPages))
    const paginationData = {
      currentPage,
      totalPages: totalPages,
      pageLimit: this.props.pageLimit,
      totalRecords: this.props.totalRecords,
    }
    this.setState({ currentPage }, () => this.onPageChanged(paginationData))
  }
  componentDidMount() {
    this.props.getAuctionscount()
    this.gotoPage(1)
  }
  handleClick = (page) => (evt) => {
    evt.preventDefault()
    this.gotoPage(page)
  }

  handleMoveLeft = (evt) => {
    evt.preventDefault()
    let temp = this.props.pageNeighbours * 2
    this.gotoPage(this.state.currentPage - temp - 1)
  }

  handleMoveRight = (evt) => {
    evt.preventDefault()
    let temp = this.props.pageNeighbours * 2
    this.gotoPage(this.state.currentPage + temp + 1)
  }

  fetchPageNumbers = () => {
    if (!this.props.totalRecords) return []
    const totalPages = Math.ceil(this.props.totalRecords / this.props.pageLimit)
    const currentPage = this.state.currentPage
    const pageNeighbours = this.props.pageNeighbours
    let temp = this.props.pageNeighbours * 2
    const totalNumbers = temp + 3
    const totalBlocks = totalNumbers + 2

    if (totalPages > totalBlocks) {
      const startPage = Math.max(2, currentPage - pageNeighbours)
      const endPage = Math.min(totalPages - 1, currentPage + pageNeighbours)
      let pages = range(startPage, endPage)

      const hasLeftSpill = startPage > 2
      let temdiff = totalPages - endPage
      const hasRightSpill = temdiff > 1
      const spillOffset = totalNumbers - (pages.length + 1)

      switch (true) {
        case hasLeftSpill && !hasRightSpill: {
          const extraPages = range(startPage - spillOffset, startPage - 1)
          pages = [LEFT_PAGE, ...extraPages, ...pages]
          break
        }

        case !hasLeftSpill && hasRightSpill: {
          const extraPages = range(endPage + 1, endPage + spillOffset)
          pages = [...pages, ...extraPages, RIGHT_PAGE]
          break
        }

        case hasLeftSpill && hasRightSpill:
        default: {
          pages = [LEFT_PAGE, ...pages, RIGHT_PAGE]
          break
        }
      }
      return [1, ...pages, totalPages]
    }
    return range(1, totalPages)
  }

  render() {
    console.log(this.props.totalRecords)
    if (!this.props.totalRecords || this.totalPages === 1) return null

    const { currentPage } = this.state
    const pages = this.fetchPageNumbers()
    if (currentPage === 0) this.gotoPage(1)
    return (
      <Fragment>
        <nav aria-label="Countries Pagibation">
          <ul className="pagination">
            {pages.map((page, index) => {
              if (page === LEFT_PAGE)
                return (
                  <li key={index} className="page-item">
                    <a
                      className="page-link"
                      href="#"
                      aria-label="Previous"
                      onClick={this.handleMoveLeft}
                    >
                      <span aria-hidden="true">&laquo;</span>
                      <span className="sr-only">Previous</span>
                    </a>
                  </li>
                )

              if (page === RIGHT_PAGE)
                return (
                  <li key={index} className="page-item">
                    <a
                      className="page-link"
                      href="#"
                      aria-label="Next"
                      onClick={this.handleMoveRight}
                    >
                      <span aria-hidden="true">&raquo;</span>
                      <span className="sr-only">Next</span>
                    </a>
                  </li>
                )

              return (
                <li
                  key={index}
                  className={`page-item 
                  ${currentPage === page ? ' active' : ''}
                  `}
                >
                  <a
                    className="page-link"
                    href="#"
                    onClick={this.handleClick(page)}
                  >
                    {page}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>
      </Fragment>
    )
  }
}

Pagination.propTypes = {
  totalRecords: PropTypes.number,
  pageLimit: PropTypes.number,
  pageNeighbours: PropTypes.number,
}

const mapStateToProps = (state) => ({
  auction: state.auction,
  pageLimit: 3,
  pageNeighbours: 2,
  totalRecords: state.auction.totalRecords,
})
// export default Pagination
export default connect(
  mapStateToProps,
  {
    getAuctionscount,
    getAuctions,
  }
)(Pagination)
