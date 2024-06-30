function trySwap(newItems, position, t) {
    if (newItems[t] === null) {
      const temp = newItems[position]
      newItems[position] = newItems[t]
      newItems[t] = temp
    }
  }
  
  function arraysEqual(a, b) {
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return false
      }
    }
    return true
  }
  
  const CORRECT = ['1', '2', '3', '4', '5', '6', '7', '8','9','10','11','12','13','14','15', null]
  
  function reducer(state, action) {
    switch (action.type) {
      case 'move': {
        const position = action.payload
        const newItems = [...state.items]
        const col = position % 4
  
        if (position < 16) {
          trySwap(newItems, position, position + 4)
        }
        if (position > 2) {
          trySwap(newItems, position, position - 4)
        }
        if (col < 3) {
          trySwap(newItems, position, position + 1)
        }
        
        if (col > 0) {
          trySwap(newItems, position, position - 1)
        }
  
        return {
          ...state,
          items: newItems,
          complete: arraysEqual(newItems, CORRECT),
        }
      }
      case 'shuffle': {
        let newState = { ...state }
        do {
          for (let i = 0; i < 300; i++) {
            newState = reducer(
              { ...newState },
              {
                type: 'move',
                payload: Math.floor(Math.random() * 16),
              }
            )
          }
        } while (newState.complete)
        return newState
      }
      case 'reset': {
        return {
          ...state,
          items: [...CORRECT],
          complete: true,
        }
      }
      default: {
        throw new Error('Unknown action: ' + action.type)
      }
    }
  }
  
  export default reducer