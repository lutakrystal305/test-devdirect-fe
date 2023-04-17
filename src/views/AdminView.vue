<!-- eslint-disable no-unused-vars -->
<!-- eslint-disable no-useless-escape -->
<script setup>
import { computed, onMounted, onUpdated, ref, watch } from 'vue'
import { useForm } from 'vee-validate'
import storage from '@/utils/localStorage'
import { CURRENT_HTML, LIST_STORAGE_HTML } from '@/utils/constants'

const [BTN_ELEMENT, P_ELEMENT] = ['BUTTON', 'P']

const idCurrent = ref(-1)
const idChoosen = ref(-1)
const currentCtx = ref(null)
const historyUndo = ref([])
const historyRedo = ref([])
const htmlChilds = ref([])
const saveInList = ref(false)
const textValue = ref('')
const alertValue = ref('')
const urlResultDownload = ref(null)
const inputFile = ref(null)

const htmlText = computed(() => htmlChilds.value?.join(''))
const htmlResult = computed(() => transformHTML(htmlChilds.value))

const handleChooseItem = (e) => {
  const index = e.classList[0].split('___')[1]
  idChoosen.value = index
  currentCtx.value = e
}

const handleAddButton = () => {
  historyUndo.value = [...historyUndo.value, htmlChilds.value]
  ++idCurrent.value
  idChoosen.value = idCurrent.value
  const temp = `<div class="div-additional"><button onclick=\"alert('hello world')\" class='component___${idCurrent.value} btn-additional html-additional'>Click</button></div>`
  htmlChilds.value = [...htmlChilds.value, temp]
  currentCtx.value = document.createElement('button')
}
const handleAddParagraphs = () => {
  ++idCurrent.value
  idChoosen.value = idCurrent.value
  historyUndo.value = [...historyUndo.value, htmlChilds.value]
  const temp = `<div class="div-additional"><p class='component___${idCurrent.value} p-additional html-additional'>This is paragraph</p></div>`
  htmlChilds.value = [...htmlChilds.value, temp]
  currentCtx.value = document.createElement('p')
}

const handleUndo = () => {
  if (!historyUndo.value.length) return
  historyRedo.value = [...historyRedo.value, htmlChilds.value]
  let temp = [...historyUndo.value]
  htmlChilds.value = temp.pop()
  idChoosen.value = htmlChilds.value.length - 1
  historyUndo.value = [...temp]
}

const handleRedo = () => {
  if (!historyRedo.value.length) return
  historyUndo.value = [...historyUndo.value, htmlChilds.value]
  let temp = [...historyRedo.value]
  htmlChilds.value = temp.pop()
  idChoosen.value = htmlChilds.value.length - 1
  historyRedo.value = [...temp]
}

const handleSave = () => {
  const list_html = storage.getData(LIST_STORAGE_HTML)
  storage.setData(CURRENT_HTML, htmlResult.value)
  if (!saveInList.value) {
    list_html && list_html.length
      ? storage.setData(LIST_STORAGE_HTML, [...list_html, htmlResult.value])
      : storage.setData(LIST_STORAGE_HTML, [htmlResult.value])
    saveInList.value = true
  } else {
    storage.setData(LIST_STORAGE_HTML, [
      ...list_html.slice(0, list_html.length - 1),
      htmlResult.value
    ])
  }
}

const loadedFile = (e) => {
  const result = JSON.parse(e.target.result)
  htmlChilds.value = result.map((element) => {
    return `<div class="div-additional">${element}</div>`
  })
  idCurrent.value = result.length - 1
  idChoosen.value = idCurrent.value
}

const handleImportFile = (e) => {
  const reader = new FileReader()
  reader.onload = loadedFile
  reader.readAsText(e.target.files[0])
}

const handleExport = () => {
  const blob = new Blob([JSON.stringify(htmlResult.value)], {
    type: 'application/json'
  })
  urlResultDownload.value = URL.createObjectURL(blob)
}

const transformHTML = (listHTMLs) => {
  return listHTMLs.map((element) =>
    element
      .replaceAll('<div class="div-additional">', '')
      .replaceAll('</div>', '')
  )
}

