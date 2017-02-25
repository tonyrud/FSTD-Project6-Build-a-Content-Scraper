//    dependencies
const fs = require('fs'),
      cheerio = require('cheerio'),
      moment = require('moment'),
      fetch = require('node-fetch'),
      request = require('request'),
      csvWriter = require('csv-write-stream'),

      //    paths
      directoryRoot = ('./'),
      directory = 'data/',
      urlRoot = 'http://shirts4mike.com/',
      urlAllShirts = 'shirts.php',


      //    setups and init variables
      writer = csvWriter({
            headers: ['Title', 'Price', 'ImageURL', 'URL', 'Time']
      });
shirtItems = [];

//    check if data directory exists, if it does continue or create if it doesn't
function directorySetup() {
      if (!fs.existsSync(directoryRoot + directory)) {
            fs.mkdirSync(directory);
            const date = moment().format('YYYY-MM-DD');
            writer.pipe(fs.createWriteStream(`${directoryRoot}${directory}${date}.csv`))
      }
}

//    error handling from promise
function errorHandler(error) {
      console.error(`Nope! ${error}`);
      Error(`'Didn't Work :(`);
}


//    check that the root url is okay
const checkUrlStatus = fetch(urlRoot)
      .then(data => {
            console.log(data)
      })
      .then(data => {
            // console.log(data);
      })
      .catch(errorHandler);

directorySetup();

function getShirtUrls() {
      const items = []
      request(urlAllShirts, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                  const $ = cheerio.load(body);
                  $('.products a').each(function (i, el) {
                        items[i] = urlRoot + $(this).attr('href')
                  })
                  // console.log(items);
            }
            // console.log(items);
      });
      return items;
      return 2
}

function getShirtInfo(url) {
      // console.log(url);
      fetch(url)
            .then
      const arr = []
      // request(url, (error, response, body) => {
      //       if (!error && response.statusCode === 200) {
      //             const $ = cheerio.load(body); 
      //             arr.push({
      //                   title: $('.shirt-details h1').html(),
      //                   price: $('.price').html(),
      //                   imgUrl: $('.shirt-picture img').attr('src'),
      //                   url: url,
      //                   time: moment().format('ddd MMM Do YYYY h:mm:ss a'),
      //             })
      //       }
      // });
      // return arr
}

function createCSV(content) {
      writer.write([
            "world",
            "bar",
            "taco"
      ])
      writer.end();
}