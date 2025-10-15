---
title: Vue
tags: [vue, javascript, typescript, framework, frontend, progressive, reactive]
---

# Vue

Vue (pronounced "view") is a progressive JavaScript framework for building user interfaces. Created by Evan You in 2014, Vue is designed to be incrementally adoptable—you can use it for just a small part of your page or build full-scale single-page applications. Known for its gentle learning curve and excellent documentation, Vue is a popular choice for developers who want a more approachable alternative to [React](/content/frameworks/react).

## What is Vue?

Vue combines the best ideas from [React](/content/frameworks/react) and Angular into an accessible, performant framework:

```vue
<template>
  <div class="counter">
    <p>Count: {{ count }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const count = ref(0);

function increment() {
  count.value++;
}
</script>

<style scoped>
.counter {
  padding: 20px;
}
</style>
```

**Key Philosophy:**
- **Progressive**: Use as much or as little as you need
- **Approachable**: Easier learning curve than React or Angular
- **Performant**: Fast virtual DOM implementation
- **Versatile**: From widgets to full SPAs

## Why Vue?

### 1. Gentle Learning Curve

Vue is often easier to learn than [React](/content/frameworks/react):

```vue
<!-- Vue: Template syntax feels like HTML -->
<template>
  <div>
    <h1>{{ title }}</h1>
    <button @click="handleClick">Click me</button>
  </div>
</template>

<script setup>
const title = 'Hello Vue';

function handleClick() {
  console.log('Clicked!');
}
</script>
```

Compare to React JSX:
```jsx
function Component() {
  const title = 'Hello React';

  function handleClick() {
    console.log('Clicked!');
  }

  return (
    <div>
      <h1>{title}</h1>
      <button onClick={handleClick}>Click me</button>
    </div>
  );
}
```

### 2. Single-File Components

Everything for a component in one file:

```vue
<template>
  <!-- HTML -->
  <div class="card">
    <h2>{{ title }}</h2>
    <p>{{ description }}</p>
  </div>
</template>

<script setup>
// JavaScript
const title = 'Card Title';
const description = 'Card description';
</script>

<style scoped>
/* Scoped CSS */
.card {
  padding: 1rem;
  background: white;
  border-radius: 8px;
}
</style>
```

### 3. Reactive Data

Built-in reactivity without hooks:

```vue
<script setup>
import { ref, computed, watch } from 'vue';

// Reactive state
const count = ref(0);
const name = ref('Alice');

// Computed property (like useMemo)
const doubleCount = computed(() => count.value * 2);

// Watcher (like useEffect)
watch(count, (newValue, oldValue) => {
  console.log(`Count changed from ${oldValue} to ${newValue}`);
});

function increment() {
  count.value++;
}
</script>

<template>
  <div>
    <p>Count: {{ count }}</p>
    <p>Double: {{ doubleCount }}</p>
    <button @click="increment">+</button>
  </div>
</template>
```

### 4. Excellent Documentation

Vue is known for having some of the best documentation in the JavaScript ecosystem:

- Clear, beginner-friendly guides
- Interactive examples
- Migration guides between versions
- Available in multiple languages

### 5. Official Ecosystem

Unlike React, Vue provides official solutions:

- **Vue Router**: Official routing
- **Pinia**: Official state management (successor to Vuex)
- **Vue Test Utils**: Official testing library
- **Vite**: Official build tool (created by Evan You)

## Vue 3 Features

### Composition API

Modern way to write Vue components:

```vue
<script setup>
import { ref, onMounted } from 'vue';

const users = ref([]);
const loading = ref(true);

onMounted(async () => {
  const response = await fetch('/api/users');
  users.value = await response.json();
  loading.value = false;
});
</script>

<template>
  <div v-if="loading">Loading...</div>
  <ul v-else>
    <li v-for="user in users" :key="user.id">
      {{ user.name }}
    </li>
  </ul>
</template>
```

### Options API (Traditional)

Still supported, easier for beginners:

```vue
<script>
export default {
  data() {
    return {
      count: 0,
      message: 'Hello'
    };
  },
  computed: {
    doubleCount() {
      return this.count * 2;
    }
  },
  methods: {
    increment() {
      this.count++;
    }
  },
  mounted() {
    console.log('Component mounted');
  }
};
</script>

<template>
  <div>
    <p>{{ message }}</p>
    <p>Count: {{ count }}</p>
    <p>Double: {{ doubleCount }}</p>
    <button @click="increment">+</button>
  </div>
</template>
```

