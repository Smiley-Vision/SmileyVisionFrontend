import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import type { Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import type { Address } from '@/modules/user/interfaces/Address'
import { getUserAddressesService } from '@/modules/user/services/profileService'
import { useCartStore } from '@/modules/user/stores/cart'
import { extractAddressList, sortAddresses } from '@/modules/user/utils/address'

import { useAuthStore } from '../stores/auth'
import { formatStreetName } from '../utils/formatStreetName'

export interface NavItem {
  label: string
  routeName: string
  icon?: string
  badge?: number
  params?: Record<string, string>
}

const ADMIN_LEFT_NAV_ITEMS: NavItem[] = [
  { label: 'Tienda', routeName: 'shop' },
  { label: 'Productos', routeName: 'admin-products' },
  { label: 'Solicitudes', routeName: 'admin-registration-applications' },
  { label: 'Pedidos', routeName: 'admin-orders' },
]

const SHOP_LEFT_NAV_ITEMS: NavItem[] = [
  { label: 'Tienda', routeName: 'shop' },
  { label: 'Micas', routeName: 'shop', params: { categorySlug: 'micas' } },
  { label: 'Armazones', routeName: 'shop', params: { categorySlug: 'armazones' } },
  { label: 'Equipos', routeName: 'shop', params: { categorySlug: 'equipos' } },
  { label: 'Mis pedidos', routeName: 'my-orders' },
]

const DRIVER_LEFT_NAV_ITEMS: NavItem[] = [
  { label: 'Pedidos', routeName: 'driver-orders' },
  { label: 'Perfil', routeName: 'profile' },
]

export function useNavbar() {
  const auth = useAuthStore()
  const cart = useCartStore()
  const route = useRoute()
  const router = useRouter()

  const isMenuOpen = ref(false)
  const dropDownMenu: Ref<HTMLElement | null> = ref(null)
  const searchQuery = ref('')
  const primaryAddress = ref<Address | null>(null)

  const isAuthenticated = computed(() => auth.isAuthenticated)
  const isAdmin = computed(() => auth.isAdmin)
  const isBuyer = computed(() => auth.isBuyer)
  const isDriver = computed(() => auth.isDriver)
  const cartCount = computed(() => cart.itemCount)

  const userDisplayName = computed(() => {
    const currentUser = auth.user
    if (!currentUser) return 'Mi perfil'

    const fullName = [currentUser.first_name, currentUser.last_name]
      .filter(Boolean)
      .join(' ')
      .trim()

    return fullName || currentUser.email || 'Mi perfil'
  })

  const roleLabel = computed(() => {
    if (isAdmin.value) return 'Admin'
    if (isBuyer.value) return 'Comprador'
    if (isDriver.value) return 'Conductor'
    return 'Invitado'
  })

  const profileIcon = computed(() => {
    if (isAdmin.value) return 'pi pi-wrench'
    if (isDriver.value) return 'pi pi-truck'
    return 'pi pi-user'
  })

  const locationLabel = computed(() => {
    if (!isAuthenticated.value || !primaryAddress.value) {
      return 'Sin ubicación principal'
    }

    const street = primaryAddress.value.street.trim()

    return street ? formatStreetName(street) : 'Sin ubicación principal'
  })

  const leftNavItems = computed<NavItem[]>(() => {
    if (isAdmin.value) return ADMIN_LEFT_NAV_ITEMS
    if (isBuyer.value) return SHOP_LEFT_NAV_ITEMS
    if (isDriver.value) return DRIVER_LEFT_NAV_ITEMS
    return SHOP_LEFT_NAV_ITEMS
  })

  const rightNavItems = computed<NavItem[]>(() => {
    if (isAdmin.value) {
      return [{ label: 'Productos', routeName: 'admin-products', icon: 'pi pi-box' }]
    }

    if (isBuyer.value) {
      return [
        {
          label: 'Carrito',
          routeName: 'cart',
          icon: 'pi pi-shopping-cart',
          badge: cartCount.value,
        },
      ]
    }

    return [{ label: 'Ingresar', routeName: 'login', icon: 'pi pi-sign-in' }]
  })

  function isRouteActive(item: NavItem) {
    if (route.name !== item.routeName) return false

    const routeCategorySlug =
      typeof route.params.categorySlug === 'string' && route.params.categorySlug !== ''
        ? route.params.categorySlug
        : null
    const itemCategorySlug = item.params?.categorySlug ?? null

    return routeCategorySlug === itemCategorySlug
  }

  function handleClickOutside(event: MouseEvent) {
    if (
      dropDownMenu.value &&
      isMenuOpen.value &&
      !dropDownMenu.value.contains(event.target as Node) &&
      event.target !== document.getElementById('menu-button')
    ) {
      isMenuOpen.value = false
    }
  }

  function toggleMenu() {
    isMenuOpen.value = !isMenuOpen.value
  }

  function closeMenu() {
    isMenuOpen.value = false
  }

  function submitSearch() {
    const query = searchQuery.value.trim()
    const routeName = isAdmin.value ? 'admin-products' : 'shop'

    if (!query) {
      router.push({ name: routeName })
      return
    }

    router.push({ name: routeName, query: { search: query } })
  }

  async function loadPrimaryAddress() {
    if (!isAuthenticated.value || !auth.user?.id) {
      primaryAddress.value = null
      return
    }

    try {
      const addresses = sortAddresses(extractAddressList(await getUserAddressesService()))
      primaryAddress.value = addresses[0] ?? null
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

  return {
    isMenuOpen,
    dropDownMenu,
    searchQuery,
    isAuthenticated,
    isAdmin,
    isBuyer,
    isDriver,
    cartCount,
    userDisplayName,
    roleLabel,
    profileIcon,
    locationLabel,
    leftNavItems,
    rightNavItems,
    isRouteActive,
    toggleMenu,
    submitSearch,
  }
}
