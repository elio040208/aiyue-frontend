import { createRouter, createWebHistory } from "vue-router";

// 动态 import 页面
const MainLayout = () => import("../components/MainLayout.vue");
const Home = () => import("../views/Home.vue");
const Login = () => import("../components/Login.vue");
const Register = () => import("../components/Register.vue");
const SongDetail = () => import("../views/SongDetail.vue");
const AIGenerate = () => import("../views/AIGenerate.vue");
const AIPiano = () => import("../views/AIPiano.vue");
const MusicComposer = () => import("../views/MusicComposer.vue");

const routes = [
  { path: "/", redirect: "/login" }, // 默认重定向到登录页
  { path: "/login", name: "Login", component: Login },
  { path: "/register", name: "Register", component: Register },
  {
    path: "/app",
    component: MainLayout,
    children: [
      { path: "home", name: "Home", component: Home },
      { path: "song/:id", name: "SongDetail", component: SongDetail },
      { path: "generate", name: "AIGenerate", component: AIGenerate },
      { path: "piano", name: "AIPiano", component: AIPiano },
      { path: "composer", name: "MusicComposer", component: MusicComposer },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 登录拦截
router.beforeEach((to, from, next) => {
  const isLoggedIn = !!localStorage.getItem("token");

  if (to.path !== "/login" && to.path !== "/register" && !isLoggedIn) {
    // 没有登录时，访问受保护页面，强制跳到登录
    next("/login");
  } else {
    // 允许自由进入登录/注册
    next();
  }
});

export default router;
