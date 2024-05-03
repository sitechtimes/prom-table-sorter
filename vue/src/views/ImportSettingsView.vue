<script scoped>
import { ref, defineProps } from 'vue'
defineProps({
  spreadsheetData: Array
})

const dataFormat = ref(null)
const cellRange = ref([null, null])
const searchAllCells = ref(false)

function calcCellRange(inputCellRange) {
  const errorMsg = 'Invalid Cell Coordinates Inputted'
  const numArr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  const letterArr = [
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z'
  ]
  try {
    let rangeArr = []
    for (let i = 0; i < inputCellRange.length; i++) {
      const cell = inputCellRange[i].toLowerCase()
      let sliceIndex = 0
      for (let j = 0; j < cell.length; j++) {
        if (numArr.indexOf(cell[j]) > -1) {
          sliceIndex = j
          break
        }
      }
      const cellArr = [cell.slice(0, sliceIndex), cell.slice(sliceIndex)]
      if (cellArr[0].length == 0) throw Error(errorMsg)
      for (let j = 0; j < cellArr[0].length; j++) {
        if (letterArr.indexOf(cellArr[0][j]) == -1) throw Error(errorMsg)
      }
      if (cellArr[1].length == 0) throw Error(errorMsg)
      for (let j = 0; j < cellArr[1].length; j++) {
        if (numArr.indexOf(cellArr[1][j]) == -1) throw Error(errorMsg)
      }
      rangeArr.push(cellArr)
    }

    // format: let rangeArr = [["A", 12], ["BA", 18]]
    for (let i = 0; i < rangeArr.length; i++) {
      rangeArr[i][1] = Number(rangeArr[i][1])
      let sum = 0
      const base26Str = rangeArr[i][0].split('').reverse()
      for (let j = 0; j < base26Str.length; j++) {
        sum += (letterArr.indexOf(base26Str[j]) + 1) * 26 ** j
      }
      rangeArr[i][0] = sum
    }
    if (rangeArr[0][0] > rangeArr[1][0])
      throw Error(`${errorMsg}: start cell's column greater than end cell's column`)
    if (rangeArr[0][1] > rangeArr[1][1])
      throw Error(`${errorMsg}: start cell's row greater than end cell's row`)
    return rangeArr
  } catch (error) {
    alert(error)
  }
}

function processRawStr(rawStr, targetArr, valuesCommaSeperated) {
  if (rawStr != null) {
    if (valuesCommaSeperated == true)
      rawStr.split(',').forEach((e) => {
        const processedStr = e.trim()
        if (processedStr.length > 0) targetArr.push(processedStr)
      })
    else {
      const processedStr = rawStr.trim()
      if (processedStr.length > 0) targetArr.push(processedStr)
    }
  }
}

function processGroups(rawGroupData) {
  let allGroups = []
  const isCommaSeperated = dataFormat.value == 'single-cell-comma-seperated'
  if (searchAllCells.value == true) {
    rawGroupData.forEach((row) => {
      let individualGroup = []
      row.forEach((cell) => {
        processRawStr(cell, individualGroup, isCommaSeperated)
      })
      allGroups.push(individualGroup)
    })
  } else {
    const processedCellRange = calcCellRange(cellRange.value) // format: [[3, 12], [10, 18]]
    for (
      let rowIndex = processedCellRange[0][1];
      rowIndex <= processedCellRange[1][1];
      rowIndex++
    ) {
      const row = rawGroupData[rowIndex]
      let individualGroup = []
      for (
        let columnIndex = processedCellRange[0][0];
        columnIndex <= processedCellRange[1][0];
        columnIndex++
      ) {
        const cell = row[columnIndex]
        processRawStr(cell, individualGroup, isCommaSeperated)
      }
      allGroups.push(individualGroup)
    }
  }
  return allGroups
}
</script>

<template>
  <h1>Prom Sorter</h1>
  <h2>Select file data format and cell range</h2>
  <label for="data-format"><h3>2. Select data file format:</h3></label>
  <div class="dataFormatContainer">
    <input
      class="checkbox"
      v-model="dataFormat"
      type="radio"
      id="rows-columns"
      value="rows-columns"
      checked
    />

    <label class="containerCheck" for="rows-columns"
      >Each row has one person's name in each cell</label
    >
  </div>
  <div class="dataFormatContainer">
    <input
      v-model="dataFormat"
      class="checkbox"
      type="radio"
      id="single-cell-comma-seperated"
      value="single-cell-comma-seperated"
    />

    <label class="containerCheck" for="single-cell-comma-seperated"
      >One cell per row has all of a group's names in it
      <span class="input-note">(Google Sheets)</span></label
    >
  </div>
  <label class="dataFormatContainer" for=""
    >• Several names in one cell must be separated by a comma</label
  >
  <label for="cell-range"><h3>3. Select data file format:</h3></label>
  <div class="containerSearchCells">
    <div v-if="searchAllCells" class="disabled rangeContainerFromto">
      <input
        disabled
        v-model="cellRange[0]"
        class="input-text cell-range"
        type="text"
        size="4"
        minlength="2"
        name="cell-range"
        required
      />
      :
      <input
        disabled
        v-model="cellRange[1]"
        class="input-text cell-range"
        type="text"
        size="4"
        minlength="2"
        name="cell-range"
        required
      />
    </div>
    <div class="rangeContainerFromto" v-else>
      <label for="cell-range">From: </label>
      <input
        v-model="cellRange[0]"
        class="input-text cell-range"
        type="text"
        size="4"
        minlength="2"
        name="cell-range"
        required
        placeholder="A1"
      />
      <label for="cell-range">To: </label>
      <input
        v-model="cellRange[1]"
        class="input-text cell-range"
        type="text"
        size="4"
        minlength="2"
        name="cell-range"
        required
        placeholder="B2"
      />
    </div>
    <div class="searchAllCells">
      <input
        type="checkbox"
        class="checkbox"
        name="search-all-cells"
        id="search-all-cells"
        v-model="searchAllCells"
        minlength="5"
      />
      <label for="search-all-cells">Search All Cells</label>
    </div>
  </div>
</template>

<style scoped></style>
