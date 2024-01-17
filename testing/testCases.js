import { mainSort, rangeSort, algoFunctionOptions } from "./sortingAlgo.js";
import { nameList } from "./testData.js";

const testCases = 10000;

for (let loops = 1; loops <= testCases; loops++) {
  let groupList = [];
  const groupQuantity = Math.round(Math.random() * 20 + 5);
  for (let i = 0; i < groupQuantity; i++) {
    let groupInstance = [];
    const groupLength = Math.round(Math.random() * 13 + 2);
    for (let n = 0; n < groupLength; n++) {
      groupInstance.push(nameList[Math.round(Math.random() * nameList.length)]);
    }
    groupList.push(groupInstance);
  }

  const maxSeats = 15;
  const minSeats = Math.round(Math.random() * 6 + 4);

  /*   console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
  console.log(`
  Test Case: ${loops}
  Max Seats: ${maxSeats}
  Min Seats: ${minSeats}
  Groups (below):`);
  console.log(groupList);
  console.log("---result---"); */

  // console.log(rangeSort(groupList, algoFunctionOptions, maxSeats, minSeats));
  try {
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    console.log(`Test Case: ${loops}`);
    rangeSort(groupList, algoFunctionOptions, maxSeats, minSeats);
    console.log(`Status: Passed`);
  } catch (error) {
    console.log(`Status: Failed
  Max Seats: ${maxSeats}
  Min Seats: ${minSeats}
  Groups (below):`);
    console.log(groupList);
    console.log("---error message---");
    console.error(error);
    break;
  }
}
