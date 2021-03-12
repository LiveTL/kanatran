import chrome


def main(browser):
    browser.setup_driver()
    web = browser.get_selenium(True)
    try:
        web.switch_to.window("1")
    except Exception:
        pass
    web.get("https://duckduckgo.com/")
    return web


if __name__ == "__main__":
    web = main(chrome)
