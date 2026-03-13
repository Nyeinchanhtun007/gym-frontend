const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/admin/plans');
  
  // Need to log in if it redirects to login
  await page.waitForTimeout(2000);
  const url = page.url();
  if (url.includes('/login')) {
      await page.fill('input[type="email"]', 'admin@ygn.com');
      await page.fill('input[type="password"]', 'password123'); // assuming standard
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
  }

  // Click delete button on the first plan
  page.on('dialog', dialog => {
      console.log('Dialog type:', dialog.type());
      console.log('Dialog message:', dialog.message());
      dialog.accept();
  });
  
  console.log('Clicking delete button...');
  await page.click('button[title="Delete Plan"]');
  
  await page.waitForTimeout(2000);
  console.log('Done');
  await browser.close();
})();
