import chrome


def main(browser):
    browser.setup_driver()
    web = browser.get_selenium(True)
    try:
        web.switch_to.window("1")
    except Exception:
        pass
    web.get("https://www.youtube.com/watch?v=5qap5aO4i9A")
    return web


if __name__ == "__main__":
    web = main(chrome)
