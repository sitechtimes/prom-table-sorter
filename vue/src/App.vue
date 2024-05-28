<template>
  <div class="leftDiv">
    <h1>Prom Sorter</h1>
    <ul>
      <li>Each row must be a separate group.</li>
      <li>Several names in one cell must be separated by a comma</li>
    </ul>
    <div class="form">
      <div class="fileUpload">
        <h2>1. Upload group Excel file</h2>
        <label class="uploadBtn" for="upload-file"><img src="/icons/fileUpload.png"></label>
        <input id="upload-file" class="btn" type="file" name="input-groups" ref="fileInput" accept=".xlsx" required />
      </div>

      <div class="dataFormat">
        <h2>2. Select data file format</h2>
        <div class="dataFormatContainer">
          <input class="checkbox" v-model="dataFormat" type="radio" id="rows-columns" value="rows-columns" checked />
          <label class="containerCheck" for="rows-columns">Each row has one person's name in each cell</label>
        </div>
        <!-- End of dataFormatContainer 1 div -->
        <div class="dataFormatContainer">
          <input v-model="dataFormat" class="checkbox" type="radio" id="single-cell-comma-seperated"
            value="single-cell-comma-seperated" />
          <label class="containerCheck" for="single-cell-comma-seperated">One cell per row has all of a group's names in
            it
          </label>
        </div>
        <!-- End of dataFormatContainer 2 div -->
      </div>
      <!-- End of dataFormat div -->
      <div for="cell-range">
        <h2>3. Select cell range</h2>

        <div v-if="searchAllCells" class="disabled rangeContainerFromto">
          <input disabled v-model="cellRange[0]" class="input-text cell-range" type="text" size="4" minlength="2"
            name="cell-range" required />
          :
          <input disabled v-model="cellRange[1]" class="input-text cell-range" type="text" size="4" minlength="2"
            name="cell-range" required />
        </div>

        <div class="rangeContainerFromto" v-else>
          <label for="cell-range">From: </label>
          <input v-model="cellRange[0]" class="input-text cell-range" type="text" size="4" minlength="2"
            name="cell-range" required placeholder="A1" />
          <label for="cell-range">To: </label>
          <input v-model="cellRange[1]" class="input-text cell-range" type="text" size="4" minlength="2"
            name="cell-range" required placeholder="B2" />
        </div>
        <!-- End of rangeContainerFromto div -->
        <div class="searchAllCells">
          <input type="radio" class="checkbox" name="search-all-cells" id="search-all-cells" v-model="searchAllCells"
            minlength="5" />
          <label for="search-all-cells">Search All Cells</label>
        </div>
        <!-- End of searchAllCells div -->
      </div>
      <!-- End of cellRange div -->
      <div for="seat-range">
          <h2>4. Define range of seats per table</h2>
        <div name="seat-range" class="rangeContainerMinmax">
          <label for="min-seats">Minimum:</label>
          <input v-model="minSeats" class="input-text" type="number" name="min-seats" min="0" step="1" required />
          <label for="max-seats">Maximum:</label>
          <input v-model="maxSeats" type="number" class="input-text" name="max-seats" min="1" step="1" required />
        </div>
      </div>
    </div>
    <!-- End of form div -->
  </div>
  <!-- End of left div -->
</template>

<script setup>
import { ref } from 'vue'
import ExcelJS from 'exceljs'
import { rangeSort, algoFunctionOptions, arrayLen2D } from './sortingAlgo.js'
import key from './components/key.vue'

const sortedTables = ref(null)
const minSeats = ref(null)
const maxSeats = ref(null)
const dataFormat = ref(null)
const fileInput = ref(null)
const downloadURL = ref(null)
const cellRange = ref([null, null])
const searchAllCells = ref(false)
let showKey = ref(false)
let showExample1 = ref(false)
let showExample2 = ref(false)

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

async function getGroups() {
  const uploadedFile = await fileInput.value.files[0].arrayBuffer()
  const importWorkbook = new ExcelJS.Workbook()
  await importWorkbook.xlsx.load(uploadedFile)
  const groupWorksheet = importWorkbook.worksheets[0]
  let allGroups = []
  const isCommaSeperated = dataFormat.value == 'single-cell-comma-seperated'
  if (searchAllCells.value == true) {
    groupWorksheet.eachRow((row) => {
      let individualGroup = []
      row.eachCell((cell) => {
        processRawStr(cell.value, individualGroup, isCommaSeperated)
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
      const row = groupWorksheet.getRow(rowIndex)
      let individualGroup = []
      for (
        let columnIndex = processedCellRange[0][0];
        columnIndex <= processedCellRange[1][0];
        columnIndex++
      ) {
        const cell = row.getCell(columnIndex)
        processRawStr(cell.value, individualGroup, isCommaSeperated)
      }
      allGroups.push(individualGroup)
    }
  }
  return allGroups
}

async function executeSort() {
  const guestGroups = await getGroups()
  // console.log(guestGroups)
  try {
    sortedTables.value = rangeSort(guestGroups, algoFunctionOptions, maxSeats.value, minSeats.value)
  } catch (error) {
    alert(error.message)
  }
  exportResultsAsXLSX()
}

async function exportResultsAsXLSX() {
  const exportWorkbook = new ExcelJS.Workbook()
  const sortedWorksheet = exportWorkbook.addWorksheet('Sorted Tables')
  sortedTables.value.forEach((table, rowIndex) => {
    const row = sortedWorksheet.getRow(rowIndex + 1)
    let cellIndex = 1
    table.occupants.forEach((group) => {
      for (let i = 0; i < group.length; i++) {
        const cell = row.getCell(cellIndex + i)
        cell.value = group[i].name
        if (group[i].name == 'guest name') {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'ccf52727' }
          }
        } else if (group[i].duplicate == true) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'ccf5bf27' }
          }
        }
      }
      cellIndex += group.length
    })
  })
  const buffer = await exportWorkbook.xlsx.writeBuffer()
  const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  const blob = new Blob([buffer], { type: fileType })
  downloadURL.value = URL.createObjectURL(blob)
}

function toggleKey() {
  let showKey = true
  console.log('showkey=' + showKey)
}
</script>


<style lang="css" scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900');
@import url('https://fonts.googleapis.com/css2?family=Hind+Madurai:wght@300;400;500;600;700&display=swap');

.leftDiv {
  display: flex;
  flex-direction: column;
  align-items: left;
  margin-left: 2rem;
  border: #bec5dc 4px solid;
  padding: 1.5rem;
}

h1 {
  font-family: 'Montserrat', sans-serif;
  font-size: 3rem;
  font-weight: bold;
  color: rgb(55, 43, 105);
}

h2 {
  font-family: 'Hind Madurai', sans-serif;
  font-size: 1.5rem;
}

label{
  font-family: 'Hind Madurai', sans-serif;
  font-size: 1.5rem;
}

ul {
  display: flex;
  flex-direction: column;
  align-items: left;
  font-family: 'Hind Madurai', sans-serif;
  font-size: 1.5rem;
}

.fileUpload {
  display: flex;
  flex-direction: row;
  align-items: center;

}

.uploadBtn {
  margin-top: 5px;
  padding-left: 0.5rem;
  border-radius: 5px;
  cursor: pointer;
}

#upload-file {
  display: none;
}

.dataFormat {
  display: flex;
  flex-direction: column;
  align-items: left;
}

.dataFormatContainer {
  display: flex;
  flex-direction: row;
  align-items: left;
}

</style>