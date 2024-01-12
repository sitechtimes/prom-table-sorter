const algoFunctionOptions = [
  {
    name: 'Largest Groups --> Largest Tables (First)',
    groupSort: function (a, b) {
      return b.length - a.length
    },
    tableSort: function (a, b) {
      return b.unoccupiedSeats - a.unoccupiedSeats
    }
  },
  {
    name: 'Largest Groups --> Smallest Tables (First)',
    groupSort: function (a, b) {
      return b.length - a.length
    },
    tableSort: function (a, b) {
      return a.unoccupiedSeats - b.unoccupiedSeats
    }
  },
  {
    name: 'Smallest Groups --> Smallest Tables (First)',
    groupSort: function (a, b) {
      return a.length - b.length
    },
    tableSort: function (a, b) {
      return a.unoccupiedSeats - b.unoccupiedSeats
    }
  }
]

function arraySum(arr) {
  let sum = 0
  for (let i = 0; i < arr.length; i++) sum += arr[i]
  return sum
}

function arrayLen2D(list2D) {
  let sum = 0
  for (let i = 0; i < list2D.length; i++) {
    sum += list2D[i].length
  }
  return sum
}

function sortTableSeats(groups, tables, groupSortFunc, tableSortFunc) {
  let tableObjs = []
  tables.forEach((table) => {
    tableObjs.push({
      capacity: table,
      unoccupiedSeats: table,
      occupants: []
    })
  })
  tableObjs.sort(tableSortFunc)
  groups.sort(groupSortFunc)

  for (let i = 0; i < groups.length; i++) {
    if (tableObjs[0].unoccupiedSeats >= groups[i].length) {
      tableObjs[0].occupants.push(groups[i])
      tableObjs[0].unoccupiedSeats -= groups[i].length
      tableObjs.sort(tableSortFunc)
    } else {
      console.log("table configuration doesn't fit, moving to next algorithm")
      return null
    }
  }
  return tableObjs
}

function checkInputValidity(checkGroupArr, checkTableArr, largeToLargeAlgoObj) {
  const tableSum = arraySum(checkTableArr)
  const guestSum = arrayLen2D(checkGroupArr)
  if (tableSum < guestSum)
    throw Error(`Too few table seats: there are ${tableSum} table seats, but ${guestSum} guests.`)

  checkGroupArr.sort(largeToLargeAlgoObj.groupSort)
  checkTableArr.sort(largeToLargeAlgoObj.tableSort)

  if (checkGroupArr[0].length > checkTableArr[0])
    throw Error(`Too few table seats: there are ${tableSum} table seats, but ${guestSum} guests.`)
}

function mainSort(mainGroups, mainTables, algoOptions) {
  checkInputValidity(
    mainGroups,
    mainTables,
    algoOptions.findIndex((e) => e.name == 'Largest Groups --> Largest Tables (First)')
  )

  let result = null
  for (let i = 0; i < algoOptions.length; i++) {
    result = sortTableSeats(
      mainGroups,
      mainTables,
      algoOptions[i].groupSort,
      algoOptions[i].tableSort
    )
    if (result != null) break
  }
  return result
}

function rangeSort(groupArr, algoOptions, maxSeats, minSeats = 0) {
  let tableArr = Array(Math.ceil(arrayLen2D(groupArr) / maxSeats)).fill(maxSeats)
  checkInputValidity(
    groupArr,
    tableArr,
    algoOptions.findIndex((e) => e.name == 'Largest Groups --> Largest Tables (First)')
  )

  let result = null
  for (let n = 0; n < 10; n++) {
    tableArr.push(maxSeats)
    for (let i = 0; i < algoOptions.length; i++) {
      result = sortTableSeats(
        groupArr,
        tableArr,
        algoOptions[i].groupSort,
        algoOptions[i].tableSort
      )

      if (result != null) {
        let test = true
        for (let tableIndex = 0; tableIndex < result.length; tableIndex++) {
          const currentSeats = result[tableIndex]['occupants']
          if (minSeats > currentSeats) test = false
          break
        }
        if (test) return result
      }
    }
  }
  return result
}

export { mainSort, rangeSort, arrayLen2D, algoFunctionOptions }
