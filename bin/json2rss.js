#!/usr/bin/env node

var argv = require('optimist').argv;
var fs = require('fs');
var RSS = require('rss');
var cheerio = require('cheerio');

var inputFile = argv._[0];
var outputFile = argv._[1];
var file = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));

var feed = new RSS({
  title: argv.title,
  description: argv.description,
  generator: 'json2rss - https://github.com/trodrigues/json2rss',
  feed_url: argv.feedUrl || '',
  site_url: argv.siteUrl || '',
  author: argv.author || '',
  pubDate: (new Date).toISOString()
});

var maxItems = 20;
var itemCount = 0;

function getItemContent(item, itemPath) {
  var htmlfile = fs.readFileSync(itemPath+'/'+item + argv.itemSuffix, 'utf-8')
  var $ = cheerio.load(htmlfile);
  return $(argv.itemSelector).html();
};

for(var item in file){
  if(itemCount >= maxItems) break;
  itemCount++;
  feed.item({
    title: file[item].title,
    description: argv.itemsPath ? getItemContent(item, argv.itemsPath) :'',
    date: file[item].date,
    guid: item,
    author: file[item].author || argv.author || '',
    url: file[item].url || argv.siteUrl ?
      argv.siteUrl +'/'+ (argv.itemPrefix || '') + item + (argv.itemSuffix || '')
      : ''
  });
}

fs.writeFileSync(outputFile, feed.xml(true));
console.log('feed generated at '+outputFile);
