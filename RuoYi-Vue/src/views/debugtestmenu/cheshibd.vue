<template>
  <iframe
    ref="iframe"
    :src="'http://localhost:8081'"
    frameborder="0"
    style="width: 100%; height: 100vh"
  ></iframe>
</template>

<script setup>
import { onMounted, ref } from "vue";

const iframe = ref(null);

onMounted(() => {
  iframe.value.onload = () => {
    // 使用 postMessage 向 iframe 发送消息
    iframe.value.contentWindow.postMessage(
      "Hello from parent",
      "http://localhost:8081"
    );
  };
});
</script>
