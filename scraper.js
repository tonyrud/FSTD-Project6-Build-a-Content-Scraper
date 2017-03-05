//    dependencies
const fs = require('fs'),
      cheerio = require('cheerio'),
      moment = require('moment'),
      fetch = require('node-fetch'),
      request = require('request'),
      csv = require('fast-csv'),

      //    paths
      directoryRoot = ('./'),
      directory = 'data/',
      urlRoot = 'http://shirts4mike.com/',
      urlAllShirts = 'shirts.php',
      errorFileName = 'scraper-error.log',

      //    setups and init variables
      csvStream = csv.createWriteStream({
            headers: true
      }),
      date = moment().format('YYYY-MM-DD'),
      scrapedContent = [];

//    check if data directory exists, if it does continue or create if it
(function directorySetup() {
      if (!fs.existsSync(directoryRoot + directory)) {
            fs.mkdirSync(directory);
      }
})();

// create csv file at current date
csvStream.pipe(fs.createWriteStream(`${directoryRoot}${directory}${date}.csv`));

//create date when error occurs
const createErrDate = () => {
      const timezone = new Date().toString().split(' ')[5],
            date = moment().format('ddd MMM Do YYYY h:mm:ssa');
      return `${date} ${timezone}`;
};

//    error handling from promise
function errorHandler(error) {
      console.error(`There was a problem connecting to ${urlRoot}.Error was <${error.message}>. Please check "${directory}${errorFileName}" for more details on the issue.`);
      fs.appendFile(directoryRoot + directory + errorFileName, `${createErrDate()} <${error}>\n`);
}

const sortArray = (array, key) => array.sort((a, b) => {
      const compare1 = a[key],
            compare2 = b[key];
      return ((compare1 < compare2) ? -1 : ((compare1 > compare2) ? 1 : 0));
});

const writeCsvLine = (content) => {
      csvStream.write(content);
};

function getShirtsBody(data) {
      return new Promise((resolve, reject) => {
            request(data.url + urlAllShirts, (error, response, body) => {
                  console.dir(response.statusCode);
                  if (!error && response.statusCode === 200) {
                        // return body of the current page
                        resolve(body);
                  } else {
                        reject(Error('error in get shirtsBody'));
                  }
            });
      });
}

function getUrls(pageBody) {
      const $ = cheerio.load(pageBody),
            urls = [];

      $('.products a').each(function (i) {
            urls[i] = urlRoot + $(this).attr('href');
      });
      return urls;
}


function scrapeUrls(urls) {
      // return promises for each url in urls array
      const detailsArr = urls.map(url => new Promise((resolve, reject) => {
            request(url, (error, response, body) => {
                  if (!error) {
                        const $ = cheerio.load(body),
                              price = $('.price').html();
                        // add elements to array for adding to csv spreadsheet
                        scrapedContent.push({
                              Title: $('.shirt-details h1').text().slice(price.length + 1),
                              Price: price,
                              ImageURL: $('.shirt-picture img').attr('src'),
                              URL: url,
                              Time: moment().format('h:mm:ss a'),
                        });
                        resolve();
                  } else {
                        reject(Error('error in get scrapeUrls'));
                  }
            });
      }));
      Promise.all(detailsArr)
            .then(() => {
                  // sort the array numerically based on imageUrl name
                  sortArray(scrapedContent, 'ImageURL');
                  scrapedContent.forEach((el) => {
                        writeCsvLine(el);
                  });
                  csvStream.end();
            });
}

//    check that the root url is okay
fetch(urlRoot)
      // send url to get the body of the shirts page
      .then(getShirtsBody)
      // send the body of shirts to get each individual shirt link
      .then(getUrls)
      // send each individual shirt link to get it's contents
      .then(scrapeUrls)
      // let user know if any errors
      .catch(errorHandler);