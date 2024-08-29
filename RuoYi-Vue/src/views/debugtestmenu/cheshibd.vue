<template>
    <iframe ref="iframe" :src="'http://localhost:8081'" frameborder="0" style="width: 100%; height: 100vh;"></iframe>
  </template>
  
  <script setup>
  import { onMounted, ref } from 'vue';
  
  const iframe = ref(null);
  
  onMounted(() => {
    // 等 iframe 加载完成后再操作其内容
    iframe.value.onload = () => {
      const iframeDocument = iframe.value.contentDocument || iframe.value.contentWindow.document;
      // 这里可以对 iframe 内部的 DOM 进行操作
      console.log(iframeDocument);
      // 例如获取标题
      console.log(iframeDocument.title);
    };
  });
  </script>
  