import asyncio
from playwright.async_api import async_playwright
import trafilatura

async def main():
    print("Testing Playwright and Trafilatura...")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        
        url = "https://www.google.com"
        print(f"Fetching {url}...")
        await page.goto(url, wait_until="domcontentloaded")
        
        content = await page.content()
        title = await page.title()
        print(f"Title: {title}")
        
        extracted = trafilatura.extract(content)
        print(f"Extracted content length: {len(extracted) if extracted else 0}")
        
        await browser.close()
    print("Test complete.")

if __name__ == "__main__":
    asyncio.run(main())
