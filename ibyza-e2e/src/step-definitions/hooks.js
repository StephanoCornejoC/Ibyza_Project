import { BeforeAll, AfterAll, Before, After, setDefaultTimeout } from '@cucumber/cucumber'
import { engage, actorCalled } from '@serenity-js/core'
import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright'
import { Cast } from '@serenity-js/core'
import { chromium } from 'playwright'

setDefaultTimeout(60_000)

let browser

BeforeAll({ timeout: 120_000 }, async () => {
  const headless = process.env.HEADLESS !== 'false'
  browser = await chromium.launch({ headless })
})

AfterAll({ timeout: 60_000 }, async () => {
  if (browser) await browser.close()
})

Before(async () => {
  const baseURL = process.env.BASE_URL || 'http://localhost:5173'
  engage(
    Cast.where((actor) =>
      actor.whoCan(
        BrowseTheWebWithPlaywright.using(browser, {
          baseURL,
          viewport: { width: 1440, height: 900 },
          ignoreHTTPSErrors: true,
        }),
      ),
    ),
  )
})

After(async () => {
  // Serenity cierra la page automaticamente entre scenarios
})
