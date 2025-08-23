<template>
  <div class="music-community">
    <!-- 顶部标题区域 -->
    <div class="header-section">
      <div class="header-container">
        <h1 class="page-title">音乐交流区</h1>
        <p class="page-subtitle">分享你的音乐作品，与音乐人交流创作心得</p>
        <div class="title-decoration">
          <div class="music-note">🎵</div>
          <div class="music-note">💬</div>
          <div class="music-note">🎶</div>
        </div>
      </div>
    </div>

    <!-- 主要交流区域 -->
    <div class="main-content">
      <div class="content-container">
        <!-- 左侧发布区域 -->
        <div class="post-section">
          <el-card class="post-card">
            <template #header>
              <div class="card-header">
                <h3>分享音乐作品</h3>
                <div class="header-icon">📝</div>
              </div>
            </template>
            
            <div class="post-form">
              <!-- 音乐文件上传 -->
              <div class="upload-section">
                <h4 class="section-title">上传音乐</h4>
                <el-upload
                  class="music-uploader"
                  drag
                  action="#"
                  :auto-upload="false"
                  :on-change="handleMusicChange"
                  :file-list="musicFiles"
                  accept="audio/*"
                >
                  <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                  <div class="el-upload__text">
                    拖拽音乐文件到此处，或<em>点击上传</em>
                  </div>
                  <template #tip>
                    <div class="el-upload__tip">
                      支持 MP3, WAV, FLAC 格式，文件大小不超过 50MB
                    </div>
                  </template>
                </el-upload>
              </div>

              <!-- 作品信息 -->
              <div class="music-info">
                <h4 class="section-title">作品信息</h4>
                <div class="form-item">
                  <label>作品标题</label>
                  <el-input 
                    v-model="newPost.title" 
                    placeholder="给你的音乐作品起个名字"
                    maxlength="50"
                    show-word-limit
                  />
                </div>
                
                <div class="form-item">
                  <label>作品描述</label>
                  <el-input 
                    v-model="newPost.description" 
                    type="textarea" 
                    :rows="4"
                    placeholder="分享你的创作灵感、制作过程或想要表达的情感..."
                    maxlength="500"
                    show-word-limit
                  />
                </div>

                <div class="form-row">
                  <div class="form-item">
                    <label>音乐风格</label>
                    <el-select v-model="newPost.genre" placeholder="选择音乐风格" class="full-width">
                      <el-option label="古典" value="classical" />
                      <el-option label="流行" value="pop" />
                      <el-option label="摇滚" value="rock" />
                      <el-option label="爵士" value="jazz" />
                      <el-option label="电子" value="electronic" />
                      <el-option label="民谣" value="folk" />
                      <el-option label="嘻哈" value="hiphop" />
                      <el-option label="其他" value="other" />
                    </el-select>
                  </div>
                  
                  <div class="form-item">
                    <label>创作时长</label>
                    <el-input-number 
                      v-model="newPost.duration" 
                      :min="1" 
                      :max="999"
                      placeholder="分钟"
                      class="full-width"
                    />
                  </div>
                </div>

                <div class="form-item">
                  <label>标签</label>
                  <el-input 
                    v-model="newPost.tags" 
                    placeholder="用逗号分隔多个标签，如：原创,钢琴,抒情"
                  />
                </div>
              </div>

              <!-- 发布按钮 -->
              <div class="post-actions">
                <el-button 
                  type="primary" 
                  size="large" 
                  @click="publishPost"
                  :loading="publishing"
                  :disabled="!canPublish"
                  class="publish-btn"
                >
                  🎵 发布作品
                </el-button>
                <el-button 
                  size="large" 
                  @click="clearForm"
                  class="clear-btn"
                >
                  清空表单
                </el-button>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 右侧交流区域 -->
        <div class="community-section">
          <!-- 筛选和排序 -->
          <div class="filter-bar">
            <el-card class="filter-card">
              <div class="filter-controls">
                <div class="filter-group">
                  <label>音乐风格</label>
                  <el-select v-model="filters.genre" placeholder="全部风格" clearable>
                    <el-option label="全部风格" value="" />
                    <el-option label="古典" value="classical" />
                    <el-option label="流行" value="pop" />
                    <el-option label="摇滚" value="rock" />
                    <el-option label="爵士" value="jazz" />
                    <el-option label="电子" value="electronic" />
                    <el-option label="民谣" value="folk" />
                    <el-option label="嘻哈" value="hiphop" />
                    <el-option label="其他" value="other" />
                  </el-select>
                </div>
                
                <div class="filter-group">
                  <label>排序方式</label>
                  <el-select v-model="filters.sortBy" placeholder="最新发布">
                    <el-option label="最新发布" value="latest" />
                    <el-option label="最多点赞" value="likes" />
                    <el-option label="最多评论" value="comments" />
                    <el-option label="最多播放" value="plays" />
                  </el-select>
                </div>

                <el-button type="primary" @click="applyFilters" class="apply-btn">
                  应用筛选
                </el-button>
              </div>
            </el-card>
          </div>

          <!-- 音乐作品列表 -->
          <div class="posts-list">
            <el-card 
              v-for="post in filteredPosts" 
              :key="post.id" 
              class="post-item"
              :class="{ 'post-item--featured': post.isFeatured }"
            >
              <div class="post-header">
                <div class="user-info">
                  <el-avatar :src="post.user.avatar" :size="40">
                    {{ post.user.name.charAt(0) }}
                  </el-avatar>
                  <div class="user-details">
                    <div class="username">{{ post.user.name }}</div>
                    <div class="post-time">{{ formatTime(post.createdAt) }}</div>
                  </div>
                </div>
                
                <div class="post-actions">
                  <el-dropdown>
                    <el-button type="text" class="more-btn">
                      <el-icon><more-filled /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item @click="reportPost(post.id)">举报</el-dropdown-item>
                        <el-dropdown-item v-if="post.user.id === currentUser?.id" @click="editPost(post.id)">编辑</el-dropdown-item>
                        <el-dropdown-item v-if="post.user.id === currentUser?.id" @click="deletePost(post.id)" divided>删除</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </div>

              <div class="post-content">
                <h3 class="post-title">{{ post.title }}</h3>
                <p class="post-description">{{ post.description }}</p>
                
                <!-- 音乐播放器 -->
                <div class="music-player">
                  <div class="player-info">
                    <div class="music-meta">
                      <span class="genre-tag">{{ getGenreLabel(post.genre) }}</span>
                      <span class="duration">{{ post.duration }}分钟</span>
                    </div>
                    <div class="play-stats">
                      <span class="play-count">🎵 {{ post.playCount }}次播放</span>
                    </div>
                  </div>
                  
                  <div class="player-controls">
                    <el-button 
                      type="primary" 
                      :icon="post.isPlaying ? 'Pause' : 'VideoPlay'"
                      @click="togglePlay(post.id)"
                      class="play-btn"
                    >
                      {{ post.isPlaying ? '暂停' : '播放' }}
                    </el-button>
                    
                    <div class="progress-bar">
                      <el-progress 
                        :percentage="post.progress || 0" 
                        :show-text="false"
                        :stroke-width="4"
                      />
                    </div>
                    
                    <span class="time-display">{{ formatDuration(post.currentTime || 0) }} / {{ formatDuration(post.duration * 60) }}</span>
                  </div>
                </div>

                <!-- 标签 -->
                <div class="post-tags" v-if="post.tags && post.tags.length">
                  <el-tag 
                    v-for="tag in post.tags" 
                    :key="tag" 
                    size="small" 
                    class="tag-item"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
              </div>

              <!-- 互动区域 -->
              <div class="post-interactions">
                <div class="interaction-buttons">
                  <el-button 
                    type="text" 
                    :class="{ 'liked': post.isLiked }"
                    @click="toggleLike(post.id)"
                    class="like-btn"
                  >
                    <el-icon><heart /></el-icon>
                    <span>{{ post.likes }}</span>
                  </el-button>
                  
                  <el-button 
                    type="text" 
                    @click="toggleComments(post.id)"
                    class="comment-btn"
                  >
                    <el-icon><chat-dot-round /></el-icon>
                    <span>{{ post.comments.length }}</span>
                  </el-button>
                  
                  <el-button 
                    type="text" 
                    @click="sharePost(post.id)"
                    class="share-btn"
                  >
                    <el-icon><share /></el-icon>
                    <span>分享</span>
                  </el-button>
                </div>
              </div>

              <!-- 评论区 -->
              <div v-if="post.showComments" class="comments-section">
                <div class="comments-header">
                  <h4>评论 ({{ post.comments.length }})</h4>
                </div>
                
                <!-- 发表评论 -->
                <div class="comment-form">
                  <el-input 
                    v-model="newComment" 
                    placeholder="写下你的评论..."
                    :rows="2"
                    type="textarea"
                    maxlength="200"
                    show-word-limit
                  />
                  <el-button 
                    type="primary" 
                    size="small" 
                    @click="addComment(post.id)"
                    :disabled="!newComment.trim()"
                    class="comment-submit-btn"
                  >
                    发表评论
                  </el-button>
                </div>

                <!-- 评论列表 -->
                <div class="comments-list">
                  <div 
                    v-for="comment in post.comments" 
                    :key="comment.id" 
                    class="comment-item"
                  >
                    <div class="comment-user">
                      <el-avatar :src="comment.user.avatar" :size="24">
                        {{ comment.user.name.charAt(0) }}
                      </el-avatar>
                      <span class="comment-username">{{ comment.user.name }}</span>
                      <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
                    </div>
                    <div class="comment-content">{{ comment.content }}</div>
                    
                    <div class="comment-actions">
                      <el-button 
                        type="text" 
                        size="small"
                        @click="likeComment(comment.id)"
                        :class="{ 'liked': comment.isLiked }"
                      >
                        <el-icon><heart /></el-icon>
                        <span>{{ comment.likes }}</span>
                      </el-button>
                      
                      <el-button 
                        type="text" 
                        size="small"
                        @click="replyComment(comment.id)"
                      >
                        回复
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
            </el-card>
          </div>

          <!-- 分页 -->
          <div class="pagination-section">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50]"
              :total="totalPosts"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  UploadFilled, 
  MoreFilled, 
  Heart, 
  ChatDotRound, 
  Share,
  VideoPlay,
  Pause
} from '@element-plus/icons-vue'

