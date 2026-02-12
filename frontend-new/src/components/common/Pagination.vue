<template>
  <div class="pagination" v-if="totalPages > 1">
    <button
      class="page-btn"
      :disabled="currentPage === 1"
      @click="handleFirst"
    >
      首页
    </button>
    <button
      class="page-btn"
      :disabled="currentPage === 1"
      @click="handlePrev"
    >
      上一页
    </button>

    <span class="page-info">第 {{ currentPage }} / {{ totalPages }} 页</span>

    <button
      class="page-btn"
      :disabled="currentPage === totalPages"
      @click="handleNext"
    >
      下一页
    </button>
    <button
      class="page-btn"
      :disabled="currentPage === totalPages"
      @click="handleLast"
    >
      末页
    </button>
  </div>
</template>

<script>
export default {
  name: 'Pagination',
  props: {
    currentPage: {
      type: Number,
      required: true
    },
    totalPages: {
      type: Number,
      required: true
    }
  },
  emits: ['change'],
  setup(props, { emit }) {
    const handleFirst = () => {
      if (props.currentPage !== 1) {
        emit('change', 1)
      }
    }

    const handlePrev = () => {
      if (props.currentPage > 1) {
        emit('change', props.currentPage - 1)
      }
    }

    const handleNext = () => {
      if (props.currentPage < props.totalPages) {
        emit('change', props.currentPage + 1)
      }
    }

    const handleLast = () => {
      if (props.currentPage !== props.totalPages) {
        emit('change', props.totalPages)
      }
    }

    return {
      handleFirst,
      handlePrev,
      handleNext,
      handleLast
    }
  }
}
</script>

<style scoped>
/* 使用全局样式 */
</style>
