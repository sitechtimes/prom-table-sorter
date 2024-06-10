<template>
  <h3 id="keyH3">KEY:</h3>
  <div class="childKey">
    <h5>* Each white box represents an individual group.</h5>
    <h4 id="yellowH4">Yellow Highlights:</h4>
    <p class="plainTextKey">Represent duplicate students.</p>
    <h4 id="redH4">Red Highlights:</h4>
    <p class="plainTextKey">Represent empty slots.</p>
  </div>
</template>

<script setup></script>

<style scoped>
#yellowH4 {
  background-color: var(--highlight);
  width: fit-content;
  margin: 10px 0;
  padding: 7px;
  font-weight: 400;
}
#redH4 {
  background-color: var(--error);
  margin: 10px 0;
  width: fit-content;
  padding: 7px;
  font-weight: 400;
}
</style>