## Template Syntax

### Directives

```vue
<template>
  <!-- Conditional rendering -->
  <div v-if="isVisible">Visible</div>
  <div v-else>Hidden</div>

  <!-- Show/hide (display: none) -->
  <div v-show="isShown">Shown</div>

  <!-- List rendering -->
  <ul>
    <li v-for="item in items" :key="item.id">
      {{ item.name }}
    </li>
  </ul>

  <!-- Event handling -->
  <button @click="handleClick">Click</button>
  <input @input="handleInput" />

  <!-- Two-way binding -->
  <input v-model="message" />

  <!-- Attribute binding -->
  <img :src="imageUrl" :alt="imageAlt" />

  <!-- Class binding -->
  <div :class="{ active: isActive, 'text-bold': isBold }">
    Text
  </div>

  <!-- Style binding -->
  <div :style="{ color: textColor, fontSize: size + 'px' }">
    Styled
  </div>
</template>
```

## State Management with Pinia

```javascript
// stores/counter.js
import { defineStore } from 'pinia';

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
    name: 'Counter'
  }),
  getters: {
    doubleCount: (state) => state.count * 2,
  },
  actions: {
    increment() {
      this.count++;
    },
    async fetchCount() {
      const response = await fetch('/api/count');
      this.count = await response.json();
    }
  }
});
```

**Using the store:**
```vue
<script setup>
import { useCounterStore } from '@/stores/counter';

const counter = useCounterStore();
</script>

<template>
  <div>
    <p>Count: {{ counter.count }}</p>
    <p>Double: {{ counter.doubleCount }}</p>
    <button @click="counter.increment">+</button>
  </div>
</template>
```

## Routing with Vue Router

```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import About from '../views/About.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About },
    { path: '/users/:id', component: UserProfile },
  ]
});

export default router;
```

**Using router:**
```vue
<template>
  <nav>
    <router-link to="/">Home</router-link>
    <router-link to="/about">About</router-link>
  </nav>

  <router-view />
</template>
```

**Accessing route params:**
```vue
<script setup>
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

console.log(route.params.id);

function goHome() {
  router.push('/');
}
</script>
```

## [TypeScript](/content/languages/typescript) Support

Vue 3 has excellent TypeScript support:

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';

interface User {
  id: number;
  name: string;
  email: string;
}

const users = ref<User[]>([]);
const searchQuery = ref<string>('');

