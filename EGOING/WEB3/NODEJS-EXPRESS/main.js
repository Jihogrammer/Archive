var fs = require('fs');
var qs = require('querystring');

var path = require('path');

var sanitizeHtml = require('sanitize-html');
var express      = require('express');
var bodyParser   = require('body-parser');

var template = require('./lib/template.js');

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));

// route, routing
// app.get('/', (req, res) => res.send('Hello World!'))
app.get('/', function(request, response) {
    fs.readdir('./data', function(error, filelist) {
        var title       = 'Welcome'
        var description = 'Hello, Node.js'
        var list        = template.list(filelist)
        var body        = `<h2>${title}</h2>${description}`
        var control     = `<a href="/create">create</a>`

        var html = template.HTML(title, list, body, control)
        response.send(html)
    })
})

// url parameter를 어떻게 분석하는지 ':pageId'
app.get('/page/:pageId', function(request, response) {
    //response.send(request.params)
    fs.readdir('./data', function(error, filelist) {
        var filteredId = path.parse(request.params.pageId).base;

        fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
            var title                = request.params.pageId
            var sanitizedTitle       = sanitizeHtml(title)
            var sanitizedDescription = sanitizeHtml(description, { allowedTags: ['h1'] })
            var list                 = template.list(filelist)
            var body                 = `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`
            var control              = `<a href="/create">create</a> <a href="/update/${sanitizedTitle}">update</a>
                                        <form action="/delete_process" method="post">
                                            <input type="hidden" name="id" value="${sanitizedTitle}">
                                            <input type="submit" value="delete">
                                        </form>`

            var html = template.HTML(sanitizedTitle, list, body, control)
            response.send(html)
        })
    })
})

app.get('/create', function(request, response) {
    fs.readdir('./data', function(error, filelist) {
        var title   = 'WEB - create';
        var list    = template.list(filelist);
        var body    =  `<form action="/create_process" method="post">
                            <p><input type="text" name="title" placeholder="title"></p>
                            <p><textarea name="description" placeholder="description"></textarea></p>
                            <p><input type="submit" value="create"></p>
                        </form>`
        var control = ''

        var html = template.HTML(title, list, body, control);
        response.send(html);
    })
})

app.post('/create_process', function(request, response) {
    var post        = request.body; // body-parser 사용
    var title       = post.title;
    var description = post.description;

    // redirect 간소화
    fs.writeFile(`data/${title}`, description, 'utf8', function(err) { response.redirect(`/page/${title}`) })

    /* var body = ''
    request.on('data', function(data) { body += data })
    request.on('end', function() {
        var post        = qs.parse(body)
        var title       = post.title
        var description = post.description

        // redirect 간소화
        fs.writeFile(`data/${title}`, description, 'utf8', function(err) { response.redirect(`/page/${title}`) })
    }) */
})

app.get('/update/:pageId', function(request, response) {
    fs.readdir('./data', function(error, filelist) {
        var filteredId = path.parse(request.params.pageId).base

        fs.readFile(`data/${filteredId}`, 'utf8', function(err, description) {
            var title   = request.params.pageId;
            var list    = template.list(filelist);
            var body    =  `<form action="/update_process" method="post">
                                <input type="hidden" name="id" value="${title}">
                                <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                                <p><textarea name="description" placeholder="description">${description}</textarea></p>
                                <p><input type="submit" value="update"></p>
                            </form>`
            var control = `<a href="/create">create</a> <a href="/update/${title}">update</a>`

            var html = template.HTML(title, list, body, control)
            response.send(html)
        })
    })
})

app.post('/update_process', function(request, response) {
    var post        = request.body; // body-parser 사용
    var id          = post.id
    var title       = post.title
    var description = post.description

    // redirect 간소화
    fs.rename(`data/${id}`, `data/${title}`, function(error) {
        fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
            response.redirect(`/page/${title}`)
        })
    })

    /* var body = ''
    request.on('data', function(data) { body += data })
    request.on('end', function() {
        var post        = qs.parse(body)
        var id          = post.id
        var title       = post.title
        var description = post.description

        // redirect 간소화
        fs.rename(`data/${id}`, `data/${title}`, function(error) {
            fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
                response.redirect(`/page/${title}`)
            })
        })
    }) */
})

app.post('/delete_process', function(request, response) {
    var post        = request.body; // body-parser 사용
    var id         = post.id
    var filteredId = path.parse(id).base

    // redirect 간소화 -> express 쓰면 편하다. 이게 프레임워크의 장점.
    fs.unlink(`data/${filteredId}`, function(error) { response.redirect('/') })

    /* var body = ''
    request.on('data', function(data) { body += data })
    request.on('end', function() {
        var post       = qs.parse(body)
        var id         = post.id
        var filteredId = path.parse(id).base

        // redirect 간소화 -> express 쓰면 편하다. 이게 프레임워크의 장점.
        fs.unlink(`data/${filteredId}`, function(error) { response.redirect('/') })
    }) */
})

// app.listen(3000, () => console.log('Example app listening on port 3000'))
app.listen(3000, function() {
    // console.log('Example app listening on port 3000')
})