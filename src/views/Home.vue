<template>
  <div class="home">
    <el-container>
      <el-header>
        <h1>AIYue 音乐馆</h1>
      </el-header>
      <el-main>
        <MusicGallery />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import MusicGallery from '../components/MusicGallery.vue'
</script>

<style scoped>
h1 {
  font-family: 'Arial', sans-serif;
  font-size: 2rem;
  text-align: center;
  margin: 1rem 0;
}
</style>
