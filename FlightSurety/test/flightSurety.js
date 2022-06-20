var Test = require("../config/testConfig.js")
var BigNumber = require("bignumber.js")

contract("Flight Surety Tests", async (accounts) => {
  console.log(accounts)
  var config
  before("setup contract", async () => {
    config = await Test.Config(accounts)
    //console.log(config)
    await config.flightSuretyData.authorizeCaller(
      config.flightSuretyApp.address
    )
  })

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it(`(multiparty) has correct initial isOperational() value`, async function () {
    // Get operating status
    let status = await config.flightSuretyData.isOperational.call()
    assert.equal(status, true, "Incorrect initial operating status value")
  })

  it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {
    // Ensure that access is denied for non-Contract Owner account
    let accessDenied = false
    try {
      await config.flightSuretyData.setOperatingStatus(false, {
        from: config.testAddresses[2],
      })
    } catch (e) {
      accessDenied = true
    }
    assert.equal(accessDenied, true, "Access not restricted to Contract Owner")
  })

  it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {
    // Ensure that access is allowed for Contract Owner account
    let accessDenied = false
    try {
      await config.flightSuretyData.setOperatingStatus(false)
    } catch (e) {
      accessDenied = true
    }
    assert.equal(accessDenied, false, "Access not restricted to Contract Owner")
  })

  it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {
    await config.flightSuretyData.setOperatingStatus(false)

    let reverted = false
    try {
      await config.flightSurety.setTestingMode(true)
    } catch (e) {
      reverted = true
    }
    assert.equal(reverted, true, "Access not blocked for requireIsOperational")

    // Set it back for other tests to work
    await config.flightSuretyData.setOperatingStatus(true)
  })

  it("Only existing airline may register a new airline", async () => {
    let newAirline2 = accounts[2]
    let newAirline3 = accounts[3]
    let newAirline4 = accounts[4]
    let newAirline5 = accounts[5]

    let fundAmount = new BigNumber(web3.utils.toWei("10", "ether"))
    let name = await config.flightSuretyData.airlineName(config.owner)

    // console.log(config.owner)

    // console.log(fundAmount)

    try {
      await config.flightSuretyApp.fundAirline(config.owner, {
        from: config.owner,
        value: fundAmount,
      })

      await config.flightSuretyApp.registerAirline(newAirline2, "delta", {
        from: config.owner,
      })
    } catch (e) {}

    // let x = await config.flightSuretyData.isAirlineFunded(config.owner)
    // console.log(x + " firstAirline funded")
    // let y = await config.flightSuretyData.isAirlineFunded(newAirline2)
    // console.log(y + " newAirline2 funded")
    // let name2 = await config.flightSuretyData.airlineName(newAirline2)
    // console.log(name2 + " 2 name")
    let resultNewAirline2 =
      await config.flightSuretyData.isAirlineRegistered.call(newAirline2)

    //console.log(resultNewAirline2 + "2")
    // Second airline send fund amount and add a new airline
    try {
      await config.flightSuretyApp.fundAirline(newAirline2, {
        from: newAirline2,
        value: fundAmount,
      })
      await config.flightSuretyApp.registerAirline(newAirline3, "abd", {
        from: newAirline2,
      })
    } catch (e) {}
    let resultNewAirline3 =
      await config.flightSuretyData.isAirlineRegistered.call(newAirline3)
    //console.log(resultNewAirline3 + "3")

    try {
      await config.flightSuretyApp.fundAirline(newAirline3, {
        from: newAirline3,
        value: fundAmount,
      })
      await config.flightSuretyApp.registerAirline(newAirline4, "united", {
        from: newAirline3,
      })
    } catch (err) {
      //console.log(err)
    }
    let resultNewAirline4 =
      await config.flightSuretyData.isAirlineRegistered.call(newAirline4)
    //console.log(resultNewAirline4 + "4")

    try {
      await config.flightSuretyApp.fundAirline(newAirline4, {
        from: newAirline4,
        value: fundAmount,
      })
      await config.flightSuretyApp.registerAirline(newAirline5, "airIndia", {
        from: newAirline4,
      })
    } catch (e) {}
    let resultNewAirline5 =
      await config.flightSuretyData.isAirlineRegistered.call(newAirline5)

    let after = await config.flightSuretyApp.getRegisteredAirlines()
    //console.log(after)

    //console.log(resultNewAirline5 + "5")
    assert.equal(
      resultNewAirline2,
      true,
      "The second airline could be registered by the first one"
    )
    assert.equal(
      resultNewAirline3,
      true,
      "The third airline could be registered by the second one"
    )
    assert.equal(
      resultNewAirline4,
      true,
      "The fourth airline could be registered by the third one"
    )
    assert.equal(
      resultNewAirline5,
      false,
      "Fourth airline cannot register a fifth airline"
    )
  })

  it("Registration of fifth airlines requires multi-party consensus - 50% of registered airlines", async () => {
    let airline2 = accounts[2] // Already registered
    let airline3 = accounts[3] // Already registered
    let airline4 = accounts[4] // Already registered
    let newAirline5 = accounts[5] // Already has 1 vote from the fourth airline
    let newAirline6 = accounts[6] //  new airline;

    try {
      await config.flightSuretyApp.registerAirline(newAirline5, "Spicejet", {
        from: airline4,
      })
    } catch (err) {
      // console.log(err)
    }
    let resultAfterFirstVote =
      await config.flightSuretyData.isAirlineRegistered.call(newAirline5)

    // Airline 5 requires 2 votes
    try {
      await config.flightSuretyApp.registerAirline(newAirline5, "Indigo", {
        from: airline3,
      })
    } catch (err) {
      //console.log(err)
    }
    let resultAfterSecondVote =
      await config.flightSuretyData.isAirlineRegistered.call(newAirline5)

    try {
      await config.flightSuretyApp.registerAirline(newAirline6, "United", {
        from: airline2,
      })
    } catch (err) {
      //console.log(err)
    }
    let resultAfterFirstTwoVotes =
      await config.flightSuretyData.isAirlineRegistered.call(newAirline6)
    try {
      await config.flightSuretyApp.registerAirline(newAirline6, "JetAirway", {
        from: airline3,
      })
    } catch (err) {
      //console.log(err)
    }

    resultAfterFirstTwoVotes =
      resultAfterFirstTwoVotes &&
      (await config.flightSuretyData.isAirlineRegistered.call(newAirline6))
    try {
      await config.flightSuretyApp.registerAirline(newAirline6, "AirIndia", {
        from: airline4,
      })
    } catch (err) {
      //console.log(err)
    }
    let resultAirline6 = await config.flightSuretyData.isAirlineRegistered.call(
      newAirline6
    )

    assert.equal(
      resultAfterFirstVote,
      false,
      "The fifth airline could not be registered"
    )
    assert.equal(
      resultAfterSecondVote,
      true,
      "The fifth airline could be registered"
    )
    assert.equal(
      resultAfterFirstTwoVotes,
      false,
      "The sixth airline could not be registered with two votes"
    )
    assert.equal(resultAirline6, true, "The sixth airline could be registered")
  })

  it("Airline can register flight", async () => {
    let airline1 = accounts[2]
    let flightName = "ABC123"
    let timestamp = 1655142818

    try {
      await config.flightSuretyApp.registerFlight(
        airline1,
        flightName,
        timestamp
      )
    } catch (err) {}

    let flightRegistered = await config.flightSuretyApp.isFlightRegistered(
      airline1,
      flightName,
      timestamp
    )

    assert.equal(flightRegistered, true, "The flight could be registered")
  })

  it(" Passenger can buy insurance", async () => {
    let airline1 = accounts[1]
    let passengerAddress = accounts[7]
    let flightName = "ABC123" //registered Flight
    let timestamp = 1655142818
    let price = new BigNumber(web3.utils.toWei("1", "ether"))

    let error
    try {
      await config.flightSuretyApp.buy(flightName, airline1, timestamp, {
        from: passengerAddress,
        value: price,
      })
    } catch (err) {
      error = err
    }

    assert.notEqual(error, undefined, "Buy Insurance.")
  })
})
