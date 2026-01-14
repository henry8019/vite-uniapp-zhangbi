<script setup>

</script>

<template>
  <div></div>
</template>

<style scoped>
.modern-input {
  width: 100%;
  background-color: #f3f4f6;
  color: #1f2937;
  font-size: 0.875rem;
  font-weight: 700;
  border-radius: 0.75rem;
  padding: 0.6rem 0.8rem;
  border: 2px solid transparent;
  margin-top: 0.25rem;
  transition: all 0.2s;
  box-sizing: border-box;
  height: 46px;
}

textarea.modern-input {
  height: 80px;
  line-height: 1.4;
}

.modern-input:focus-within,
.modern-input:focus {
  background-color: #ffffff;
  border-color: #c7d2fe;
}

@keyframes pop-in {
  0% {
    transform: scale(0.95);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
.animate-pop-in {
  animation: pop-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}
</style>
