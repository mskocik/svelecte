import { getSingletonHighlighter } from 'shiki';
import { transformerNotationDiff } from '@shikijs/transformers';
import { escapeSvelte } from 'mdsvex';

const THEME = 'github-dark';

/**
 * Returns code with curly braces and backticks replaced by HTML entity equivalents
 * @param {string} code - highlighted HTML
 * @returns {string} - escaped HTML
 */
function escapeHtml(code) {
  return code.replace(
    /[{}`]/g,
    (character) => ({ '{': '&lbrace;', '}': '&rbrace;', '`': '&grave;' }[character]),
  );
}

/**
 * @param {string} code - code to highlight
 * @param {string} lang - code language
 * @param {string} meta - code meta
 * @returns {Promise<string>} - highlighted html
 */
async function highlighter(code, lang, meta) {
  const highlighter = await getSingletonHighlighter({
    langs: ['svelte', 'css', 'javascript', 'bash', 'html'],
    themes: ['catppuccin-latte', 'monokai']
  });
  const darkHtml = escapeHtml(escapeSvelte(highlighter.codeToHtml(code, {
    lang,
    theme: 'monokai',
    transformers: [
      transformerNotationDiff()
    ]
  })));
  const lightHtml = escapeHtml(escapeSvelte(highlighter.codeToHtml(code, {
    lang,
    theme: 'catppuccin-latte',
    transformers: [
      transformerNotationDiff()
    ]
  })));
  // return `{@html \`${darkHtml}${lightHtml}\` }`;
  return `{@html \`<div class="language-${lang} vp-adaptive-theme">${lightHtml}${darkHtml}</div>\` }`;
  // const html = shikiHighlighter.codeToHtml(code, {
  //   lang: lang,
  //   theme: THEME,
  //   transformers: [
  //     transformerNotationDiff()
  //   ]
  // });
  // return escapeSvelte(html);
}

export default highlighter;
