import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import MainLayout from "../components/MainLayout.vue"
const routes = [
  {
    path: "/",
    component: MainLayout,
    children: [
      { path: "/", name: "Home", component: Home },
      {
        path: "/song/:id",
        name: "SongDetail",
        component: () => import("../views/SongDetail.vue"),
      },
      {
        path: "/generate",
        name: "AIGenerate",
        component: () => import("../views/AIGenerate.vue"),
      },
            {
        path: "/piano",
        name: "AIPiano",
        component: () => import("../views/AIPiano.vue"),
      },
    ],
  },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
