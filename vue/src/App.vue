<script setup>
import { ref } from 'vue'
import { mainSort, rangeSort, algoFunctionOptions, arrayLen2D } from './sortingAlgo.js'
import { testGroups, testTables } from './testData.js'

const sortedTables = ref([])
const minSeats = ref(null)
const maxSeats = ref(null)

// console.log(rangeSort(testGroups, algoFunctionOptions, maxSeats.value, minSeats.value))

function executeSort() {
  try {
    sortedTables.value = rangeSort(testGroups, algoFunctionOptions, maxSeats.value, minSeats.value)
  } catch (error) {
    alert(error.message)
  }
}
</script>

<template>
  <h1>Prom Table Sorting App</h1>
  <label for="min-seats">Minimum Number of Seats per Table</label>
  <input v-model="minSeats" type="number" name="min-seats" min="0" step="1" />
  <br />
  <label for="max-seats">Maximum Number of Seats per Table</label>
  <input v-model="maxSeats" type="number" name="max-seats" min="1" step="1" />
  <br />
  <button @click="executeSort">Sort</button>
  <br />
  <br />
  <div class="table" v-for="table in sortedTables">
    <p class="text">
      {{ table.capacity - arrayLen2D(table.occupants) }}/{{ table.capacity }} Seats Unoccupied
    </p>
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
</style>
