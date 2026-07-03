<script setup>
import { getUserAddressesService } from '@/contexts/identity/services/profileService'
import { useCartStore } from '@/contexts/catalog/stores/cart'
import { useAuthStore } from '@/contexts/identity/stores/auth'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

const auth = useAuthStore()
const cart = useCartStore()
const route = useRoute()
const router = useRouter()
const emit = defineEmits(['toggle-menu'])

const isMenuOpen = ref(false)
const dropDownMenu = ref(null)
const searchQuery = ref('')
const primaryAddress = ref(null)

const roleId = computed(() => Number(auth.user?.role_id ?? 0))
const isAuthenticated = computed(() => auth.isAuthenticated)
const isAdmin = computed(() => roleId.value === 1)
const isBuyer = computed(() => roleId.value === 2)
const isDriver = computed(() => roleId.value === 3)
const cartCount = computed(() => cart.itemCount)

const userDisplayName = computed(() => {
  const currentUser = auth.user ?? {}
  const fullName = [currentUser.first_name, currentUser.last_name].filter(Boolean).join(' ').trim()

  return fullName || currentUser.name || currentUser.email || 'Mi perfil'
})

const roleLabel = computed(() => {
  if (isAdmin.value) return 'Admin'
  if (isBuyer.value) return 'Comprador'
  if (isDriver.value) return 'Conductor'
  return 'Invitado'
})

const locationLabel = computed(() => {
  if (!isAuthenticated.value || !primaryAddress.value) {
    return 'Sin ubicación principal'
  }

  const street = String(primaryAddress.value.street ?? '').trim()

  return street ? `Calle ${street}` : 'Sin ubicación principal'
})

const leftNavItems = computed(() => {
  if (isAdmin.value) {
    return [
      { label: 'Tienda', routeName: 'shop' },
      { label: 'Productos', routeName: 'admin-products' },
      { label: 'Inventario', routeName: 'admin-products-availability' },
      { label: 'Solicitudes', routeName: 'admin-register' },
    ]
  }

  if (isBuyer.value) {
    return [
      { label: 'Tienda', routeName: 'shop' },
      { label: 'Micas', routeName: 'shop-Micas' },
      { label: 'Armazones', routeName: 'shop-Armazones' },
      { label: 'Equipos', routeName: 'shop-Equipos' },
    ]
  }

  if (isDriver.value) {
    return [{ label: 'Perfil', routeName: 'profile' }]
  }

  return [
    { label: 'Tienda', routeName: 'shop' },
    { label: 'Micas', routeName: 'shop-Micas' },
    { label: 'Armazones', routeName: 'shop-Armazones' },
    { label: 'Equipos', routeName: 'shop-Equipos' },
  ]
})

const rightNavItems = computed(() => {
  if (isAdmin.value) {
    return [{ label: 'Productos', routeName: 'admin-products', icon: 'pi pi-box' }]
  }

  if (isBuyer.value) {
    return [
      { label: 'Carrito', routeName: 'cart', icon: 'pi pi-shopping-cart', badge: cartCount.value },
    ]
  }

  return [{ label: 'Ingresar', routeName: 'login', icon: 'pi pi-sign-in' }]
})

function isRouteActive(routeName) {
  return route.name === routeName
}

function handleClickOutside(event) {
  if (
    dropDownMenu.value &&
    isMenuOpen.value &&
    !dropDownMenu.value.contains(event.target) &&
    event.target !== document.getElementById('menu-button')
  ) {
    isMenuOpen.value = false
    emit('toggle-menu', false)
  }
}

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
  emit('toggle-menu', isMenuOpen.value)
}

function closeMenu() {
  isMenuOpen.value = false
  emit('toggle-menu', false)
}

function submitSearch() {
  const query = searchQuery.value.trim()

  if (!query) {
    router.push({ name: isAdmin.value ? 'admin-products' : 'shop' })
    return
  }

  router.push({
    name: isAdmin.value ? 'admin-products' : 'shop',
    query: { search: query },
  })
}

async function loadPrimaryAddress() {
  if (!isAuthenticated.value || !auth.user?.id) {
    primaryAddress.value = null
    return
  }

  try {
    const response = await getUserAddressesService(auth.user.id)
    const addresses = Array.isArray(response?.addresses) ? response.addresses : []
    primaryAddress.value = addresses.find((address) => address?.is_default) ?? addresses[0] ?? null
  } catch {
    primaryAddress.value = null
  }
}

