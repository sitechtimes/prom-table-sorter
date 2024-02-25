<script setup>
import { ref } from 'vue'
import ExcelJS from 'exceljs'
import { rangeSort, algoFunctionOptions, arrayLen2D } from './sortingAlgo.js'

const sortedTables = ref(null)
const minSeats = ref(null)
const maxSeats = ref(null)
const dataFormat = ref(null)
const fileInput = ref(null)
const downloadURL = ref(null)
const cellRange = ref([null, null])
const searchAllCells = ref(false)


function calcCellRange(cellRange) {
  const errorMsg = "Invalid Cell Coordinates Inputted"
  const numArr = [('0', '1', '2', '3', '4', '5', '6', '7', '8', '9')]
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
  for (let i = 0; i < cellRange.length; i++) {
    const cell = cellRange[i].toLowerCase()
    let sliceIndex = 0
    for (let j = 0; j < cell.length; j++) {
      if (numArr.indexOf(cell[j]) > -1) {
        sliceIndex = j
        break
      }
    }
    const cellArr = ([cell.slice(0, sliceIndex), cell.slice(sliceIndex)])
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
    let base26Str = rangeArr[i][0].reverse()
    for (let j = 0; j < base26Str.length; j++) {
      sum += (letterArr.indexOf(base26Str[j]) * (26 ** j))
    }
    rangeArr[i][0] = sum
  }

  if (rangeArr[0][0] > rangeArr[1][0]) throw Error(`${errorMsg}: start cell's column greater than end cell's column`)
  if (rangeArr[0][1] > rangeArr[1][1]) throw Error(`${errorMsg}: start cell's row greater than end cell's row`)

  return rangeArr
  } catch (error) {
    alert(error)
  }
}

async function getGroups() {
  const uploadedFile = await fileInput.value.files[0].arrayBuffer()
  const importWorkbook = new ExcelJS.Workbook()
  await importWorkbook.xlsx.load(uploadedFile)
  const groupWorksheet = importWorkbook.worksheets[0]
  let allGroups = []
  if (searchAllCells == true) {
    groupWorksheet.eachRow((row) => {
      let individualGroup = []
      row.eachCell((cell) => {
        individualGroup.push(cell.value)
      })
      allGroups.push(individualGroup)
    })
  } else {
  }

  return allGroups
}

async function executeSort() {
  const guestGroups = await getGroups()
  console.log(guestGroups)
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
        console.log(cell, cellIndex)
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
</script>

<template>
  <h1>Prom Table Sorting App</h1>
  <br />
  <form>
    <label for="input-groups">Upload Group Excel File: </label>

    <input type="file" name="input-groups" ref="fileInput" accept=".xlsx" required />
    <br />
    <br />
    <label for="data-format">Input File Data Format:</label>
    <br />
    <input v-model="dataFormat" type="radio" id="rows-columns" value="rows-columns" checked />
    <label for="rows-columns"
      >Each row has one person's name in each cell, and each row is a seperate group.</label
    >
    <br />
    <input
      v-model="dataFormat"
      type="radio"
      id="single-cell-comma-seperated"
      value="single-cell-comma-seperated"
    />
    <label for="single-cell-comma-seperated"
      >One cell in each row has all of a group's names in it, with each name being seperated by a
      comma and each row being a seperate group.
      <span class="input-note">(Google Sheets)</span></label
    >
    <br />
    <br />
    <div v-if="searchAllCells" class="disabled">
      <label for="cell-range">Cell Range: </label>
      <input
        disabled
        v-model="cellRange[0]"
        type="text"
        size="1"
        minlength="2"
        name="cell-range"
        id="cell-range"
        required
      />
      :
      <input
        disabled
        v-model="cellRange[1]"
        type="text"
        size="1"
        minlength="2"
        name="cell-range"
        id="cell-range"
        required
      />
    </div>
    <div v-else>
      <label for="cell-range">Cell Range: </label>
      <input
        v-model="cellRange[0]"
        type="text"
        size="1"
        minlength="2"
        name="cell-range"
        id="cell-range"
        required
        placeholder="A1"
      />
      :
      <input
        v-model="cellRange[1]"
        type="text"
        size="1"
        minlength="2"
        name="cell-range"
        id="cell-range"
        required
        placeholder="B2"
      />
    </div>
    <input
      type="checkbox"
      name="search-all-cells"
      id="search-all-cells"
      v-model="searchAllCells"
      minlength="5"
    />
    <label for="search-all-cells">Search All Cells</label>
    <br />
    <br />
    <label for="min-seats">Minimum Number of Seats per Table: </label>
    <input v-model="minSeats" type="number" name="min-seats" min="0" step="1" required />
    <br />
    <label for="max-seats">Maximum Number of Seats per Table: </label>
    <input v-model="maxSeats" type="number" name="max-seats" min="1" step="1" required />
    <br />
    <button @click="executeSort">Sort</button>
  </form>

  <br />
  <br />
  <div v-if="sortedTables != null">
    <p>----------</p>
    <a v-if="downloadURL == null" disabled class="btn-link">Loading...</a>
    <a v-else :href="downloadURL" class="btn-link">Download Sorted Tables</a>
  </div>

  <br />
  <div class="table" v-for="table in sortedTables">
    <p class="text">{{ arrayLen2D(table.occupants) }}/{{ table.capacity }} Seats Occupied</p>
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
</template>

<style scoped>
.table {
  background-color: brown;
  padding: 0.5rem;
  margin: 0.5rem;
}

.group {
  background-color: bisque;
  padding: 0.5rem;
  margin: 0.5rem;
}

.person {
  background-color: cadetblue;
  padding: 0.5rem;
  margin: 0.5rem;
}

.text {
  color: wheat;
}

.input-note {
  font-style: italic;
}

.btn-link {
  font: 12.5px Arial;
  text-decoration: none;
  background-color: #e9e9ed;
  color: #000000;
  padding: 5px;
  border: 1px solid #8f8f9d;
  border-radius: 4.5px;
}
.btn-link:hover {
  background-color: #d0d0d7;
  border-color: #676774;
}

.btn-link:active {
  background-color: #b1b1b9;
  border-color: #484851;
}

.duplicate mark {
  background-color: #f5ca50;
}

.unnamed mark {
  background-color: #f55050;
}
.disabled {
  opacity: 60%;
}
</style>