// 响应式状态
const newPost = ref({
  title: '',
  description: '',
  genre: '',
  duration: 1,
  tags: ''
})

const newComment = ref('')
const musicFiles = ref([])
const publishing = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const totalPosts = ref(0)

// 筛选器
const filters = ref({
  genre: '',
  sortBy: 'latest'
})

// 模拟用户数据
const currentUser = ref({
  id: 1,
  name: '音乐创作者',
  avatar: ''
})

// 模拟音乐作品数据
const posts = ref([
  {
    id: 1,
    title: '春日序曲 - 钢琴独奏',
    description: '这是一首描绘春天美好景色的钢琴曲，灵感来源于清晨的花园漫步。使用了大量的琶音和装饰音来表现春天的生机与活力。',
    genre: 'classical',
    duration: 3,
    tags: ['原创', '钢琴', '春天', '抒情'],
    playCount: 156,
    likes: 23,
    comments: [
      {
        id: 1,
        user: { name: '音乐爱好者', avatar: '' },
        content: '非常优美的旋律，让人仿佛置身于春天的花园中！',
        createdAt: new Date('2024-01-15T10:30:00'),
        likes: 5,
        isLiked: false
      }
    ],
    user: { id: 2, name: '钢琴诗人', avatar: '' },
    createdAt: new Date('2024-01-15T09:00:00'),
    isLiked: false,
    isPlaying: false,
    progress: 0,
    currentTime: 0,
    showComments: false,
    isFeatured: true
  },
  {
    id: 2,
    title: '城市夜雨 - 电子音乐',
    description: '以城市雨夜为背景创作的电子音乐，融合了环境音效和电子节拍，营造出都市夜晚的宁静与神秘感。',
    genre: 'electronic',
    duration: 4,
    tags: ['电子', '环境', '都市', '夜晚'],
    playCount: 89,
    likes: 15,
    comments: [],
    user: { id: 3, name: '电子音乐人', avatar: '' },
    createdAt: new Date('2024-01-14T20:15:00'),
    isLiked: false,
    isPlaying: false,
    progress: 0,
    currentTime: 0,
    showComments: false,
    isFeatured: false
  }
])

