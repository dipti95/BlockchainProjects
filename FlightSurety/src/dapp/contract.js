import FlightSuretyApp from "../../build/contracts/FlightSuretyApp.json"
import FlightSuretyData from "../../build/contracts/FlightSuretydata.json"
import Config from "./config.json"
import Web3 from "web3"

export default class Contract {
  constructor(network, callback) {
    let config = Config[network]
    this.web3 = new Web3(new Web3.providers.HttpProvider(config.url))
    this.flightSuretyApp = new this.web3.eth.Contract(
      FlightSuretyApp.abi,
      config.appAddress
    )
    this.flightSuretyData = new this.web3.eth.Contract(
      FlightSuretyData.abi,
      config.dataAddress
    )
    //
    this.appAddress = config.appAddress
    this.initialize(callback)
    this.owner = null
    this.airlines = []
    this.passengers = []

    //
    this.accounts = []
  }

  initialize(callback) {
    this.web3.eth.getAccounts(async (error, accts) => {
      this.owner = accts[0]

      let counter = 1

      this.airlines = await this.flightSuretyApp.methods
        .getRegisteredAirlines()
        .call({ from: self.owner })

      console.log(this.airlines)

      if (!this.airlines || !this.airlines.length) {
        alert("There is no airline available")
      }
      //   while (this.airlines.length < 5) {
      //     this.airlines.push(accts[counter++])
      //   }

      while (this.passengers.length < 5) {
        this.passengers.push(accts[counter++])
      }

      callback()
    })
  }

  isOperational(callback) {
    let self = this
    self.flightSuretyApp.methods
      .isOperational()
      .call({ from: self.owner }, callback)
  }

  fetchFlightStatus(airline, flight, timestamp, callback) {
    let self = this
    let payload = {
      airline: airline,
      flight: flight,
      timestamp: timestamp,
    }
    self.flightSuretyApp.methods
      .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
      .send({ from: self.owner }, (error, result) => {
        callback(error, payload)

        console.log(error)
      })
  }

  // fetchFlightStatus(flight, callback) {
  //   let self = this
  //   let payload = {
  //     airline: self.airlines[0],
  //     flight: flight,
  //     timestamp: Math.floor(Date.now() / 1000),
  //   }
  //   self.flightSuretyApp.methods
  //     .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
  //     .send({ from: self.owner }, (error, result) => {
  //       callback(error, payload)
  //     })
  // }

  async isAirlineFunded(airline, callback) {
    // let self = this

    // let x = await self.flightSuretyData.methods
    //   .isAirlineFunded(airline)
    //   .send({ from: self.owner, gas: "4500000" }, (error, result) => {
    //     callback(error, result)
    //     console.log(result)
    //   })

    let self = this
    self.flightSuretyData.methods
      .isAirlineFunded(airline)
      .call({ from: self.owner }, callback)

    //console.log(x)
  }

  async registerAirline(airline, name, callback) {
    let self = this
    console.log(this.owner)
    console.group(self.owner)
    console.log(this.airlines)
    await self.flightSuretyApp.methods
      .registerAirline(airline, name)
      .send({ from: self.owner, gas: "4500000" }, (error, result) => {
        callback(error, result)
      })
  }

  async registerFlight(address, name, timestamp, callback) {
    let self = this
    console.log(address)
    console.log(name)
    console.log(timestamp)
    //console.log()
    await self.flightSuretyApp.methods
      .registerFlight(address, name, timestamp)
      .send(
        { from: self.owner, gas: 5000000, gasPrice: 20000000 },
        (error, result) => {
          callback(error, result)
        }
      )
  }

  async buy(address, name, timestamp, passangerAddress, amt, callback) {
    let self = this
    let amount = self.web3.utils.toWei(amt, "ether").toString()
    await self.flightSuretyApp.methods.buy(name, address, timestamp).send(
      {
        from: passangerAddress,
        value: amount,
        gas: 5000000,
        gasPrice: 20000000,
      },
      (error, result) => {
        callback(error, result)
      }
    )
  }

  fundAirline(airline, funds, callback) {
    let self = this
    let amount = self.web3.utils.toWei(funds, "ether").toString()
    self.flightSuretyApp.methods
      .fundAirline(airline)
      .send({ from: airline, value: amount }, (error, result) => {
        callback(error, result)
      })
  }

  getPassengerCredit(passangerAddress, callback) {
    let self = this
    self.flightSuretyApp.methods
      .getPassengerCredit(passangerAddress)
      .call({ from: self.owner }, callback)
  }

  withdrawCredit(pessangerAddress, callback) {
    let self = this
    self.flightSuretyApp.methods
      .withdrawCredit(pessangerAddress)
      .send({ from: self.owner }, (error, result) => {
        callback(error, result)
      })
  }
}
