<script setup>
import { onMounted, ref } from 'vue'
import storage from '@/utils/localStorage'
import { CURRENT_HTML, LIST_STORAGE_HTML } from '@/utils/constants'
import { useRouter } from 'vue-router'

const router = useRouter()

const list_history_html = ref([])

const handleNavigate = (item) => {
  storage.setData(CURRENT_HTML, item)
  window.open(window.location.href + 'consumer', '_blank')
}

const handleOpenNewTemplate = () => {
  router.push({ name: 'admin' })
}

onMounted(() => {
  list_history_html.value = storage.getData(LIST_STORAGE_HTML)
})
</script>
<template>
  <div class="DashboardView d-flex flex-column justify-content-start">
    <h4 class="py-5">Dashboard View</h4>
    <div class="d-flex">
      <div
        @click="handleOpenNewTemplate"
        class="template-item new-template d-flex align-items-center jusitfy-content-center"
      >
        <p class="plus w-100">+</p>
      </div>
      <div v-for="(item, id) in list_history_html" :key="id">
        <div
          class="template-item d-flex justify-content-center align-items-center"
          @click="() => handleNavigate(item)"
        >
          <div
            class="rep-html d-flex flex-column align-items-center"
            v-html="item"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.DashboardView {
  width: 100vw;
  min-height: 100vh;
  padding: 50px 200px;
  .template-item {
    width: 160px;
    height: 200px;
    border: 1px solid #aaa;
    border-radius: 4px;
    margin: 0px 20px;
    padding: 20px 30px;
    cursor: pointer;
    &:hover {
      box-shadow: 3px 2px 2px #aaa;
    }
    .rep-html {
      transform: scale(0.5);
      overflow: hidden;
    }
  }
  .new-template {
    font-size: 72px;
    .plus {
      margin: 0;
      text-align: center;
    }
  }
}
</style>
