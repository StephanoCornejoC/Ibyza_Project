/**
 * Serenity/JS configuracion centralizada.
 * Se importa desde los hooks de Cucumber.
 */
import { configure } from '@serenity-js/core'
import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright'
import { ConsoleReporter } from '@serenity-js/console-reporter'
import { SerenityBDDReporter } from '@serenity-js/serenity-bdd'
import { chromium } from 'playwright'

let browser

export async function configureSerenity() {
  const headless = process.env.HEADLESS !== 'false'
  browser = await chromium.launch({
    headless,
    slowMo: headless ? 0 : 100,
  })

  configure({
    actors: () => ({
      prepare: (actor) =>
        actor.whoCan(
          BrowseTheWebWithPlaywright.using(browser, {
            baseURL: process.env.BASE_URL || 'http://localhost:5173',
            viewport: { width: 1440, height: 900 },
          }),
        ),
    }),
    crew: [
      ConsoleReporter.forDarkTerminals(),
      '@serenity-js/serenity-bdd',
      ['@serenity-js/core:ArtifactArchiver', { outputDirectory: 'reports' }],
    ],
  })
}

export async function closeSerenity() {
  if (browser) {
    await browser.close()
  }
}
