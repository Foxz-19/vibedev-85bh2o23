from os import getenv
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True); page=browser.new_page()
    page.on('dialog', lambda dialog: dialog.accept())
    page.goto(getenv('TEST_URL','http://127.0.0.1:19023/index.html'))
    page.wait_for_load_state('networkidle')
    q=page.locator
    assert q('#water-result').inner_text() == '375 g'
    q('[data-hydration="85"]').click()
    assert q('#water-result').inner_text() == '425 g'
    assert q('#descriptor').inner_text() == 'Wet & sticky'
    q('#flour').fill('650'); q('#hydration').fill('80')
    q('#recipe-name').fill('Sunday loaf'); q('#recipe-form').press('Enter')
    assert q('.recipe-item').count() == 1
    assert '650 g flour' in q('.recipe-meta').inner_text()
    q('[data-action="edit"]').click(); q('#recipe-name').fill('Sunday loaf updated'); q('#recipe-form').press('Enter')
    assert q('.recipe-name').inner_text() == 'Sunday loaf updated'
    q('#recipe-name').fill('Second loaf'); q('#recipe-form').press('Enter')
    q('[data-action="edit"]').first.click(); q('[data-action="load"]').nth(1).click()
    assert q('#recipe-name').input_value() == ''
    assert q('#save-recipe span').first.inner_text() == 'Save recipe'
    q('[data-action="delete"]').first.click(); q('[data-action="delete"]').click()
    assert q('.recipe-item').count() == 0
    q('#flour').fill('0')
    assert 'between 1 and 100,000' in q('#form-message').inner_text()
    q('#flour').fill('500')
    for index in range(6):
        q('#recipe-name').fill(f'Bake {index}'); q('#recipe-form').press('Enter')
    assert q('.recipe-item').count() == 5
    assert '5 saved recipes' in q('#recipe-message').inner_text()
    page.evaluate("localStorage.setItem('crumb-recipes-v1', '{bad json')")
    page.reload()
    page.wait_for_load_state('networkidle')
    assert 'could not be read' in q('#recipe-message').inner_text()
    browser.close()
print('smoke test passed')