// 计算属性
const canPublish = computed(() => {
  return newPost.value.title.trim() && 
         newPost.value.description.trim() && 
         newPost.value.genre && 
         musicFiles.value.length > 0
})

const filteredPosts = computed(() => {
  let filtered = [...posts.value]
  
  // 按风格筛选
  if (filters.value.genre) {
    filtered = filtered.filter(post => post.genre === filters.value.genre)
  }
  
  // 排序
  switch (filters.value.sortBy) {
    case 'likes':
      filtered.sort((a, b) => b.likes - a.likes)
      break
    case 'comments':
      filtered.sort((a, b) => b.comments.length - a.comments.length)
      break
    case 'plays':
      filtered.sort((a, b) => b.playCount - a.playCount)
      break
    default:
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }
  
  return filtered
})

// 方法
function handleMusicChange(file) {
  musicFiles.value = [file]
}

function publishPost() {
  if (!canPublish.value) {
    ElMessage.warning('请填写完整的作品信息')
    return
  }
  
  publishing.value = true
  
  // 模拟发布过程
  setTimeout(() => {
    const post = {
      id: Date.now(),
      ...newPost.value,
      tags: newPost.value.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      playCount: 0,
      likes: 0,
      comments: [],
      user: currentUser.value,
      createdAt: new Date(),
      isLiked: false,
      isPlaying: false,
      progress: 0,
      currentTime: 0,
      showComments: false,
      isFeatured: false
    }
    
    posts.value.unshift(post)
    totalPosts.value++
    
    clearForm()
    publishing.value = false
    ElMessage.success('作品发布成功！')
  }, 1500)
}