const onSubmit = () => {
  if (textValue.value && textValue.value.length > 0) {
    const textPattern = /\>.+\</g
    historyUndo.value = [...historyUndo.value, htmlChilds.value]
    let currElementStr = htmlChilds.value[idChoosen.value]
      .replace('<div class="div-additional">', '')
      .replaceAll('</div>', '')
    if (currentCtx.value.tagName === BTN_ELEMENT) {
      const alertPattern = /((alert\(\")[\w\s\d]+\"\))/g
      currElementStr = currElementStr.replaceAll(
        textPattern,
        `>${textValue.value}<`
      )
      currElementStr = currElementStr.replaceAll(
        alertPattern,
        `alert('${alertValue.value}')`
      )
    } else {
      currElementStr = currElementStr.replaceAll(
        textPattern,
        `>${textValue.value}<`
      )
    }
    htmlChilds.value = [
      ...htmlChilds.value.slice(0, idChoosen.value),
      `<div class="div-additional">${currElementStr}</div>`,
      ...htmlChilds.value.slice(+idChoosen.value + 1)
    ]
  }
}

const resetForm = () => {
  textValue.value = ''
  alertValue.value = ''
}

watch(
  currentCtx,
  (current, prev) => {
    if (current && current !== prev) {
      if (currentCtx.value.tagName === BTN_ELEMENT) {
        const alertRegex = /((alert\(\').+\'\))/
        textValue.value = currentCtx.value.textContent || 'Click'
        alertValue.value = htmlChilds.value[idChoosen.value]
          .match(alertRegex)[0]
          .replaceAll("alert('", '')
          .replaceAll("')", '')
      } else {
        textValue.value = currentCtx.value.textContent || 'This is paragraph'
      }
    }
  },
  { deep: true }
)

onUpdated(() => {
  const divElements = document.getElementsByClassName('div-additional')
  divElements &&
    divElements.length &&
    Array.from(divElements).forEach((element) => {
      element.onclick = () => handleChooseItem(element.firstChild)
    })
})
</script>

<template>
  <div class="AdminView d-flex w-100">
    <div
      class="AdminView--side-bar h-100 d-flex flex-column align-items-center"
    >
      <button class="w-100" @click="handleAddButton">Button</button>
      <button class="w-100" @click="handleAddParagraphs">Paragraph</button>
    </div>
    <div class="AdminView--body h-100">
      <div class="AdminView--body--toolbar d-flex justify-content-center">
        <button @click="handleUndo" class="toolbar-item">Undo</button>
        <button @click="handleRedo" class="toolbar-item">Redo</button>
        <button @click="handleSave" class="toolbar-item">Save</button>
        <label class="file-import-container">
          <input
            type="file"
            class="toolbar-item file-import"
            accept="application/json, "
            @change="handleImportFile"
          />
          Import
        </label>

        <a
          @click="handleExport"
          class="toolbar-item"
          :href="urlResultDownload"
          download
          >Export</a
        >
      </div>
      <div
        class="result-view d-flex flex-column align-items-center py-3"
        v-html="htmlText"
      ></div>
      <div class="AdminView--body--footer">
        <div
          v-if="idCurrent >= 0"
          class="d-flex flex-column align-items-center"
        >
          <input
            type="text"
            name="mainText"
            v-model="textValue"
            :placeholder="
              currentCtx && currentCtx.tagName === BTN_ELEMENT
                ? 'Text in button'
                : 'Text in Paragraph'
            "
          />
          <input
            v-if="currentCtx && currentCtx.tagName === BTN_ELEMENT"
            name="subText"
            type="text"
            v-model="alertValue"
            placeholder="Text in Alert"
          />
          <button @click="onSubmit">Submit</button>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.AdminView {
  width: 100vw !important;
  height: 100vh;
  &--side-bar {
    width: 15%;
  }
  &--body {
    border-left: 1px solid #aaa;
    width: 85%;
    &--toolbar {
      height: 30px;
    }
    &--footer {
      height: 150px;
      position: absolute;
      bottom: 0;
    }
  }
}
.result-view {
  border-top: 1px solid #aaa;
  border-bottom: 1px solid #aaa;
  height: calc(100% - 182px);
  max-height: calc(100% - 182px);
  overflow-y: auto;
  ::v-deep {
    button {
      pointer-events: none;
    }
    div {
      cursor: pointer;
    }
  }
}
.toolbar-item {
  padding: 0 25px;
  background-color: rgb(10, 124, 16);
  color: white;
  border: 1px solid #aaa;
  text-decoration: none;
  cursor: pointer;
}
.file-import-container {
  border: 1px solid #aaa;
  display: inline-block;
  padding: 6px 12px;
  cursor: pointer;
  padding: 0 25px;
  background-color: rgb(10, 124, 16);
  color: white;
}
.file-import {
  display: none;
}
</style>
