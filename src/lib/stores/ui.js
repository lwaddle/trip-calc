import { writable } from 'svelte/store';

// ===========================
// Modal Management
// ===========================

export const activeModal = writable(null);

export function openModal(modalId) {
    activeModal.set(modalId);
}

export function closeModal() {
    activeModal.set(null);
}

// ===========================
// Toast Notifications
// ===========================

export const toastMessage = writable('');
export const toastType = writable('info'); // 'success', 'error', 'info'
export const toastVisible = writable(false);

let toastTimeout;

export function showToast(message, type = 'info', duration = 3000) {
    // Clear existing timeout
    if (toastTimeout) {
        clearTimeout(toastTimeout);
    }

    toastMessage.set(message);
    toastType.set(type);
    toastVisible.set(true);

    // Auto-hide after duration
    toastTimeout = setTimeout(() => {
        toastVisible.set(false);
    }, duration);
}

export function hideToast() {
    toastVisible.set(false);
    if (toastTimeout) {
        clearTimeout(toastTimeout);
    }
}

// ===========================
// Loading States
// ===========================

export const isLoading = writable(false);
export const loadingMessage = writable('');

export function setLoading(loading, message = '') {
    isLoading.set(loading);
    loadingMessage.set(message);
}
