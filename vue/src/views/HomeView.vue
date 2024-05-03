<script setup>
import { ref } from 'vue'
import router from '@/router'
import ExcelJS from 'exceljs'

const fileInput = ref(null)

async function getSpreadsheetData() {
  const uploadedFile = await fileInput.value.files[0].arrayBuffer()
  const importWorkbook = new ExcelJS.Workbook()
  await importWorkbook.xlsx.load(uploadedFile)
  const groupWorksheet = importWorkbook.worksheets[0]
  let rawSpreadsheetData = []
  groupWorksheet.eachRow((row) => {
    let individualRow = []
    row.eachCell((cell) => individualRow.push(cell.value))
    rawSpreadsheetData.push(individualRow)
  })
  // return rawSpreadsheetData
  router.push({ name: 'Import Settings', params: { spreadsheetData: rawSpreadsheetData } })
}
</script>

<template>
  <h1>Prom Sorter</h1>
  <h2>Upload Excel File (.xlsx)</h2>
  <p>The program will examine the first spreadsheet tab in the workbook file.</p>
  <div>
    <label class="uploadBtn btn" for="upload-file">Upload</label>
    <input
      id="upload-file"
      class="btn"
      type="file"
      name="input-groups"
      ref="fileInput"
      accept=".xlsx"
    />
  </div>
  <button @click="getSpreadsheetData">Next</button>
</template>

<style scoped></style>
