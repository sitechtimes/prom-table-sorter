import { mainSort, rangeSort, algoFunctionOptions } from './sortingAlgo.js'

const testCases = 10000

const nameList = []

for (let loops = 0; loops <= testCases; loops++) {
  let groupList = []
  const groupQuantity = Math.round(Math.random() * 20 + 5)
  for (let i = 0; i <= groupQuantity; i++) {
    let groupInstance = []
    const groupLength = Math.round(Math.random() * 13 + 2)
    for (let n = 0; n <= groupLength; n++) {
      groupInstance.push(nameList[Math.round(Math.random() * nameList.length)])
    }
    groupList.push(groupInstance)
  }
  console.log(rangeSort())
}
