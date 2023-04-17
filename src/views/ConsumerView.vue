<script setup>
import storage from '@/utils/localStorage'
import { computed, onMounted, ref } from 'vue'
import { CURRENT_HTML } from '@/utils/constants'

const htmlListResult = ref('')
const htmlResult = computed(() =>
  htmlListResult.value && htmlListResult.value.length
    ? htmlListResult.value.join('')
    : ''
)
onMounted(() => {
  htmlListResult.value = storage.getData(CURRENT_HTML)
})
</script>
<template>
  <div class="ConsumerView">
    <h1>About View</h1>
    <div
      v-html="htmlResult"
      class="d-flex flex-column align-items-center"
    ></div>
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .ConsumerView {
    width: 100vw;
    height: 100vh;
    max-height: 100vh;
    overflow-y: auto;
  }
}
</style>