onMounted(() => {
  void cart.initializeForSession().catch(() => {})
  void loadPrimaryAddress()
  document.body.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.body.removeEventListener('click', handleClickOutside)
})

watch(
  () => [auth.isAuthenticated, auth.user?.id],
  () => {
    void cart.initializeForSession().catch(() => {})
    void loadPrimaryAddress()
  },
  { immediate: true },
)

watch(
  () => route.fullPath,
  () => {
    closeMenu()
  },
)
</script>

<template>
  <header
    class="sticky top-0 z-50 border-b border-sky-900/10 bg-sky-800 text-white shadow-[0_10px_24px_rgba(7,89,133,0.18)]"
  >
    <div class="mx-auto max-w-[1600px] px-4 py-2.5 sm:px-6 lg:px-12">
      <div
        class="hidden items-center gap-5 lg:grid lg:grid-cols-[220px_minmax(320px,1fr)_260px_220px]"
      >
        <RouterLink :to="{ name: 'home' }" class="flex items-center gap-3">
          <div
            class="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
          >
            <img
              src="@/assets/images/smiley_logo.png"
              alt="Smiley Vision Logo"
              class="h-10 w-10 object-contain"
            />
          </div>
          <div class="flex flex-col leading-none text-white">
            <span class="text-xl font-extrabold">Smiley</span>
            <span class="-mt-1 text-xl font-extrabold">Vision</span>
          </div>
        </RouterLink>

        <form
          class="flex items-center overflow-hidden rounded-[0.55rem] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.16)]"
          @submit.prevent="submitSearch"
        >
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Buscar productos, marcas y más..."
            class="h-11 w-full border-0 px-5 text-base font-medium text-slate-700 outline-none placeholder:text-slate-400"
          />
          <button
            type="submit"
            class="flex h-11 w-14 items-center justify-center border-l border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
          >
            <i class="pi pi-search text-lg"></i>
          </button>
        </form>

        <div class="flex items-center text-slate-100">
          <span class="flex h-10 w-10 items-center justify-center text-white">
            <i class="pi pi-map-marker text-[1.35rem]"></i>
          </span>
          <div class="leading-tight">
            <p class="text-sm font-bold text-white">{{ locationLabel }}</p>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2">
          <RouterLink
            v-for="item in rightNavItems"
            :key="`top-right-${item.routeName}`"
            :to="{ name: item.routeName }"
            :class="[
              isRouteActive(item.routeName)
                ? 'bg-sky-900 text-white'
                : 'text-slate-100 hover:bg-sky-700/70',
              'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition',
            ]"
          >
            <i :class="item.icon"></i>
            <span>{{ item.label }}</span>
            <span
              v-if="item.badge > 0"
              class="inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[0.72rem] font-bold text-white"
            >
              {{ item.badge > 99 ? '99+' : item.badge }}
            </span>
          </RouterLink>

          <RouterLink
            v-if="isAuthenticated"
            :to="{ name: 'profile' }"
            class="flex h-11 w-11 items-center justify-center rounded-full bg-white text-sky-800 shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition hover:scale-[1.03]"
            aria-label="Ir al perfil"
          >
            <i
              :class="isAdmin ? 'pi pi-wrench' : isDriver ? 'pi pi-truck' : 'pi pi-user'"
              class="text-base"
            ></i>
          </RouterLink>
        </div>
      </div>

      <div class="hidden items-center justify-between gap-6 pt-2 lg:flex">
        <div class="flex flex-wrap items-center gap-1">
          <RouterLink
            v-for="item in leftNavItems"
            :key="item.routeName"
            :to="{ name: item.routeName }"
            :class="[
              isRouteActive(item.routeName)
                ? 'bg-sky-900 text-white'
                : 'text-slate-200 hover:bg-sky-700/70 hover:text-white',
              'rounded-xl px-3 py-2 text-[0.98rem] font-medium transition',
            ]"
          >
            {{ item.label }}
          </RouterLink>
        </div>

        <div
          v-if="isAuthenticated"
          class="flex items-center gap-2 text-sm font-medium text-slate-300"
        >
          <span>{{ userDisplayName }}</span>
          <span class="text-slate-400">|</span>
          <span>{{ roleLabel }}</span>
        </div>
      </div>

      <div class="flex flex-col gap-3 lg:hidden">
        <div class="flex items-center justify-between gap-4">
          <RouterLink :to="{ name: 'home' }" class="flex items-center gap-3">
            <div
              class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
            >
              <img
                src="@/assets/images/smiley_logo.png"
                alt="Smiley Vision Logo"
                class="h-10 w-10 object-contain"
              />
            </div>
            <div class="flex flex-col leading-none text-white">
              <span class="font-extrabold">Smiley</span>
              <span class="-mt-1 font-extrabold">Vision</span>
            </div>
          </RouterLink>

          <div class="flex items-center gap-2">
            <RouterLink
              v-if="isBuyer"
              :to="{ name: 'cart' }"
              class="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-sky-800 shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
            >
              <i class="pi pi-shopping-cart"></i>
              <span
                v-if="cartCount > 0"
                class="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[0.65rem] font-bold text-white"
              >
                {{ cartCount > 99 ? '99+' : cartCount }}
              </span>
            </RouterLink>
            <RouterLink
              v-if="isAuthenticated"
              :to="{ name: 'profile' }"
              class="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sky-800 shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
            >
              <i :class="isAdmin ? 'pi pi-wrench' : isDriver ? 'pi pi-truck' : 'pi pi-user'"></i>
            </RouterLink>
            <button
              id="menu-button"
              :class="`pi ${isMenuOpen ? 'pi-times' : 'pi-bars'}`"
              class="rounded-xl p-2 text-white"
              style="font-size: 1.6rem"
              @click="toggleMenu"
            ></button>
          </div>
        </div>

        <form
          class="flex items-center overflow-hidden rounded-[0.55rem] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.16)]"
          @submit.prevent="submitSearch"
        >
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Buscar productos..."
            class="h-10 w-full border-0 px-4 text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
          />
          <button
            type="submit"
            class="flex h-10 w-12 items-center justify-center border-l border-slate-200 text-slate-500"
          >
            <i class="pi pi-search text-lg"></i>
          </button>
        </form>

        <div class="flex items-center gap-3 text-slate-100">
          <span class="flex h-9 w-9 items-center justify-center text-white">
            <i class="pi pi-map-marker text-[1.2rem]"></i>
          </span>
          <div class="leading-tight">
            <p class="text-sm font-bold text-white">{{ locationLabel }}</p>
          </div>
        </div>
      </div>
    </div>
  </header>

  <div ref="dropDownMenu" class="sticky top-[76px] z-50 flex justify-end lg:hidden">
    <div
      :class="[
        isMenuOpen
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : 'pointer-events-none -translate-y-2 opacity-0',
        'absolute right-4 w-[min(22rem,calc(100vw-2rem))] rounded-[1.2rem] border border-sky-700/30 bg-sky-800 px-4 py-4 shadow-[0_18px_40px_rgba(0,0,0,0.18)] transition duration-200',
      ]"
    >
      <div class="flex flex-col gap-2">
        <RouterLink
          v-for="item in leftNavItems"
          :key="`mobile-left-${item.routeName}`"
          :to="{ name: item.routeName }"
          :class="[
            isRouteActive(item.routeName)
              ? 'bg-sky-900 text-white'
              : 'hover:bg-sky-700/70 text-slate-100',
            'rounded-xl px-4 py-3 font-bold',
          ]"
        >
          {{ item.label }}
        </RouterLink>

        <RouterLink
          v-if="isAuthenticated"
          :to="{ name: 'profile' }"
          class="mt-2 rounded-xl bg-sky-900/80 px-4 py-3"
        >
          <div class="flex items-center gap-3">
            <span
              class="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sky-800"
            >
              <i :class="isAdmin ? 'pi pi-wrench' : isDriver ? 'pi pi-truck' : 'pi pi-user'"></i>
            </span>
            <span class="flex flex-col leading-tight">
              <span class="max-w-[180px] truncate font-bold text-white">{{ userDisplayName }}</span>
              <span class="text-xs text-slate-300">{{ roleLabel }}</span>
            </span>
          </div>
        </RouterLink>

        <RouterLink
          v-for="item in rightNavItems"
          :key="`mobile-right-${item.routeName}`"
          :to="{ name: item.routeName }"
          :class="[
            isRouteActive(item.routeName)
              ? 'bg-sky-900 text-white'
              : 'hover:bg-sky-700/70 text-slate-100',
            'flex items-center justify-between rounded-xl px-4 py-3 font-bold',
          ]"
        >
          <span class="flex items-center gap-3">
            <i :class="item.icon"></i>
            <span>{{ item.label }}</span>
          </span>
          <span
            v-if="item.badge > 0"
            class="inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[0.72rem] font-bold text-white"
          >
            {{ item.badge > 99 ? '99+' : item.badge }}
          </span>
        </RouterLink>
      </div>
    </div>
  </div>
</template>
