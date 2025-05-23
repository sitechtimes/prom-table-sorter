<script setup>
import { ref, reactive } from 'vue'
import ExcelJS from 'exceljs'
import { rangeSort, algoFunctionOptions, arrayLen2D } from './sortingAlgo.js'
import key from './components/key.vue'

const sortedTables = ref(null)
const minSeats = ref(null)
const maxSeats = ref(null)
const dataFormat = ref(null)
const uploadedGroupFile = ref(null)
const uploadedPaidFile = ref(null)
const downloadGroupExcelFileURL = ref(null)
const downloadComparisonExcelFileURL = ref(null)
const cellRange = ref([null, null])
const searchAllCells = ref(false)
const validDataFormat = ref(true)
let hasNotPaid = reactive([])
let hasNoSeat = reactive([])
let showKey = ref(false)
let showComparisonWindow = ref(false)
let showExample1 = ref(false)
let showExample2 = ref(false)
let showExample3 = ref(false)
let showpaidExample = ref(false)

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

function processRawStr(rawStr, targetArr, dataFormat) {
  if (rawStr != null) {
    if (dataFormat == 'single-cell-comma-seperated')
      rawStr.split(',').forEach((e) => {
        const processedStr = e.trim()
        if (processedStr.length > 0) targetArr.push({ name: processedStr })
      })
    else if (dataFormat == 'rows-columns-with-id') {
      const processedStr = typeof rawStr == 'string' ? rawStr.trim() : rawStr
      if (typeof processedStr == 'number') {
        targetArr[targetArr.length - 1].id = processedStr
      } else if (processedStr.length > 0 && processedStr != 'Yes' && processedStr != 'No') {
        targetArr.push({ name: processedStr })
      }
    } else {
      const processedStr = rawStr.trim()
      if (processedStr.length > 0) targetArr.push({ name: processedStr })
    }
  }
}

function toggleDataFormat() {
  validDataFormat.value = !validDataFormat.value
}

async function compareSeatAndPay(guestGroups) {
  const workbook = new ExcelJS.Workbook()
  const paidWorkbook = new ExcelJS.Workbook()
  const uploadedFile = await uploadedGroupFile.value.files[0].arrayBuffer()
  await workbook.xlsx.load(uploadedFile)
  const paidFile = await uploadedPaidFile.value.files[0].arrayBuffer()
  await paidWorkbook.xlsx.load(paidFile)
  const paid = []

  for (let i = 1; i <= paidWorkbook.worksheets[0].actualRowCount; i++) {
    const newPaidObject = {
      name: paidWorkbook.worksheets[0].getCell(`A${i}`).value,
      id: paidWorkbook.worksheets[0].getCell(`B${i}`).value
    }
    paid.push(newPaidObject)
  }
  const attending = guestGroups.flat()
  hasNotPaid = attending.filter((person) => !paid.map((person) => person.id).includes(person.id))
  hasNoSeat = paid.filter((person) => !attending.map((person) => person.id).includes(person.id))
}

