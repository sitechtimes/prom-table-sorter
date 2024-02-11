<script setup>
import { ref } from 'vue'
import ExcelJS from 'exceljs'
import { rangeSort, algoFunctionOptions, arrayLen2D } from './sortingAlgo.js'

const sortedTables = ref(null)
const minSeats = ref(null)
const maxSeats = ref(null)
const fileInput = ref(null)
const downloadURL = ref(null)

async function getGroups() {
  const uploadedFile = await fileInput.value.files[0].arrayBuffer()
  const importWorkbook = new ExcelJS.Workbook()
  await importWorkbook.xlsx.load(uploadedFile)
  const groupWorksheet = importWorkbook.worksheets[0]
  let allGroups = []
  groupWorksheet.eachRow((row) => {
    let individualGroup = []
    row.eachCell((cell) => {
      individualGroup.push(cell.value)
    })
    allGroups.push(individualGroup)
  })
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
  <label for="input-groups"
    >Upload Group Excel File:
    <br />
    <span class="input-note"
      >(Each row should have one person's name in each cell, each row is a seperate group.)</span
    >
  </label>
  <br />
  <input type="file" name="input-groups" ref="fileInput" accept=".xlsx" />
  <br />
  <br />
  <label for="min-seats">Minimum Number of Seats per Table: </label>
  <input v-model="minSeats" type="number" name="min-seats" min="0" step="1" />
  <br />
  <label for="max-seats">Maximum Number of Seats per Table: </label>
  <input v-model="maxSeats" type="number" name="max-seats" min="1" step="1" />
  <br />
  <button @click="executeSort">Sort</button>
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
</style>
