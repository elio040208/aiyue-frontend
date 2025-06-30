<template>
  <div class="music-gallery">
    <el-row :gutter="20">
      <el-col
        v-for="song in songs"
        :key="song.id"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="6"
      >
        <el-card shadow="hover" class="music-card">
          <img
            v-if="song.cover_url"
            :src="song.cover_url"
            alt="cover"
            class="cover"
          />
          <div class="info">
            <h3>{{ song.title }}</h3>
            <p>{{ song.artist }} - {{ song.album }}</p>
            <audio
              v-if="song.audio_url"
              controls
              :src="song.audio_url"
              class="audio-player"
            ></audio>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-empty
      v-if="!loading && songs.length === 0"
      description="暂无歌曲"
    />
    <el-skeleton
      v-if="loading"
      rows="6"
      animated
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const songs = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await axios.get('http://8.149.130.118:8000/music/songs')
    songs.value = res.data
  } catch (error) {
    console.error('加载歌曲失败:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.music-gallery {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.music-card {
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.3s;
}

.music-card:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.cover {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 8px 8px 0 0;
}

.info {
  padding: 12px 10px;
}

.info h3 {
  font-size: 1.1rem;
  margin: 0 0 6px;
  font-weight: 600;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.info p {
  font-size: 0.9rem;
  color: #606266;
  margin: 0 0 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.audio-player {
  width: 100%;
  outline: none;
}
</style>
