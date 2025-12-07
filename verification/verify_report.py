from playwright.sync_api import sync_playwright
import time

def verify_board_report():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a larger viewport to capture the full report
        context = browser.new_context(viewport={'width': 1280, 'height': 1500})
        page = context.new_page()

        print("Navigating to login...")
        page.goto('http://localhost:3000/login')

        print("Filling login form...")
        # Use ID selectors as name attribute might be missing
        page.fill('#email', 'client@beta.nl')
        page.fill('#password', 'password123')
        page.click('button[type="submit"]')

        print("Waiting for dashboard redirect...")
        # Wait for navigation to dashboard
        page.wait_for_url('**/dashboard/org/**', timeout=10000)

        curr_url = page.url
        print(f"Logged in. Current URL: {curr_url}")

        # http://localhost:3000/dashboard/org/UUID
        if '/dashboard/org/' in curr_url:
            org_id = curr_url.split('/dashboard/org/')[1].split('/')[0]
            report_url = f"http://localhost:3000/dashboard/org/{org_id}/board-report"

            print(f"Navigating to report: {report_url}")
            page.goto(report_url)

            # Wait for report content to load
            print("Waiting for report content...")
            page.wait_for_selector('h1', state='visible')

            # Additional wait to ensure charts/tables are rendered
            time.sleep(2)

            # Take screenshot
            print("Taking screenshot...")
            page.screenshot(path='verification/board_report.png', full_page=True)
            print(f"Screenshot saved to verification/board_report.png")
        else:
            print(f"Unexpected URL after login: {curr_url}")

        browser.close()

if __name__ == "__main__":
    verify_board_report()
