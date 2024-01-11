<script setup>
import { ref } from 'vue'
import { mainSort, rangeSort, algoFunctionOptions, listLen2D } from './sortingAlgo.js'
import { testGroups, testTables } from './testData.js'

// test sorting function
// const sortedTables = ref(mainSort(testGroups, testTables, algoFunctionOptions))
const sortedTables = ref(rangeSort(testGroups, algoFunctionOptions, 14, 8))
</script>

<template>
  <h1>Prom Table Sorting App</h1>
  <br />
  <div class="table" v-for="table in sortedTables">
    <p class="text">
      {{ table.capacity - listLen2D(table.occupants) }}/{{ table.capacity }} Seats Unoccupied
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