function clearForm() {
  newPost.value = {
    title: '',
    description: '',
    genre: '',
    duration: 1,
    tags: ''
  }
  musicFiles.value = []
  newComment.value = ''
}

function applyFilters() {
  currentPage.value = 1
  ElMessage.info('筛选条件已应用')
}

function togglePlay(postId) {
  const post = posts.value.find(p => p.id === postId)
  if (post) {
    post.isPlaying = !post.isPlaying
    if (post.isPlaying) {
      // 模拟播放进度
      const interval = setInterval(() => {
        if (post.progress < 100) {
          post.progress += 1
          post.currentTime = (post.progress / 100) * (post.duration * 60)
        } else {
          clearInterval(interval)
          post.isPlaying = false
          post.progress = 0
          post.currentTime = 0
        }
      }, 1000)
    } else {
      post.progress = 0
      post.currentTime = 0
    }
  }
}

function toggleLike(postId) {
  const post = posts.value.find(p => p.id === postId)
  if (post) {
    post.isLiked = !post.isLiked
    post.likes += post.isLiked ? 1 : -1
  }
}

function toggleComments(postId) {
  const post = posts.value.find(p => p.id === postId)
  if (post) {
    post.showComments = !post.showComments
  }
}

function addComment(postId) {
  if (!newComment.value.trim()) return
  
  const post = posts.value.find(p => p.id === postId)
  if (post) {
    const comment = {
      id: Date.now(),
      user: currentUser.value,
      content: newComment.value,
      createdAt: new Date(),
      likes: 0,
      isLiked: false
    }
    
    post.comments.push(comment)
    newComment.value = ''
    ElMessage.success('评论发表成功！')
  }
}

function likeComment(commentId) {
  // 查找并点赞评论
  posts.value.forEach(post => {
    post.comments.forEach(comment => {
      if (comment.id === commentId) {
        comment.isLiked = !comment.isLiked
        comment.likes += comment.isLiked ? 1 : -1
      }
    })
  })
}

function sharePost(postId) {
  ElMessage.success('分享功能开发中...')
}

function reportPost(postId) {
  ElMessage.info('举报功能开发中...')
}

function editPost(postId) {
  ElMessage.info('编辑功能开发中...')
}

function deletePost(postId) {
  ElMessageBox.confirm('确定要删除这个作品吗？', '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = posts.value.findIndex(p => p.id === postId)
    if (index > -1) {
      posts.value.splice(index, 1)
      totalPosts.value--
      ElMessage.success('作品已删除')
    }
  })
}

function replyComment(commentId) {
  ElMessage.info('回复功能开发中...')
}