async function getGroups() {
  const uploadedFile = await uploadedGroupFile.value.files[0].arrayBuffer()
  const importWorkbook = new ExcelJS.Workbook()
  await importWorkbook.xlsx.load(uploadedFile)
  const groupWorksheet = importWorkbook.worksheets[0]
  let allGroups = []
  if (searchAllCells.value == true) {
    groupWorksheet.eachRow((row) => {
      let individualGroup = []
      row.eachCell((cell) => {
        processRawStr(cell.value, individualGroup, dataFormat.value)
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
        processRawStr(cell.value, individualGroup, dataFormat.value)
      }
      allGroups.push(individualGroup)
    }
  }
  return allGroups
}

async function executeSort() {
  const guestGroups = await getGroups()
  try {
    sortedTables.value = rangeSort(
      guestGroups,
      algoFunctionOptions,
      maxSeats.value,
      minSeats.value,
      dataFormat.value == 'rows-columns-with-id'
    )
    exportResultsAsXLSX()
    compareSeatAndPay(guestGroups).then(() => {
      exportComparisonsAsXLSX()
    })
  } catch (error) {
    alert(error.message)
  }
}

async function exportComparisonsAsXLSX() {
  const exportWorkbook = new ExcelJS.Workbook()
  const sortedWorksheet = exportWorkbook.addWorksheet('Comparison Worksheet')
  sortedWorksheet.mergeCells('A1:B1')
  sortedWorksheet.getCell('A1').value = 'Has a seat but did not pay'
  sortedWorksheet.getCell('A2').value = 'Name'
  sortedWorksheet.getCell('B2').value = 'Cell'

  sortedWorksheet.mergeCells('D1:E1')
  sortedWorksheet.getCell('D1').value = 'Has paid but does not have a seat'
  sortedWorksheet.getCell('D2').value = 'Name'
  sortedWorksheet.getCell('E2').value = 'Cell'

  for(let i=0; i<hasNotPaid.length; i++){ 
      sortedWorksheet.getRow(i+3).getCell(1).value = hasNotPaid[i].name
      sortedWorksheet.getRow(i+3).getCell(2).value = hasNotPaid[i].id
  }
  
  
  for(let i=0; i <hasNoSeat.length; i++){
    sortedWorksheet.getRow(i+3).getCell(4).value = hasNoSeat[i].name
    sortedWorksheet.getRow(i+3).getCell(5).value = hasNoSeat[i].id
  }

  const buffer = await exportWorkbook.xlsx.writeBuffer()
  const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  const blob = new Blob([buffer], { type: fileType })
  downloadComparisonExcelFileURL.value = URL.createObjectURL(blob)
}

//xlsx
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
  downloadGroupExcelFileURL.value = URL.createObjectURL(blob)
}
</script>

<template>
  <div class="body">
    <div class="header">
      <h1>Prom Table Sorter</h1>
      <div class="line"></div>
    </div>

    <div class="main">
      <div class="leftDiv">
        <div v-if="showExample1" class="ex example1">
          <img
            src="/public/rows-columns-info.png"
            alt="Example image of several names in one cell each, filling multiple rows and cells per row"
          />
          <img
            @click="showExample1 = !showExample1"
            class="closeIcon"
            src="/public/close.png"
            alt="x to close webpage"
          />
        </div>
        <div v-if="showExample2" class="ex example2">
          <img
            src="/public/single-cell-comma-seperated-info.png"
            alt="Example image of several names in one cell separated by a comma for reference"
          />
          <img
            @click="showExample2 = !showExample2"
            class="closeIcon"
            src="/public/close.png"
            alt="x to close webpage"
          />
        </div>
        <div v-if="showExample3" class="ex example3">
          <img
            src="/public/placeholder.png"
            alt="Example image of several names and IDs in one cell each, filling multiple rows and cells per row"
          />
          <img
            @click="showExample3 = !showExample3"
            class="closeIcon"
            src="/public/close.png"
            alt="x to close webpage"
          />
        </div>
        <div class="notes">
          <h2>Please Note:</h2>
          <ul>
            <li>Each row must be a separate group</li>
            <li>Several names in one cell must be separated by a comma</li>
          </ul>
        </div>
        <!-- End of notes div -->
        <div class="form">
          <div class="fileUpload">
            <h3>1. Upload group Excel file</h3>
            <label class="uploadBtn" for="upload-file"><img src="/icons/fileUpload.png" /></label>
            <input
              id="upload-file"
              class="upload-btn"
              type="file"
              name="input-groups"
              ref="uploadedGroupFile"
              accept=".xlsx"
              required
            />
          </div>

          <div v-if="showpaidExample" class="ex example1">
            <p>Names should be in Column A while IDs should be in Column B</p>
            <img
              src="/public/paidExample.png"
              alt="Example image of several names in one cell each, filling multiple rows and cells per row"
            />
            <img
              @click="showpaidExample = !showpaidExample"
              class="closeIcon"
              src="/public/close.png"
              alt="x to close webpage"
            />
          </div>
          <div class="fileUpload">
            <h3>Upload Excel file of those who paid</h3>
            <label class="uploadBtn" for="upload-file2"><img src="/icons/fileUpload.png" /></label>
            <input
              id="upload-file2"
              class="upload-btn"
              type="file"
              name="input-groups"
              ref="uploadedPaidFile"
              accept=".xlsx"
              @change="toggleDataFormat()"
            />

            <img
              class="example"
              @click="showpaidExample = !showpaidExample"
              src="/icons/hint.png"
            />
          </div>

          <div class="dataFormat">
            <h3>2. Select data file format</h3>
            <div class="dataFormatContainer">
              <input
                v-if="validDataFormat"
                class="checkbox"
                v-model="dataFormat"
                type="radio"
                id="rows-columns"
                value="rows-columns"
                checked
              />
              <input
                v-else
                class="checkbox"
                v-model="dataFormat"
                type="radio"
                id="rows-columns"
                value="rows-columns"
                checked
                disabled
              />
              <label class="containerCheck" for="rows-columns"
                >Each row has one person's name in each cell</label
              >
              <img class="example" @click="showExample1 = !showExample1" src="/icons/hint.png" />
            </div>
            <!-- End of dataFormatContainer 1 div -->
            <div class="dataFormatContainer">
              <input
                v-if="validDataFormat"
                v-model="dataFormat"
                class="checkbox"
                type="radio"
                id="single-cell-comma-seperated"
                value="single-cell-comma-seperated"
              />
              <input
                v-else
                v-model="dataFormat"
                class="checkbox"
                type="radio"
                id="single-cell-comma-seperated"
                value="single-cell-comma-seperated"
                disabled
              />
              <label class="containerCheck" for="single-cell-comma-seperated"
                >One cell per row has all of a group's names in it
              </label>
              <img class="example" @click="showExample2 = !showExample2" src="/icons/hint.png" />
            </div>
            <!-- End of dataFormatContainer 2 div -->
            <div class="dataFormatContainer">
              <input
                v-model="dataFormat"
                class="checkbox"
                type="radio"
                id="rows-columns-with-id"
                value="rows-columns-with-id"
              />
              <label class="containerCheck" for="rows-columns-with-id"
                >Each row has one person's name in a cell and the person's id in the next cell for
                each person in the group
              </label>
              <img class="example" @click="showExample3 = !showExample3" src="/icons/hint.png" />
            </div>
            <!-- End of dataFormatContainer 3 div -->
          </div>
          <!-- End of dataFormat div -->
          <div for="cell-range">
            <h3>3. Select cell range</h3>

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
            <!-- End of rangeContainerFromto div -->
            <div class="searchAllCells">
              <input
                type="radio"
                class="checkbox"
                name="search-all-cells"
                id="search-all-cells"
                v-model="searchAllCells"
                minlength="5"
              />
              <label for="search-all-cells">Search All Cells</label>
            </div>
            <!-- End of searchAllCells div -->
          </div>
          <!-- End of cellRange div -->
          <div for="seat-range">
            <h3>4. Define range of seats per table</h3>
            <div name="seat-range" class="rangeContainerMinmax">
              <label for="min-seats">Minimum:</label>
              <input
                v-model="minSeats"
                class="input-text"
                type="number"
                name="min-seats"
                min="0"
                step="1"
                required
              />
              <label for="max-seats">Maximum:</label>
              <input
                v-model="maxSeats"
                type="number"
                class="input-text"
                name="max-seats"
                min="1"
                step="1"
                required
              />
            </div>
          </div>
          <!-- End of seatRange div -->
          <button @click="executeSort" class="btn" id="sortBtn">Sort</button>
        </div>
        <!-- End of form div -->
      </div>
      <!-- End of left div -->
      <div class="rightDiv">
        <div id="navBar">
          <h2>Generated Tables</h2>
          <button class="keyBtn" @click="showKey = !showKey">Key</button>
          <div v-if="showKey" class="key">
            <key></key>
            <img
              @click="showKey = !showKey"
              class="closeIcon"
              src="/public/close.png"
              alt="x to close webpage"
            />
          </div>

          <button class="keyBtn" @click="showComparisonWindow = !showComparisonWindow">
            Comparison
          </button>
          <div v-if="showComparisonWindow" class="key" id="comparisonWindow">
            <div>
              <h3>Sort the Tables, and then click to Download Comparison Excel Sheet</h3>
              <div v-if="sortedTables != null">
                <a v-if="downloadComparisonExcelFileURL == null" disabled class="btn">Loading...</a>
                <a v-else :href="downloadComparisonExcelFileURL" class="downloadBtn btn"
                  >Download Comparison</a
                >
                <div class="comparisonList" v-if="sortedTables != null">
                  <h4>Has a seat, but no payment</h4>
                  <li v-for="person in hasNotPaid">{{ person.name }} ({{ person.id }})</li>
                  <h4>Has paid, but no seat</h4>
                  <li v-for="student in hasNoSeat">{{ student.name }} ({{ student.id }})</li>
                </div>
              </div>
            </div>
            <img
              @click="showComparisonWindow = !showComparisonWindow"
              class="closeIcon"
              src="/public/close.png"
              alt="x to close webpage"
            />
          </div>

          <div v-if="sortedTables != null">
            <a v-if="downloadGroupExcelFileURL == null" disabled class="btn">Loading...</a>
            <a v-else :href="downloadGroupExcelFileURL" class="downloadBtn btn"
              >Download Sorted Tables</a
            >
          </div>
        </div>

        <div id="tables">
          <div class="table" v-for="table in sortedTables">
            <div class="tableHeaderContainer">
              <h4 class="tableHeader">Table {{ table.index }}</h4>
              <h5 class="text occupiedSeats">
                {{ arrayLen2D(table.occupants) }}/{{ table.capacity }} Seats Occupied
              </h5>
            </div>
            <div class="groupsInTable">
              <div class="group" v-for="group in table.occupants">
                <div v-for="person in group">
                  <p v-if="person.name == 'guest name'" class="person unnamed">
                    <mark>{{ person.name }}</mark>
                  </p>
                  <p v-else-if="person.duplicate == true" class="person duplicate">
                    <mark>{{ person.name }}</mark>
                  </p>
                  <p v-else class="person">{{ person.name }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,100..900;1,100..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');

.main {
  color: #372b69;
  display: flex;
  flex-direction: row;
}

.header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-left: 2rem;
  margin-bottom: 1rem;
}

.line {
  height: 0.2rem;
  width: 70vw;
  margin-left: 1rem;
  background-color: #372b69;
}

.leftDiv {
  display: flex;
  flex-direction: column;
  align-items: left;
  margin-left: 2rem;
  padding: 1.5rem;
  height: 90vh;
  width: 45vw;
}

.rightDiv {
  display: flex;
  flex-direction: column;
  align-items: left;
  margin-left: 2rem;
  border: #372b69 0.2rem solid;
  padding: 1.5rem;
  height: 80vh;
  width: 45vw;
  overflow-y: scroll;
}

.upload-btn {
  display: none;
}

.searchAllCells {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 1rem;
}

h1 {
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: 4rem;
  font-weight: bold;
  color: #372b69;
}

h2 {
  font-family:
    Noto Sans,
    sans-serif;
  font-size: 1.75rem;
  color: #372b69;
  font-weight: 600;
}

h3 {
  font-family:
    Noto Sans,
    sans-serif;
  font-size: 1.75rem;
  color: #372b69;
  font-weight: 600;
  line-height: 1.4;
  margin-top: 2.3125rem;
}

label {
  font-family:
    Noto Sans,
    sans-serif;
  font-size: 1.5rem;
}

ul {
  display: flex;
  flex-direction: column;
  align-items: left;
  font-family:
    Noto Sans,
    sans-serif;
  font-size: 1.5rem;
}

#sortBtn {
  font-size: 1.5rem;
  font-family:
    playfair display,
    serif;
  font-style: italic;
  padding: 5px;
  background-color: #372b69;
  border-radius: 0;
  margin-top: 2rem;
  transition:
    background-color 0.3s ease,
    transform 0.2s ease;
  text-align: center;
}