const filteredUsers = computed(() => {
  return users.value.filter(user =>
    user.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

async function fetchUsers(): Promise<void> {
  const response = await fetch('/api/users');
  users.value = await response.json();
}
</script>
```

## Nuxt (Full-Stack Framework)

Nuxt is to Vue what [Next.js](/content/frameworks/nextjs) is to React:

```vue
<!-- pages/index.vue -->
<script setup>
const { data: posts } = await useFetch('/api/posts');
</script>

<template>
  <div>
    <h1>Blog Posts</h1>
    <article v-for="post in posts" :key="post.id">
      <h2>{{ post.title }}</h2>
      <p>{{ post.excerpt }}</p>
    </article>
  </div>
</template>
```

**Features:**
- Server-side rendering
- File-based routing
- Auto-imports
- API routes
- Built on Vite

## Styling Options

### Scoped Styles

```vue
<style scoped>
/* Only applies to this component */
.button {
  background: blue;
  color: white;
}
</style>
```

### [Tailwind CSS](/content/css/tailwind)

```vue
<template>
  <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">
    Click me
  </button>
</template>
```

### CSS Modules

```vue
<script setup>
import styles from './Button.module.css';
</script>

<template>
  <button :class="styles.button">
    Click me
  </button>
</template>
```

## Component Communication

### Props (Parent → Child)

```vue
<!-- Parent -->
<template>
  <UserCard :user="currentUser" :is-admin="true" />
</template>

<!-- Child (UserCard.vue) -->
<script setup>
interface Props {
  user: User;
  isAdmin?: boolean;
}

const props = defineProps<Props>();
</script>

<template>
  <div class="card">
    <h2>{{ props.user.name }}</h2>
    <span v-if="props.isAdmin">Admin</span>
  </div>
</template>
```

### Emits (Child → Parent)

```vue
<!-- Child -->
<script setup>
const emit = defineEmits<{
  update: [value: string];
  delete: [];
}>();

function handleUpdate() {
  emit('update', 'new value');
}
</script>

<template>
  <button @click="handleUpdate">Update</button>
</template>

<!-- Parent -->
<template>
  <ChildComponent
    @update="handleUpdate"
    @delete="handleDelete"
  />
</template>
```

## Lifecycle Hooks

```vue
<script setup>
import {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted
} from 'vue';

onBeforeMount(() => {
  console.log('About to mount');
});

onMounted(() => {
  console.log('Component mounted');
  // Fetch data, add event listeners
});

onBeforeUpdate(() => {
  console.log('About to update');
});

onUpdated(() => {
  console.log('Component updated');
});

onBeforeUnmount(() => {
  console.log('About to unmount');
  // Cleanup
});

onUnmounted(() => {
  console.log('Component unmounted');
});
</script>
```

## Vue vs React

| Feature | Vue | [React](/content/frameworks/react) |
|---------|-----|-------|
| **Learning Curve** | Gentle | Moderate |
| **Syntax** | Templates | JSX |
| **State** | Built-in reactivity | Hooks |
| **Routing** | Official (Vue Router) | Third-party |
| **State Management** | Official (Pinia) | Third-party |
| **TypeScript** | Excellent | Excellent |
| **Ecosystem** | Large | Huge |
| **Job Market** | Good | Excellent |

## Component Libraries

- **Vuetify**: Material Design components
- **Quasar**: Full-featured UI framework
- **Element Plus**: Desktop-focused UI library
- **PrimeVue**: Rich set of components
- **Naive UI**: Modern component library
- **Ant Design Vue**: Enterprise UI components

## Best Practices

### 1. Use Composition API for Complex Logic

```vue
<!-- ✓ Good for complex components -->
<script setup>
import { ref, computed, onMounted } from 'vue';
import { useUserData } from '@/composables/useUserData';

const { users, loading, error } = useUserData();
</script>
```

### 2. Keep Components Small

```vue
<!-- ✓ Good - small, focused components -->
<script setup>
import UserCard from './UserCard.vue';
import UserList from './UserList.vue';
</script>
```

### 3. Use Computed for Derived State

```vue
<script setup>
import { ref, computed } from 'vue';

const items = ref([...]);

// ✓ Good - computed
const expensiveItems = computed(() =>
  items.value.filter(item => item.price > 100)
);

// ❌ Bad - method called on every render
function getExpensiveItems() {
  return items.value.filter(item => item.price > 100);
}
</script>
```

## Learning Resources

### Official Resources
- **Vue Documentation**: [vuejs.org](https://vuejs.org)
- **Vue Mastery**: Official video courses
- **Vue School**: Interactive tutorials
- **Vue 3 Migration Guide**: Upgrade from Vue 2

### Community
- **Vue Discord**: Active community
- **Vue Forum**: Official discussions
- **r/vuejs**: Reddit community
- **Awesome Vue**: Curated resources

### Courses
- **Vue 3 Complete Guide** - Maximilian Schwarzmüller
- **Vue.js Course for Beginners** - freeCodeCamp
- **Vue Mastery** - Official courses
- **Vue School** - Interactive learning

### YouTube Channels
- **Vue Mastery**: Official channel
- **Program With Erik**: Vue tutorials
- **The Net Ninja**: Vue course
- **Traversy Media**: Vue crash courses

## Key Takeaways

- **Progressive framework** for building UIs
- **Gentler learning curve** than React or Angular
- **Single-file components** with template, script, and style
- **Built-in reactivity** without hooks
- **Official ecosystem** (Router, Pinia, DevTools)
- **Excellent documentation** and community
- **TypeScript support** in Vue 3
- **Versatile** from small widgets to large apps

## Related Topics

- [React](/content/frameworks/react) - Alternative UI library
- [Angular](/content/frameworks/angular) - Full framework alternative
- [JavaScript Frameworks](/content/frameworks/javascript-frameworks) - Framework comparison
- [TypeScript](/content/languages/typescript) - Type-safe Vue development
- [Tailwind CSS](/content/css/tailwind) - Popular styling choice
- [Next.js](/content/frameworks/nextjs) - React's full-stack framework (compare with Nuxt)

Vue strikes a perfect balance between simplicity and power. Its approachable syntax, excellent documentation, and official ecosystem make it an ideal choice for developers who want a more intuitive alternative to React while still building production-grade applications. Whether you're adding interactivity to a WordPress site or building a complex SPA, Vue's progressive nature means you can use exactly what you need.
