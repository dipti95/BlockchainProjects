pragma solidity ^0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;       
                                 // Blocks all state changes throughout the contract if false

    struct Airline{
        bool isRegistered;
        bool funded;
        string name;
    }

    

    mapping(address => Airline) airlines;
    address[] private airlinesRegisteredAddresses;
    mapping(address => uint8) authorizedContracts;
    uint256 constant fundAmtRequired = 10 ether;

    struct Flight {
        bool isRegistered;
        uint8 statusCode;
        uint256 timestamp;        
        address airline;
        string flightName;
    }
    mapping(bytes32 => Flight) private flights;

    struct Insurance{
        bool isInsured;
        bytes32 flightKey;
        uint256 insurancePrice;
    }

    mapping(uint => Insurance) insurances;
    mapping(address => uint[]) passengerInsurances;

    struct Passenger{
        address passengerAddress;
        mapping (bytes32 => uint256) insuredFlights;
        uint256 credit;
    }
    mapping(address => Passenger) private passengers;
    address[] public passengerAddresses;

   
    
    
    uint256 public count =0;
    uint256 totalInsuredAmt = 0;




    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/


    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor
                                (
                                    
                                ) 
                                public 
    {
        contractOwner = msg.sender;
        airlines[msg.sender] =  Airline({
            isRegistered: true,
            funded :false,
            name: 'Delta'
        });
        airlinesRegisteredAddresses.push(msg.sender);
        passengerAddresses = new address[](0);
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in 
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational() 
    {
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }
    

    modifier requireCallerAuthorized()
    {
        require(authorizedContracts[msg.sender] == 1, "Caller is not authorized");
        _;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */      
    function isOperational() 
                            public 
                            view 
                            returns(bool) 
    {
        return operational;
    }


    function isAirline
                            (
                                address _address
                            )
                            external
                            view
                            returns(bool)
    {
        return airlines[_address].isRegistered;
    }

    function authorizeCaller( address contractAddress)
    external
    requireContractOwner
    {
        authorizedContracts[contractAddress] = 1;
    }


    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */    
    function setOperatingStatus
                            (
                                bool mode
                            ) 
                            external
                            requireContractOwner 
    {
        operational = mode;
    }

    function airlineName(address airline)
    external
    view
    returns(string)
    {
        return airlines[airline].name;
    }

     function isAirlineRegistered (address airlineAddress) 
     external 
     view 
     returns(bool)
    {
        return airlines[airlineAddress].isRegistered;
    }

    function isAirlineFunded(address airlineAddress)
     external 
     view 
     returns(bool)
     {
        return airlines[airlineAddress].funded;
    }

    function isFlightRegistered(bytes32 flightKey)
    external
    view 
    returns(bool)
    {
        return flights[flightKey].isRegistered;
    }

    function noOfRegisteredAirlines()
    public 
    view 
    requireIsOperational 
    returns (uint num) 
    {
        return airlinesRegisteredAddresses.length;
    }

      function getPassengerCredit
                            (
                                address insuredPassenger
                            )
                            external
                            view
                            returns(uint256)
    {
        return passengers[insuredPassenger].credit;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */   
    function registerAirline
                            ( 
                                address newAirlineAddress,
                                string name   
                            )
                            external
                           requireIsOperational
    {
        airlines[newAirlineAddress] = Airline({
            isRegistered: true,
            funded :false,
            name: name
        });
        airlinesRegisteredAddresses.push(newAirlineAddress);
    }


    function getRegisteredAirlines() 
    requireIsOperational 
    public 
    view 
    returns(address[])
    {
        return airlinesRegisteredAddresses;
    }

    function registerFlight
                                (
                                    address airlineAddress,
                                    string flightName,
                                    uint256 timestamp
                                )
                            
                                requireIsOperational
                                external
    {
        bytes32 flightKey = keccak256(abi.encodePacked( airlineAddress, flightName, timestamp));
        flights[flightKey] = Flight({
            isRegistered: true, 
            flightName:flightName, 
            statusCode: 0, 
            timestamp: timestamp, 
            airline: airlineAddress
            });
    }





    


   /**
    * @dev Buy insurance for a flight
    *
    */   
    

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */

    function buy
                            (      
                                bytes32 flightKey,
                                address passengerAddress,
                                uint256 insuredAmount                        
                            )
                            external
                            payable
                            requireIsOperational
    {
        if (passengers[passengerAddress].passengerAddress != address(0)) { 
            require(passengers[passengerAddress].insuredFlights[flightKey] == 0, "This flight is already insured");
            
        } else { 
            passengers[passengerAddress] = Passenger({
                passengerAddress: passengerAddress,
                credit: 0
            });
            passengerAddresses.push(passengerAddress);
        }
        passengers[passengerAddress].insuredFlights[flightKey] = insuredAmount;
        totalInsuredAmt = totalInsuredAmt.add(insuredAmount); 
    }

    function creditInsurees
                                (
                                    bytes32 flightKey
                                )
                                external
                                requireIsOperational
    {
        for (uint256 i = 0; i < passengerAddresses.length; i++) {
            if(passengers[passengerAddresses[i]].insuredFlights[flightKey] != 0) {
                uint256 payedPrice = passengers[passengerAddresses[i]].insuredFlights[flightKey];
                uint256 credit = passengers[passengerAddresses[i]].credit;
                passengers[passengerAddresses[i]].insuredFlights[flightKey] = 0;
                passengers[passengerAddresses[i]].credit = credit + payedPrice + payedPrice.div(2); 
               
            }
        }
    }

    function pay
                            (
                                address insuredPassenger
                            )
                            external
                            payable
                            requireIsOperational
    {
        
        require(passengers[insuredPassenger].passengerAddress != address(0), "Not insured");
        require(passengers[insuredPassenger].credit > 0, " No credit pending");
        uint256 credit = passengers[insuredPassenger].credit;
        
        passengers[insuredPassenger].credit = 0;
        insuredPassenger.transfer(credit);
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */

    

      function fund
                            (   
                                address airline,
                                uint amt
                            )
                            public
                            payable
                            requireIsOperational
    {
       
        require(airlines[airline].isRegistered, 'Airline is not registered');
        airlines[airline].funded = true;
    }
    

    function getFlightKey(address airline,string memory flight, uint256 timestamp)
     pure
     internal
     returns(bytes32) 
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }



    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    // function() 
    //                         external 
    //                         payable 
    // {
    //     fund();
    // }


}

