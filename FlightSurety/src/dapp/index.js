import DOM from "./dom"
import Contract from "./contract"
import "./flightsurety.css"
;(async () => {
  let result = null

  let contract = new Contract("localhost", () => {
    // Read transaction
    contract.isOperational((error, result) => {
      console.log(error, result)
      display("Operational Status", "Check if contract is operational", [
        { label: "Operational Status", error: error, value: result },
      ])
      contract.airlines.forEach((airline) => {
        displayListAirline(airline, DOM.elid("airlines"))
      })
    })

    // User-submitted transaction
    DOM.elid("submit-oracle").addEventListener("click", () => {
      console.log("clicked")

      let flight = DOM.elid("flight-number").value
      let airline = DOM.elid("airline-address").value
      let timestamp = DOM.elid("timestamp").value
      // Write transaction
      contract.fetchFlightStatus(
        //airline,
        flight,
        //timestamp,
        (error, result) => {
          console.log(result)
          display("Oracles", "Trigger oracles", [
            {
              label: "Fetch Flight Status",
              error: error,
              value: result.flight + " " + result.timestamp,
            },
          ])
        }
      )
    })

    DOM.elid("is_airlineFunded").addEventListener("click", () => {
      console.log("clicked")
      let airline = DOM.elid("airlines").value
      console.log(airline)
      contract.isAirlineFunded(airline, (error, result) => {
        console.log(result)
        alert(result)
      })
    })

    DOM.elid("fund-airline").addEventListener("click", () => {
      console.log("clicked")
      let airline = DOM.elid("airlines").value
      let fund = DOM.elid("airline-fund").value
      contract.fundAirline(airline, fund, (error, result) => {
        alert("Airline was successfully funded.")
      })
    })

    DOM.elid("airlines").addEventListener("change", () => {
      return contract.airlines
    })

    DOM.elid("register-airline").addEventListener("click", () => {
      console.log("clicked")
      let airlineAddress = DOM.elid("airline_address").value
      let airlineName = DOM.elid("airline_name").value
      console.log(airlineName)

      contract.registerAirline(airlineAddress, airlineName, (error, result) => {
        console.log(result + "register airline")
        console.log(error.message)
        if (result === undefined) {
          alert(JSON.stringify(error.message))
        }
        if (result !== undefined) {
          alert("Airline was successfully registered.")
        }
        // displayAirline("display-wrapper-registeredAirline", [
        //   {
        //     label: ``,
        //     error: error,
        //     value: result,
        //   },
        // ])
      })
      DOM.elid("airline-address").value = ""
      DOM.elid("airline_name").value = ""
    })

    DOM.elid("register-flight").addEventListener("click", () => {
      console.log("clicked")
      let address = DOM.elid("address").value
      let flightName = DOM.elid("flight_name").value
      let timestamp = Number(DOM.elid("timestamp").value)
      console.log(address)
      console.log(flightName)
      console.log(timestamp)

      contract.registerFlight(
        address,
        flightName,
        timestamp,
        (error, result) => {
          console.log(result + "register flight")
          //console.log(error.message)
          displayFlight("display-wrapper-registerFlight", [
            {
              label: ` ${address},${flightName},${timestamp}`,
              error: error,
              value: result,
            },
          ])
          DOM.elid("address").value = ""
          DOM.elid("flight_name").value = ""
          DOM.elid("timestamp").value = ""
        }
      )
    })

    DOM.elid("buy-insurance").addEventListener("click", () => {
      console.log("clicked")
      let airlineAddress = DOM.elid("airlineaddress").value
      let name = DOM.elid("flightname").value
      let timestamp = Number(DOM.elid("_timestamp").value)
      let passenger = DOM.elid("passenger-address").value
      let amt = DOM.elid("insurance-amt").value
      contract.buy(
        airlineAddress,
        name,
        timestamp,
        passenger,
        amt,
        (error, result) => {
          console.log(result)
          displayBuy("display-wrapper-BuyInsurance", [
            {
              label: `Passenger address: ${passenger}`,
              error: error,
              value: result,
            },
          ])
        }
      )
    })
    DOM.elid("credit").addEventListener("click", () => {
      console.log("clicked")
      let passengerAddress = DOM.elid("passanger-address").value
      contract.getPassengerCredit(passengerAddress, (error, result) => {
        displayTx("display-wrapper-creditAmount", [
          {
            label: "Check Credit",
            error: error,
            value: result + " ETH",
          },
        ])
        DOM.elid("passanger-address").value = ""
      })
    })

    DOM.elid("withdraw").addEventListener("click", () => {
      let passengerAddress = DOM.elid("passanger-address").value
      contract.withdrawCredit(passengerAddress, (error, result) => {
        displayTx("display-wrapper-creditAmount", [
          { label: "Credit", error: error, value: result + " ETH" },
        ])
        DOM.elid("passanger-address").value = ""
      })
    })
  })
})()

function display(title, description, results) {
  let displayDiv = DOM.elid("display-wrapper")
  let section = DOM.section()
  section.appendChild(DOM.h2(title))
  section.appendChild(DOM.h5(description))
  results.map((result) => {
    let row = section.appendChild(DOM.div({ className: "row" }))
    row.appendChild(DOM.div({ className: "col-sm-4 field" }, result.label))
    row.appendChild(
      DOM.div(
        { className: "col-sm-8 field-value" },
        result.error ? String(result.error) : String(result.value)
      )
    )
    section.appendChild(row)
  })
  displayDiv.append(section)
}

function displayListAirline(airline, parentEl) {
  let el = document.createElement("option")
  el.text = airline
  el.value = airline
  parentEl.add(el)
}

function displayTx(id, results) {
  let displayDiv = DOM.elid(id)
  results.map((result) => {
    let row = displayDiv.appendChild(DOM.div({ className: "row" }))
    row.appendChild(
      DOM.div(
        { className: "col-sm-3 field" },
        result.error ? result.label + " Error" : result.label
      )
    )
    row.appendChild(
      DOM.div(
        { className: "col-sm-9 field-value" },
        result.error ? String(result.error) : String(result.value)
      )
    )
    displayDiv.appendChild(row)
  })
}

function displayFlight(id, results) {
  let displayDiv = DOM.elid(id)
  results.map((result) => {
    let row = displayDiv.appendChild(DOM.div({ className: "row" }))
    row.appendChild(
      DOM.div(
        { className: "field" },
        result.error ? result.label + " Error" : result.label
      )
    )
    row.appendChild(
      DOM.div(
        { className: " field-value" },
        result.error ? String(result.error) : String(result.value)
      )
    )
    displayDiv.appendChild(row)
  })
}

function displayBuy(id, results) {
  let displayDiv = DOM.elid(id)
  results.map((result) => {
    let row = displayDiv.appendChild(DOM.div({ className: "row" }))
    row.appendChild(
      DOM.div(
        { className: "field" },
        result.error ? result.label + " Error" : result.label
      )
    )
    row.appendChild(
      DOM.div(
        { className: " field-value" },
        result.error ? String(result.error) : String(result.value)
      )
    )
    displayDiv.appendChild(row)
  })
}

// function displayAirline(id, results) {
//   let displayDiv = DOM.elid(id)
//   results.map((result) => {
//     let row = displayDiv.appendChild(DOM.div({ className: "row" }))
//     row.appendChild(
//       DOM.div(
//         { className: "field" },
//         result.error ? result.label + " Error" : result.label
//       )
//     )
//     row.appendChild(
//       DOM.div(
//         { className: " field-value" },
//         result.error ? String(result.error) : String(result.value)
//       )
//     )
//     displayDiv.appendChild(row)
//   })
// }
