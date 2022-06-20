import FlightSuretyApp from "../../build/contracts/FlightSuretyApp.json"
import Config from "./config.json"
import Web3 from "web3"
import express from "express"

let config = Config["localhost"]
let web3 = new Web3(
  new Web3.providers.WebsocketProvider(config.url.replace("http", "ws"))
)
web3.eth.defaultAccount = web3.eth.accounts[0]
let flightSuretyApp = new web3.eth.Contract(
  FlightSuretyApp.abi,
  config.appAddress
)

const oracles = 30

const STATUS_CODE_UNKNOWN = 0
const STATUS_CODE_ON_TIME = 10
const STATUS_CODE_LATE_AIRLINE = 20
const STATUS_CODE_LATE_WEATHER = 30
const STATUS_CODE_LATE_TECHNICAL = 40
const STATUS_CODE_LATE_OTHER = 50

const statusCodeArr = [
  STATUS_CODE_UNKNOWN,
  STATUS_CODE_ON_TIME,
  STATUS_CODE_LATE_AIRLINE,
  STATUS_CODE_LATE_WEATHER,
  STATUS_CODE_LATE_TECHNICAL,
  STATUS_CODE_LATE_OTHER,
]

const registeredOracles = []

web3.eth.getAccounts((error, accounts) => {
  for (let idx = 0; idx < oracles; idx++) {
    flightSuretyApp.methods.registerOracle().send(
      {
        from: accounts[idx],
        value: web3.utils.toWei("1", "ether"),
        gas: 9999999,
      },
      (error, result) => {
        flightSuretyApp.methods
          .getMyIndexes()
          .call({ from: accounts[idx] }, (error, result) => {
            let oracle = {
              account: accounts[idx],
              index: result,
            }
            registeredOracles.push(oracle)
            console.log(
              "ORACLE REGISTERED:" +
                JSON.stringify(oracle.account) +
                JSON.stringify(oracle.index)
            )
          })
      }
    )
  }
})

flightSuretyApp.events.OracleRequest(
  {
    fromBlock: 0,
  },
  function (error, event) {
    let index = event.returnValues.index
    let airline = event.returnValues.airline
    let flight = event.returnValues.flight
    let timestamp = event.returnValues.timestamp

    console.log(airline)
    console.log(flight)
    console.log(index)
    console.log(timestamp)
    //statusCode =20 just for testing
    let statusCode = 20
    //statusCodeArr[Math.floor(Math.random() * statusCodeArr.length)]

    for (let idx = 0; idx < registeredOracles.length; idx++) {
      if (registeredOracles[idx].index.includes(index)) {
        flightSuretyApp.methods
          .submitOracleResponse(index, airline, flight, timestamp, statusCode)
          .send(
            { from: registeredOracles[idx].address, gas: 9999999 },
            (error, result) => {
              console.log(
                JSON.stringify(registeredOracles[idx]) +
                  "STATUS-CODE:" +
                  statusCode
              )
            }
          )
      }
    }
  }
)

const app = express()
app.get("/api", (req, res) => {
  res.send({
    message: "An API for use with your Dapp!",
  })
})

export default app
