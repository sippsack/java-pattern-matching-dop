import { createHighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import java from 'shiki/langs/java.mjs'
import light from 'shiki/themes/github-light.mjs'
import dark from 'shiki/themes/github-dark.mjs'

const highlighter = createHighlighterCore({
  langs: [java],
  themes: [light, dark],
  engine: createJavaScriptRegexEngine(),
})

export async function highlightJava(code: string) {
  return (await highlighter).codeToHtml(code, {
    lang: 'java', themes: { light: 'github-light', dark: 'github-dark' },
  })
}
