import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { Provider } from 'react-redux'

import store from './store'
import './App.css'

import Navbar from './components/layout/Navbar'
import Main from './components/layout/Main'
import Auctions from './components/auctions/Auctions'
import CreateAuction from './components/auction/CreateAuction'
import AuctionDetails from './components/auction/AuctionDetails'
import NotFound from './components/notFound/NotFound'

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Router>
          <div className="App">
            <Navbar />
            <Main>
              <Switch>
                <Route exact path="/" component={Auctions} />
                <Route exact path="/createAuction" component={CreateAuction} />
                <Route
                  exact
                  path="/auction/:address"
                  component={AuctionDetails}
                />
                <Route exact component={NotFound} />
              </Switch>
            </Main>
          </div>
        </Router>
      </Provider>
    )
  }
}

export default App
