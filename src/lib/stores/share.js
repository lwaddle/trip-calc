/**
 * Share Store
 * Manages state for estimate sharing functionality
 */

import { writable } from 'svelte/store';
import {
  createEstimateShare,
  loadSharedEstimate,
  copySharedEstimate
} from '$lib/services/database.js';
import { showToast } from './ui.js';

// Store for share view mode (when viewing a shared estimate)
export const isShareView = writable(false);
export const sharedEstimateData = writable(null);
export const shareToken = writable(null);

/**
 * Generate a shareable link for an estimate
 * @param {string} estimateId - UUID of the estimate
 * @param {string} estimateName - Name of the estimate
 * @returns {Promise<{shareUrl: string | null, error: Error | null}>}
 */
export async function generateShareLink(estimateId, estimateName) {
  try {
    const { shareToken: token, error } = await createEstimateShare(estimateId, estimateName);

    if (error) {
      return { shareUrl: null, error };
    }

    const shareUrl = `${window.location.origin}${window.location.pathname}?share=${token}`;
    return { shareUrl, error: null };
  } catch (error) {
    return { shareUrl: null, error };
  }
}

/**
 * Load a shared estimate from a share token
 * @param {string} token - Share token from URL parameter
 * @returns {Promise<{data: object | null, error: Error | null}>}
 */
export async function loadShared(token) {
  try {
    const { data, error } = await loadSharedEstimate(token);

    if (error) {
      return { data: null, error };
    }

    // Update share view stores
    sharedEstimateData.set(data);
    shareToken.set(token);
    isShareView.set(true);

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Import a shared estimate to the current user's account
 * @param {string} token - Share token
 * @param {string} newName - Optional new name for the imported estimate
 * @returns {Promise<{data: object | null, error: Error | null}>}
 */
export async function importSharedEstimate(token, newName = null) {
  try {
    const { data, error } = await copySharedEstimate(token, newName);

    if (error) {
      showToast('Failed to import estimate: ' + error.message, 'error');
      return { data: null, error };
    }

    showToast('Estimate imported successfully!', 'success');
    return { data, error: null };
  } catch (error) {
    showToast('Failed to import estimate', 'error');
    return { data: null, error };
  }
}

/**
 * Exit share view mode and return to normal calculator
 */
export function exitShareView() {
  isShareView.set(false);
  sharedEstimateData.set(null);
  shareToken.set(null);

  // Clear the URL parameter
  const url = new URL(window.location);
  url.searchParams.delete('share');
  window.history.replaceState({}, '', url);
}

/**
 * Share via email (opens mailto link)
 * @param {string} estimateText - Text content of the estimate
 * @param {string} shareUrl - Optional shareable URL
 */
export function shareViaEmail(estimateText, shareUrl = null) {
  const subject = encodeURIComponent('Trip Cost Estimate');

  let body;
  if (shareUrl) {
    body = encodeURIComponent(`View this estimate online:\n${shareUrl}\n\n---\n\n${estimateText}`);
  } else {
    body = encodeURIComponent(estimateText);
  }

  window.location.href = `mailto:?subject=${subject}&body=${body}`;
  showToast('Opening email client...', 'success');
}

/**
 * Share via Web Share API (native sharing on mobile)
 * @param {string} title - Share title
 * @param {string} url - Share URL (for saved estimates)
 * @param {string} text - Share text (for unsaved estimates)
 * @returns {Promise<{success: boolean, error: Error | null}>}
 */
export async function shareViaNative(title, url = null, text = null) {
  if (!navigator.share) {
    showToast('Native sharing not supported on this device', 'error');
    return { success: false, error: new Error('Not supported') };
  }

  try {
    const shareData = { title };

    if (url) {
      shareData.url = url;
    } else if (text) {
      shareData.text = text;
    }

    await navigator.share(shareData);
    showToast('Shared successfully!', 'success');
    return { success: true, error: null };
  } catch (error) {
    // User cancelled or sharing failed
    if (error.name !== 'AbortError') {
      console.error('Share failed:', error);
      showToast('Failed to share', 'error');
      return { success: false, error };
    }
    return { success: false, error: null }; // User cancelled
  }
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - Success status
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!', 'success');
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    showToast('Failed to copy to clipboard', 'error');
    return false;
  }
}
