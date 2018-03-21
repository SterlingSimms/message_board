let express     = require('express'),
    app         = express(),
    path        = require('path'),
    session     = require('express-session'),
    body_parser = require('body-parser'),
    mongoose    = require('mongoose');
app.use(body_parser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "static")));
app.use(session({
    secret: '^P%mUWCwF4hWAhtgUb8BrRqWPuR$%4w^@FSB3j*VfumMEJB8SPpr57%aqRmsEyHGhJKcvgu9#W&5ZvUrCZ*q4c%8^A9RJ49@Mf3X',
    proxy: true,
    resave: false,
    saveUninitialized: true
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
mongoose.connect('mongodb://localhost/messages');
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;
var MessageSchema = new mongoose.Schema({
    message_name: {type: String, required: true, minlength: 4},
    comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}],
    message_content: {type: String, require: true},
    created : {type : Date, default : Date.now}
});

var CommentSchema = new mongoose.Schema({
    comment_name: {type: String, required: true, minlength: 4},
    _message: {type: Schema.Types.ObjectId, ref: 'Message'},
    comment_content: {type: String, require: true},
    created : {type : Date, default : Date.now}
});

mongoose.model('Message', MessageSchema);
mongoose.model('Comment', CommentSchema);
var Message = mongoose.model('Message');
var Comment = mongoose.model('Comment');

app.get('/', (req, res) => {
    Message.find({}, function(err, messages){
        Comment.find({}, function(err, comments){
            if(err){
                console.log('There are errors')
            }
            else{
                res.render('index', {message: messages, comment: comments});
            }
    });
});
});

app.post('/post_message', (req,res) =>{
    var message = new Message(req.body);
    message.save(function(error, message){
        if(error){
            console.log('error')
        }
        else{
            res.redirect('/')
        }
    });
});

app.post('/post_comment/:id', (req,res) =>{
    Message.findOne({_id: req.params.id}, function(err, message){
        var comment = new Comment(req.body);
        comment._post = message._id;
        comment.save(function(err){
            message.comments.push(comment);
            message.save(function(err){
                    if(err){ 
                        console.log('Error'); 
                    }
                    else { 
                        res.redirect('/'); 
                    }
                });
            });
        });
    });

let server = app.listen(6789, () => {
    console.log("listening on port 6789");
});
// io.sockets.on('connection', function (socket) {
//     console.log("Client/socket is connected!");
//     console.log("Client/socket id is: ", socket.id);
// });