#sortBtn:hover {
  background-color: #5e4c9b;
  transition-delay: 0.1s;
}

#sortBtn:active {
  transform: scale(1.25);
}

input[type='radio'] {
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid #372b69;
  border-radius: 50%;
}

.fileUpload {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.fileUpload img {
  width: 2rem;
  height: 2rem;
  margin-top: 2rem;
}

img:hover {
  transition: transform 0.2s ease;
  transform: scale(1.1);
}

.uploadBtn {
  margin-top: 5px;
  padding-left: 0.5rem;
  border-radius: 5px;
  cursor: pointer;
}

.dataFormat {
  display: flex;
  flex-direction: column;
  align-items: left;
}

.dataFormatContainer {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: left;
  margin-top: 1rem;
}

.dataFormatContainer input[type='radio'] {
  margin-right: 0.5rem;
}

.example {
  background-color: transparent;
  border: none;
  width: 2rem;
  margin-left: 1rem;
}

.input-text {
  font-family:
    Noto Sans,
    sans-serif;
  font-size: 1rem;
  padding: 0.5rem;
  margin-left: 0.5rem;
  margin-right: 1rem;
  border: 1px solid #bec5dc;
  border-radius: 5px;
  width: 1rem;
}

.cell-range {
  width: 3rem;
  text-align: center;
}

.rangeContainerFromto,
.rangeContainerMinmax {
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
}

.rangeContainerFromto label,
.rangeContainerMinmax label {
  margin-right: 0.5rem;
}

.rangeContainerMinmax .input-text {
  width: 50px;
}

.checkbox {
  margin-right: 0.5rem;
}

.disabled {
  opacity: 0.6;
}

.navBar {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.keyBtn {
  transition:
    background-color 0.3s ease,
    transform 0.2s ease;
  color: #372b69;
  border: #372b69 solid;
  text-align: center;
  width: 8rem;
  text-align: center;
}

#comparisonWindow {
  overflow: scroll;
  height: 30rem;
}
</style>
