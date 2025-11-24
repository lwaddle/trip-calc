/**
 * Cloudflare Pages Function for Dynamic Metadata
 *
 * Intercepts requests with ?share={token} parameter and injects
 * dynamic <title> and OpenGraph meta tags for link previews.
 */

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const shareToken = url.searchParams.get('share');

  // If no share parameter, serve static file as-is
  if (!shareToken) {
    return context.env.ASSETS.fetch(context.request);
  }

  try {
    // Fetch estimate name from Supabase
    const estimateName = await fetchEstimateNameFromSupabase(
      shareToken,
      context.env.SUPABASE_URL,
      context.env.SUPABASE_ANON_KEY
    );

    // Fetch the base HTML
    const response = await context.env.ASSETS.fetch(context.request);

    // If estimate not found or error, return original HTML
    if (!estimateName) {
      return response;
    }

    // Generate dynamic title
    const dynamicTitle = `Trip Cost Estimate - ${estimateName}`;
    const dynamicUrl = url.toString();

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
      .on('meta[name="twitter:title"]', {
        element(el) {
          el.setAttribute('content', dynamicTitle);
        }
      })
      .on('meta[property="og:url"]', {
        element(el) {
          el.setAttribute('content', dynamicUrl);
        }
      })
      .on('meta[name="twitter:url"]', {
        element(el) {
          el.setAttribute('content', dynamicUrl);
        }
      })
      .transform(response);

  } catch (error) {
    // On any error, fallback to serving original static HTML
    console.error('Error generating dynamic metadata:', error);
    return context.env.ASSETS.fetch(context.request);
  }
}

/**
 * Fetches estimate name from Supabase by share token
 *
 * @param {string} shareToken - UUID share token
 * @param {string} supabaseUrl - Supabase project URL
 * @param {string} supabaseKey - Supabase anon key
 * @returns {Promise<string|null>} Estimate name or null if not found
 */
async function fetchEstimateNameFromSupabase(shareToken, supabaseUrl, supabaseKey) {
  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/estimate_shares?share_token=eq.${shareToken}&select=share_name`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.error('Supabase query failed:', response.status);
      return null;
    }

    const data = await response.json();

    // Check if we got a result
    if (data && data.length > 0 && data[0].share_name) {
      return data[0].share_name;
    }

    return null;

  } catch (error) {
    console.error('Error fetching from Supabase:', error);
    return null;
  }
}
