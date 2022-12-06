<script setup lang="ts">
import '@/assets/styles/app.scss'

onBeforeMount(() => {
  initWallet()
})

useHead({
  title: 'Cgram',
  meta: [
    { name: 'description', content: '' },
    { name: 'keywords', content: '' },
  ],
  link: [
    {
      rel: 'icon',
      type: 'image/svg+xml',
      href: '/favicon.svg',
    },
  ],
})
</script>

<template>
  <router-view />
</template>