function handleSizeChange(size) {
  pageSize.value = size
  currentPage.value = 1
}

function handleCurrentChange(page) {
  currentPage.value = page
}

// 工具函数
function formatTime(date) {
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  
  return date.toLocaleDateString()
}

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function getGenreLabel(genre) {
  const labels = {
    classical: '古典',
    pop: '流行',
    rock: '摇滚',
    jazz: '爵士',
    electronic: '电子',
    folk: '民谣',
    hiphop: '嘻哈',
    other: '其他'
  }
  return labels[genre] || genre
}

// 生命周期
onMounted(() => {
  totalPosts.value = posts.value.length
})
</script>

<style scoped>
.music-community {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding: 20px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: white;
}

/* 头部样式 */
.header-section {
  text-align: center;
  margin-bottom: 40px;
}

.header-container {
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  font-size: 3rem;
  font-weight: 700;
  color: white;
  margin: 0 0 16px 0;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.page-subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 24px 0;
}

.title-decoration {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.music-note {
  font-size: 2rem;
  color: rgba(255, 255, 255, 0.8);
  animation: float 3s ease-in-out infinite;
}

.music-note:nth-child(2) {
  animation-delay: 1s;
}

.music-note:nth-child(3) {
  animation-delay: 2s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

/* 主要内容区域 */
.main-content {
  max-width: 1400px;
  margin: 0 auto;
}

.content-container {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

/* 发布区域 */
.post-section {
  position: sticky;
  top: 20px;
  height: fit-content;
}

.post-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: none;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.3rem;
  font-weight: 600;
}

.header-icon {
  font-size: 1.5rem;
}

.control-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.control-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.section-title {
  margin: 0 0 16px 0;
  color: #555;
  font-size: 1.1rem;
  font-weight: 600;
}

/* 帖子列表样式 */
.posts-section {
  margin-top: 30px;
}

.posts-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: none;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.posts-container {
  padding: 20px;
}

.post-item {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.post-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.post-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.2rem;
}

.user-info {
  flex: 1;
}

.username {
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
}

.post-time {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.post-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 8px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #e9ecef;
  color: #666;
}

.action-btn:hover {
  background: #dee2e6;
  transform: translateY(-1px);
}

.action-btn.primary {
  background: #007bff;
  color: white;
}

.action-btn.primary:hover {
  background: #0056b3;
}

.post-content {
  margin-bottom: 16px;
}

.post-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
}

.post-text {
  color: #555;
  line-height: 1.6;
  margin: 0 0 16px 0;
}

.post-audio {
  background: #e9ecef;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.audio-player {
  width: 100%;
  height: 40px;
  border-radius: 8px;
  border: none;
  background: white;
}

.post-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.tag {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 500;
}

.post-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #e9ecef;
}

.stats-left {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 0.9rem;
}

.stat-icon {
  font-size: 1rem;
}

/* 发布区域样式 */
.publish-section {
  margin-bottom: 30px;
}

.publish-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: none;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.publish-container {
  padding: 24px;
}

.publish-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #555;
  font-size: 0.9rem;
}

.form-input {
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-textarea {
  min-height: 120px;
  resize: vertical;
}

.tag-input {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background: white;
  min-height: 48px;
}

.tag-item {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tag-remove {
  cursor: pointer;
  font-weight: bold;
  color: #1976d2;
}

.tag-remove:hover {
  color: #d32f2f;
}

.publish-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.publish-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
}

.publish-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
}

.cancel-btn {
  padding: 12px 24px;
  border: 2px solid #6c757d;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  color: #6c757d;
}

.cancel-btn:hover {
  background: #6c757d;
  color: white;
}

/* 筛选器样式 */
.filters-section {
  margin-bottom: 20px;
}

.filters-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: none;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.filters-container {
  padding: 20px;
}

.filters-row {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 120px;
}

.filter-item label {
  font-weight: 600;
  color: #555;
  font-size: 0.9rem;
}

.filter-select {
  padding: 8px 12px;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  background: white;
  font-size: 0.9rem;
}

.filter-select:focus {
  outline: none;
  border-color: #007bff;
}

.search-box {
  flex: 1;
  min-width: 200px;
}

