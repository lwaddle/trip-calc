/**
 * Cloudflare Pages Function for Dynamic Metadata - TEST VERSION
 *
 * Simple test to verify HTMLRewriter works
 */

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const shareToken = url.searchParams.get('share');

  // If no share parameter, serve index.html for SPA routing
  if (!shareToken) {
    return context.env.ASSETS.fetch(context.request);
  }

  // TEST: Use hardcoded title to verify HTMLRewriter works
  const dynamicTitle = `TEST - Dynamic Title Works! - Token: ${shareToken.substring(0, 8)}...`;
  const dynamicUrl = url.toString();

  // Fetch the base HTML using the original request
  const response = await context.env.ASSETS.fetch(context.request);

  // Use HTMLRewriter to inject dynamic metadata
  return new HTMLRewriter()
    .on('title', {
      element(el) {
        el.setInnerContent(dynamicTitle);
      }
    })
    .on('meta[property="og:title"]', {
      element(el) {
        el.setAttribute('content', dynamicTitle);
      }
    })
    .on('meta[property="twitter:title"]', {
      element(el) {
        el.setAttribute('content', dynamicTitle);
      }
    })
    .on('meta[property="og:url"]', {
      element(el) {
        el.setAttribute('content', dynamicUrl);
      }
    })
    .on('meta[property="twitter:url"]', {
      element(el) {
        el.setAttribute('content', dynamicUrl);
      }
    })
    .transform(response);
}
