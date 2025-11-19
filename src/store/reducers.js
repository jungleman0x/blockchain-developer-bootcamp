import { ethers } from 'ethers'

// ------------------------------
// PROVIDER REDUCER
// ------------------------------

export const provider = (state = {}, action) => {
  switch (action.type) {

    case 'PROVIDER_LOADED':
      return {
        ...state,
        connection: action.connection
      }

    case 'NETWORK_LOADED':
      return {
        ...state,
        chainId: action.chainId
      }

    case 'ACCOUNT_LOADED':
      return {
        ...state,
        account: action.account
      }

    case 'ETHER_BALANCE_LOADED':
      return {
        ...state,
        balance: action.balance
      }

    default:
      return state
  }
}



// ------------------------------
// TOKENS REDUCER
// ------------------------------

const DEFAULT_TOKENS_STATE = {
  loaded: false,
  contracts: [],
  symbols: [],
  balances: []     // 🔥 importantísimo: balances definidos
}

export const tokens = (state = DEFAULT_TOKENS_STATE, action) => {
  switch (action.type) {

    case 'TOKEN_1_LOADED':
      return {
        ...state,
        loaded: true,
        contracts: [action.token],
        symbols: [action.symbol]
      }

    case 'TOKEN_1_BALANCE_LOADED':
      return {
        ...state,
        balances: [action.balance, state.balances?.[1]]
      }

    case 'TOKEN_2_LOADED':
      return {
        ...state,
        loaded: true,
        contracts: [...state.contracts, action.token],
        symbols: [...state.symbols, action.symbol]
      }

    case 'TOKEN_2_BALANCE_LOADED':
      return {
        ...state,
        balances: [state.balances?.[0], action.balance]
      }

    default:
      return state
  }
}



// ------------------------------
// EXCHANGE REDUCER
// ------------------------------

const DEFAULT_EXCHANGE_STATE = {
  loaded: false,
  contract: {},
  transaction: {
    isSuccessful: false
  },
  allOrders: {
    loaded: false,
    data: []
  },
  events: []
}


export const exchange = (state = DEFAULT_EXCHANGE_STATE, action) => {
  let index, data
  switch (action.type) {

    case 'EXCHANGE_LOADED':
      return {
        ...state,
        loaded: true,
        contract: action.exchange
      }

    case 'EXCHANGE_TOKEN_1_BALANCE_LOADED':
      return {
        ...state,
        balances: [action.balance, state.balances?.[1]]
      }

    case 'EXCHANGE_TOKEN_2_BALANCE_LOADED':
      return {
        ...state,
        balances: [state.balances?.[0], action.balance]
      }


    // ---------------------------------------------------------
    // TRANSFER REQUEST (Deposit / Withdraw loading state)
    // ---------------------------------------------------------

    case 'TRANSFER_REQUEST':
      return {
        ...state,
        transaction: {
          transactionType: 'Transfer',
          isPending: true,
          isSuccessful: false,
          isError: false
        },
        transferInProgress: true
      }

    // ---------------------------------------------------------
    // TRANSFER SUCCESS
    // ---------------------------------------------------------

    case 'TRANSFER_SUCCESS':
      return {
        ...state,
        transaction: {
          transactionType: 'Transfer',
          isPending: false,
          isSuccessful: true,
          isError: false
        },
        transferInProgress: false,
        events: [action.event, ...state.events]
      }

    // ---------------------------------------------------------
    // TRANSFER FAIL
    // ---------------------------------------------------------

    case 'TRANSFER_FAIL':
      return {
        ...state,
        transaction: {
          transactionType: 'Transfer',
          isPending: false,
          isSuccessful: false,
          isError: true
        },
        transferInProgress: false
      }
    case 'NEW_ORDER_REQUEST':
      return {
        ...state,
        transaction: {
          transactionType: 'New Order',
          isPending: true,
          isSuccessful: false
        },
      }
    case 'NEW_ORDER_SUCCESS':
      index = state.allOrders.data.findIndex(order => order.id === action.orderId)
      
      
      if(index === -1) {
        data = [...state.allOrders.data, action.order]
      } else {
        data = state.allOrders.data
      }
      

      return {
        ...state,
        allOrders: {
          ...state.allOrders,
          data: [...state.allOrders.data, action.order]   // agrega el nuevo order
        },

        transaction: {
          transactionType: 'New Order',
          isPending: false,
          isSuccessful: true
        }
      }

    case 'NEW_ORDER_FAIL':
      return {
        ...state,
          transaction: {
            transactionType: 'New Order',
            isPending: false,
            isSuccesful: false,
            isError: true
          }
      }
    default:
      return state
  }
}
