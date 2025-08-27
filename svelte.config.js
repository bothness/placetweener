import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const production = process.env.NODE_ENV === 'production';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// hydrate the <div id="svelte"> element in src/app.html
		adapter: adapter({
			// Options below are defaults
			pages: 'build',
			assets: 'build',
			strict: false,
			fallback: '404.html'
		}),
		prerender: {
			handleHttpError: 'warn',
			handleMissingId: 'warn',
		},
		paths: {
			base: production ? '/placetweener' : '',
			assets: production ? 'https://bothness.github.io/placetweener' : '',
			relative: false,
		}
	}
};

export default config;
