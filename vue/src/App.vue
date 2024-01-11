<script setup>
import { ref } from 'vue'
import { mainSort, algoOptions } from './sortingAlgo.js'
import { testGroups, testTables } from './testData.js'

function listLen2D(list2D) {
  let sum = 0
  for (let i = 0; i < list2D.length; i++) {
    sum += list2D[i].length
  }
  return sum
}

// test sorting function
const sortedTables = ref(mainSort(testGroups, testTables, algoOptions))
</script>

<template>
  <h1>Prom Table Sorting App</h1>
  <br />
  <div class="table" v-for="table in sortedTables">
    <p>{{ table.capacity - listLen2D(table.occupants) }}/{{ table.capacity }} Seats</p>
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
</style>
