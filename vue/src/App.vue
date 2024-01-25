<script setup>
import { ref } from 'vue'
import { read, utils } from 'xlsx'
import { mainSort, rangeSort, algoFunctionOptions, arrayLen2D } from './sortingAlgo.js'
import { testGroups, testTables } from './testData.js'

const sortedTables = ref(null)
const minSeats = ref(null)
const maxSeats = ref(null)
const fileInput = ref(null)

async function getGroups() {
  const uploadFile = await fileInput.value.files[0].arrayBuffer()
  const workbook = read(uploadFile)
  const worksheet = workbook.Sheets[workbook.SheetNames[0]]
  const dataArray = utils.sheet_to_json(worksheet, { header: 1 })
  return dataArray
}

async function executeSort() {
  const guestGroups = await getGroups()
  try {
    sortedTables.value = rangeSort(guestGroups, algoFunctionOptions, maxSeats.value, minSeats.value)
  } catch (error) {
    alert(error.message)
  }
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
  <button @click="getGroups">get groups</button>
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
  <div class="table" v-for="table in sortedTables">
    <p class="text">{{ arrayLen2D(table.occupants) }}/{{ table.capacity }} Seats Occupied</p>
    <div class="group" v-for="group in table.occupants">
      <p class="person" v-for="person in group">{{ person }}</p>
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
</style>