.search-input {
  width: 100%;
  padding: 8px 16px;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  background: white;
  font-size: 0.9rem;
}

.search-input:focus {
  outline: none;
  border-color: #007bff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content-container {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .control-panel {
    position: static;
  }
  
  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-item {
    min-width: auto;
  }
  
  .search-box {
    min-width: auto;
  }
  
  .publish-actions {
    flex-direction: column;
  }
  
  .post-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .post-actions {
    align-self: flex-end;
  }
}

@media (max-width: 480px) {
  .music-community {
    padding: 16px;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .page-subtitle {
    font-size: 1rem;
  }
  
  .post-item {
    padding: 16px;
  }
  
  .publish-container {
    padding: 16px;
  }
}

/* 额外样式 */
.post-form {
  padding: 20px 0;
}

.upload-section, .music-info {
  margin-bottom: 24px;
}

.form-item {
  margin-bottom: 16px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.full-width {
  width: 100%;
}

.post-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 24px;
}

.publish-btn, .clear-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.publish-btn {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
}

.publish-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
}

.clear-btn {
  background: #6c757d;
  color: white;
}

.clear-btn:hover {
  background: #495057;
  transform: translateY(-2px);
}

/* 社区区域样式 */
.community-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filter-bar {
  margin-bottom: 20px;
}

.filter-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: none;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.filter-controls {
  display: flex;
  gap: 16px;
  align-items: end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 120px;
}

.filter-group label {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.apply-btn {
  height: 40px;
  padding: 0 20px;
}

/* 帖子列表样式 */
.posts-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.post-item {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: none;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.post-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
}

.post-item--featured {
  border: 2px solid #ffd700;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(255, 215, 0, 0.05));
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e9ecef;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.username {
  font-weight: 600;
  color: #333;
  margin: 0;
}

.post-time {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.more-btn {
  padding: 8px;
  border-radius: 50%;
}

.post-content {
  margin-bottom: 20px;
}

.post-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 12px 0;
}

.post-description {
  color: #555;
  line-height: 1.6;
  margin: 0 0 20px 0;
}

/* 音乐播放器样式 */
.music-player {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #e9ecef;
}

.player-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.music-meta {
  display: flex;
  gap: 12px;
  align-items: center;
}

.genre-tag {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 600;
}

.duration {
  color: #666;
  font-size: 0.9rem;
}

.play-stats {
  color: #666;
  font-size: 0.9rem;
}

.player-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.play-btn {
  min-width: 100px;
}

.progress-bar {
  flex: 1;
}

.time-display {
  color: #666;
  font-size: 0.9rem;
  min-width: 80px;
  text-align: right;
}

/* 标签样式 */
.post-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.tag-item {
  background: #e3f2fd;
  color: #1976d2;
  border: none;
  border-radius: 16px;
  padding: 4px 12px;
  font-size: 0.8rem;
}

/* 互动区域样式 */
.post-interactions {
  padding-top: 16px;
  border-top: 1px solid #e9ecef;
}

.interaction-buttons {
  display: flex;
  gap: 16px;
}

.interaction-buttons .el-button {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 0.9rem;
}

.interaction-buttons .el-button:hover {
  color: #333;
}

.interaction-buttons .el-button.liked {
  color: #e91e63;
}

/* 评论区样式 */
.comments-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.comments-header h4 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 1.1rem;
}

.comment-form {
  margin-bottom: 20px;
}

.comment-form .el-input {
  margin-bottom: 12px;
}

.comment-submit-btn {
  float: right;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e9ecef;
}

.comment-user {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.comment-username {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.comment-time {
  color: #666;
  font-size: 0.8rem;
}

.comment-content {
  color: #555;
  line-height: 1.5;
  margin-bottom: 12px;
}

.comment-actions {
  display: flex;
  gap: 12px;
}

.comment-actions .el-button {
  font-size: 0.8rem;
  padding: 4px 8px;
}

/* 分页样式 */
.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    min-width: auto;
  }
  
  .player-controls {
    flex-direction: column;
    gap: 12px;
  }
  
  .progress-bar {
    width: 100%;
  }
  
  .time-display {
    text-align: center;
  }
  
  .interaction-buttons {
    justify-content: space-around;
  }
}

</style>