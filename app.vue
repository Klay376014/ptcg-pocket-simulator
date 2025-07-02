<template>
  <div class="dark bg-background text-foreground min-h-screen">
    <NuxtRouteAnnouncer />
    <header class="p-4 border-b">
      <nav>
        <NuxtLink to="/">
          <Button variant="outline">Index</Button>
        </NuxtLink>
        <NuxtLink to="/second" class="ml-4">
          <Button variant="outline">Second Page</Button>
        </NuxtLink>
      </nav>
    </header>
    <main class="p-4">
      <NuxtPage />
    </main>
  </div>
</template>

<script setup lang="ts">
</script>