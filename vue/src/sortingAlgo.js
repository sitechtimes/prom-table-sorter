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

function getTopSort(arr, sortFunc) {
  let currentTopIndex = 0
  for (let i = 1; i < arr.length; i++) {
    if (sortFunc(arr[i], arr[currentTopIndex]) < 0) currentTopIndex = i
  }
  return currentTopIndex
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
  groups.sort(groupSortFunc)

  for (let i = 0; i < groups.length; i++) {
    const topTableIndex = getTopSort(tableObjs, tableSortFunc)
    /* console.log(
      tableObjs[topTableIndex].unoccupiedSeats ==
        tableObjs.toSorted(tableSortFunc)[0].unoccupiedSeats
    ) */
    if (tableObjs[topTableIndex].unoccupiedSeats >= groups[i].length) {
      tableObjs[topTableIndex].occupants.push(groups[i])
      tableObjs[topTableIndex].unoccupiedSeats -= groups[i].length
    } else {
      // console.log("table configuration doesn't fit, moving to next algorithm");
      return null
    }
  }
  return tableObjs
}

function checkInputValidity(
  checkGroupArr,
  checkTableArr,
  largeToLargeAlgoObj,
  totalErrorMsg,
  individualErrorMsg
) {
  const tableSum = arraySum(checkTableArr)
  const guestSum = arrayLen2D(checkGroupArr)
  if (tableSum < guestSum) {
    throw Error(totalErrorMsg.replace('{tableSum}', tableSum).replace('{guestSum}', guestSum))
  }
  checkGroupArr.sort(largeToLargeAlgoObj.groupSort)
  checkTableArr.sort(largeToLargeAlgoObj.tableSort)
  if (checkGroupArr[0].length > checkTableArr[0]) {
    throw Error(
      individualErrorMsg
        .replace('{tableSeats}', checkTableArr[0])
        .replace('{groupGuests}', checkGroupArr[0].length)
    )
  }
}

function tagDuplicates(checkGroupArr) {
  /*   for (let x = 0; x < checkGroupArr.length; x++) {
    for (let y = 0; y < checkGroupArr[x].length; y++) {}
  } */
  let newGroupArr = []
  checkGroupArr.forEach((targetGroup) => {
    let newGroup = []
    targetGroup.forEach((targetName) => {
      let timesAppeared = 0
      for (let i = 0; i < checkGroupArr.length; i++) {
        for (let j = 0; j < checkGroupArr[i].length; j++) {
          if (targetName == checkGroupArr[i][j]) {
            timesAppeared++
            if (timesAppeared > 1) break
          }
        }
        if (timesAppeared > 1) break
      }

      timesAppeared > 1
        ? newGroup.push({ name: targetName, duplicate: true })
        : newGroup.push({ name: targetName, duplicate: false })
    })
    newGroupArr.push(newGroup)
  })
  return newGroupArr
}

// mainSort not fully tested; doesn't have handling of edge cases
function mainSort(mainGroups, mainTables, algoOptions) {
  checkInputValidity(
    mainGroups,
    mainTables,
    algoOptions[
      algoOptions.findIndex((e) => e.name == 'Largest Groups --> Largest Tables (First)')
    ],
    `ERROR:
      Too few tables: there are {tableSum} total table seats, but {guestSum} guests. Try increasing the number of tables.`,
    `ERROR:
      Tables too small: the largest table has {tableSeats} seats, but the largest group has {groupGuests} guests. Try increasing the number of table seats.`
  )

  const groupObjArr = tagDuplicates(mainGroups)

  let result = null
  for (let i = 0; i < algoOptions.length; i++) {
    result = sortTableSeats(
      groupObjArr,
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
    algoOptions[
      algoOptions.findIndex((e) => e.name == 'Largest Groups --> Largest Tables (First)')
    ],
    `INTENRAL ERROR:\n\nThis error was most likely caused by an internal issue with the code, and the error message associated with this error is most likely inapplicable. Below is that error message anyway:\n\nToo few tables: there are {tableSum} total table seats, but {guestSum} guests. Try increasing the number of tables.`,
    `ERROR:\n\nTables too small: the largest table has {tableSeats} seats, but the largest group has {groupGuests} guests. Try increasing the maximum number of seats per table.`
  )

  const groupObjArr = tagDuplicates(groupArr)

  let result = null
  const maxAdditionalTables = groupArr.length - tableArr.length
  for (let n = 0; n <= maxAdditionalTables; n++) {
    for (let i = 0; i < algoOptions.length; i++) {
      result = sortTableSeats(
        groupObjArr,
        tableArr,
        algoOptions[i].groupSort,
        algoOptions[i].tableSort
      )

      if (result != null) {
        let isValidResult = true
        // console.log(result);
        for (let tableIndex = 0; tableIndex < result.length; tableIndex++) {
          const currentSeats = arrayLen2D(result[tableIndex].occupants)
          // console.log(result[tableIndex]["occupants"].length);
          // console.log(currentSeats);
          // console.log(`Current seats: ${currentSeats}
          // Min seats: ${minSeats}`);
          if (minSeats > currentSeats) {
            isValidResult = false
            break
          }
        }
        if (isValidResult) return result
      }
    }
    tableArr.push(maxSeats)
  }
  if (!result) {
    throw Error(
      `ERROR:\n\nGroups cannot be sorted into tables with current settings. Try decreasing the minimum number of seats per table, or increasing the maximum number of seats per table.`
    )
  }
  return result
}

export { mainSort, rangeSort, arrayLen2D, algoFunctionOptions }
