<script setup>
import router from '@/router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'primevue'
import { computed } from 'vue'
import { ref, defineEmits, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const auth = useAuthStore()
const toast = useToast()

const isMenuOpen = ref(false)
const dropDownMenu = ref(null)
const isAuthenticated = computed(() => auth.isAuthenticated)
const isAdmin = computed(() => auth.isAdmin)
const user = computed(() => auth.user)
const emit = defineEmits(['toggle-menu'])

const isActiveLink = (routePath) => {
    const route = useRoute() // Current route path we're in
    return route.path === routePath
}

// User clicks outside the drop-down menu
function handleClickOutside(event) {
    if (dropDownMenu.value &&
        isMenuOpen.value &&
        !dropDownMenu.value.contains(event.target) &&
        event.target !== document.getElementById('menu-button')) {
            isMenuOpen.value = false;
            emit('toggle-menu', false);
    }
}

const handleLogout = async () => {
    try {
        const data = await auth.logout()

        router.push('/')

        toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Sesión cerrada',
            life: 4000 // 4 seconds
        })
    } catch (error) {
        throw error
    }
}

const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value
    emit('toggle-menu', isMenuOpen.value)
}

onMounted(() => {
    document.body.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    document.body.removeEventListener('click', handleClickOutside)
})
</script>

