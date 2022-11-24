<script setup lang="ts">
import { sayHello } from '#preload'
</script>

<template>
  <div text-xl>
    <Counter />

    <button @click="sayHello">
      SayHello
    </button>
  </div>
</template>
