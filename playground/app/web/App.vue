<script setup lang="ts">
import { sayHello } from '#preload'
</script>

<template>
  <div text-xl>
    <Counter />

    <div mt-2>
      <button @click="sayHello">
        SayHello
      </button>
    </div>
  </div>
</template>