<template>
    <!-- Navbar - Desktop -->
    <div class="bg-sky-800 min-w-full max-w-full shadow-2xl">
        <div class="text-white mx-auto px-20 py-6 flex items-center justify-between">

            <!-- Logo section -->
            <div class="flex justify-center items-center gap-x-4">
                <div class="min-w-16 max-w-16">
                    <img src="@/assets/images/smiley_logo.png" alt="Smiley Vision Logo">
                </div>
                <div class="flex lg:text-2xl text-xl font-semibold shrink-0 md:visible invisible">
                    Smiley Vision
                </div>
            </div>

            <!-- Nabar Links - Desktop -->
            <ul class="lg:flex items-center justify-between my-4 xl:gap-x-4 hidden">
                <li>
                    <!-- Home -->
                    <RouterLink
                        :class="[isActiveLink('/') ? 'bg-sky-900' : 'hover:bg-sky-700 hover:rounded-xl',
                                 'p-4 font-semibold rounded-xl']"
                        :to="{ name: 'home' }">Principal
                    </RouterLink>
                </li>
                <li>
                    <!-- About -->
                    <RouterLink
                        :class="[isActiveLink('/about') ? 'bg-sky-900' : 'hover:bg-sky-700 hover:rounded-xl',
                                 'p-4 font-semibold rounded-xl']"
                        :to="{ name: 'about' }">Acerca
                    </RouterLink>
                </li>
                <li>
                    <!-- Shop / Products (admin) -->
                    <RouterLink
                        v-if="!isAuthenticated || isAuthenticated && !isAdmin"
                        :class="[isActiveLink('/shop') ? 'bg-sky-900' : 'hover:bg-sky-700 hover:rounded-xl',
                                 'p-4 font-semibold rounded-xl']"
                        :to="{ name: 'shop' }">Comprar
                    </RouterLink>
                    <RouterLink
                        v-else
                        :class="[isActiveLink('/admin/products') ? 'bg-sky-900' : 'hover:bg-sky-700 hover:rounded-xl',
                                 'p-4 font-semibold rounded-xl']"
                        :to="{ name: 'admin-products' }">Productos
                    </RouterLink>
                </li>
                <li>
                    <!-- Contact / Register (admin) -->
                    <RouterLink
                        v-if="!isAuthenticated || isAuthenticated && !isAdmin"
                        :class="[isActiveLink('/contact') ? 'bg-sky-900' : 'hover:bg-sky-700 hover:rounded-xl',
                                 'p-4 font-semibold rounded-xl']"
                        :to="{ name: 'contact' }">Contacto
                    </RouterLink>
                    <RouterLink
                        v-else
                        :class="[isActiveLink('/admin/register') ? 'bg-sky-900' : 'hover:bg-sky-700 hover:rounded-xl',
                                 'p-4 font-semibold rounded-xl']"
                        :to="{ name: 'admin-register' }">Registrar
                    </RouterLink>
                </li>
            </ul>

            <!-- Navbar Icons - Desktop -->
            <div class="lg:flex items-center justify-center gap-8 hidden">
                <div v-if="!isAuthenticated" class="flex gap-x-8">
                    <div class="min-w-8 max-w-16">
                        <RouterLink class="pi pi-info-circle" style="font-size: 1.5rem" :to="{ name: 'about' }"></RouterLink>
                    </div>
                    <div class="min-w-8 max-w-16">
                        <RouterLink class="pi pi-shopping-bag" style="font-size: 1.5rem" :to="{ name: 'shop' }"></RouterLink>
                    </div>
                </div>
                <div v-else-if="isAuthenticated && isAdmin" class="text-2xl xl:-ml-24">
                    {{ '[ADMIN] ' + user.name }}
                </div>
                <div v-else-if="isAuthenticated && !isAdmin" class="text-2xl xl:-ml-20">
                    {{ '[USER] ' + user.name }}
                </div>
                <RouterLink v-if="!isAuthenticated" :to="{ name: 'login' }" class="bg-sky-200 hover:bg-sky-300 text-black px-4 py-2 rounded-xl shadow-xl">
                    Iniciar sesión
                </RouterLink>
                <RouterLink v-else :to="{ name: 'home' }" @click.prevent="handleLogout" class="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-xl shadow-xl">
                    Cerrar sesión
                </RouterLink>
            </div>

            <!-- Mobile Menu Icon -->
            <div class="flex lg:hidden">
                <button id="menu-button" :class="`pi ${isMenuOpen ? 'pi-times' : 'pi-bars'}`" style="font-size: 2rem"
                    @click="toggleMenu"></button>
            </div>
        </div>
    </div>

    <!-- Mobile Menu -->
    <div ref="dropDownMenu" class="absolute right-0 shadow-xl z-50">
        <ul :class="`flex flex-col max-w-40 bg-sky-600 text-white px-6 py-4 gap-y-4 lg:hidden
            ${isMenuOpen ? '' : 'hidden'}`">
            <li>
                <RouterLink class="hover:bg-sky-700 hover:rounded-xl px-4 py-2 font-semibold" :to="{ name: 'home' }">Principal
                </RouterLink>
            </li>
            <li>
                <RouterLink class="hover:bg-sky-700 hover:rounded-xl px-4 py-2 font-semibold" :to="{ name: 'about' }">Acerca
                </RouterLink>
            </li>
            <li>
                <RouterLink v-if="!isAuthenticated || isAuthenticated && !isAdmin"
                    class="hover:bg-sky-700 hover:rounded-xl px-4 py-2 font-semibold" :to="{ name: 'shop' }">Comprar
                </RouterLink>
                <RouterLink v-else class="hover:bg-sky-700 hover:rounded-xl px-4 py-2 font-semibold" :to="{ name: 'admin-products' }">Productos
                </RouterLink>
            </li>
            <li>
                <RouterLink v-if="!isAuthenticated || isAuthenticated && !isAdmin"
                    class="hover:bg-sky-700 hover:rounded-xl px-4 py-2 font-semibold" :to="{ name: 'contact' }">Contacto
                </RouterLink>
                <RouterLink v-else class="hover:bg-sky-700 hover:rounded-xl px-4 py-2 font-semibold" :to="{ name: 'admin-register' }">Registrar
                </RouterLink>
            </li>
            <li class="mb-1">
                <RouterLink v-if="!isAuthenticated"
                    class="hover:bg-sky-700 hover:rounded-xl px-4 py-2 font-semibold" :to="{ name: 'login' }">Ingresar
                </RouterLink>
                <RouterLink v-else
                    class="hover:bg-sky-700 hover:rounded-xl px-4 py-2 font-semibold" :to="{ name: 'home' }" @click.prevent="handleLogout">Salir
                </RouterLink>
            </li>
        </ul>
    </div>
</template>