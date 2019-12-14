# Polaris WAF Test

One Paragraph of project description goes here

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Installing

Install required packages
```
yarn
```

### Running all tests
```
node runtest.js
```

After running tests, you can get output at ./tests/dvwa/outputs/ folder

### Running tests interactive
Running in RELP console
```bash
node -i -e "$(cat index.js)"
```

```bash
> chrome.openBrowser()  # wait for chromium browser starting
> dvwa.login()  # goto dvwa test page
> dvwa.setSecurityLevel("low")      # level includes "low", "medium", "high", "imposible" (references dvwa)
```

You can reset state after being blocked by polaris firewall
```bash
> dvwa.reset()
```

You can add more testcases under folder ./tests/dvwa/payloads/
```
...
├── tests
│   └── dvwa
│       ├── outputs
│       ├── payloads
│       │   ├── cmdi-attack-general.txt
│       │   ├── cmdi-attack.txt
│       │   ├── cmdi-normal.txt
│       │   ├── sqli-attack.txt
│       │   ├── sqli-normal.txt
│       │   ├── xss-attack.txt
│       │   └── xss-normal.txt
│       ├── script.js
│       └── test.json
...
```

### Notes
- When import testing results (*.csv files), we should configure delimiter as `[[<=>]]`
- You can change delimiter settings in ./tests/dvwa/script.js:2
```js
const DELIMITER_CHAR = '[[<=>]]';
```

## Built With

* [Node.js](https://nodejs.org/en/) - Javascript runtime
* [Puppeteer](https://github.com/puppeteer/puppeteer) - Headless browser

## Authors

* **Ngoc Tin** - *Initial work* - [my github repo](https://github.com/ngoctint1lvc)