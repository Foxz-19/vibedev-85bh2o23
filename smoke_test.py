from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.on('dialog', lambda dialog: dialog.accept())
    page.goto('http://127.0.0.1:19023/index.html')
    page.wait_for_load_state('networkidle')
    assert page.locator('#water-result').inner_text() == '375 g'
    page.locator('[data-hydration="85"]').click()
    assert page.locator('#water-result').inner_text() == '425 g'
    assert page.locator('#descriptor').inner_text() == 'Wet & sticky'
    page.locator('#flour').fill('650')
    page.locator('#hydration').fill('80')
    page.locator('#recipe-name').fill('Sunday loaf')
    page.locator('#recipe-form').press('Enter')
    assert page.locator('.recipe-item').count() == 1
    assert '650 g flour' in page.locator('.recipe-meta').inner_text()
    page.locator('[data-action="edit"]').click()
    page.locator('#recipe-name').fill('Sunday loaf updated')
    page.locator('#recipe-form').press('Enter')
    assert page.locator('.recipe-name').inner_text() == 'Sunday loaf updated'
    page.locator('#recipe-name').fill('Second loaf')
    page.locator('#recipe-form').press('Enter')
    page.locator('[data-action="edit"]').first.click()
    page.locator('[data-action="load"]').nth(1).click()
    assert page.locator('#recipe-name').input_value() == ''
    assert page.locator('#save-recipe span').first.inner_text() == 'Save recipe'
    page.locator('[data-action="delete"]').first.click()
    page.locator('[data-action="delete"]').click()
    assert page.locator('.recipe-item').count() == 0
    page.locator('#flour').fill('0')
    assert 'between 1 and 100,000' in page.locator('#form-message').inner_text()
    page.locator('#flour').fill('500')
    for index in range(6):
        page.locator('#recipe-name').fill(f'Bake {index}')
        page.locator('#recipe-form').press('Enter')
    assert page.locator('.recipe-item').count() == 5
    assert '5 saved recipes' in page.locator('#recipe-message').inner_text()
    page.evaluate("localStorage.setItem('crumb-recipes-v1', '{bad json')")
    page.reload()
    page.wait_for_load_state('networkidle')
    assert 'could not be read' in page.locator('#recipe-message').inner_text()
    browser.close()
print('smoke test passed')
