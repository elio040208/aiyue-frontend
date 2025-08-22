<template>
  <div class="music-gallery">
    <!-- 搜索栏 -->
    <div class="search-section">
      <div class="search-container">
        <div class="search-header">
          <h1 class="page-title">音乐馆</h1>
          <p class="page-subtitle">发现你喜爱的音乐</p>
        </div>
        <div class="search-bar">
          <el-input
            v-model="searchQuery"
            placeholder="搜索歌曲、艺术家或专辑..."
            size="large"
            clearable
            @input="handleSearch"
            @clear="handleClear"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </div>
    </div>

    <!-- 音乐卡片网格 -->
    <div class="songs-grid">
      <div class="grid-header" v-if="filteredSongs.length > 0">
        <h2 class="grid-title">
          {{ searchQuery ? `搜索结果 (${filteredSongs.length})` : `全部音乐 (${songs.length})` }}
        </h2>
      </div>
      
      <el-row :gutter="24" class="songs-row">
        <el-col
          v-for="song in filteredSongs"
          :key="song.id"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
          :xl="4"
        >
          <div class="music-card" @click="goToDetail(song.id)">
            <div class="card-cover">
              <img
                v-if="song.cover_url"
                :src="song.cover_url"
                :alt="song.title"
                class="cover-image"
              />
              <div v-else class="cover-placeholder">
                <el-icon><Headset /></el-icon>
              </div>
              <div class="card-overlay">
                <div class="play-button">
                  <el-icon><VideoPlay /></el-icon>
                </div>
              </div>
            </div>
            <div class="card-content">
              <h3 class="song-title">{{ song.title }}</h3>
              <p class="song-artist">{{ song.artist }}</p>
              <p class="song-album" v-if="song.album">{{ song.album }}</p>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 空状态 -->
      <div v-if="!loading && filteredSongs.length === 0" class="empty-state">
        <div class="empty-content">
          <el-icon class="empty-icon"><Search /></el-icon>
          <h3>{{ searchQuery ? '未找到相关音乐' : '暂无音乐' }}</h3>
          <p>{{ searchQuery ? '尝试使用其他关键词搜索' : '请稍后再来看看' }}</p>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <el-row :gutter="24">
          <el-col
            v-for="i in 8"
            :key="i"
            :xs="24"
            :sm="12"
            :md="8"
            :lg="6"
            :xl="4"
          >
            <el-skeleton animated>
              <template #template>
                <div class="skeleton-card">
                  <el-skeleton-item variant="image" style="width: 100%; height: 200px; border-radius: 12px;" />
                  <div style="padding: 16px;">
                    <el-skeleton-item variant="h3" style="width: 80%; margin-bottom: 8px;" />
                    <el-skeleton-item variant="text" style="width: 60%; margin-bottom: 4px;" />
                    <el-skeleton-item variant="text" style="width: 40%;" />
                  </div>
                </div>
              </template>
            </el-skeleton>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Headset, VideoPlay } from '@element-plus/icons-vue'
import axios from 'axios'
import { BASE_URL } from '../config'

const router = useRouter()
const songs = ref([])
const loading = ref(true)
const searchQuery = ref('')

// 过滤后的歌曲列表
const filteredSongs = computed(() => {
  if (!searchQuery.value) {
    return songs.value
  }
  
  const query = searchQuery.value.toLowerCase()
  return songs.value.filter(song => 
    song.title.toLowerCase().includes(query) ||
    song.artist.toLowerCase().includes(query) ||
    (song.album && song.album.toLowerCase().includes(query))
  )
})

// 跳转到详情页
const goToDetail = (id) => {
  router.push({ name: "SongDetail", params: { id } })
}


// 搜索处理
const handleSearch = () => {
  // 这里可以添加防抖逻辑
}

// 清除搜索
const handleClear = () => {
  searchQuery.value = ''
}

// 加载歌曲数据
onMounted(async () => {
  try {
    const res = await axios.get(`${BASE_URL}/songs`)
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
  min-height: 100vh;
  background: transparent;
}

.search-section {
  background: linear-gradient(135deg, #A2B1FB 0%, #7472FE 100%);
  padding: 48px 32px;
  position: relative;
  overflow: hidden;
}

.search-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="music-pattern" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M25 10 L25 35 Q25 40 30 40 Q35 40 35 35 L35 15 Q35 10 30 10 Z" fill="white" opacity="0.05"/></pattern></defs><rect width="100" height="100" fill="url(%23music-pattern)"/></svg>');
  pointer-events: none;
}

.search-container {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.search-header {
  text-align: center;
  margin-bottom: 32px;
}

.page-title {
  font-size: 3rem;
  font-weight: 700;
  color: white;
  margin: 0 0 8px 0;
  text-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  letter-spacing: -1px;
}

.page-subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-weight: 300;
}

.search-bar {
  max-width: 500px;
  margin: 0 auto;
}

.search-bar :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 12px 20px;
}

.search-bar :deep(.el-input__inner) {
  font-size: 1.1rem;
  color: #334155;
}

.songs-grid {
  padding: 48px 32px;
  max-width: 1400px;
  margin: 0 auto;
}

.grid-header {
  margin-bottom: 32px;
}

.grid-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  text-align: center;
}

.music-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
  position: relative;
}

.music-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.card-cover {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.music-card:hover .cover-image {
  transform: scale(1.05);
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 2rem;
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.music-card:hover .card-overlay {
  opacity: 1;
}

.play-button {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #667eea;
  transform: scale(0.8);
  transition: transform 0.3s ease;
}

.music-card:hover .play-button {
  transform: scale(1);
}

.card-content {
  padding: 20px;
}

.song-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.song-artist {
  font-size: 0.95rem;
  color: #64748b;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.song-album {
  font-size: 0.9rem;
  color: #94a3b8;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-content {
  max-width: 400px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 4rem;
  color: #cbd5e1;
  margin-bottom: 24px;
}

.empty-content h3 {
  font-size: 1.5rem;
  color: #475569;
  margin: 0 0 12px 0;
}

.empty-content p {
  font-size: 1rem;
  color: #94a3b8;
  margin: 0;
}

.loading-state {
  padding: 24px 0;
}

.skeleton-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 24px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-section {
    padding: 32px 20px;
  }
  
  .page-title {
    font-size: 2.5rem;
  }
  
  .songs-grid {
    padding: 32px 20px;
  }
  
  .card-cover {
    height: 180px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 2rem;
  }
  
  .page-subtitle {
    font-size: 1rem;
  }
  
  .card-cover {
    height: 160px;
  }
}
</style>